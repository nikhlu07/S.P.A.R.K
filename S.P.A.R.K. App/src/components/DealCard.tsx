import { Heart, MapPin, Users, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DealCardProps {
  business: {
    id: string;
    name: string;
    image: string;
    category: string;
    distance: string;
    rating: number;
    friendsLove: number;
  };
  deal: {
    title: string;
    description: string;
    discount: string;
    validUntil: string;
    nftCoupon?: boolean;
    trending?: boolean;
  };
  onShare?: () => void;
  onClaim?: () => void;
  className?: string;
}

export function DealCard({ business, deal, onShare, onClaim, className }: DealCardProps) {
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
      <div className="relative h-40 overflow-hidden">
        <img 
          src={business.image} 
          alt={business.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
          Valid until {deal.validUntil}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShare}
            className="flex-1 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            <Heart className="w-3 h-3 mr-1" />
            Share
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onClaim}
            className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Zap className="w-3 h-3 mr-1" />
            Claim Now
          </Button>
        </div>
      </div>

      {/* Shine effect for NFT coupons */}
      {deal.nftCoupon && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-spark-shine" />
        </div>
      )}
    </div>
  );
}