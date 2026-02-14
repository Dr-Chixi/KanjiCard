import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Kanji {
  id: string;
  kanji: string;
  onyomi: string[];
  onyomi_romaji: string[];
  kunyomi: string[];
  kunyomi_romaji: string[];
  meaning_fr: string;
}

interface FlashcardProps {
  kanji: Kanji;
  onAnswer: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  showAnswer?: boolean;
}

export default function Flashcard({ kanji, onAnswer, showAnswer: initialShow = false }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(initialShow);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleAnswer = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    onAnswer(quality);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <motion.div
        className="relative w-full aspect-[3/4] cursor-pointer"
        onClick={handleFlip}
        style={{ transformStyle: "preserve-3d" }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Card className="w-full h-full glass-card shadow-glow flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <span className="text-8xl font-japanese kanji-shadow">
                    {kanji.kanji}
                  </span>
                  <p className="mt-8 text-muted-foreground text-sm">
                    Touche pour révéler
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Card className="w-full h-full glass-card shadow-glow overflow-hidden">
                <CardContent className="h-full flex flex-col p-6">
                  {/* Kanji */}
                  <div className="text-center mb-4">
                    <span className="text-5xl font-japanese">{kanji.kanji}</span>
                  </div>

                  {/* Meaning */}
                  <div className="text-center mb-4">
                    <p className="text-xl font-semibold text-gradient-primary">
                      {kanji.meaning_fr}
                    </p>
                  </div>

                  {/* Readings */}
                  <div className="flex-1 space-y-3">
                    {/* On'yomi */}
                    {kanji.onyomi.length > 0 && (
                      <div className="bg-primary/10 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          On'yomi (音読み)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {kanji.onyomi.map((reading, i) => (
                            <div key={i} className="text-center">
                              <span className="text-lg font-japanese">{reading}</span>
                              <span className="text-sm text-muted-foreground ml-1">
                                ({kanji.onyomi_romaji[i]})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kun'yomi */}
                    {kanji.kunyomi.length > 0 && (
                      <div className="bg-accent/10 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Kun'yomi (訓読み)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {kanji.kunyomi.map((reading, i) => (
                            <div key={i} className="text-center">
                              <span className="text-lg font-japanese">{reading}</span>
                              <span className="text-sm text-muted-foreground ml-1">
                                ({kanji.kunyomi_romaji[i]})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Answer buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-col h-auto py-3 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswer(1);
                      }}
                    >
                      <span className="text-lg">😕</span>
                      <span className="text-xs mt-1">Je ne sais pas</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-col h-auto py-3 border-accent/50 hover:bg-accent/10 hover:text-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswer(3);
                      }}
                    >
                      <span className="text-lg">🤔</span>
                      <span className="text-xs mt-1">Difficile</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-col h-auto py-3 border-success/50 hover:bg-success/10 hover:text-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswer(5);
                      }}
                    >
                      <span className="text-lg">😊</span>
                      <span className="text-xs mt-1">Facile</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
