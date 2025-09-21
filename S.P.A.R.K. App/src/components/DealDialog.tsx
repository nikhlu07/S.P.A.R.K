import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Share2, Clock, Tag, Building, X, Zap, Coins } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { BlockchainPayment } from './BlockchainPayment';
import { mockDeals, mockBusinesses } from '@/data/mockData';

// Define types for deal and business to avoid using 'any'
interface Deal {
  id: string;
  businessId: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
}

interface Business {
  id: string;
  name: string;
  location: string;
  owner: string;
}

interface DealDialogProps {
  dealId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DealDialog = ({ dealId, isOpen, onClose }: DealDialogProps) => {
  const { isConnected, campaigns, businesses } = useWeb3();
  const { claimCoupon } = useBlockchain();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  if (!dealId) return null;

  // Try to find real campaign data first, fallback to mock data
  let deal: Deal | undefined;
  let business: Business | undefined;

  if (isConnected && campaigns.length > 0) {
    const campaign = campaigns.find(c => c.campaignId.toString() === dealId);
    if (campaign) {
      const businessData = businesses.find(b => b.businessAddress === campaign.businessOwner);
      deal = {
        id: campaign.campaignId.toString(),
        businessId: campaign.businessOwner,
        title: campaign.name,
        description: campaign.description,
        category: businessData?.category || 'General',
        endDate: new Date(campaign.endTime * 1000).toISOString()
      };
      business = businessData ? {
        id: businessData.businessAddress,
        name: businessData.name,
        location: businessData.location,
        owner: businessData.owner
      } : undefined;
    }
  }

  // Fallback to mock data if no real data found
  if (!deal || !business) {
    deal = mockDeals.find(d => d.id === dealId);
    business = deal ? mockBusinesses.find(b => b.id === deal.businessId) : undefined;
  }

  if (!deal || !business) {
    return null; // Or a fallback UI
  }

  const handleClaimDeal = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // If it's a real campaign, claim the coupon
      if (isConnected && campaigns.length > 0) {
        const campaign = campaigns.find(c => c.campaignId.toString() === dealId);
        if (campaign) {
          console.log('Claiming coupon for dealId:', dealId);
          await claimCoupon(Number(dealId));
          setPaymentSuccess(true);
        }
      } else {
        // For mock deals, show payment interface
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Failed to claim deal:', error);
      alert('Failed to claim deal. Please try again.');
    }
  };

  const handlePaymentSuccess = (txHash: string) => {
    setPaymentSuccess(true);
    setShowPayment(false);
    console.log('Payment successful:', txHash);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    alert(`Payment failed: ${error}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-gray-200 border-purple-500/30 max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-0">
          <img 
            src={(deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop")}
            alt={deal.title} 
            className="rounded-t-lg w-full h-48 object-cover mb-4"
            onError={(e) => {
              e.currentTarget.src = deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop";
            }}
          />
          <DialogTitle className="text-3xl font-bold text-white text-glow mb-2">{deal.title}</DialogTitle>
          <DialogDescription className="text-lg text-purple-400 font-semibold">{business.name}</DialogDescription>
        </DialogHeader>
        
        <div className="px-6">
          <p className="text-gray-300 mb-6">{deal.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 font-tech">
              <div className="flex items-center gap-3">
                  <Tag className="w-6 h-6 text-purple-400" />
                  <div>
                      <div className="text-gray-400 text-sm uppercase">Category</div>
                      <div className="text-white font-semibold">{deal.category}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <div>
                      <div className="text-gray-400 text-sm uppercase">Expires On</div>
                      <div className="text-white font-semibold">{new Date(deal.endDate).toLocaleDateString()}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-purple-400" />
                  <div>
                      <div className="text-gray-400 text-sm uppercase">Location</div>
                      <div className="text-white font-semibold">{business.location}</div>
                  </div>
              </div>
               <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-purple-400" />
                  <div>
                      <div className="text-gray-400 text-sm uppercase">Owner</div>
                      <div className="text-white font-semibold">{business.owner}</div>
                  </div>
              </div>
          </div>

          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-tech text-lg font-bold text-white text-glow mb-2">Terms & Conditions</h4>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                  <li>This offer cannot be combined with other promotions.</li>
                  <li>Valid for one-time use per customer.</li>
                  <li>Management reserves the right to modify or cancel the offer.</li>
              </ul>
          </div>
        </div>

        <DialogFooter className="p-6 bg-black/20 mt-6 flex flex-col sm:flex-row gap-4">
          {paymentSuccess ? (
            <div className="w-full text-center py-4">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <Coins className="w-5 h-5" />
                <span className="font-semibold">Deal Claimed Successfully!</span>
              </div>
              <p className="text-sm text-gray-400">Your NFT coupon has been added to your wallet.</p>
            </div>
          ) : showPayment ? (
            <div className="w-full">
              <BlockchainPayment
                dealId={dealId}
                businessAddress={business.id}
                dealTitle={deal.title}
                amount="10.00" // This should come from the deal data
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => setShowPayment(false)}
              >
                Cancel Payment
              </Button>
            </div>
          ) : (
            <>
              <Button 
                className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto flex-1" 
                onClick={handleClaimDeal}
                disabled={!isConnected}
              >
                <Zap className="mr-2 h-4 w-4" />
                {isConnected ? 'Claim Deal' : 'Connect Wallet to Claim'}
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => alert('Share functionality to be implemented.')}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </>
          )}
        </DialogFooter>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};
