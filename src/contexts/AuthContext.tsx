import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Initializing...");

    // Check current URL for debug
    console.log("AuthContext: Current URL:", window.location.href);

    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthContext: Auth State Change:", event, session ? "Session Present" : "No Session");
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("AuthContext: getSession result:", session ? "Session Found" : "No Session", error);
      if (error) console.error("AuthContext: getSession error:", error);

      // FALLBACK: If no session but hash has access_token, try manual set
      if (!session && window.location.hash && window.location.hash.includes('access_token')) {
        console.log("AuthContext: No session but detected hash with token. Attempting manual recovery...");
        const params = new URLSearchParams(window.location.hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          supabase.auth.setSession({
            access_token,
            refresh_token,
          }).then(({ data, error: setSessionError }) => {
            if (setSessionError) {
              console.error("AuthContext: Manual session set failed:", setSessionError);
              setLoading(false);
            } else if (data.session) {
              console.log("AuthContext: Manual session set success");
              setSession(data.session);
              setUser(data.session.user);
              setLoading(false);
            } else {
              setLoading(false);
            }
          });
          return;
        }
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log("Attempting sign up with:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) console.error("Sign up error:", error);
    if (data) console.log("Sign up response data:", data);
    return { error };
  };

  const signInWithGoogle = async () => {
    console.log("Starting Google sign-in flow...");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error("Google OAuth error:", error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error during Google sign-in:", err);
      return { error: err instanceof Error ? err : new Error("Failed to sign in with Google") };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
