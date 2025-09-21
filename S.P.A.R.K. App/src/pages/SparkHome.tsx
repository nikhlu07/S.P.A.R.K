
import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Search,
  Filter,
  Zap,
  Heart,
  TrendingUp,
  Repeat,
  QrCode,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WalletCard } from "@/components/WalletCard";
import { DealCard } from "@/components/DealCard";
import { LineTestComponent } from "@/components/LineTestComponent";
import { DealDialog } from "@/components/DealDialog";
import { LearnMoreDialog } from "@/components/LearnMoreDialog";
import type { AppContext } from "@/components/layout/MainLayout";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSupabase } from "@/contexts/SupabaseContext";
import { mockViralDeals, mockLocalBusinesses, mockTransactions, mockInvestmentData } from "@/data/mockHomeData";

import TransactionsPage from "./TransactionsPage";

// --- TYPES ---
type Tab = 'deals' | 'invest' | 'transactions';
type Business = {
  id: string;
  name: string;
  category: string;
  location: string;
  owner: string;
  isVerified: boolean;
  trustScore: number;
  totalVolume: number;
  createdAt: Date;
  metadataURI: string;
};
type Deal = {
  id: number;
  title: string;
  description: string;
  maxCoupons: number;
  claimedCoupons: number;
  discountPercent: number;
  creator: string;
  isActive: boolean;
  createdAt: Date;
};
type DealWithBusiness = {
  deal: Deal;
  business: Business;
};

// --- CONSTANTS ---
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'deals', label: 'VIRAL DEALS', icon: Zap },
  { id: 'invest', label: 'INVEST & EARN', icon: TrendingUp },
  { id: 'transactions', label: 'TRANSACTIONS', icon: Repeat },
];

// --- HELPER COMPONENTS ---

