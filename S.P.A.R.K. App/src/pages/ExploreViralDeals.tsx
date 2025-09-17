import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DealDialog } from '@/components/DealDialog';
import { useWeb3 } from '@/contexts/Web3Context';
import { mockDeals, mockBusinesses } from '@/data/mockData';

const ExploreViralDeals = () => {
  const { 
    isConnected, 
    campaigns, 
    businesses 
  } = useWeb3();
  
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <>
      <h1 className="font-tech text-3xl font-bold text-white text-glow mb-8 text-center">
        Explore Viral Deals
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden flex flex-col bg-gray-900/50 card-border-glow animation-none">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-glow">{deal.title}</CardTitle>
                  <CardDescription className="text-purple-400">{deal.store}</CardDescription>
                </div>
                <div className="font-tech text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-full px-3 py-1">
                  {deal.category}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <img src={deal.image} alt={deal.title} className="rounded-lg mb-4 w-full h-48 object-cover" />
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
              <Button variant="cyber" onClick={() => handleViewDeal(deal.id)}>View Deal</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <DealDialog
        dealId={selectedDealId}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default ExploreViralDeals;
