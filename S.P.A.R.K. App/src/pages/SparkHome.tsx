import React, { useState, useEffect, useRef } from "react";
import { ethers } from "https://esm.sh/ethers@6.13.1";
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
  Star,
  Plus,
  ArrowRight,
  Share2,
  X
} from "lucide-react";

// --- UTILITY FUNCTIONS ---
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
}

// --- MOCK DATA ---
const mockBusinesses = [
    { id: 'biz1', name: 'Cyber Chai', category: 'Cafe', rating: 4.8, distance: '150m' },
    { id: 'biz2', name: 'Glitch Grub', category: 'Restaurant', rating: 4.5, distance: '300m' },
    { id: 'biz3', name: 'Data Discounts', category: 'Retail', rating: 4.9, distance: '50m' },
    { id: 'biz4', name: 'Retro Reads', category: 'Bookstore', rating: 4.7, distance: '250m' },
];

const mockDeals = [
    { id: 'deal1', businessId: 'biz1', title: '25% off on Iced Lattes', description: 'Cool down with our signature iced lattes.', trending: true, requiredPoints: 50 },
    { id: 'deal2', businessId: 'biz2', title: 'Buy One Get One Free on Ramen', description: 'Share a bowl of authentic ramen with a friend.', trending: true, requiredPoints: 100 },
    { id: 'deal3', businessId: 'biz3', title: '15% off on all electronics', description: 'Upgrade your gear with our latest tech.', trending: false, requiredPoints: 200 },
    { id: 'deal4', businessId: 'biz4', title: 'Get a free bookmark with any purchase', description: 'A little something for our book lovers.', trending: false, requiredPoints: 20 },
    { id: 'deal5', businessId: 'biz1', title: 'Early Bird Coffee', description: 'Get a flat 50% off before 10 AM.', trending: true, requiredPoints: 30 },
];

const mockRewardTokens = [
    { symbol: 'C-CHAI', name: 'Cyber Chai Token', balance: 125.50, usdValue: 12.55, logo: '☕' },
    { symbol: 'G-GRUB', name: 'Glitch Grub Coin', balance: 80.00, usdValue: 24.00, logo: '🍜' },
    { symbol: 'D-DISC', name: 'Data Discounts NFT', balance: 1.00, usdValue: 50.00, logo: '💾' },
];

const mockLeaderboard = [
    { rank: 1, name: 'NeuralNomad', points: 12500, avatar: '🤖' },
    { rank: 2, name: 'GlitchGoddess', points: 11800, avatar: '👾' },
    { rank: 3, name: 'DataDemon', points: 10500, avatar: '👹' },
    { rank: 4, name: 'You', points: 9800, avatar: '😎' },
    { rank: 5, name: 'ByteBard', points: 9200, avatar: '🎶' },
];

const mockUserStats = {
    businessesSupported: 12,
    tokensEarned: 245.50,
    nftCouponsCollected: 3,
    communityRank: 4,
};

const mockCommunityStats = {
    totalUsers: 1578,
    activeBusinesses: 42,
    monthlyVolume: 2500000,
    loansActive: 15,
    communityPool: 5000000,
    averageYield: 8.5,
};

const heroImage = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop";

// --- UI COMPONENTS ---
const Button = ({ variant, size, className, children, ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        ghost: "hover:bg-accent hover:text-accent-foreground",
        cyber: "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20",
        neural: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/50",
        quantum: "bg-white text-purple-700 hover:bg-gray-200",
        electric: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    };

    const sizes = {
        icon: "h-10 w-10",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);
    return <button className={classes} {...props}>{children}</button>;
};

const Input = ({ className, ...props }) => {
    return (
        <input
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
};

const Badge = ({ variant, className, children }) => {
    const variants = {
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    };
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
            {children}
        </div>
    );
};

// --- REUSABLE COMPONENTS ---

const CyberBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)',
            backgroundSize: '3rem 3rem',
            animation: 'moveGrid 20s linear infinite'
        }} />
    </div>
);

