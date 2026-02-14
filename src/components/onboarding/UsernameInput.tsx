import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, AlertCircle, CheckCircle2 } from "lucide-react";

interface UsernameInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
    checkAvailability?: (username: string) => Promise<boolean>;
}

export default function UsernameInput({
    value,
    onChange,
    error,
    checkAvailability,
}: UsernameInputProps) {
    const [localError, setLocalError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isTaken, setIsTaken] = useState(false);

    useEffect(() => {
        // Validate username format
        if (!value) {
            setLocalError(null);
            setIsValid(false);
            setIsTaken(false);
            return;
        }

        if (value.length < 3) {
            setLocalError("Le nom doit contenir au moins 3 caractères");
            setIsValid(false);
            setIsTaken(false);
            return;
        }

        if (value.length > 20) {
            setLocalError("Le nom ne peut pas dépasser 20 caractères");
            setIsValid(false);
            setIsTaken(false);
            return;
        }

        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(value)) {
            setLocalError("Seuls les lettres, chiffres, _ et - sont autorisés");
            setIsValid(false);
            setIsTaken(false);
            return;
        }

        setLocalError(null);
        setIsValid(true);

        // Async Availability Check
        if (checkAvailability) {
            const timer = setTimeout(async () => {
                setIsChecking(true);
                const available = await checkAvailability(value);
                setIsTaken(!available);
                setIsChecking(false);
            }, 500); // 500ms debounce

            return () => clearTimeout(timer);
        }
    }, [value, checkAvailability]);

    const displayError = error || localError || (isTaken ? "Nom d'utilisateur déjà pris" : null);

    return (
        <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-semibold">
                Nom d'utilisateur
            </Label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`pl-10 pr-10 h-12 text-base ${displayError
                        ? "border-destructive focus-visible:ring-destructive"
                        : isValid && !isChecking && !isTaken
                            ? "border-success focus-visible:ring-success"
                            : ""
                        }`}
                    maxLength={20}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking && (
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                    {!isChecking && isValid && !displayError && (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                    {!isChecking && displayError && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                </div>
            </div>

            {displayError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {displayError}
                </p>
            )}

            {isValid && !isChecking && !displayError && (
                <p className="text-sm text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Nom d'utilisateur disponible
                </p>
            )}

            <p className="text-xs text-muted-foreground">
                {value.length}/20 caractères
            </p>
        </div>
    );
}
