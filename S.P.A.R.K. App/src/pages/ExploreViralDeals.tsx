import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DealDialog } from '@/components/DealDialog';
import { useWeb3 } from '@/contexts/Web3Context';
import { mockDeals, mockBusinesses } from '@/data/mockData';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Share2, 
  Heart, 
  Zap, 
  Clock,
  Users,
  Flame
} from "lucide-react";

const ExploreViralDeals = () => {
  const { 
    isConnected, 
    campaigns, 
    businesses 
  } = useWeb3();
  
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  useEffect(() => {
    if (isConnected && campaigns.length > 0) {
      // Use real campaign data
      const realDeals = campaigns.map(campaign => {
        const business = businesses.find(b => b.businessAddress === campaign.businessOwner);
        return {
          id: campaign.campaignId.toString(),
          title: campaign.name,
          description: campaign.description,
          store: business ? business.name : 'Unknown Store',
          category: business ? business.category : 'General',
          image: campaign.imageURI || '/api/placeholder/300/200',
          discount: `${campaign.discountPercentage}% OFF`,
          originalPrice: campaign.minPurchaseAmount,
          discountedPrice: campaign.maxPurchaseAmount,
          nftCoupon: campaign.isViral,
          viral: campaign.isViral,
          claimed: campaign.claimedCoupons,
          total: campaign.totalCoupons,
          isActive: campaign.isActive,
          businessId: campaign.businessOwner
        };
      });
      setDeals(realDeals);
    } else {
      // Fallback to mock data
      const dealsWithBusiness = mockDeals.map(deal => {
        const business = mockBusinesses.find(b => b.id === deal.businessId);
        return { ...deal, store: business ? business.name : 'Unknown Store' };
      });
      setDeals(dealsWithBusiness);
    }
  }, [isConnected, campaigns, businesses]);

  const handleViewDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDealId(null);
  };

  // Filter and sort deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'viral') return deal.viral;
    if (filterType === 'active') return deal.isActive;
    if (filterType === 'nft') return deal.nftCoupon;
    return true;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        return b.discountPercentage - a.discountPercentage;
      case 'claimed':
        return b.claimed - a.claimed;
      case 'trending':
      default:
        return b.claimed - a.claimed; // Most claimed = most trending
    }
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-tech text-4xl font-bold text-white text-glow mb-4 flex items-center justify-center gap-3">
            <Flame className="w-10 h-10 text-orange-400" />
            Viral Deals
            <Flame className="w-10 h-10 text-orange-400" />
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover viral marketing campaigns and NFT coupons that spread through social networks. 
            Share deals, earn rewards, and support local businesses.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search deals, businesses, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
              >
                <option value="all">All Deals</option>
                <option value="viral">🔥 Viral Only</option>
                <option value="active">⚡ Active Only</option>
                <option value="nft">🎫 NFT Coupons</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
              >
                <option value="trending">🔥 Trending</option>
                <option value="discount">💰 Highest Discount</option>
                <option value="claimed">👥 Most Claimed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-400">{sortedDeals.length}</div>
            <div className="text-sm text-gray-400">Total Deals</div>
          </div>
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">
              {sortedDeals.filter(d => d.viral).length}
            </div>
            <div className="text-sm text-gray-400">Viral Campaigns</div>
          </div>
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {sortedDeals.reduce((sum, d) => sum + d.claimed, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Claims</div>
          </div>
          <div className="card-border-glow p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">
              {sortedDeals.filter(d => d.nftCoupon).length}
            </div>
            <div className="text-sm text-gray-400">NFT Coupons</div>
          </div>
        </div>
        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDeals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden flex flex-col bg-gray-900/50 card-border-glow animation-none">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-glow">{deal.title}</CardTitle>
                  <CardDescription className="text-purple-400">{deal.store}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="font-tech text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-full px-3 py-1">
                    {deal.category}
                  </div>
                  {deal.viral && (
                    <div className="font-tech text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/50 rounded-full px-3 py-1 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      VIRAL
                    </div>
                  )}
                  {deal.nftCoupon && (
                    <div className="font-tech text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-full px-3 py-1">
                      NFT
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <img 
                src={deal.image || (deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop")} 
                alt={deal.title} 
                className="rounded-lg mb-4 w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop";
                }}
              />
              <p className="text-gray-300 mb-4">{deal.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-green-400">{deal.discount}</span>
                  <div className="text-sm text-gray-400">
                    <span className="line-through">${deal.originalPrice}</span>
                    <span className="ml-2 text-white">${deal.discountedPrice}</span>
                  </div>
                </div>
                {deal.nftCoupon && (
                  <div className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-3 py-1">
                    NFT COUPON
                  </div>
                )}
              </div>
              {isConnected && (
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Claimed:</span>
                    <span className="text-white">{deal.claimed}/{deal.total}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Status:</span>
                    <span className={deal.isActive ? 'text-green-400' : 'text-red-400'}>
                      {deal.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-400 font-tech">
                {isConnected ? `Campaign ID: ${deal.id}` : `Expires: ${new Date(deal.endDate).toLocaleDateString()}`}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="cyber" onClick={() => handleViewDeal(deal.id)}>
                  <Zap className="w-4 h-4 mr-2" />
                  View Deal
                </Button>
              </div>
            </CardFooter>
          </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedDeals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
              <Flame className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No viral deals found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filters
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              variant="cyber"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <DealDialog
        dealId={selectedDealId}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default ExploreViralDeals;