const WalletCard = ({ balance, usdBalance, address }) => {
    const displayAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    return (
        <div className="p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-primary/20 shadow-cyber">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-cyber uppercase text-muted-foreground">KAIA Balance</h3>
                    <p className="text-3xl font-neural font-bold data-readout">${usdBalance.toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm">{balance.toFixed(4)} KAIA</p>
                </div>
                <div className="text-right">
                    <div className="px-3 py-1 rounded-full bg-matrix-green/10 text-matrix-green text-xs font-semibold">
                        Connected
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 font-mono">{displayAddress}</p>
                </div>
            </div>
        </div>
    );
};

const DealCard = ({ business, deal, onShare, onClaim }) => (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-card backdrop-blur-sm border border-primary/20 shadow-cyber hover:shadow-neural transition-cyber flex flex-col">
        <div className="p-5 flex-grow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{business.name.charAt(0)}</div>
                    <div>
                        <h3 className="font-semibold text-foreground">{business.name}</h3>
                        <p className="text-xs text-muted-foreground">{business.category} • {business.distance}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-cyber-gold">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{business.rating}</span>
                </div>
            </div>
            <h4 className="text-lg font-bold text-primary mb-2 neural-title">{deal.title}</h4>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">{deal.description}</p>
        </div>
        <div className="px-5 pb-5 mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                 <span>Required: <span className="font-bold text-primary">{deal.requiredPoints} SPARK</span></span>
                 <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onShare}><Share2 className="w-4 h-4" /></Button>
            </div>
            <Button variant="electric" className="w-full" onClick={onClaim}>
                Claim Deal <Zap className="w-4 h-4 ml-2" />
            </Button>
        </div>
    </div>
);

const RewardToken = ({ token, onClick }) => (
    <div className="p-4 rounded-lg bg-gradient-card backdrop-blur-sm border border-primary/20 shadow-cyber hover:shadow-neural transition-cyber group cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{token.logo}</div>
            <div>
                <h3 className="font-bold text-lg">{token.symbol}</h3>
                <p className="text-xs text-muted-foreground">{token.name}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-semibold text-xl data-readout">{token.balance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">${token.usdValue.toFixed(2)}</p>
        </div>
    </div>
);

const CommunityLeaderboard = ({ entries, title }) => (
    <div>
        <h2 className="text-lg font-neural font-bold neural-title mb-4">{title}</h2>
        <div className="space-y-2">
            {entries.map(entry => (
                <div key={entry.rank} className={cn(
                    "flex items-center p-3 rounded-lg bg-gradient-card backdrop-blur-sm border border-primary/20",
                    entry.name === 'You' && "border-primary shadow-neural"
                )}>
                    <div className="flex items-center gap-4 flex-1">
                        <span className="font-bold text-lg w-6 text-center">{entry.rank}</span>
                        <span className="text-2xl">{entry.avatar}</span>
                        <span className="font-semibold">{entry.name}</span>
                    </div>
                    <span className="font-bold text-primary data-readout">{entry.points.toLocaleString()} pts</span>
                </div>
            ))}
        </div>
    </div>
);

const PaymentScanner = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-card border border-primary/30 shadow-neural m-4">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-neural font-bold neural-title text-center mb-4">SCAN & PAY</h2>
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Camera Feed Placeholder</p>
                </div>
                 <p className="text-center text-muted-foreground text-sm mt-4">Point your camera at a SPARK QR code to complete a transaction.</p>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
const kaiaTestnet = {
  chainId: '0x3E9', // 1001
  chainName: 'Kaia Kairos Testnet',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18,
  },
  rpcUrls: ['https://public-en-kairos.node.kaia.io'],
  blockExplorerUrls: ['https://kairos.kaiaexplorer.io/'],
};

