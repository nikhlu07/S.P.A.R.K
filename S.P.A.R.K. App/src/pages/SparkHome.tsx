import React, { useState } from "react";
import { ethers } from "ethers";
import {
  MapPin,
  Bell,
  QrCode,
  Search,
  Filter,
  Zap,
  Heart,
  Users,
  TrendingUp,
  Gift,
  Plus,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CyberBackground } from "@/components/CyberBackground";
import { WalletCard } from "@/components/WalletCard";
import { DealCard } from "@/components/DealCard";
import { RewardToken } from "@/components/RewardToken";
import { CommunityLeaderboard } from "@/components/CommunityLeaderboard";
import { PaymentScanner } from "@/components/PaymentScanner";

import {
  mockBusinesses,
  mockDeals,
  mockRewardTokens,
  mockLeaderboard,
  mockUserStats,
  mockCommunityStats,
} from "@/data/mockData";

// --- Augmenting global types ---
// A minimal interface for EIP-1193 providers.
interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
}
declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

// --- TYPES ---
type Tab = 'deals' | 'rewards' | 'community';
type Business = (typeof mockBusinesses)[0];
type Deal = (typeof mockDeals)[0];
type DealWithBusiness = {
  deal: Deal;
  business: Business;
};

// --- CONSTANTS ---
const KAIA_TESTNET = {
  chainId: '0x3E9', // 1001
  chainName: 'Kaia Kairos Testnet',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
  rpcUrls: ['https://public-en-kairos.node.kaia.io'],
  blockExplorerUrls: ['https://kairos.kaiaexplorer.io/'],
};

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'deals', label: 'VIRAL DEALS', icon: Zap },
  { id: 'rewards', label: 'NEURAL REWARDS', icon: Gift },
  { id: 'community', label: 'MATRIX HUB', icon: Users },
];

const heroImage = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop";

// --- HELPER COMPONENTS ---

const UserStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard value={mockUserStats.businessesSupported} label="Business Nodes" />
    <StatCard value={mockUserStats.tokensEarned.toFixed(2)} label="Tokens Mined" className="text-matrix-green" />
    <StatCard value={mockUserStats.nftCouponsCollected} label="NFT Assets" className="text-cyber-gold" />
    <StatCard value={`#${mockUserStats.communityRank}`} label="Neural Rank" />
  </div>
);

const StatCard = ({ value, label, className }: { value: string | number; label: string; className?: string }) => (
  <div className="p-4 rounded-lg bg-gradient-card backdrop-blur-sm border border-primary/20 text-center shadow-cyber hover:shadow-neural transition-cyber group">
    <div className={cn("text-2xl font-neural font-bold text-primary mb-1 data-readout group-hover:animate-neural-pulse", className)}>{value}</div>
    <div className="text-xs text-muted-foreground font-cyber uppercase">{label}</div>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function SparkHome() {
  const [activeTab, setActiveTab] = useState<Tab>('deals');
  const [showPaymentScanner, setShowPaymentScanner] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletUsdBalance, setWalletUsdBalance] = useState<number>(0);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(KAIA_TESTNET.chainId)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: KAIA_TESTNET.chainId }],
          });
        } catch (switchError: unknown) {
          const error = switchError as { code?: number };
          if (error.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [KAIA_TESTNET],
            });
          } else {
            console.error("Failed to switch wallet:", error);
            alert("Failed to switch wallet. See console for more details.");
            return;
          }
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      const formattedBalance = parseFloat(ethers.formatUnits(balance, 18));
      const kaiaUsdPrice = 0.15; // In a real app, this would be fetched from an oracle

      setWalletAddress(address);
      setWalletBalance(formattedBalance);
      setWalletUsdBalance(formattedBalance * kaiaUsdPrice);

    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. See console for more details.");
    }
  };

  const dealsWithBusinesses: DealWithBusiness[] = mockDeals.map(deal => ({
    deal,
    business: mockBusinesses.find(b => b.id === deal.businessId)!,
  })).filter((item): item is DealWithBusiness => item.business != null);

  const trendingDeals = dealsWithBusinesses.filter(({ deal }) => deal.trending);
  const localDeals = dealsWithBusinesses.filter(({ deal }) => !deal.trending);

  const renderContent = () => {
    switch (activeTab) {
      case 'deals':
        return <DealsContent trendingDeals={trendingDeals} localDeals={localDeals} />;
      case 'rewards':
        return <RewardsContent />;
      case 'community':
        return <CommunityContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans relative">
      <CyberBackground />
      <div className="relative z-10">
        <Header onScanClick={() => setShowPaymentScanner(true)} />
        <main className="container mx-auto px-4 py-6 space-y-8">
          <Hero onScanClick={() => setShowPaymentScanner(true)} />
          {walletAddress ? (
            <WalletCard
              balance={walletBalance}
              usdBalance={walletUsdBalance}
              address={walletAddress}
            />
          ) : (
            <ConnectWallet onConnect={connectWallet} />
          )}
          <UserStats />
          <SearchBar />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderContent()}
        </main>
        <FloatingScanButton onClick={() => setShowPaymentScanner(true)} />
      </div>
      <PaymentScanner
        isOpen={showPaymentScanner}
        onClose={() => setShowPaymentScanner(false)}
      />
    </div>
  );
}

