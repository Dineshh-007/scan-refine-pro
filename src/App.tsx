import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Process from "./pages/Process";
import Hospitals from "./pages/Hospitals";
import Reports from "./pages/Reports";
import Educate from "./pages/Educate";
import Breathing from "./pages/Breathing";
import MacroTracker from "./pages/MacroTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/process" element={<Process />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/educate" element={<Educate />} />
          <Route path="/breathing" element={<Breathing />} />
          <Route path="/macro-tracker" element={<MacroTracker />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
