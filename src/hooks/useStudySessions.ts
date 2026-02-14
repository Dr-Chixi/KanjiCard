import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string | null;
  started_at: string;
  ended_at: string | null;
  cards_studied: number;
  correct_answers: number;
  xp_earned: number;
}

export function useStudySessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["study-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as StudySession[];
    },
    enabled: !!user,
  });
}

export function useWeeklySessionCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weekly-session-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count, error } = await supabase
        .from("study_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("started_at", weekAgo.toISOString());

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useCreateSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deckId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          deck_id: deckId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      cardsStudied,
      correctAnswers,
      xpEarned,
    }: {
      sessionId: string;
      cardsStudied: number;
      correctAnswers: number;
      xpEarned: number;
    }) => {
      const { error } = await supabase
        .from("study_sessions")
        .update({
          ended_at: new Date().toISOString(),
          cards_studied: cardsStudied,
          correct_answers: correctAnswers,
          xp_earned: xpEarned,
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-session-count"] });
    },
  });
}
