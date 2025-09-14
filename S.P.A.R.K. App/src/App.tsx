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
import Invest from "./pages/Invest";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

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
            <Route path="/invest" element={<Invest />} />
          </Route>
          {/*<Route path="/login" element={<LoginPage />} />*/}
          {/*<Route path="/register" element={<RegisterPage />} />*/}
          {/*<Route path="/profile" element={<ProfilePage />} />*/}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL \"*\" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
