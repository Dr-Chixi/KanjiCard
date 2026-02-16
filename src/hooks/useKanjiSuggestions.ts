import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface KanjiSuggestion {
    id: string;
    user_id: string;
    kanji_id: string | null;
    kanji: string;
    onyomi: string[];
    kunyomi: string[];
    meaning_fr: string;
    status: "pending" | "approved" | "rejected";
    admin_comment: string | null;
    created_at: string;
    profile?: { username: string; avatar_url: string | null };
    original?: { kanji: string; meaning_fr: string; onyomi: string[]; kunyomi: string[] } | null;
}

export function useMySuggestions() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["my-suggestions", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("kanji_suggestions" as any)
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as unknown as KanjiSuggestion[];
        },
        enabled: !!user,
    });
}

export function usePendingSuggestions() {
    const { user } = useAuth();
    // We rely on RLS to restrict this, but we also check email on client to avoid unnecessary calls
    const isAdmin = user?.email === "charif.lycee@gmail.com";

    return useQuery({
        queryKey: ["pending-suggestions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("kanji_suggestions" as any)
                .select(`
          *,
          profile:profiles(username, avatar_url),
          original:kanjis(kanji, meaning_fr, onyomi, kunyomi)
        `)
                .eq("status", "pending")
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as unknown as KanjiSuggestion[];
        },
        enabled: !!user && isAdmin,
    });
}

export function useSubmitSuggestion() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({
            kanjiId,
            kanji,
            onyomi,
            kunyomi,
            meaning_fr,
        }: {
            kanjiId?: string;
            kanji: string;
            onyomi: string[];
            kunyomi: string[];
            meaning_fr: string;
        }) => {
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from("kanji_suggestions" as any).insert({
                user_id: user.id,
                kanji_id: kanjiId || null,
                kanji,
                onyomi,
                kunyomi,
                meaning_fr,
                status: "pending",
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-suggestions"] });
        },
    });
}

export function useApproveSuggestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (suggestion: KanjiSuggestion) => {
            // 1. Insert or Update Kanji
            if (suggestion.kanji_id) {
                // Update existing
                const { error: kanjiError } = await supabase
                    .from("kanjis")
                    .update({
                        kanji: suggestion.kanji,
                        onyomi: suggestion.onyomi,
                        kunyomi: suggestion.kunyomi,
                        meaning_fr: suggestion.meaning_fr,
                    })
                    .eq("id", suggestion.kanji_id);

                if (kanjiError) throw kanjiError;
            } else {
                // Create new
                const { error: kanjiError } = await supabase.from("kanjis").insert({
                    kanji: suggestion.kanji,
                    onyomi: suggestion.onyomi,
                    kunyomi: suggestion.kunyomi,
                    meaning_fr: suggestion.meaning_fr,
                    jlpt_level: 5, // Default level
                });

                if (kanjiError) throw kanjiError;
            }

            // 2. Update Suggestion Status
            const { error: statusError } = await supabase
                .from("kanji_suggestions" as any)
                .update({ status: "approved" })
                .eq("id", suggestion.id);

            if (statusError) throw statusError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-suggestions"] });
            queryClient.invalidateQueries({ queryKey: ["all-kanjis"] }); // Update global kanji list
            queryClient.invalidateQueries({ queryKey: ["kanji-search"] }); // Update search results
        },
    });
}

export function useRejectSuggestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
            const { error } = await supabase
                .from("kanji_suggestions" as any)
                .update({
                    status: "rejected",
                    admin_comment: comment,
                })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-suggestions"] });
        },
    });
}
