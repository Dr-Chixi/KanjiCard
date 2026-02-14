import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Plus, X, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = ["📚", "🎌", "🌸", "⛩️", "🗻", "🎎", "🍣", "🎋", "🌊", "🔥", "⭐", "💎"];

interface Kanji {
  id: string;
  kanji: string;
  meaning_fr: string;
  jlpt_level: number;
}

export default function CreateDeck() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [selectedKanjis, setSelectedKanjis] = useState<Kanji[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jlptFilter, setJlptFilter] = useState<number | null>(null);

  // Fetch all kanjis
  const { data: kanjis, isLoading: kanjisLoading } = useQuery({
    queryKey: ["all-kanjis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kanjis")
        .select("id, kanji, meaning_fr, jlpt_level")
        .order("jlpt_level", { ascending: false })
        .order("frequency", { ascending: true });
      if (error) throw error;
      return data as Kanji[];
    },
  });

  // Filter kanjis based on search and JLPT level
  const filteredKanjis = kanjis?.filter((k) => {
    const matchesSearch =
      !searchQuery ||
      k.kanji.includes(searchQuery) ||
      k.meaning_fr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJlpt = !jlptFilter || k.jlpt_level === jlptFilter;
    const notSelected = !selectedKanjis.find((s) => s.id === k.id);
    return matchesSearch && matchesJlpt && notSelected;
  });

  // Create deck mutation
  const createDeck = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!name.trim()) throw new Error("Le nom est requis");
      if (selectedKanjis.length === 0) throw new Error("Sélectionne au moins un kanji");

      // Create deck
      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          cover_emoji: emoji,
          is_custom: true,
          is_official: false,
          user_id: user.id,
          kanji_count: selectedKanjis.length,
          xp_multiplier: 0.5, // Custom decks give 50% XP
          required_level: 1,
        })
        .select()
        .single();

      if (deckError) throw deckError;

      // Add kanjis to deck
      const deckKanjis = selectedKanjis.map((k, i) => ({
        deck_id: deck.id,
        kanji_id: k.id,
        position: i,
      }));

      const { error: kanjiError } = await supabase.from("deck_kanjis").insert(deckKanjis);
      if (kanjiError) throw kanjiError;

      return deck;
    },
    onSuccess: (deck) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Deck créé !",
        description: `"${deck.name}" avec ${selectedKanjis.length} kanjis`,
      });
      navigate("/decks");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleKanji = (kanji: Kanji) => {
    console.log("Toggling kanji:", kanji.kanji, kanji.id);
    setSelectedKanjis((prev) => {
      const isSelected = prev.some((k) => k.id === kanji.id);
      if (isSelected) {
        return prev.filter((k) => k.id !== kanji.id);
      } else {
        return [...prev, kanji];
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="gradient-primary px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-white">Créer un deck KanjiCard</h1>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Deck Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4 space-y-4">
                {/* Emoji Picker */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Icône
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={cn(
                          "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                          emoji === e
                            ? "gradient-primary shadow-glow"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Nom du deck
                  </label>
                  <Input
                    placeholder="Ex: Mes kanjis favoris"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Description (optionnel)
                  </label>
                  <Textarea
                    placeholder="Décris ton deck..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Kanjis */}
          {selectedKanjis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  Kanjis sélectionnés ({selectedKanjis.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedKanjis([])}
                >
                  Tout effacer
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedKanjis.map((kanji) => (
                    <motion.button
                      key={kanji.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="group relative px-3 py-2 rounded-xl glass-card hover:bg-destructive/10 transition-colors"
                      onClick={() => toggleKanji(kanji)}
                    >
                      <span className="text-lg font-japanese">{kanji.kanji}</span>
                      <X className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Kanji Library */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold mb-3">Bibliothèque de kanjis</h3>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un kanji ou sa signification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* JLPT Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Badge
                variant={jlptFilter === null ? "default" : "secondary"}
                className="cursor-pointer shrink-0"
                onClick={() => setJlptFilter(null)}
              >
                Tous
              </Badge>
              {[5, 4, 3, 2, 1].map((level) => (
                <Badge
                  key={level}
                  variant={jlptFilter === level ? "default" : "secondary"}
                  className="cursor-pointer shrink-0"
                  onClick={() => setJlptFilter(jlptFilter === level ? null : level)}
                >
                  N{level}
                </Badge>
              ))}
            </div>

            {/* Kanji Grid */}
            <ScrollArea className="h-64 rounded-xl border bg-card/50">
              {kanjisLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Chargement...
                </div>
              ) : filteredKanjis && filteredKanjis.length > 0 ? (
                <div className="grid grid-cols-5 gap-2 p-3">
                  {filteredKanjis.slice(0, 100).map((kanji) => (
                    <button
                      key={kanji.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleKanji(kanji);
                      }}
                      className="aspect-square rounded-xl bg-muted/50 hover:bg-primary/20 flex flex-col items-center justify-center p-1 transition-all active:scale-95 cursor-pointer touch-none"
                    >
                      <span className="text-xl font-japanese group-hover:text-primary pointer-events-none">
                        {kanji.kanji}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center pointer-events-none">
                        {kanji.meaning_fr.split(",")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery || jlptFilter
                    ? "Aucun kanji trouvé"
                    : "Aucun kanji disponible"}
                </div>
              )}
            </ScrollArea>
            {filteredKanjis && filteredKanjis.length > 100 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Affichage des 100 premiers résultats
              </p>
            )}
          </motion.div>

          {/* Create Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              className="w-full h-14 gradient-accent text-lg"
              onClick={() => createDeck.mutate()}
              disabled={createDeck.isPending || !name.trim() || selectedKanjis.length === 0}
            >
              {createDeck.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {!name.trim() ? "Donne un nom au deck" : `Créer le deck (${selectedKanjis.length} kanjis)`}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Les decks personnalisés rapportent 50% d'XP
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
