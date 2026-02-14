import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Star, Zap } from "lucide-react";
import { getXpForLevel, getLevelProgress } from "@/hooks/useProfile";

interface LevelProgressProps {
  currentLevel: number;
  totalXp: number;
}

export default function LevelProgress({ currentLevel, totalXp }: LevelProgressProps) {
  const xpForNextLevel = getXpForLevel(currentLevel);
  const progress = getLevelProgress(totalXp, currentLevel);
  const xpInLevel = Math.floor((progress / 100) * xpForNextLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold">
              {currentLevel}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Niveau {currentLevel}</h3>
            <p className="text-sm text-muted-foreground">
              {xpInLevel} / {xpForNextLevel} XP
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-xp/20 text-xp">
          <Zap className="w-4 h-4" />
          <span className="font-semibold">{totalXp}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-3" />
        <p className="text-xs text-muted-foreground text-center">
          {Math.ceil(xpForNextLevel - xpInLevel)} XP pour le niveau {currentLevel + 1}
        </p>
      </div>
    </motion.div>
  );
}
