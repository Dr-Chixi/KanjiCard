import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSubmitSuggestion } from "@/hooks/useKanjiSuggestions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Sparkles, PenLine } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SuggestionFormData {
    kanjiId?: string;
    kanji: string;
    onyomi: string;
    kunyomi: string;
    meaning_fr: string;
}

export default function KanjiSuggestionDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("new");
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();
    const submitMutation = useSubmitSuggestion();

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SuggestionFormData>({
        defaultValues: {
            kanji: "",
            onyomi: "",
            kunyomi: "",
            meaning_fr: "",
        },
    });

    // Search for existing kanjis to modify
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ["kanji-search", searchQuery],
        queryFn: async () => {
            if (!searchQuery) return [];
            const { data, error } = await supabase
                .from("kanjis")
                .select("*")
                .or(`kanji.ilike.%${searchQuery}%,meaning_fr.ilike.%${searchQuery}%`)
                .limit(10);
            if (error) throw error;
            return data;
        },
        enabled: activeTab === "edit" && searchQuery.length > 0,
    });

    const onSubmit = (data: SuggestionFormData) => {
        const onyomiArray = data.onyomi.split(",").map((s) => s.trim()).filter(Boolean);
        const kunyomiArray = data.kunyomi.split(",").map((s) => s.trim()).filter(Boolean);

        submitMutation.mutate(
            {
                kanjiId: activeTab === "edit" ? data.kanjiId : undefined,
                kanji: data.kanji,
                onyomi: onyomiArray,
                kunyomi: kunyomiArray,
                meaning_fr: data.meaning_fr,
            },
            {
                onSuccess: () => {
                    toast({
                        title: "Proposition envoyée !",
                        description: "Un administrateur va examiner votre suggestion.",
                    });
                    setOpen(false);
                    reset();
                    setSearchQuery("");
                },
                onError: (error) => {
                    toast({
                        title: "Erreur",
                        description: error.message,
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleSelectKanji = (kanji: any) => {
        setValue("kanjiId", kanji.id);
        setValue("kanji", kanji.kanji);
        setValue("onyomi", kanji.onyomi.join(", "));
        setValue("kunyomi", kanji.kunyomi.join(", "));
        setValue("meaning_fr", kanji.meaning_fr);
        toast({
            title: "Kanji sélectionné",
            description: `Vous modifiez maintenant ${kanji.kanji}`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button variant="outline">Proposer un kanji</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Contribuer au Dictionnaire</DialogTitle>
                    <DialogDescription>
                        Proposez un nouveau kanji ou une correction. Vos contributions aident la communauté !
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new">Nouveau Kanji</TabsTrigger>
                        <TabsTrigger value="edit">Modifier Existant</TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un kanji à modifier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {searchQuery && (
                            <ScrollArea className="h-40 rounded-md border p-2">
                                {isSearching ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : searchResults?.length === 0 ? (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                        Aucun kanji trouvé
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {searchResults?.map((k: any) => (
                                            <button
                                                key={k.id}
                                                onClick={() => handleSelectKanji(k)}
                                                className="w-full text-left flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
                                            >
                                                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded font-japanese text-lg">
                                                    {k.kanji}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{k.meaning_fr}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {k.onyomi?.join(", ")}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        )}
                    </TabsContent>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <Label htmlFor="kanji">Kanji</Label>
                                <div className="mt-1.5 flex items-center justify-center aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                                    <input
                                        {...register("kanji", { required: true, maxLength: 1 })}
                                        className="w-full h-full bg-transparent text-center text-3xl font-japanese outline-none"
                                        placeholder="?"
                                        maxLength={1}
                                    />
                                </div>
                            </div>
                            <div className="col-span-3 space-y-4">
                                <div>
                                    <Label htmlFor="meaning_fr">Signification (FR)</Label>
                                    <Input
                                        {...register("meaning_fr", { required: true })}
                                        placeholder="Ex: Feu, Flamme"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="onyomi">Onyomi (Katakana)</Label>
                                <Input
                                    {...register("onyomi")}
                                    placeholder="Ex: カ, ヒ"
                                    className="mt-1.5"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Séparés par des virgules</p>
                            </div>
                            <div>
                                <Label htmlFor="kunyomi">Kunyomi (Hiragana)</Label>
                                <Input
                                    {...register("kunyomi")}
                                    placeholder="Ex: ひ, ほ"
                                    className="mt-1.5"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Séparés par des virgules</p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-primary"
                            disabled={submitMutation.isPending}
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    {activeTab === "edit" ? <PenLine className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    {activeTab === "edit" ? "Proposer la modification" : "Proposer le kanji"}
                                </>
                            )}
                        </Button>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
