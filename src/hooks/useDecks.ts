import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Deck {
  id: string;
  name: string;
  description: string | null;
  jlpt_level: number | null;
  is_official: boolean;
  is_custom: boolean;
  user_id: string | null;
  xp_multiplier: number;
  required_level: number;
  kanji_count: number;
  cover_emoji: string;
  created_at: string;
  updated_at: string;
}

export function useOfficialDecks() {
  return useQuery({
    queryKey: ["decks", "official"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("is_official", true)
        .order("required_level", { ascending: true })
        .order("jlpt_level", { ascending: false });

      if (error) throw error;
      return data as Deck[];
    },
  });
}

export function useCustomDecks(userId: string | undefined) {
  return useQuery({
    queryKey: ["decks", "custom", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("is_custom", true)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Deck[];
    },
    enabled: !!userId,
  });
}

export function useDeck(deckId: string | undefined) {
  return useQuery({
    queryKey: ["deck", deckId],
    queryFn: async () => {
      if (!deckId) return null;

      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .select(`
          *,
          kanjis:deck_kanjis(
            kanji:kanjis(id, kanji, meaning_fr, jlpt_level)
          )
        `)
        .eq("id", deckId)
        .single();

      if (deckError) throw deckError;

      // Transform the nested structure to match our Kanji interface
      const kanjis = (deck.kanjis || []).map((dk: any) => dk.kanji);
      return { ...deck, kanjis } as Deck & { kanjis: any[] };
    },
    enabled: !!deckId,
  });
}

export function useUpdateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deckId,
      name,
      description,
      emoji,
      kanjiIds,
    }: {
      deckId: string;
      name: string;
      description: string | null;
      emoji: string;
      kanjiIds: string[];
    }) => {
      // 1. Update deck metadata
      const { error: deckError } = await supabase
        .from("decks")
        .update({
          name,
          description,
          cover_emoji: emoji,
          kanji_count: kanjiIds.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deckId);

      if (deckError) throw deckError;

      // 2. Update deck kanjis (simplest way: delete all and re-add)
      const { error: deleteError } = await supabase
        .from("deck_kanjis")
        .delete()
        .eq("deck_id", deckId);

      if (deleteError) throw deleteError;

      const deckKanjis = kanjiIds.map((kanjiId, i) => ({
        deck_id: deckId,
        kanji_id: kanjiId,
        position: i,
      }));

      const { error: insertError } = await supabase
        .from("deck_kanjis")
        .insert(deckKanjis);

      if (insertError) throw insertError;

      return deckId;
    },
    onSuccess: (deckId) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deckId: string) => {
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", deckId);

      if (error) throw error;
      return deckId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}
