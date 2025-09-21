import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import { SupabaseProvider } from "./contexts/SupabaseContext";
import { LineProvider } from "./contexts/LineContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import MainLayout from "@/components/layout/MainLayout";
import SparkHome from "./pages/SparkHome";
import ExploreViralDeals from "./pages/ExploreViralDeals";
import LocalMarketplace from "./pages/LocalMarketplace";
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
import BusinessVerifyPage from "./pages/business/BusinessVerifyPage";
import PaymentScanPage from "./pages/PaymentScanPage";
import Community from "./pages/Community";
import LocalExchangeListing from "./pages/business/LocalExchangeListing";
import { LineDemoPage } from "./pages/LineDemo";
import AnalyticsDemo from "./pages/AnalyticsDemo";
// Removed NetworkStats import as feature is deprecated

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LineProvider>
      <Web3Provider>
        <SupabaseProvider>
          <BusinessProvider>
            <BlockchainProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<SparkHome />} />
                  <Route path="/explore-viral-deals" element={<ExploreViralDeals />} />
                  <Route path="/local-marketplace" element={<LocalMarketplace />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/deal/:dealId" element={<DealDetails />} />
                  <Route path="/discover-rewards" element={<DiscoverRewards />} />
                  <Route path="/invest" element={<Invest />} />
                  <Route path="/pay" element={<PaymentScanPage />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/line-demo" element={<LineDemoPage />} />
                  <Route path="/analytics" element={<AnalyticsDemo />} />
                  {/* Removed Network Stats route */}
                </Route>

                <Route path="/business" element={<BusinessLayout />}>
                  <Route index element={<BusinessWelcomePage />} />
                  <Route path="login" element={<BusinessLoginPage />} />
                  <Route path="register" element={<BusinessRegisterPage />} />
                  <Route path="dashboard" element={<BusinessDashboard />} />
                  <Route path="verify" element={<BusinessVerifyPage />} />
                  <Route path="exchange-listing" element={<LocalExchangeListing />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
            </BlockchainProvider>
          </BusinessProvider>
        </SupabaseProvider>
      </Web3Provider>
    </LineProvider>
  </QueryClientProvider>
);

export default App;
