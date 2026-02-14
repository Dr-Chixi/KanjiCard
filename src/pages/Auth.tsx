import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        // Navigation will be handled by the auth state change in AuthContext or ProtectedRoute
        navigate("/");
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({
          title: "Inscription réussie !",
          description: "Si la confirmation par email est activée, vérifie ta boîte de réception.",
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      let title = "Erreur d'authentification";
      let description = error.message || "Une erreur est survenue.";

      // Handle specific "Email not confirmed" error
      if (error.message?.includes("Email not confirmed")) {
        title = "Email non confirmé";
        description = "Vérifie ta boîte mail (et tes spams) !";

        toast({
          title,
          description,
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { error: resendError } = await signUp(email, password);
                if (!resendError) {
                  toast({ title: "Email renvoyé !", description: "Vérifie tes mails." });
                }
              }}
            >
              Renvoyer
            </Button>
          ),
        });
        return;
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission side effects
    if (isLoading) return;

    try {
      setIsLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Google sign-in error:", error);
        toast({
          title: "Erreur Google",
          description: error.message || "Impossible de lancer la connexion Google.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
      // If no error, we are redirecting, so no need to stop loading
    } catch (err) {
      console.error("Unexpected Google sign-in error:", err);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors de la connexion Google.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gradient-primary">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">漢</div>
        <div className="absolute top-40 right-20 text-5xl opacity-15 animate-float" style={{ animationDelay: "1s" }}>字</div>
        <div className="absolute bottom-32 left-20 text-7xl opacity-10 animate-float" style={{ animationDelay: "2s" }}>学</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: "0.5s" }}>習</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card shadow-glow mb-4"
          >
            <span className="text-4xl font-japanese">漢</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-primary-foreground">KanjiCard</h1>
          <p className="text-primary-foreground/80 mt-2">Maîtrise les kanjis, un jour à la fois</p>
        </div>

        <Card className="glass-card border-0 shadow-glow">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Bon retour !" : "Créer un compte"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Connecte-toi pour continuer ton apprentissage"
                : "Rejoins des milliers d'apprenants"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Chargement...
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLogin ? "Se connecter" : "Créer mon compte"}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </div>
          </CardContent>
        </Card>


        {/* Debug Section */}
        <div className="mt-8 p-4 bg-black/80 text-white rounded-lg text-xs font-mono w-full max-w-md overflow-hidden">
          <h3 className="font-bold mb-2 text-red-400">Zone de Debug (Temporaire)</h3>
          <div className="space-y-1">
            <p>Status: {isLoading ? "Chargement..." : "Prêt"}</p>
            <p>URL Supabase: {import.meta.env.VITE_SUPABASE_URL ? "Configurée ✅" : "MANQUANTE ❌"}</p>
            <p>Project ID (env): {import.meta.env.VITE_SUPABASE_PROJECT_ID}</p>
            <p>Clé Anon: {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "Configurée ✅" : "MANQUANTE ❌"}</p>
            <p>URL Site: {window.location.origin}</p>
            <p>URL Redirection: {window.location.origin}</p>
            <div className="border-t border-gray-700 my-2 pt-2">
              <p className="text-gray-400">Si l'auth Google échoue :</p>
              <ol className="list-decimal pl-4 space-y-1 text-gray-500">
                <li>Vérifiez que <strong>{window.location.origin}</strong> est dans les "Site URL" ou "Redirect URLs" de Supabase.</li>
                <li>Vérifiez que Google est activé dans Auth Providers.</li>
                <li>Vérifiez le Client ID / Secret (sans espaces !).</li>
              </ol>
            </div>
          </div>
        </div>

      </motion.div >
    </div >
  );
}
