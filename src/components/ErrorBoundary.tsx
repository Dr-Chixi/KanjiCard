import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-2">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold">Oups ! Quelque chose a cassé.</h1>
                        <div className="p-4 bg-muted rounded-lg text-left overflow-auto max-h-40 font-mono text-xs">
                            <p className="font-bold text-destructive mb-1">{this.state.error?.name}: {this.state.error?.message}</p>
                            <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                        </div>
                        <p className="text-muted-foreground">
                            Le code a rencontré une erreur inattendue. Essaye de rafraîchir la page ou de revenir à l'accueil.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => window.location.href = "/"}
                                variant="outline"
                                className="flex-1"
                            >
                                Retour à l'accueil
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                className="flex-1 gradient-primary"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Rafraîchir
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.children;
    }
}