// --- SUB-COMPONENTS for SparkHome ---

const Header = ({ onScanClick }: { onScanClick: () => void }) => (
  <header className="sticky top-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-purple-500/20 shadow-cyber">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="SPARK" className="h-8" />
        <h1 className="text-xl font-neural font-bold cyber-text">SPARK</h1>
        <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground font-cyber">
          <MapPin className="w-4 h-4" />
          <span className="data-readout">LUCKNOW // UTTAR PRADESH</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center animate-neural-pulse">
            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
          </div>
        </Button>
        <Button variant="cyber" size="icon" onClick={onScanClick}>
          <QrCode className="w-5 h-5" />
        </Button>
      </div>
    </div>
  </header>
);

const Hero = ({ onScanClick }: { onScanClick: () => void }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-cyber border border-primary/30 shadow-neural">
    <div className="absolute inset-0">
      <img src={heroImage} alt="Neural Commerce Revolution" className="w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-black/60" />
    </div>
    <div className="relative z-10 p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-neural font-bold mb-4 neural-title">NEURAL COMMERCE PROTOCOL ACTIVE ⚡</h1>
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-6 font-cyber">INTERFACING WITH LOCAL BUSINESS MATRIX // LUCKNOW SECTOR</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="neural" size="lg" onClick={onScanClick}>
            <QrCode className="w-5 h-5 mr-2" />
            INITIATE SCAN
          </Button>
          <Button variant="quantum" size="lg">
            <Gift className="w-5 h-5 mr-2" />
            ACCESS DEALS
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const ConnectWallet = ({ onConnect }: { onConnect: () => void }) => (
  <div className="p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-primary/20 text-center shadow-cyber hover:shadow-neural transition-cyber group">
    <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
    <p className="text-muted-foreground mb-4">Engage with the SPARK ecosystem on the Kaia network.</p>
    <Button variant="electric" onClick={onConnect}>
      Connect Wallet
    </Button>
  </div>
);

const SearchBar = () => (
    <div className="flex gap-3">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                placeholder="SEARCH LOCAL MATRIX..."
                className="pl-10 bg-gradient-card backdrop-blur-sm border-primary/30 focus:border-primary/60 font-cyber uppercase text-sm placeholder:text-muted-foreground/60"
            />
        </div>
        <Button variant="neural" size="icon">
            <Filter className="w-4 h-4" />
        </Button>
    </div>
);

const Tabs = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (tab: Tab) => void }) => (
  <div className="flex gap-1 p-1 bg-gradient-card backdrop-blur-sm rounded-lg border border-primary/20 shadow-cyber">
    {TABS.map(tab => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-cyber font-bold uppercase tracking-wide transition-cyber relative overflow-hidden",
            activeTab === tab.id
              ? "bg-gradient-electric text-primary-foreground shadow-neural"
              : "text-muted-foreground hover:text-foreground hover:bg-black/20"
          )}
        >
          <Icon className="w-4 h-4" />
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-holo-shimmer" />
          )}
        </button>
      );
    })}
  </div>
);

