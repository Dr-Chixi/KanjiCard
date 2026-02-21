import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Study from "./pages/Study";
import Decks from "./pages/Decks";
import CreateDeck from "./pages/CreateDeck";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { needsOnboarding, isCheckingOnboarding, profile } = useOnboarding();
  const { user, loading } = useAuth();

  return (
    <BrowserRouter>
      <Toaster />
      <Sonner />

      {/* DEBUG OVERLAY - Restricted to specific admin */}
      {user?.email === 'charif.lycee@gmail.com' && (
        <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-[10px] z-[9999] pointer-events-none max-w-md overflow-hidden break-words font-mono scale-90 origin-top-left opacity-50 hover:opacity-100 transition-opacity">
          <p>User Auth: {user ? user.email : "NULL"}</p>
          <p>Profile Username: {profile?.username || "NULL"}</p>
          <p>Profile Avatar: {profile?.avatar_url || "NULL"}</p>
          <p>Loading Auth: {loading ? "YES" : "NO"}</p>
          <p>Checking Onboarding: {isCheckingOnboarding ? "YES" : "NO"}</p>
          <p className={needsOnboarding ? "text-green-400 font-bold" : "text-red-400"}>
            Needs Onboarding: {needsOnboarding ? "YES" : "NO"}
          </p>
          <p className="border-t border-gray-600 mt-1 pt-1 text-gray-400">URL Params:</p>
          <p>Search: {window.location.search || "(none)"}</p>
          <p>Hash: {window.location.hash || "(none)"}</p>
        </div>
      )}

      <OnboardingModal open={needsOnboarding} />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/:deckId"
          element={
            <ProtectedRoute>
              <Study />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <Decks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/create"
          element={
            <ProtectedRoute>
              <CreateDeck />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/edit/:deckId"
          element={
            <ProtectedRoute>
              <CreateDeck />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

