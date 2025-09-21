import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Share2, Clock, Tag, Building } from 'lucide-react';
import { mockDeals, mockBusinesses } from '@/data/mockData'; // Assuming mockData is accessible

const DealDetails = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  
  // In a real app, you'd fetch this data. Here we find it from mock data.
  const deal = mockDeals.find(d => d.id === dealId);
  const business = deal ? mockBusinesses.find(b => b.id === deal.businessId) : null;

  if (!deal || !business) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500">Deal not found!</h2>
        <Button onClick={() => navigate(-1)} variant="link" className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-gray-300 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Deals
        </Button>
        <Card className="overflow-hidden bg-gray-900/50 card-border-glow animation-none">
            <CardHeader>
                <img 
                  src={deal.image || (deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop")} 
                  alt={deal.title} 
                  className="rounded-t-lg w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = deal.title.toLowerCase().includes('pizza') ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('coffee') ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop" : deal.title.toLowerCase().includes('electronics') ? "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop";
                  }}
                />
            </CardHeader>
            <CardContent className="p-6">
                <CardTitle className="text-3xl font-bold text-white text-glow mb-2">{deal.title}</CardTitle>
                <CardDescription className="text-lg text-purple-400 font-semibold mb-6">{business.name}</CardDescription>
                
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
                </div>

                <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="font-tech text-lg font-bold text-white text-glow mb-2">Terms & Conditions</h4>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        <li>This offer cannot be combined with other promotions.</li>
                        <li>Valid for one-time use per customer.</li>
                        <li>Management reserves the right to modify or cancel the offer.</li>
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="p-6 bg-black/20 flex flex-col sm:flex-row gap-4">
                <Button className="glow-button font-semibold text-white px-8 py-3 rounded-lg w-full sm:w-auto flex-1">Claim Deal as NFT</Button>
                <Button variant="outline" className="w-full sm:w-auto">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
};

export default DealDetails;
