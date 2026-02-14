import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  current_level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  kanjis_learned: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

// Calculate XP needed for next level (exponential curve)
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelProgress(totalXp: number, currentLevel: number): number {
  const xpForCurrentLevel = getXpForLevel(currentLevel);
  const xpForPreviousLevels = Array.from({ length: currentLevel - 1 }, (_, i) => getXpForLevel(i + 1)).reduce((a, b) => a + b, 0);
  const xpInCurrentLevel = totalXp - xpForPreviousLevels;
  return Math.min(100, (xpInCurrentLevel / xpForCurrentLevel) * 100);
}
