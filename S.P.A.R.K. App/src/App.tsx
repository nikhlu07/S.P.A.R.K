
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import MainLayout from "@/components/layout/MainLayout";
import SparkHome from "./pages/SparkHome";
import ExploreViralDeals from "./pages/ExploreViralDeals";
import Notifications from "./pages/Notifications";
import DealDetails from "./pages/DealDetails";
import DiscoverRewards from "./pages/DiscoverRewards";
import Invest from "./pages/Invest";
import NotFound from "./pages/NotFound";
import BusinessLayout from "@/components/layout/BusinessLayout";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import BusinessLoginPage from "./pages/business/BusinessLoginPage";
import BusinessRegisterPage from "./pages/business/BusinessRegisterPage";
import BusinessWelcomePage from "./pages/business/BusinessWelcomePage";
import BusinessVerificationPage from "./pages/business/BusinessVerificationPage";
import LocalExchangeListing from "./pages/business/LocalExchangeListing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
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

          <Route path="/business" element={<BusinessLayout />}>
            <Route index element={<BusinessWelcomePage />} />
            <Route path="login" element={<BusinessLoginPage />} />
            <Route path="register" element={<BusinessRegisterPage />} />
            <Route path="dashboard" element={<BusinessDashboard />} />
            <Route path="verify" element={<BusinessVerificationPage />} />
            <Route path="exchange-listing" element={<LocalExchangeListing />} />
          </Route>

          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