const DealsContent = ({ trendingDeals, localDeals }: { trendingDeals: DealWithBusiness[], localDeals: DealWithBusiness[] }) => (
  <div className="space-y-6">
    <DealsSection title="🔥 VIRAL PROTOCOL ACTIVE" deals={trendingDeals} badgeText={`${trendingDeals.length} NODES`} icon={TrendingUp} />
    <DealsSection title="LOCAL COMMERCE MATRIX" deals={localDeals} icon={Heart} />
  </div>
);

const DealsSection = ({ title, deals, badgeText, icon: Icon }: { title: string; deals: DealWithBusiness[]; badgeText?: string, icon: React.ElementType }) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-primary animate-neural-pulse" />
      <h2 className="text-lg font-neural font-bold neural-title">{title}</h2>
      {badgeText && (
        <Badge variant="secondary" className="ml-auto bg-gradient-electric text-primary-foreground font-cyber shadow-neural">
          {badgeText}
        </Badge>
      )}
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {deals.map(({ deal, business }) => (
        <DealCard
          key={deal.id}
          business={business}
          deal={deal}
          onShare={() => alert(`Sharing deal ID: ${deal.id}`)}
          onClaim={() => alert(`Claiming deal ID: ${deal.id}`)}
        />
      ))}
    </div>
  </div>
);

const RewardsContent = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">💎 Your Active Rewards</h2>
        <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Discover More
        </Button>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockRewardTokens.map((token) => (
        <RewardToken key={token.symbol} token={token} onClick={() => console.log('Token clicked:', token.symbol)} />
      ))}
    </div>
    <CommunityInvestmentPool />
  </div>
);

const CommunityInvestmentPool = () => (
    <div className="p-6 rounded-xl bg-gradient-success text-success-foreground shadow-success">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold">Community Investment Pool</h3>
                <p className="text-success-foreground/80">Earn while helping local businesses grow</p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
                <div className="text-2xl font-bold">₹{mockCommunityStats.communityPool.toLocaleString()}</div>
                <div className="text-success-foreground/80 text-sm">Total Pool Value</div>
            </div>
            <div>
                <div className="text-2xl font-bold">{mockCommunityStats.averageYield}%</div>
                <div className="text-success-foreground/80 text-sm">Annual Yield</div>
            </div>
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 bg-white/10 text-success-foreground border-0 hover:bg-white/20">
                Invest Now
            </Button>
            <Button variant="secondary" className="flex-1 bg-white/10 text-success-foreground border-0 hover:bg-white/20">
                Learn More
            </Button>
        </div>
    </div>
);


const CommunityContent = () => (
  <div className="space-y-6">
    <CommunityLeaderboard entries={mockLeaderboard} title="🎯 Community Champions" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CommunityStat value={mockCommunityStats.totalUsers.toLocaleString()} label="Active Users" />
        <CommunityStat value={mockCommunityStats.activeBusinesses} label="Local Businesses" className="text-matrix-green" />
        <CommunityStat value={`₹${(mockCommunityStats.monthlyVolume / 1000000).toFixed(1)}M`} label="Monthly Volume" className="text-cyber-gold" />
        <CommunityStat value={mockCommunityStats.loansActive} label="Active Loans" />
    </div>
  </div>
);

const CommunityStat = ({ value, label, className }: { value: string | number; label: string; className?: string }) => (
    <div className="p-4 rounded-lg bg-gradient-card border border-border/50 text-center">
        <div className={cn("text-xl font-bold text-primary mb-1", className)}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
    </div>
);

const FloatingScanButton = ({ onClick }: { onClick: () => void }) => (
  <div className="fixed bottom-6 right-6 z-40">
    <Button
      variant="electric"
      size="lg"
      className="rounded-full w-14 h-14 shadow-neural animate-cyber-glow"
      onClick={onClick}
    >
      <QrCode className="w-6 h-6" />
    </Button>
  </div>
);
