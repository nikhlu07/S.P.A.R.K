import { Wallet, Eye, EyeOff, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface WalletCardProps {
  balance: number;
  usdBalance: number;
  address: string;
  networkName: string;
  currencySymbol: string;
  className?: string;
}

export function WalletCard({ balance, usdBalance, address, networkName, currencySymbol, className }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  
  const formatBalance = (amount: number) => {
    if (!showBalance) return `•••••• ${currencySymbol}`;
    return `${amount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${currencySymbol}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    // Could add toast notification here
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-gradient-hero p-6 text-primary-foreground shadow-glow",
      "hover:shadow-xl transition-all duration-300",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">MetaMask Wallet</h3>
              <p className="text-primary-foreground/70 text-sm">{networkName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="h-8 w-8 text-primary-foreground hover:bg-white/10"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAddress}
              className="h-8 w-8 text-primary-foreground hover:bg-white/10"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <div className="text-3xl font-bold mb-1">{formatBalance(balance)}</div>
          <div className="text-primary-foreground/70 text-sm">
            {showBalance ? `$${parseFloat(usdBalance || '0').toFixed(2)} USD` : "$••••"}
          </div>
        </div>

        {/* Address */}
        <div className="mt-4 text-xs text-primary-foreground/50 font-mono">
          {address}
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/5 animate-pulse-glow" />
      <div className="absolute bottom-6 left-8 w-12 h-12 rounded-full bg-white/5 animate-float" />
    </div>
  );
}
