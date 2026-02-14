import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OnboardingData {
    username: string;
    avatarId: string;
}

export function useOnboarding() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // 1. Single source of truth for profile data
    const profileQuery = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
            if (!user) return null;
            console.log("Onboarding: Fetching profile for", user.id);
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                console.error("Onboarding: Error fetching profile:", error);
                throw error;
            }
            return data;
        },
        enabled: !!user,
        staleTime: 0, // Ensure we check every time for onboarding status
    });

    // 2. Derive onboarding status from profile data
    const needsOnboarding = (() => {
        if (!user || profileQuery.isLoading) return false;

        const data = profileQuery.data;

        // If no profile exists yet, they definitely need onboarding
        if (!data) {
            console.log("Onboarding: No profile found, user needs onboarding.");
            return true;
        }

        // Logic for incomplete profile:
        // - Missing username
        // - Username is just the email (default from trigger)
        // - Missing avatar
        // - Avatar is from Google/External (not starting with 'emoji:')
        const needsUsername = !data.username || data.username === user.email || data.username.trim() === "";
        const needsAvatar = !data.avatar_url || !data.avatar_url.startsWith('emoji:');

        console.log("Onboarding: Check results", {
            needsUsername,
            needsAvatar,
            currentUsername: data.username,
            currentAvatar: data.avatar_url
        });

        return needsUsername || needsAvatar;
    })();

    // Complete onboarding mutation
    const completeOnboarding = useMutation({
        mutationFn: async ({ username, avatarId }: OnboardingData) => {
            if (!user) throw new Error("Not authenticated");

            const avatarUrl = `emoji:${avatarId}`;

            // Helper to translate common database errors
            const handleDatabaseError = (err: any) => {
                const message = err.message || "";
                if (err.code === '23505' || message.includes('profiles_username_unique') || message.includes('already taken')) {
                    throw new Error("Ce nom d'utilisateur est déjà pris.");
                }
                throw err;
            };

            console.log("Onboarding: Attempting update via RPC for", user.id);

            // 1. Try RPC (Best method)
            try {
                const { data, error } = await supabase.rpc('update_user_onboarding', {
                    p_username: username,
                    p_avatar_url: avatarUrl
                });

                if (error) {
                    console.warn("Onboarding: RPC error", error);
                    handleDatabaseError(error);
                }

                if (data) {
                    console.log("Onboarding: RPC success", data);
                    return data;
                }
            } catch (err: any) {
                // If it was already thrown by handleDatabaseError, re-throw it
                if (err.message === "Ce nom d'utilisateur est déjà pris.") throw err;

                // Otherwise try to handle it
                handleDatabaseError(err);
                console.warn("Onboarding: RPC execution failed, falling back...", err);
            }

            // 2. Fallback: Manual Check & Update
            console.log("Onboarding: Falling back to manual update...");

            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (existingProfile) {
                const { data, error } = await supabase
                    .from("profiles")
                    .update({
                        username,
                        avatar_url: avatarUrl,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("user_id", user.id)
                    .select()
                    .single();

                if (error) handleDatabaseError(error);
                return data;
            } else {
                const { data, error } = await supabase
                    .from("profiles")
                    .insert({
                        user_id: user.id,
                        username,
                        avatar_url: avatarUrl,
                    })
                    .select()
                    .single();

                if (error) handleDatabaseError(error);
                return data;
            }
        },
        onSuccess: () => {
            // Force refetch profile and status
            queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
        },
    });

    // Check if a username is already taken
    const checkUsernameAvailability = async (username: string) => {
        if (!username || username.trim().length < 3) return true;

        const { data, error } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("username", username.trim())
            .maybeSingle();

        if (error) {
            console.error("Onboarding: Error checking username availability:", error);
            return true; // Assume available on error to avoid blocking, database will catch it anyway
        }

        // If data exists and belongs to another user, it's taken
        return !data || data.user_id === user?.id;
    };

    return {
        needsOnboarding,
        isCheckingOnboarding: profileQuery.isLoading,
        completeOnboarding,
        checkUsernameAvailability,
        profile: profileQuery.data
    };
}
