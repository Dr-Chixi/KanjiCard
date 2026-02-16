import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useOfficialDecks, useCustomDecks, useDeleteDeck } from "@/hooks/useDecks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeckCard from "@/components/dashboard/DeckCard";
import { ArrowLeft, Plus, BookOpen, Folder, User } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

export default function Decks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: officialDecks, isLoading: officialLoading } = useOfficialDecks();
  const { data: customDecks, isLoading: customLoading } = useCustomDecks(user?.id);
  const deleteMutation = useDeleteDeck();
  const { toast } = useToast();

  const handleDeleteDeck = (deckId: string) => {
    deleteMutation.mutate(deckId, {
      onSuccess: () => {
        toast({
          title: "Deck supprimé",
          description: "Le deck a été supprimé avec succès.",
        });
      },
      onError: (error) => {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le deck : " + error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-primary px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">Mes Decks</h1>
              <p className="text-sm text-white/70">Explore et crée des decks</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4">
        <div className="max-w-lg mx-auto">
          <Tabs defaultValue="official" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="official" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Officiels
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Personnalisés
              </TabsTrigger>
            </TabsList>

            <TabsContent value="official" className="space-y-3">
              {officialLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
                ))
              ) : officialDecks && officialDecks.length > 0 ? (
                officialDecks.map((deck, index) => (
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
                    delay={index * 0.05}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun deck officiel disponible</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-3">
              {/* Create button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-14 border-dashed mb-4"
                  onClick={() => navigate("/decks/create")}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer un nouveau deck
                </Button>
              </motion.div>

              {customLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
                ))
              ) : customDecks && customDecks.length > 0 ? (
                customDecks.map((deck, index) => (
                  <DeckCard
                    key={deck.id}
                    id={deck.id}
                    name={deck.name}
                    description={deck.description}
                    emoji={deck.cover_emoji || "📚"}
                    kanjiCount={deck.kanji_count}
                    jlptLevel={null}
                    requiredLevel={1}
                    userLevel={profile?.current_level || 1}
                    onClick={() => navigate(`/study/${deck.id}`)}
                    onEdit={() => navigate(`/decks/edit/${deck.id}`)}
                    onDelete={() => handleDeleteDeck(deck.id)}
                    delay={index * 0.05}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tu n'as pas encore de deck personnalisé</p>
                  <p className="text-sm mt-1">Crée-en un pour étudier tes kanjis préférés !</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