const UserStats = ({ 
  usdtBalance, 
  businessesSupported = 0,
  couponsCollected = 0,
  communityRank = 1
}: { 
  usdtBalance?: string;
  businessesSupported?: number;
  couponsCollected?: number;
  communityRank?: number;
}) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={businessesSupported} label="Business Nodes" />
        <StatCard value={usdtBalance ? parseFloat(usdtBalance).toFixed(2) : "0.00"} label="USDT Balance" className="text-purple-400" />
        <StatCard value={couponsCollected} label="Coupons Collected" className="text-purple-400" />
        <StatCard value={`#${communityRank}`} label="Community Rank" />
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
  const { 
    setShowPaymentScanner,
    walletAddress,
    walletBalance,
    walletUsdBalance,
    connectWallet,
    isLoggedIn,
  } = useOutletContext<AppContext>();
  
  const {
    isConnected,
    account,
    balance,
    usdtBalance,
    kaiaUsdValue,
    businesses: web3Businesses,
    campaigns: web3Campaigns,
    poolInfo,
    connectWallet: connectWeb3Wallet,
    refreshBalances,
    isLoading: web3Loading,
    error: web3Error
  } = useWeb3();

  const {
    businesses: supabaseBusinesses,
    deals: supabaseDeals,
    dealsWithBusinesses: supabaseDealsWithBusinesses,
    trendingDeals: supabaseTrendingDeals,
    nftCouponDeals: supabaseNftCouponDeals,
    rewardTokens,
    leaderboard,
    userStats: supabaseUserStats,
    communityStats: supabaseCommunityStats,
    isLoading: supabaseLoading,
    error: supabaseError,
    refreshAll: refreshSupabaseData
  } = useSupabase();
  
  const [activeTab, setActiveTab] = useState<Tab>('deals');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  const handleViewDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDialogOpen(true);
  };

  const handleConnectWallet = async () => {
    try {
      await connectWeb3Wallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };


  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDealId(null);
  };

  // Use Web3 data if available, otherwise use mock data
  const businesses = web3Businesses.length > 0 ? web3Businesses : mockLocalBusinesses;
  const campaigns = web3Campaigns.length > 0 ? web3Campaigns : [];
  
  // Create deals from real businesses
  const realBusinessDeals = businesses.map((business, index) => ({
    id: `real_${business.id}`,
    title: `Special Deal from ${business.name}`,
    description: `Exclusive offer from ${business.name} in ${business.location}`,
    business: business,
    deal: {
      id: index + 100,
      title: `Special Deal from ${business.name}`,
      description: `Exclusive offer from ${business.name}`,
      maxCoupons: 50,
      claimedCoupons: Math.floor(Math.random() * 30),
      discountPercent: 20 + Math.floor(Math.random() * 30),
      creator: business.owner,
      isActive: true,
      createdAt: business.createdAt
    },
    image: business.category === 'Food' ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : 
           business.category === 'Technology' ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" :
           "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
    discount: `${20 + Math.floor(Math.random() * 30)}%`,
    nftCoupon: Math.random() > 0.5,
    trending: business.isVerified,
    claimed: Math.floor(Math.random() * 30),
    total: 50
  }));
  
  // Use real business deals if available, otherwise use mock data
  const trendingDeals = realBusinessDeals.length > 0 ? [...realBusinessDeals, ...mockViralDeals] : mockViralDeals;
  const localDeals = realBusinessDeals.length > 0 ? realBusinessDeals : mockViralDeals.slice(1);

  const renderContent = () => {
    switch (activeTab) {
      case 'deals':
        return <DealsContent trendingDeals={trendingDeals} localDeals={localDeals} onViewDeal={handleViewDeal} />;
      case 'invest':
        return <InvestContent 
          poolInfo={mockInvestmentData} 
          onLearnMoreClick={() => setIsLearnMoreOpen(true)} 
        />;
      case 'transactions':
        return <TransactionsContent transactions={mockTransactions} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Hero onScanClick={() => setShowPaymentScanner(true)} />
      {/* <LineTestComponent /> */}
      {isConnected && account ? (
        <WalletCard
          balance={parseFloat(balance)}
          usdBalance={parseFloat(kaiaUsdValue)}
          address={account}
          networkName="Kaia Kairos Testnet"
          currencySymbol="KAIA"
        />
      ) : (
        <ConnectWallet onConnect={handleConnectWallet} />
      )}
      
      {(web3Error || supabaseError) && (
        <div className="text-red-500 text-center text-sm mt-4">
          {web3Error || supabaseError}
        </div>
      )}
      

      <UserStats 
        usdtBalance={usdtBalance}
        businessesSupported={businesses.length}
        couponsCollected={campaigns.reduce((sum, c) => sum + (c.claimedCoupons || 0), 0)}
        communityRank={1}
      />
      <SearchBar />
      
      
      {/* Loading and refresh controls */}
      <div className="flex justify-between items-center mb-4">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <Button 
          onClick={async () => {
            await refreshBalances();
            await refreshSupabaseData();
          }}
          disabled={supabaseLoading || web3Loading}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {(supabaseLoading || web3Loading) ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>
      
      {renderContent()}
      <DealDialog
        dealId={selectedDealId}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
      <LearnMoreDialog isOpen={isLearnMoreOpen} onClose={() => setIsLearnMoreOpen(false)} />
    </>
  );
}

// --- SUB-COMPONENTS for SparkHome ---

const Hero = ({ onScanClick }: { onScanClick: () => void }) => {
    return (
        <section className="relative hero-bg pt-8 pb-10 md:pt-20 md:pb-14">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="font-tech text-purple-400 text-sm mb-4 flex justify-center items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="status-light"></span>
                        <span>SYSTEM STATUS: OPERATIONAL</span>
                    </div>
                    <span>|</span>
                    <span>INDIA</span>
                </div>
                <h1 className="font-tech text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tighter mt-6 text-glow">
                    S.P.A.R.K
                </h1>
                <p className="mt-2 text-lg md:text-xl text-purple-300 font-medium">
                    Social Platform for Augmented Reality Commerce
                </p>
                <p className="mt-4 max-w-4xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed">
                    Discover exclusive deals, invest in local businesses, and connect with your community through the power of blockchain technology. 
                    <span className="text-purple-400 font-semibold"> Experience the future of social commerce today.</span>
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link to="/explore-viral-deals" className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto">
                        Discover Deals
                    </Link>
                    <Button onClick={onScanClick} className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 font-semibold px-8 py-3 rounded-lg w-full sm:w-auto flex items-center justify-center space-x-2">
                        <QrCode className="w-5 h-5" />
                        <span>Quick Pay</span>
                    </Button>
                </div>
            </div>
        </section>
    );
}


const ConnectWallet = ({ onConnect }: { onConnect: () => void }) => (
    <div className="bg-gray-900/50 card-border-glow rounded-lg p-10 md:p-12 text-center animation-none">
        <h2 className="font-tech text-2xl md:text-3xl font-bold text-white text-glow">Connect Your Wallet</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">Join the S.P.A.R.K ecosystem and unlock exclusive deals, community investments, and seamless payments powered by blockchain technology.</p>
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
                placeholder="Search deals, businesses, or investments..."
                className="pl-10 bg-black/20 border-purple-500/30 focus:border-purple-500/60 font-tech text-sm text-white placeholder:text-gray-500 rounded-lg"
            />
        </div>
        <Button className="glow-button text-white rounded-lg" onClick={() => alert('Filter functionality to be implemented.')}>
            <Filter className="w-4 h-4" />
        </Button>
    </div>
);

const Tabs = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (tab: Tab) => void }) => (
  <div className="flex gap-2 p-2 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-lg">
    {TABS.map(tab => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-tech font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden",
            isActive
              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white text-glow border border-purple-400/50 shadow-lg shadow-purple-500/20"
              : "text-gray-400 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent"
          )}
        >
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse" />
          )}
          <Icon className={cn("w-5 h-5 relative z-10", isActive ? "text-purple-300" : "text-gray-500")} />
          <span className="relative z-10">{tab.label}</span>
          {isActive && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
          )}
        </button>
      );
    })}
  </div>
);