export default function SparkHome() {
  const [activeTab, setActiveTab] = useState<'deals' | 'rewards' | 'community'>('deals');
  const [showPaymentScanner, setShowPaymentScanner] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletUsdBalance, setWalletUsdBalance] = useState<number>(0);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (currentChainId !== kaiaTestnet.chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: kaiaTestnet.chainId }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [kaiaTestnet],
                });
              } catch (addError) {
                console.error(addError);
                alert('Failed to add the Kaia Kairos Testnet to your wallet.');
                return;
              }
            } else {
              console.error(switchError);
              alert('Failed to switch to the Kaia Kairos Testnet. Please switch manually in MetaMask.');
              return;
            }
          }
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = signer.address;
        setWalletAddress(address);

        // Fetch the native KAIA balance from the connected wallet
        const balanceBigInt = await provider.getBalance(address);

        // Convert the balance from Wei (smallest unit) to KAIA (18 decimals)
        const formattedBalance = parseFloat(ethers.formatUnits(balanceBigInt, 18));
        setWalletBalance(formattedBalance);

        // For demonstration, using a static price for KAIA to USD conversion.
        // In a real app, you would fetch this from a price oracle or API.
        const kaiaUsdPrice = 0.15;
        setWalletUsdBalance(formattedBalance * kaiaUsdPrice);

      } catch (error) {
        console.error("Error connecting to wallet or fetching balance:", error);
        alert("Failed to connect wallet or fetch balance. See console for details.");
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };

  const dealsWithBusinesses = mockDeals.map(deal => {
    const business = mockBusinesses.find(b => b.id === deal.businessId);
    return { deal, business: business! };
  }).filter(item => item.business); // Ensure business is found

  const handleShare = (dealId: string) => {
    console.log('Sharing deal:', dealId);
    alert(`Sharing deal ID: ${dealId}`);
  };

  const handleClaimDeal = (dealId: string) => {
    console.log('Claiming deal:', dealId);
    alert(`Claiming deal ID: ${dealId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans relative">
      <CyberBackground />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-purple-500/20 shadow-cyber">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="SPARK" className="h-8" />
                  <h1 className="text-xl font-neural font-bold cyber-text">
                    SPARK
                  </h1>
                </div>
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
                <Button
                  variant="cyber"
                  size="icon"
                  onClick={() => setShowPaymentScanner(true)}
                >
                  <QrCode className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-cyber border border-primary/30 shadow-neural">
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt="Neural Commerce Revolution"
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-neural font-bold mb-4 neural-title">
                  NEURAL COMMERCE PROTOCOL ACTIVE ⚡
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/90 mb-6 font-cyber">
                  INTERFACING WITH LOCAL BUSINESS MATRIX // LUCKNOW SECTOR
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="neural"
                    size="lg"
                    onClick={() => setShowPaymentScanner(true)}
                  >
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

              <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex gap-2">
                <div className="w-2 h-2 bg-matrix-green rounded-full animate-neural-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-neural-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="w-2 h-2 bg-warning rounded-full animate-neural-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>

          {walletAddress ? (
            <WalletCard
              balance={walletBalance}
              usdBalance={walletUsdBalance}
              address={walletAddress}
            />
          ) : (
            <div className="p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-primary/20 text-center shadow-cyber hover:shadow-neural transition-cyber group">
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">Engage with the SPARK ecosystem on the Kaia network.</p>
              <Button variant="electric" onClick={connectWallet}>
                Connect Wallet
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gradient-card backdrop-blur-sm border border-primary/20 text-center shadow-cyber hover:shadow-neural transition-cyber group">
              <div className="text-2xl font-neural font-bold text-primary mb-1 data-readout group-hover:animate-neural-pulse">{mockUserStats.businessesSupported}</div>
              <div className="text-xs text-muted-foreground font-cyber uppercase">Business Nodes</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-card backdrop-blur-sm border border-primary/20 text-center shadow-cyber hover:shadow-neural transition-cyber group">
              <div className="text-2xl font-neural font-bold text-matrix-green mb-1 group-hover:animate-neural-pulse">{mockUserStats.tokensEarned.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground font-cyber uppercase">Tokens Mined</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-card backdrop-blur-sm border border-primary/20 text-center shadow-cyber hover:shadow-neural transition-cyber group">
              <div className="text-2xl font-neural font-bold text-cyber-gold mb-1 group-hover:animate-neural-pulse">{mockUserStats.nftCouponsCollected}</div>
              <div className="text-xs text-muted-foreground font-cyber uppercase">NFT Assets</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-card backdrop-blur-sm border border-primary/20 text-center shadow-cyber hover:shadow-neural transition-cyber group">
              <div className="text-2xl font-neural font-bold text-primary mb-1 group-hover:animate-neural-pulse">#{mockUserStats.communityRank}</div>
              <div className="text-xs text-muted-foreground font-cyber uppercase">Neural Rank</div>
            </div>
          </div>

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

          <div className="flex gap-1 p-1 bg-gradient-card backdrop-blur-sm rounded-lg border border-primary/20 shadow-cyber">
            {[
              { id: 'deals', label: 'VIRAL DEALS', icon: Zap },
              { id: 'rewards', label: 'NEURAL REWARDS', icon: Gift },
              { id: 'community', label: 'MATRIX HUB', icon: Users },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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

          {activeTab === 'deals' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary animate-neural-pulse" />
                  <h2 className="text-lg font-neural font-bold neural-title">🔥 VIRAL PROTOCOL ACTIVE</h2>
                  <Badge variant="secondary" className="ml-auto bg-gradient-electric text-primary-foreground font-cyber shadow-neural">
                    {dealsWithBusinesses.filter(d => d.deal.trending).length} NODES
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dealsWithBusinesses
                    .filter(({ deal }) => deal.trending)
                    .map(({ deal, business }, index) => (
                      <DealCard
                        key={`${deal.id}-${index}`}
                        business={business}
                        deal={deal}
                        onShare={() => handleShare(deal.id)}
                        onClaim={() => handleClaimDeal(deal.id)}
                      />
                    ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-primary animate-neural-pulse" />
                  <h2 className="text-lg font-neural font-bold neural-title">LOCAL COMMERCE MATRIX</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dealsWithBusinesses
                    .filter(({ deal }) => !deal.trending)
                    .map(({ deal, business }, index) => (
                      <DealCard
                        key={`${deal.id}-${index}`}
                        business={business}
                        deal={deal}
                        onShare={() => handleShare(deal.id)}
                        onClaim={() => handleClaimDeal(deal.id)}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
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
                  <RewardToken
                    key={token.symbol}
                    token={token}
                    onClick={() => console.log('Token clicked:', token.symbol)}
                  />
                ))}
              </div>

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
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              <CommunityLeaderboard
                entries={mockLeaderboard}
                title="🎯 Community Champions"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-card border border-border/50 text-center">
                  <div className="text-xl font-bold text-primary mb-1">{mockCommunityStats.totalUsers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-card border border-border/50 text-center">
                  <div className="text-xl font-bold text-matrix-green mb-1">{mockCommunityStats.activeBusinesses}</div>
                  <div className="text-xs text-muted-foreground">Local Businesses</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-card border border-border/50 text-center">
                  <div className="text-xl font-bold text-cyber-gold mb-1">₹{(mockCommunityStats.monthlyVolume / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-muted-foreground">Monthly Volume</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-card border border-border/50 text-center">
                  <div className="text-xl font-bold text-primary mb-1">{mockCommunityStats.loansActive}</div>
                  <div className="text-xs text-muted-foreground">Active Loans</div>
                </div>
              </div>
            </div>
          )}

        </main>

        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="electric"
            size="lg"
            className="rounded-full w-14 h-14 shadow-neural animate-cyber-glow"
            onClick={() => setShowPaymentScanner(true)}
          >
            <QrCode className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <PaymentScanner
        isOpen={showPaymentScanner}
        onClose={() => setShowPaymentScanner(false)}
      />
    </div>
  );
}