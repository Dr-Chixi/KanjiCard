import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useOfficialDecks } from "@/hooks/useDecks";
import { useAIRecommendation } from "@/hooks/useAIRecommendation";
import { useWeeklySessionCount } from "@/hooks/useStudySessions";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import StreakDisplay from "@/components/dashboard/StreakDisplay";
import LevelProgress from "@/components/dashboard/LevelProgress";
import DeckCard from "@/components/dashboard/DeckCard";
import { LogOut, BookOpen, Target, Brain, Plus, Sparkles, Folder, User, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: decks, isLoading: decksLoading } = useOfficialDecks();
  const { data: aiRecommendation, isLoading: aiLoading } = useAIRecommendation();
  const { data: weeklySessionCount } = useWeeklySessionCount();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4" />
          <div className="h-4 w-24 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-primary px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-card/20 backdrop-blur flex items-center justify-center">
                <span className="text-2xl font-japanese text-white">漢</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Salut, {profile?.username?.split(" ")[0] || "Apprenant"} !
                </h1>
                <p className="text-sm text-white/70">Prêt à apprendre ?</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Streak */}
          <StreakDisplay
            currentStreak={profile?.current_streak || 0}
            longestStreak={profile?.longest_streak || 0}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 -mt-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Level Progress */}
          <LevelProgress
            currentLevel={profile?.current_level || 1}
            totalXp={profile?.total_xp || 0}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="Kanjis appris"
              value={profile?.kanjis_learned || 0}
              icon={BookOpen}
              gradient="primary"
              delay={0.3}
            />
            <StatsCard
              title="Sessions"
              value={weeklySessionCount || 0}
              subtitle="Cette semaine"
              icon={Target}
              gradient="accent"
              delay={0.4}
            />
          </div>

          {/* AI Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Suggestions IA</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {aiLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 h-24 animate-pulse bg-muted/50" />
                ))
              ) : aiRecommendation && aiRecommendation.length > 0 ? (
                aiRecommendation.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="glass-card rounded-2xl p-4 relative overflow-hidden group"
                  >
                    {/* Background Glow */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 rounded-full transition-opacity group-hover:opacity-20 ${suggestion.type === 'review' ? 'bg-orange-500' :
                      suggestion.type === 'learn' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />

                    <div className="flex gap-4 items-start relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${suggestion.type === 'review' ? 'bg-orange-500/10 text-orange-500' :
                        suggestion.type === 'learn' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                        {suggestion.type === 'review' && <Brain className="w-6 h-6" />}
                        {suggestion.type === 'learn' && <Plus className="w-6 h-6" />}
                        {suggestion.type === 'challenge' && <Target className="w-6 h-6" />}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{suggestion.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {suggestion.message}
                        </p>

                        {suggestion.deckId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 mt-2 px-0 hover:bg-transparent text-primary font-semibold text-xs group/btn"
                            onClick={() => navigate(`/study/${suggestion.deckId}`)}
                          >
                            Vas-y maintenant
                            <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-xs text-muted-foreground py-4 italic">
                  Continue de t'entraîner pour débloquer plus de suggestions ! ✨
                </p>
              )}
            </div>
          </div>

          {/* Decks Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Decks officiels</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/decks")}>
                Voir tout
              </Button>
            </div>

            <div className="space-y-3">
              {decksLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
                ))
              ) : decks && decks.length > 0 ? (
                decks.slice(0, 3).map((deck, index) => (
                  <DeckCard
                    key={deck.id}
                    id={deck.id}
                    name={deck.name}
                    description={deck.description}
                    emoji={deck.cover_emoji || "📚"}
                    kanjiCount={deck.kanji_count}
                    jlptLevel={deck.jlpt_level}
                    requiredLevel={deck.required_level}
                    userLevel={profile?.current_level || 1}
                    onClick={() => navigate(`/study/${deck.id}`)}
                    delay={0.6 + index * 0.1}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-destructive/10 rounded-xl p-4 border border-destructive/20">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-destructive" />
                  <p className="font-bold text-destructive">Aucune donnée trouvée !</p>
                  <p className="text-sm mt-1">La base de données semble vide.</p>
                  <p className="text-xs mt-2 text-muted-foreground">Avez-vous exécuté le script de Seed SQL ?</p>
                </div>
              )}
            </div>
          </section>

          {/* Create Custom Deck */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <Button
              variant="outline"
              className="w-full h-14 border-dashed"
              onClick={() => navigate("/decks/create")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un deck personnalisé
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t">
        <div className="max-w-lg mx-auto flex items-center justify-around py-3">
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2 text-primary" onClick={() => navigate("/")}>
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Apprendre</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate("/decks")}>
            <Folder className="w-5 h-5" />
            <span className="text-xs">Decks</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate("/profile")}>
            <User className="w-5 h-5" />
            <span className="text-xs">Profil</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
