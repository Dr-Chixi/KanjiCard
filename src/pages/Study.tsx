import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useKanjisForDeck, calculateSRS, Kanji } from "@/hooks/useKanjis";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Flashcard from "@/components/study/Flashcard";
import { X, Trophy, Zap, Star, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export default function Study() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionIdRef = useRef<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const { data: deck } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("id", deckId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!deckId,
  });

  const { data: kanjis, isLoading } = useKanjisForDeck(deckId);

  // Create session when component mounts
  useEffect(() => {
    const createSession = async () => {
      if (!user || !deckId || sessionIdRef.current) return;
      
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          deck_id: deckId,
        })
        .select()
        .single();
      
      if (!error && data) {
        sessionIdRef.current = data.id;
      }
    };
    
    createSession();
  }, [user, deckId]);

  const updateProgress = useMutation({
    mutationFn: async ({
      kanjiId,
      quality,
    }: {
      kanjiId: string;
      quality: 0 | 1 | 2 | 3 | 4 | 5;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get existing progress
      const { data: existing } = await supabase
        .from("user_kanji_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("kanji_id", kanjiId)
        .single();

      const srs = calculateSRS(
        quality,
        existing?.repetitions || 0,
        existing?.ease_factor || 2.5,
        existing?.interval_days || 0
      );

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + srs.interval);

      if (existing) {
        await supabase
          .from("user_kanji_progress")
          .update({
            ease_factor: srs.easeFactor,
            interval_days: srs.interval,
            repetitions: srs.repetitions,
            next_review_date: nextReviewDate.toISOString(),
            last_review_date: new Date().toISOString(),
            total_reviews: existing.total_reviews + 1,
            correct_reviews: quality >= 3 ? existing.correct_reviews + 1 : existing.correct_reviews,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_kanji_progress").insert({
          user_id: user.id,
          kanji_id: kanjiId,
          ease_factor: srs.easeFactor,
          interval_days: srs.interval,
          repetitions: srs.repetitions,
          next_review_date: nextReviewDate.toISOString(),
          last_review_date: new Date().toISOString(),
          total_reviews: 1,
          correct_reviews: quality >= 3 ? 1 : 0,
        });
      }

      return { quality, isNew: !existing };
    },
  });

  const handleAnswer = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!kanjis || !kanjis[currentIndex]) return;

    await updateProgress.mutateAsync({
      kanjiId: kanjis[currentIndex].id,
      quality,
    });

    if (quality >= 3) {
      setCorrectCount((c) => c + 1);
      // XP: 10 base + bonus for difficulty
      const xp = Math.round(10 * (deck?.xp_multiplier || 1) * (quality === 5 ? 1.5 : 1));
      setXpEarned((e) => e + xp);
    }

    if (currentIndex < kanjis.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Session complete
      setSessionComplete(true);
      await finishSession();
      
      // Celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#F97316", "#FBBF24"],
      });
    }
  };

  const finishSession = async () => {
    if (!user || !deck || !kanjis) return;

    const finalXp = xpEarned;
    const finalCorrect = correctCount;

    // Update study session
    if (sessionIdRef.current) {
      await supabase
        .from("study_sessions")
        .update({
          ended_at: new Date().toISOString(),
          cards_studied: kanjis.length,
          correct_answers: finalCorrect + (kanjis[currentIndex] ? 1 : 0),
          xp_earned: finalXp,
        })
        .eq("id", sessionIdRef.current);
    }

    // Update user profile with XP and streak
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const today = new Date().toISOString().split("T")[0];
      const lastStudy = profile.last_study_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = profile.current_streak;
      if (lastStudy === yesterdayStr) {
        newStreak += 1;
      } else if (lastStudy !== today) {
        newStreak = 1;
      }

      const newTotalXp = profile.total_xp + finalXp;
      
      // Calculate new level
      let newLevel = profile.current_level;
      let xpThreshold = 100 * Math.pow(1.5, newLevel - 1);
      let accumulatedXp = 0;
      for (let i = 1; i < newLevel; i++) {
        accumulatedXp += 100 * Math.pow(1.5, i - 1);
      }
      while (newTotalXp >= accumulatedXp + xpThreshold) {
        accumulatedXp += xpThreshold;
        newLevel++;
        xpThreshold = 100 * Math.pow(1.5, newLevel - 1);
      }

      await supabase
        .from("profiles")
        .update({
          total_xp: newTotalXp,
          current_level: newLevel,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, profile.longest_streak),
          last_study_date: today,
          kanjis_learned: profile.kanjis_learned + finalCorrect,
        })
        .eq("user_id", user.id);

      if (newLevel > profile.current_level) {
        toast({
          title: "🎉 Niveau supérieur !",
          description: `Tu es maintenant niveau ${newLevel} !`,
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["weekly-session-count"] });
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setXpEarned(0);
    setSessionComplete(false);
    sessionIdRef.current = null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!kanjis || kanjis.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Aucun kanji dans ce deck</p>
          <Button onClick={() => navigate("/")}>Retour</Button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round((correctCount / kanjis.length) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-primary">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 rounded-3xl bg-card shadow-glow mx-auto mb-6 flex items-center justify-center"
          >
            <Trophy className="w-12 h-12 text-xp" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">Session terminée !</h1>
          <p className="text-white/80 mb-8">
            {accuracy >= 80 ? "Excellent travail ! 🌟" : 
             accuracy >= 60 ? "Bien joué ! Continue comme ça 💪" : 
             "C'est en forgeant qu'on devient forgeron ! 🔨"}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-4 text-center"
            >
              <Star className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{correctCount}/{kanjis.length}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-4 text-center"
            >
              <Zap className="w-6 h-6 mx-auto mb-2 text-xp" />
              <p className="text-2xl font-bold">+{xpEarned}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-4 text-center"
            >
              <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">Précision</p>
            </motion.div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full gradient-accent"
              onClick={() => navigate("/")}
            >
              Retour au dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={restartSession}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentKanji = kanjis[currentIndex];
  const progress = ((currentIndex + 1) / kanjis.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <X className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
            {currentIndex + 1}/{kanjis.length}
          </span>
        </div>
      </header>

      {/* Deck name */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">{deck?.name}</p>
      </div>

      {/* Flashcard */}
      <main className="px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKanji.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Flashcard kanji={currentKanji} onAnswer={handleAnswer} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
