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
