import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AIRecommendationItem {
  type: 'review' | 'learn' | 'challenge';
  title: string;
  message: string;
  deckId: string | null;
}

interface AIRecommendationResponse {
  recommendations: AIRecommendationItem[];
}

export function useAIRecommendation() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["ai-recommendation", session?.user?.id],
    queryFn: async (): Promise<AIRecommendationItem[]> => {
      if (!session) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke("ai-recommendation", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("AI recommendation error:", error);
        return [
          {
            type: "challenge",
            title: "Continue !",
            message: "Continue ton apprentissage, tu progresses bien ! 🌸",
            deckId: null
          }
        ];
      }

      const response = data as AIRecommendationResponse;
      return response.recommendations || [];
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
}
