import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useLearnedKanjisCount } from "@/hooks/useKanjis";
import { getAvatarEmoji, avatarUrlToId } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import ProgressChart from "@/components/profile/ProgressChart";
import {
  ArrowLeft,
  LogOut,
  BookOpen,
  Target,
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  Folder,
  User,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: learnedCount } = useLearnedKanjisCount();

  // Fetch study sessions for the chart
  const { data: studySessions } = useQuery({
    queryKey: ["study-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("started_at", thirtyDaysAgo)
        .order("started_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate XP needed for next level
  const calculateLevelProgress = () => {
    if (!profile) return { current: 0, needed: 100, percentage: 0 };
    const level = profile.current_level;
    let accumulatedXp = 0;
    for (let i = 1; i < level; i++) {
      accumulatedXp += Math.round(100 * Math.pow(1.5, i - 1));
    }
    const xpInCurrentLevel = profile.total_xp - accumulatedXp;
    const xpNeededForLevel = Math.round(100 * Math.pow(1.5, level - 1));
    return {
      current: xpInCurrentLevel,
      needed: xpNeededForLevel,
      percentage: (xpInCurrentLevel / xpNeededForLevel) * 100,
    };
  };

  const levelProgress = calculateLevelProgress();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-primary px-4 pt-12 pb-16">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Profile Info */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white/20">
                {profile?.avatar_url && avatarUrlToId(profile.avatar_url) ? (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-card">
                    {getAvatarEmoji(avatarUrlToId(profile.avatar_url) || '')}
                  </div>
                ) : (
                  <>
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl bg-card">
                      {profile?.username?.[0]?.toUpperCase() || "K"}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {profile?.username || "KanjiCard"}
            </h1>
            <p className="text-white/70">{user?.email}</p>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-8">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Niveau</p>
                      <p className="text-2xl font-bold">{profile?.current_level || 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">XP Total</p>
                    <p className="text-lg font-semibold text-xp">
                      {profile?.total_xp?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span>
                      {levelProgress.current} / {levelProgress.needed} XP
                    </span>
                  </div>
                  <Progress value={levelProgress.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{learnedCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Kanjis appris</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Flame className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{profile?.current_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Jours de suite</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{profile?.longest_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Meilleure série</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {profile?.last_study_date
                      ? format(new Date(profile.last_study_date), "d MMM", { locale: fr })
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Dernière session</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progression (30 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart sessions={studySessions || []} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Member Since */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-center text-sm text-muted-foreground">
              Membre depuis{" "}
              {profile?.created_at
                ? format(new Date(profile.created_at), "MMMM yyyy", { locale: fr })
                : "récemment"}
            </p>
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