const DealsContent = ({ trendingDeals, localDeals, onViewDeal }: { trendingDeals: DealWithBusiness[], localDeals: DealWithBusiness[], onViewDeal: (dealId: string) => void }) => (
  <div className="space-y-8">
    <DealsSection title="🔥 Trending Deals" deals={trendingDeals} badgeText={`${trendingDeals.length} Active`} icon={TrendingUp} onViewDeal={onViewDeal} />
    <DealsSection title="🏪 Local Businesses" deals={localDeals} icon={Heart} onViewDeal={onViewDeal} />
  </div>
);

const DealsSection = ({ title, deals, badgeText, icon: Icon, onViewDeal }: { title: string; deals: any[]; badgeText?: string, icon: React.ElementType, onViewDeal: (dealId: string) => void }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-6 h-6 text-purple-400" />
      <h2 className="text-2xl font-tech font-bold text-white text-glow">{title}</h2>
      {badgeText && (
        <Badge className="ml-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 text-purple-300 font-tech px-3 py-1">
          {badgeText}
        </Badge>
      )}
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <div key={deal.id} className="group relative overflow-hidden rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="aspect-video overflow-hidden">
            <img 
              src={deal.image || (deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop")} 
              alt={deal.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop";
              }}
            />
            <div className="absolute top-3 right-3 flex gap-2">
              {deal.nftCoupon && (
                <Badge className="bg-blue-500/20 border border-blue-400/50 text-blue-300 text-xs">
                  NFT
                </Badge>
              )}
              {deal.trending && (
                <Badge className="bg-red-500/20 border border-red-400/50 text-red-300 text-xs">
                  🔥 VIRAL
                </Badge>
              )}
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                {deal.title}
              </h3>
              <Badge className="bg-green-500/20 border border-green-400/50 text-green-300 text-sm font-bold">
                {deal.discount}
              </Badge>
            </div>
            
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {deal.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {deal.business.name}
              </span>
              <span>{deal.business.location}</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <span className="text-gray-400">Claimed: </span>
                <span className="text-white font-bold">{deal.claimed}/{deal.total}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Trust: </span>
                <span className="text-purple-400 font-bold">{deal.business.trustScore}/100</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => onViewDeal(deal.id.toString())}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
              >
                View Deal
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InvestContent = ({ 
  poolInfo, 
  onLearnMoreClick 
}: { 
  poolInfo: any | null;
  onLearnMoreClick: () => void;
}) => (
  <CommunityInvestmentPool poolInfo={poolInfo} onLearnMoreClick={onLearnMoreClick} />
);

const TransactionsContent = ({ transactions }: { transactions: any[] }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <Repeat className="w-6 h-6 text-purple-400" />
      <h2 className="text-2xl font-tech font-bold text-white text-glow">Recent Activity</h2>
      <Badge className="ml-auto bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 text-purple-300 font-tech px-3 py-1">
        {transactions.length} Total
      </Badge>
    </div>
    
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="group relative overflow-hidden rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{transaction.description}</h3>
                <p className="text-gray-400 text-sm">{transaction.business.name} • {transaction.business.category}</p>
                <p className="text-gray-500 text-xs">{transaction.created_at.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-white">{transaction.amount} {transaction.currency}</div>
              <Badge className={`mt-1 ${
                transaction.status === 'completed' 
                  ? 'bg-green-500/20 border border-green-400/50 text-green-300'
                  : 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300'
              }`}>
                {transaction.status}
              </Badge>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Hash: {transaction.transaction_hash.slice(0, 10)}...{transaction.transaction_hash.slice(-6)}</span>
              <span>ID: #{transaction.id}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CommunityInvestmentPool = ({ 
  poolInfo, 
  onLearnMoreClick 
}: { 
  poolInfo: any | null;
  onLearnMoreClick: () => void;
}) => {
  if (!poolInfo) return null;

  return (
    <div className="space-y-6">
      {/* Main Investment Pool Card */}
      <div className="card-border-glow rounded-xl p-8 animation-none">
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
            </div>
            <div className="flex-1 text-center md:text-left">
            <h3 className="font-tech text-2xl font-bold text-white text-glow">Community Investment Pool</h3>
                <p className="mt-2 text-gray-300">Support local entrepreneurs and earn returns while building stronger communities. Your investment creates real impact.</p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-6 text-center">
                <div>
              <div className="text-3xl font-bold text-white">
                {poolInfo.totalInvested.toLocaleString()} USDT
              </div>
              <div className="text-sm text-purple-400 font-tech">Total Pool</div>
                </div>
                <div>
              <div className="text-3xl font-bold text-white">
                {poolInfo.totalInvestors.toLocaleString()}
                </div>
              <div className="text-sm text-purple-400 font-tech">Total Investors</div>
                </div>
            </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">{poolInfo.activeBusinesses.toLocaleString()}</div>
            <div className="text-sm text-purple-400 font-tech">Active Businesses</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{(poolInfo.monthlyVolume / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-purple-400 font-tech">Monthly Volume (USDT)</div>
            </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/invest" className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto">Invest Now</Link>
            <Button className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 text-gray-300 font-semibold px-8 py-3 rounded-lg w-full sm:w-auto" onClick={onLearnMoreClick}>Learn More</Button>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card-border-glow rounded-xl p-6 animation-none">
        <h4 className="font-tech text-xl font-bold text-white text-glow mb-4">Top Performing Investments</h4>
        <div className="space-y-4">
          {poolInfo.topPerformers.map((performer: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-300">#{index + 1}</span>
                </div>
                <div>
                  <h5 className="font-bold text-white">{performer.name}</h5>
                  <p className="text-gray-400 text-sm">Invested: {performer.invested.toLocaleString()} USDT</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">+{performer.return}%</div>
                <div className="text-sm text-gray-400">Return</div>
              </div>
            </div>
          ))}
        </div>
        </div>
    </div>
);
};

