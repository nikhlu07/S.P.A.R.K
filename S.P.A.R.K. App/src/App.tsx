import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SparkHome from "./pages/SparkHome";
import ExploreViralDeals from "./pages/ExploreViralDeals";
import Notifications from "./pages/Notifications";
import DealDetails from "./pages/DealDetails";
import DiscoverRewards from "./pages/DiscoverRewards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<SparkHome />} />
            <Route path="/explore-viral-deals" element={<ExploreViralDeals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/deal/:dealId" element={<DealDetails />} />
            <Route path="/discover-rewards" element={<DiscoverRewards />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
