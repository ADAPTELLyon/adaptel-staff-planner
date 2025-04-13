
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Commandes from "./pages/Commandes";
import Planning from "./pages/Planning";
import Clients from "./pages/Clients";
import Candidats from "./pages/Candidats";
import Parametrages from "./pages/Parametrages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/commandes" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/commandes" element={<Commandes />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/candidats" element={<Candidats />} />
            <Route path="/parametrages" element={<Parametrages />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
