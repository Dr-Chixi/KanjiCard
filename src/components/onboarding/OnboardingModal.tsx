import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import AvatarSelector from "./AvatarSelector";
import UsernameInput from "./UsernameInput";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingModalProps {
    open: boolean;
}

export default function OnboardingModal({ open }: OnboardingModalProps) {
    const [step, setStep] = useState<"welcome" | "avatar" | "username">("welcome");
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState<string | null>(null);

    const { completeOnboarding, checkUsernameAvailability } = useOnboarding();
    const { toast } = useToast();

    const handleUsernameChange = (val: string) => {
        setUsername(val);
        if (usernameError) setUsernameError(null);
    };

    const handleNext = () => {
        if (step === "welcome") {
            setStep("avatar");
        } else if (step === "avatar") {
            if (!selectedAvatarId) {
                toast({
                    title: "Sélectionne un avatar",
                    description: "Choisis un avatar avant de continuer",
                    variant: "destructive",
                });
                return;
            }
            setStep("username");
        }
    };

    const handleBack = () => {
        if (step === "username") {
            setStep("avatar");
        } else if (step === "avatar") {
            setStep("welcome");
        }
    };

    const handleComplete = async () => {
        if (!selectedAvatarId) {
            toast({
                title: "Erreur",
                description: "Sélectionne un avatar",
                variant: "destructive",
            });
            return;
        }

        if (!username || username.length < 3) {
            setUsernameError("Le nom doit contenir au moins 3 caractères");
            return;
        }

        if (username.length > 20) {
            setUsernameError("Le nom ne peut pas dépasser 20 caractères");
            return;
        }

        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(username)) {
            setUsernameError("Seuls les lettres, chiffres, _ et - sont autorisés");
            return;
        }

        try {
            await completeOnboarding.mutateAsync({
                username,
                avatarId: selectedAvatarId,
            });

            toast({
                title: "Bienvenue ! 🎉",
                description: "Ton profil a été créé avec succès",
            });
        } catch (error: any) {
            const message = error.message || "";
            if (message.includes("déjà pris") || message.includes("already taken")) {
                setUsernameError("Nom d'utilisateur déjà pris");
            } else {
                toast({
                    title: "Erreur",
                    description: message || "Une erreur est survenue",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <Dialog open={open} modal>
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <AnimatePresence mode="wait">
                    {step === "welcome" && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 py-4"
                        >
                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-glow"
                                >
                                    <span className="text-5xl">漢</span>
                                </motion.div>

                                <div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        Bienvenue sur KanjiCard ! 🎉
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Avant de commencer ton aventure, personnalisons ton profil
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 py-4">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                            <span className="text-2xl">🎨</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Avatar unique</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                            <span className="text-2xl">✏️</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Nom personnalisé</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                            <span className="text-2xl">🚀</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">C'est parti !</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleNext}
                                className="w-full h-12 gradient-primary"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Commencer
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === "avatar" && (
                        <motion.div
                            key="avatar"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 py-4"
                        >
                            <AvatarSelector
                                avatars={AVATAR_OPTIONS}
                                selectedAvatarId={selectedAvatarId}
                                onSelectAvatar={setSelectedAvatarId}
                            />

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleBack}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="flex-1 gradient-primary"
                                    disabled={!selectedAvatarId}
                                >
                                    Suivant
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === "username" && (
                        <motion.div
                            key="username"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 py-4"
                        >
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 rounded-full bg-card border-4 border-primary/20 flex items-center justify-center text-5xl mx-auto mb-3">
                                    {selectedAvatarId && AVATAR_OPTIONS.find(a => a.id === selectedAvatarId)?.emoji}
                                </div>
                                <h3 className="text-lg font-semibold">Choisis ton nom</h3>
                                <p className="text-sm text-muted-foreground">
                                    Comment veux-tu être appelé ?
                                </p>
                            </div>

                            <UsernameInput
                                value={username}
                                onChange={handleUsernameChange}
                                error={usernameError}
                                checkAvailability={checkUsernameAvailability}
                            />

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleBack}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </Button>
                                <Button
                                    onClick={handleComplete}
                                    className="flex-1 gradient-primary"
                                    disabled={!username || username.length < 3 || completeOnboarding.isPending}
                                >
                                    {completeOnboarding.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            C'est parti !
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
