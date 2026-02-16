import { useState } from "react";
import { usePendingSuggestions, useApproveSuggestion, useRejectSuggestion, KanjiSuggestion } from "@/hooks/useKanjiSuggestions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function AdminSuggestions() {
    const { data: suggestions, isLoading } = usePendingSuggestions();
    const approveMutation = useApproveSuggestion();
    const rejectMutation = useRejectSuggestion();
    const { toast } = useToast();

    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectComment, setRejectComment] = useState("");

    const handleApprove = (suggestion: KanjiSuggestion) => {
        approveMutation.mutate(suggestion, {
            onSuccess: () => {
                toast({
                    title: "Suggestion approuvée",
                    description: "Le kanji a été mis à jour/créé.",
                });
            },
            onError: (error) => {
                toast({
                    title: "Erreur",
                    description: error.message,
                    variant: "destructive",
                });
            },
        });
    };

    const handleReject = () => {
        if (!rejectId) return;
        rejectMutation.mutate(
            { id: rejectId, comment: rejectComment },
            {
                onSuccess: () => {
                    toast({
                        title: "Suggestion rejetée",
                        description: "Le statut a été mis à jour.",
                    });
                    setRejectId(null);
                    setRejectComment("");
                },
            }
        );
    };

    if (isLoading) {
        return <div className="text-center py-4">Chargement des suggestions...</div>;
    }

    if (!suggestions || suggestions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border rounded-xl bg-card/50">
                <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Aucune suggestion en attente.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={suggestion.profile?.avatar_url || undefined} />
                                    <AvatarFallback>{suggestion.profile?.username?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{suggestion.profile?.username || "Utilisateur inconnu"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {suggestion.kanji_id ? "Modification" : "Nouveau Kanji"} •{" "}
                                        {new Date(suggestion.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setRejectId(suggestion.id)}
                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApprove(suggestion)}
                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                >
                                    {approveMutation.isPending && approveMutation.variables?.id === suggestion.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-start">
                            {/* Original (if exists) */}
                            {suggestion.original ? (
                                <div className="space-y-1 opacity-70">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Actuel</p>
                                    <div className="p-2 border rounded bg-background">
                                        <p className="text-lg font-japanese">{suggestion.original.kanji}</p>
                                        <p className="text-sm">{suggestion.original.meaning_fr}</p>
                                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                            <p>On: {suggestion.original.onyomi.join(", ")}</p>
                                            <p>Kun: {suggestion.original.kunyomi.join(", ")}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1 opacity-50">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Nouveau</p>
                                    <div className="p-2 border border-dashed rounded h-full flex items-center justify-center text-muted-foreground text-sm">
                                        Création
                                    </div>
                                </div>
                            )}

                            {/* Arrow */}
                            <div className="self-center pt-6 text-muted-foreground">
                                <ArrowRight className="w-4 h-4" />
                            </div>

                            {/* Proposed */}
                            <div className="space-y-1">
                                <p className="text-xs text-primary font-semibold uppercase">Proposition</p>
                                <div className="p-2 border border-primary/20 rounded bg-primary/5 shadow-sm">
                                    <p className="text-lg font-japanese font-bold text-primary">{suggestion.kanji}</p>
                                    <p className="text-sm font-medium">{suggestion.meaning_fr}</p>
                                    <div className="text-xs mt-1 space-y-0.5">
                                        <p><span className="text-muted-foreground">On:</span> {suggestion.onyomi.join(", ")}</p>
                                        <p><span className="text-muted-foreground">Kun:</span> {suggestion.kunyomi.join(", ")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <AlertDialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rejeter la suggestion ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vous pouvez laisser un commentaire pour expliquer le refus (optionnel).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                        <Input
                            placeholder="Raison du refus..."
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Rejeter
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
