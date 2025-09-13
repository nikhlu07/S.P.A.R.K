import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
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
import { WalletCard } from "@/components/WalletCard";
import { DealCard } from "@/components/DealCard";
import { RewardToken } from "@/components/RewardToken";
import { CommunityLeaderboard } from "@/components/CommunityLeaderboard";
import type { AppContext } from "@/components/layout/MainLayout";

import {
  mockBusinesses,
  mockDeals,
  mockRewardTokens,
  mockLeaderboard,
  mockUserStats,
  mockCommunityStats,
} from "@/data/mockData";

// --- Augmenting global types ---
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

// --- HELPER COMPONENTS ---

const UserStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard value={mockUserStats.businessesSupported} label="Business Nodes" />
    <StatCard value={mockUserStats.tokensEarned.toFixed(2)} label="Tokens Mined" className="text-purple-400" />
    <StatCard value={mockUserStats.nftCouponsCollected} label="NFT Assets" className="text-purple-400" />
    <StatCard value={`#${mockUserStats.communityRank}`} label="Neural Rank" />
  </div>
);

const StatCard = ({ value, label, className }: { value: string | number; label: string; className?: string }) => (
    <div className={cn("card-border-glow p-4 rounded-lg text-center animation-none", className)}>
        <div className={cn("text-2xl font-tech font-bold text-white mb-1", className)}>{value}</div>
        <div className="text-xs text-gray-400 font-tech uppercase">{label}</div>
    </div>
);

// --- MAIN APP COMPONENT ---

export default function SparkHome() {
  const { setShowPaymentScanner } = useOutletContext<AppContext>();
  const [activeTab, setActiveTab] = useState<Tab>('deals');
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
    <>
      <Hero onScanClick={() => setShowPaymentScanner(true)} />
      {walletAddress ? (
        <WalletCard
          balance={walletBalance}
          usdBalance={walletUsdBalance}
          address={walletAddress}
          networkName={KAIA_TESTNET.chainName}
          currencySymbol={KAIA_TESTNET.nativeCurrency.symbol}
        />
      ) : (
        <ConnectWallet onConnect={connectWallet} />
      )}
      <UserStats />
      <SearchBar />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </>
  );
}

// --- SUB-COMPONENTS for SparkHome ---

const Hero = ({ onScanClick }: { onScanClick: () => void }) => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            setTime(now.toLocaleTimeString('en-US', options).replace(' ', '') + ' IST');
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative hero-bg pt-16 pb-10 md:pt-20 md:pb-14">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="font-tech text-purple-400 text-sm mb-4 flex justify-center items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="status-light"></span>
                        <span>SYSTEM STATUS: OPERATIONAL</span>
                    </div>
                    <span>|</span>
                    <span>INDIA</span>
                    <span>|</span>
                    <span id="live-time">{time}</span>
                </div>
                <h1 className="font-tech text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tighter mt-4 text-glow">
                    Neural Commerce Matrix
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-md md:text-lg text-gray-400">
                    Connecting you to the future of local economies.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link to="/explore-viral-deals" className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto">
                        Explore Viral Deals
                    </Link>
                    <Button onClick={onScanClick} className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 font-semibold px-8 py-3 rounded-lg w-full sm:w-auto flex items-center justify-center space-x-2">
                        <QrCode className="w-5 h-5" />
                        <span>Scan & Pay</span>
                    </Button>
                </div>
            </div>
        </section>
    );
}


const ConnectWallet = ({ onConnect }: { onConnect: () => void }) => (
    <div className="bg-gray-900/50 card-border-glow rounded-lg p-10 md:p-12 text-center animation-none">
        <h2 className="font-tech text-2xl md:text-3xl font-bold text-white text-glow">Connect to the Matrix</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Engage with the SPARK ecosystem on the Kaia network to unlock the full potential of social commerce.</p>
        <div className="mt-8">
            <button onClick={onConnect} className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto">
                Connect Wallet
            </button>
        </div>
    </div>
);

const SearchBar = () => (
    <div className="flex gap-3">
        <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                placeholder="Search deals, businesses, or rewards..."
                className="pl-10 bg-black/20 border-purple-500/30 focus:border-purple-500/60 font-tech text-sm text-white placeholder:text-gray-500 rounded-lg"
            />
        </div>
        <Button className="glow-button text-white rounded-lg" onClick={() => alert('Filter functionality to be implemented.')}>
            <Filter className="w-4 h-4" />
        </Button>
    </div>
);

