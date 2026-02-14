import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const isOnFire = currentStreak >= 7;

  useEffect(() => {
    if (currentStreak > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-2xl p-4 bg-card/20 backdrop-blur"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={currentStreak > 0 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={cn(
              "relative w-16 h-16 rounded-2xl flex items-center justify-center",
              currentStreak > 0 ? "bg-gradient-to-br from-accent to-orange-500" : "bg-muted"
            )}
          >
            <Flame
              className={cn(
                "w-8 h-8",
                currentStreak > 0 ? "text-white" : "text-muted-foreground",
                isOnFire && "animate-streak-fire"
              )}
            />
            {currentStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-xp text-[11px] font-bold flex items-center justify-center text-background shadow-lg"
              >
                {currentStreak}
              </motion.div>
            )}
            {isOnFire && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-orange-500 opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{currentStreak}</span>
              <span className="text-white/70">jour{currentStreak !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-sm text-white/70">
              {currentStreak === 0
                ? "Commence ta série !"
                : currentStreak >= longestStreak
                  ? "🎉 Record personnel !"
                  : `Record: ${longestStreak} jours`}
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-white/70">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">Record</span>
            </div>
            <p className="text-lg font-semibold text-white">{longestStreak}</p>
          </div>
        </div>

        {/* Weekly dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "w-3 h-3 rounded-full",
                i < (currentStreak % 7 || (currentStreak > 0 ? 7 : 0))
                  ? "bg-gradient-to-br from-accent to-orange-500"
                  : "bg-white/20"
              )}
            />
          ))}
        </div>
      </motion.div>

      {/* Celebration animation */}
      <AnimatePresence>
        {showCelebration && currentStreak > 0 && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: (Math.random() - 0.5) * 200,
                  y: -100 - Math.random() * 100,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="absolute left-1/2 top-1/2 pointer-events-none"
              >
                <span className="text-2xl">{["🔥", "⭐", "✨", "🌟", "💫"][i % 5]}</span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
