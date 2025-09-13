import { Coins, TrendingUp, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardTokenProps {
  token: {
    name: string;
    symbol: string;
    balance: number;
    business: string;
    color: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
  };
  onClick?: () => void;
  className?: string;
}

export function RewardToken({ token, onClick, className }: RewardTokenProps) {
  const getTrendIcon = () => {
    if (token.trend === 'up') return TrendingUp;
    return TrendingUp; // Using same icon for simplicity
  };

  const TrendIcon = getTrendIcon();

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-lg bg-gradient-card border border-border/50 cursor-pointer",
        "hover:shadow-glow hover:scale-[1.02] transition-all duration-300",
        "group overflow-hidden",
        className
      )}
    >
      {/* Background Gradient based on token color */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${token.color}20, ${token.color}05)` 
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-soft"
              style={{ backgroundColor: token.color }}
            >
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">{token.symbol}</div>
              <div className="text-xs text-muted-foreground">{token.business}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg text-foreground">{token.balance.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">tokens</div>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{token.name}</div>
          <div className={cn(
            "flex items-center gap-1 text-xs",
            token.trend === 'up' ? "text-success" : "text-muted-foreground"
          )}>
            <TrendIcon className="w-3 h-3" />
            <span>+{token.trendValue}</span>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-spark-shine" />
        </div>
      </div>
    </div>
  );
}