const Tabs = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (tab: Tab) => void }) => (
  <div className="flex gap-1 p-1 bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/20">
    {TABS.map(tab => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-tech font-bold uppercase tracking-wide transition-all duration-300",
            activeTab === tab.id
              ? "bg-purple-500/10 text-white text-glow"
              : "text-gray-400 hover:text-white hover:bg-purple-500/5"
          )}
        >
          <Icon className="w-4 h-4" />
          {tab.label}
        </button>
      );
    })}
  </div>
);

const DealsContent = ({ trendingDeals, localDeals }: { trendingDeals: DealWithBusiness[], localDeals: DealWithBusiness[] }) => (
  <div className="space-y-8">
    <DealsSection title="🔥 Viral Deals" deals={trendingDeals} badgeText={`${trendingDeals.length} Active`} icon={TrendingUp} />
    <DealsSection title="📍 Local Marketplace" deals={localDeals} icon={Heart} />
  </div>
);

const DealsSection = ({ title, deals, badgeText, icon: Icon }: { title: string; deals: DealWithBusiness[]; badgeText?: string, icon: React.ElementType }) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-5 h-5 text-purple-400" />
      <h2 className="text-xl font-tech font-bold text-white text-glow">{title}</h2>
      {badgeText && (
        <Badge className="ml-auto bg-purple-500/10 border border-purple-500 text-purple-300 font-tech">
          {badgeText}
        </Badge>
      )}
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deals.map(({ deal, business }) => (
        <DealCard
          key={deal.id}
          business={business}
          deal={deal}
          onShare={() => alert(`Sharing deal ID: ${deal.id}`)}
        />
      ))}
    </div>
  </div>
);

const RewardsContent = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
        <h2 className="text-xl font-tech font-bold text-white text-glow flex items-center gap-3"><Gift className="w-5 h-5 text-purple-400" /> Your Reward Tokens</h2>
        <Link to="/discover-rewards">
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white">
              <Plus className="w-4 h-4 mr-1" />
              Discover More
          </Button>
        </Link>
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockRewardTokens.map((token) => (
        <RewardToken key={token.symbol} token={token} onClick={() => console.log("Token clicked:", token.symbol)} />
      ))}
    </div>
    <CommunityInvestmentPool />
  </div>
);

const CommunityInvestmentPool = () => (
    <div className="card-border-glow rounded-lg p-8 animation-none">
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-purple-900/50 border-2 border-purple-700 flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="font-tech text-2xl font-bold text-white text-glow">Community Quantum Yield</h3>
                <p className="mt-2 text-gray-400">Invest in local businesses and earn a share of their success. Your capital directly fuels the local economy.</p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-6 text-center">
                <div>
                    <div className="text-3xl font-bold text-white">₹{mockCommunityStats.communityPool.toLocaleString()}</div>
                    <div className="text-sm text-purple-400 font-tech">Total Value Locked</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white">{mockCommunityStats.averageYield}%</div>
                    <div className="text-sm text-purple-400 font-tech">Average APY</div>
                </div>
            </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto" onClick={() => alert('Invest Now functionality to be implemented.')}>Invest Now</Button>
            <Button className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 font-semibold px-8 py-3 rounded-lg w-full sm:w-auto" onClick={() => alert('Learn More functionality to be implemented.')}>Learn More</Button>
        </div>
    </div>
);


const CommunityContent = () => (
  <div className="space-y-8">
    <CommunityLeaderboard entries={mockLeaderboard} title="Community Champions" />
    <div className="text-center">
        <h2 className="text-xl font-tech font-bold text-white text-glow flex items-center justify-center gap-3"><Users className="w-5 h-5 text-purple-400" /> Network Statistics</h2>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CommunityStat value={mockCommunityStats.totalUsers.toLocaleString()} label="Active Users" />
        <CommunityStat value={mockCommunityStats.activeBusinesses} label="Local Businesses" className="text-purple-400" />
        <CommunityStat value={`₹${(mockCommunityStats.monthlyVolume / 1000000).toFixed(1)}M`} label="Monthly Volume" className="text-purple-400" />
        <CommunityStat value={mockCommunityStats.loansActive} label="Active Loans" />
    </div>
  </div>
);

const CommunityStat = ({ value, label, className }: { value: string | number; label: string; className?: string }) => (
    <div className={cn("card-border-glow p-4 rounded-lg text-center animation-none", className)}>
        <div className={cn("text-2xl font-tech font-bold text-white mb-1", className)}>{value}</div>
        <div className="text-xs text-gray-400 font-tech uppercase">{label}</div>
    </div>
);
