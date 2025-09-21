import { Heart, MapPin, Users, Zap, Gift, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineShareButton } from "@/components/LineShareButton";
import { BlockchainPayment } from "@/components/BlockchainPayment";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getImageProps, getDealImage } from "@/utils/imageUtils";

interface DealCardProps {
  business: {
    id: string;
    name: string;
    image: string;
    category: string;
    distance: string;
    rating: number;
    friendsLove: number;
    wallet_address?: string;
  };
  deal: {
    id: string;
    title: string;
    description: string;
    discount: string;
    endDate: string;
    nftCoupon?: boolean;
    trending?: boolean;
    original_price?: number;
    discounted_price?: number;
  };
  onShare?: () => void;
  onViewDeal: (dealId: string) => void;
  className?: string;
}

export function DealCard({ business, deal, onShare, onViewDeal, className }: DealCardProps) {
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = (txHash: string) => {
    console.log('Payment successful:', txHash);
    setShowPayment(false);
    // You can add more success handling here
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    // You can add more error handling here
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg bg-gradient-card shadow-card border border-border/50",
      "hover:shadow-glow hover:scale-[1.02] transition-all duration-300",
      className
    )}>
      {/* Trending Badge */}
      {deal.trending && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="default" className="bg-gradient-primary text-primary-foreground shadow-glow">
            <Zap className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        </div>
      )}

      {/* NFT Badge */}
      {deal.nftCoupon && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-spark-gold text-warning-foreground font-medium">
            <Gift className="w-3 h-3 mr-1" />
            NFT
          </Badge>
        </div>
      )}

      {/* Business Image */}
      <div className="relative h-40 overflow-hidden" style={{ width: '100%', height: '160px' }}>
        <img 
          {...getImageProps(
            getDealImage(deal.title, business.category, business.image),
            business.name,
            "w-full h-full transition-transform duration-300 hover:scale-110"
          )}
          style={{ 
            width: '100%', 
            height: '100%', 
            maxWidth: '100%', 
            maxHeight: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Business Info Overlay */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-white/30 text-white text-xs">
              {business.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              {business.distance}
            </div>
          </div>
          <h3 className="font-semibold text-lg">{business.name}</h3>
        </div>
      </div>

      {/* Deal Content */}
      <div className="p-4">
        {/* Deal Title & Discount */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-sm mb-1">{deal.title}</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">{deal.description}</p>
          </div>
          <div className="text-right ml-3">
            <div className="text-2xl font-bold text-primary">{deal.discount}</div>
            <div className="text-xs text-muted-foreground">OFF</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {business.friendsLove} friends love this
          </div>
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full mr-0.5",
                    i < Math.floor(business.rating) ? "bg-spark-gold" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span>{business.rating}</span>
          </div>
        </div>

        {/* Validity */}
        <div className="text-xs text-muted-foreground mb-4">
          Valid until {new Date(deal.endDate).toLocaleDateString()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <LineShareButton 
            deal={deal}
            size="sm"
            className="flex-1"
          />
          {business.wallet_address && deal.discounted_price ? (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowPayment(true)}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Coins className="w-3 h-3 mr-1" />
              Pay Now
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onViewDeal(deal.id)}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Zap className="w-3 h-3 mr-1" />
              Claim Now
            </Button>
          )}
        </div>
      </div>

      {/* Shine effect for NFT coupons */}
      {/*{deal.nftCoupon && (*/}
      {/*  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">*/}
      {/*    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-spark-shine" />*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Blockchain Payment Modal */}
      {showPayment && business.wallet_address && deal.discounted_price && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gray-900 rounded-lg max-w-[95vw] sm:max-w-md w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Blockchain Payment</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPayment(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-4">
              <BlockchainPayment
                dealId={deal.id}
                businessAddress={business.wallet_address}
                dealTitle={deal.title}
                amount={deal.discounted_price.toString()}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
