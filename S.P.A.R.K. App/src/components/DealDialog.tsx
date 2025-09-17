import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Share2, Clock, Tag, Building, X } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-gray-200 border-purple-500/30 max-w-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <img src={`https://via.placeholder.com/800x400/581845/FFFFFF?text=${deal.title}`} alt={deal.title} className="rounded-t-lg w-full h-48 object-cover mb-4" />
          <DialogTitle className="text-3xl font-bold text-white text-glow mb-2">{deal.title}</DialogTitle>
          <DialogDescription className="text-lg text-purple-400 font-semibold">{business.name}</DialogDescription>
        </DialogHeader>
        
        <div className="px-6">
          <p className="text-gray-300 mb-6">{deal.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-tech">
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
            <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto flex-1" onClick={() => alert('Claim Deal as NFT functionality to be implemented.')}>Claim Deal as NFT</Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => alert('Share functionality to be implemented.')}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
            </Button>
        </DialogFooter>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};
