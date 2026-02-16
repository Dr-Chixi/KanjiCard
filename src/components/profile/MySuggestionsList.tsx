import { useMySuggestions } from "@/hooks/useKanjiSuggestions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function MySuggestionsList() {
    const { data: suggestions, isLoading } = useMySuggestions();

    if (isLoading) {
        return <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>;
    }

    if (!suggestions || suggestions.length === 0) {
        return (
            <div className="text-center py-6 border border-dashed rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Aucune contribution pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-xl font-japanese text-primary">
                                {suggestion.kanji}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{suggestion.meaning_fr}</p>
                                <p className="text-xs text-muted-foreground">
                                    {suggestion.kanji_id ? "Modification" : "Nouveau"} • {new Date(suggestion.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div>
                            {suggestion.status === "pending" && (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20">
                                    <Clock className="w-3 h-3 mr-1" />
                                    En attente
                                </Badge>
                            )}
                            {suggestion.status === "approved" && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Approuvé
                                </Badge>
                            )}
                            {suggestion.status === "rejected" && (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Rejeté
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                    {suggestion.status === "rejected" && suggestion.admin_comment && (
                        <div className="px-3 pb-3 pt-0">
                            <div className="text-xs bg-destructive/5 text-destructive p-2 rounded">
                                <span className="font-semibold">Raison :</span> {suggestion.admin_comment}
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}
