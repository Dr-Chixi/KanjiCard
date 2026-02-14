import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useOfficialDecks } from "@/hooks/useDecks";
import { useLearnedKanjisCount } from "@/hooks/useKanjis";
import { useWeeklySessionCount } from "@/hooks/useStudySessions";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import StreakDisplay from "@/components/dashboard/StreakDisplay";
import LevelProgress from "@/components/dashboard/LevelProgress";
import DeckCard from "@/components/dashboard/DeckCard";
import { LogOut, BookOpen, Target, Plus, Folder, User } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: decks, isLoading: decksLoading } = useOfficialDecks();
  const { data: weeklySessionCount } = useWeeklySessionCount();
  const { data: learnedCount } = useLearnedKanjisCount();

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
              value={learnedCount || 0}
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

      <BottomNav />
    </div>
  );
}
