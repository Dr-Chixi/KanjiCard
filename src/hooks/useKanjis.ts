import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Kanji {
  id: string;
  kanji: string;
  onyomi: string[];
  onyomi_romaji: string[];
  kunyomi: string[];
  kunyomi_romaji: string[];
  meaning_fr: string;
  meaning_en: string | null;
  jlpt_level: number;
  stroke_count: number | null;
  frequency: number | null;
}

export interface KanjiProgress {
  id: string;
  user_id: string;
  kanji_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_review_date: string | null;
  total_reviews: number;
  correct_reviews: number;
}

export function useKanjisForDeck(deckId: string | undefined) {
  return useQuery({
    queryKey: ["kanjis", "deck", deckId],
    queryFn: async () => {
      if (!deckId) return [];
      
      const { data, error } = await supabase
        .from("deck_kanjis")
        .select(`
          position,
          kanjis (*)
        `)
        .eq("deck_id", deckId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data.map(item => item.kanjis as unknown as Kanji);
    },
    enabled: !!deckId,
  });
}

export function useUserKanjiProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["kanji-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_kanji_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as KanjiProgress[];
    },
    enabled: !!user,
  });
}

// SM-2 Algorithm implementation
export function calculateSRS(
  quality: 0 | 1 | 2 | 3 | 4 | 5,
  repetitions: number,
  easeFactor: number,
  interval: number
): { repetitions: number; easeFactor: number; interval: number } {
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
  };
}
