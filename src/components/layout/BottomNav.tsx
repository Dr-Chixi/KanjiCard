import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Folder, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t z-50">
            <div className="max-w-lg mx-auto flex items-center justify-around py-3">
                <Button
                    variant="ghost"
                    className={`flex-col gap-1 h-auto py-2 ${isActive("/") ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground"}`}
                    onClick={() => navigate("/")}
                >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs">Apprendre</span>
                </Button>
                <Button
                    variant="ghost"
                    className={`flex-col gap-1 h-auto py-2 ${isActive("/decks") ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground"}`}
                    onClick={() => navigate("/decks")}
                >
                    <Folder className="w-5 h-5" />
                    <span className="text-xs">Decks</span>
                </Button>
                <Button
                    variant="ghost"
                    className={`flex-col gap-1 h-auto py-2 ${isActive("/profile") ? "text-primary hover:text-primary hover:bg-transparent" : "text-muted-foreground"}`}
                    onClick={() => navigate("/profile")}
                >
                    <User className="w-5 h-5" />
                    <span className="text-xs">Profil</span>
                </Button>
            </div>
        </nav>
    );
}
