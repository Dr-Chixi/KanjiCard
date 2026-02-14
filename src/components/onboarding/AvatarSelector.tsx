import { motion } from "framer-motion";
import { AvatarOption } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
    avatars: AvatarOption[];
    selectedAvatarId: string | null;
    onSelectAvatar: (avatarId: string) => void;
}

export default function AvatarSelector({
    avatars,
    selectedAvatarId,
    onSelectAvatar,
}: AvatarSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Choisis ton avatar</h3>
                <p className="text-sm text-muted-foreground">
                    Sélectionne un avatar qui te représente
                </p>
            </div>

            <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2">
                {avatars.map((avatar, index) => (
                    <motion.button
                        key={avatar.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => onSelectAvatar(avatar.id)}
                        className={cn(
                            "relative aspect-square rounded-xl border-2 transition-all duration-200",
                            "hover:scale-110 hover:shadow-lg",
                            "flex items-center justify-center text-4xl",
                            selectedAvatarId === avatar.id
                                ? "border-primary bg-primary/10 shadow-glow"
                                : "border-border bg-card hover:border-primary/50"
                        )}
                        type="button"
                        aria-label={avatar.label}
                    >
                        {avatar.emoji}
                        {selectedAvatarId === avatar.id && (
                            <motion.div
                                layoutId="avatar-selected"
                                className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <svg
                                    className="w-3 h-3 text-primary-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </motion.div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
