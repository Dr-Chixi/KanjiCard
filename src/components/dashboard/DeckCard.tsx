import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, BookOpen, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeckCardProps {
  id: string;
  name: string;
  description?: string | null;
  emoji: string;
  kanjiCount: number;
  jlptLevel?: number | null;
  requiredLevel: number;
  userLevel: number;
  isCompleted?: boolean;
  progress?: number;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  delay?: number;
}

export default function DeckCard({
  name,
  description,
  emoji,
  kanjiCount,
  jlptLevel,
  requiredLevel,
  userLevel,
  isCompleted = false,
  progress = 0,
  onClick,
  onDelete,
  onEdit,
  delay = 0,
}: DeckCardProps) {
  const isLocked = userLevel < requiredLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
    >
      <Card
        className={cn(
          "glass-card cursor-pointer transition-all overflow-hidden",
          isLocked && "opacity-60 cursor-not-allowed",
          isCompleted && "ring-2 ring-success"
        )}
        onClick={!isLocked ? onClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Emoji/Icon */}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
              isLocked ? "bg-muted" : "gradient-primary"
            )}>
              {isLocked ? <Lock className="w-6 h-6 text-muted-foreground" /> : emoji}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-semibold truncate">{name}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.div>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Supprimer le deck "${name}" ?`)) {
                          onDelete();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {description}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {jlptLevel && (
                  <Badge variant="secondary" className="text-xs">
                    JLPT N{jlptLevel}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  <span>{kanjiCount} kanjis</span>
                </div>
                {isLocked && (
                  <span className="text-xs text-muted-foreground">
                    Niveau {requiredLevel} requis
                  </span>
                )}
              </div>

              {/* Progress bar for started decks */}
              {progress > 0 && !isCompleted && (
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
