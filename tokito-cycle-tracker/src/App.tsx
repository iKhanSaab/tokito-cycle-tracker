import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadScreen } from "@/components/LoadScreen";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [showLoadScreen, setShowLoadScreen] = useState(true);
  const [loadComplete, setLoadComplete] = useState(false);

  // Show loading screen every time the app opens
  const handleLoadComplete = () => {
    setLoadComplete(true);
    // Small delay for smooth transition
    setTimeout(() => {
      setShowLoadScreen(false);
    }, 300);
  };

  if (showLoadScreen && !loadComplete) {
    return <LoadScreen onComplete={handleLoadComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
