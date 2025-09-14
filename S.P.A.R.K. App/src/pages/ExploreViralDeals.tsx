import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DealDialog } from '@/components/DealDialog';
import { mockDeals, mockBusinesses } from '@/data/mockData';

const ExploreViralDeals = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const dealsWithBusiness = mockDeals.map(deal => {
      const business = mockBusinesses.find(b => b.id === deal.businessId);
      return { ...deal, store: business ? business.name : 'Unknown Store' };
    });
    setDeals(dealsWithBusiness);
  }, []);

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
              <p className="text-gray-300">{deal.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-400 font-tech">
                Expires: {new Date(deal.endDate).toLocaleDateString()}
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
