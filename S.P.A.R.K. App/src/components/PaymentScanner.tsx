import { useState } from "react";
import { QrCode, Camera, X, Zap, Check, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWeb3 } from '@/contexts/Web3Context';
import { mockTransactions } from "@/data/mockData";

interface PaymentScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentScanner({ isOpen, onClose }: PaymentScannerProps) {
  const { isConnected, businesses, usdtBalance } = useWeb3();
  const [step, setStep] = useState<'scanning' | 'business' | 'payment' | 'success'>('scanning');
  const [amount, setAmount] = useState(35);
  
  // Use real business data if available, fallback to mock
  const scannedBusiness = isConnected && businesses.length > 0 ? {
    name: businesses[0].name,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    rating: 4.8,
    friendsLove: 15,
    category: businesses[0].category,
    address: businesses[0].businessAddress,
    trustScore: businesses[0].trustScore,
    offers: {
      discount: "20% OFF",
      description: "Free samosa with chai purchase",
      tokensEarned: 7
    }
  } : {
    name: "Sharma Tea Stall",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    rating: 4.8,
    friendsLove: 15,
    category: "Beverages",
    offers: {
      discount: "20% OFF",
      description: "Free samosa with chai purchase",
      tokensEarned: 7
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setStep('scanning');
    }, 300); // Delay to allow for closing animation
  };

  const handleScan = () => {
    // Simulate QR code scanning
    setTimeout(() => setStep('business'), 1000);
  };

  const handlePayment = () => {
    setStep('payment');
    // Simulate payment processing
    setTimeout(() => {
        // Create a transaction record
        const newTransaction = {
            id: `txn_${Date.now()}`,
            businessName: scannedBusiness.name,
            amount: (amount * 0.8).toFixed(0),
            date: new Date().toISOString(),
            tokensEarned: scannedBusiness.offers.tokensEarned,
        };
        mockTransactions.unshift(newTransaction); // Add to the beginning of the array
        console.log("New transaction recorded:", newTransaction);
        console.log("All transactions:", mockTransactions);

        setStep('success');
    }, 2000);
  };

  const handleShare = () => {
    console.log('Sharing payment success');
    // Would integrate with LINE sharing API
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-glow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            SPARK Pay
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {step === 'scanning' && (
          <div className="p-6 text-center">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="w-full h-full bg-gradient-card rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center">
                <Camera className="w-16 h-16 text-muted-foreground animate-pulse-glow" />
              </div>
              
              {/* Scanning Animation */}
              <div className="absolute inset-4 border-2 border-primary rounded-xl">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-xl animate-ping" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Scan QR Code</h3>
            <p className="text-muted-foreground mb-6">
              Point your camera at the business QR code to pay and earn rewards
            </p>
            
            <Button variant="cyber" size="lg" className="w-full" onClick={handleScan}>
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning
            </Button>
          </div>
        )}

        {step === 'business' && (
          <div className="p-6">
            {/* Business Info */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-gradient-card border border-border/50">
              <img 
                src={scannedBusiness.image} 
                alt={scannedBusiness.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{scannedBusiness.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{scannedBusiness.category}</Badge>
                  <span>⭐ {scannedBusiness.rating}</span>
                  <span>❤️ {scannedBusiness.friendsLove} friends</span>
                </div>
              </div>
            </div>

            {/* Special Offer */}
            <div className="p-4 rounded-lg bg-gradient-success text-success-foreground mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Special Offer Active!</span>
              </div>
              <p className="text-sm">{scannedBusiness.offers.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold">{scannedBusiness.offers.discount}</span>
                <Badge variant="secondary" className="bg-white/20 text-success-foreground">
                  +{scannedBusiness.offers.tokensEarned} tokens
                </Badge>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Amount to Pay
              </label>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">₹{amount}</span>
              </div>
              {isConnected && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Your USDT Balance:</span>
                    <span className="text-green-400 font-bold">{parseFloat(usdtBalance || '0').toFixed(2)} USDT</span>
                  </div>
                  {scannedBusiness.address && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Business Address:</span>
                      <span className="text-blue-400 font-mono text-xs">{scannedBusiness.address.slice(0, 8)}...{scannedBusiness.address.slice(-6)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button variant="electric" size="lg" className="w-full" onClick={handlePayment}>
              <Zap className="w-5 h-5 mr-2" />
              Pay with SPARK
            </Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow">
              <Zap className="w-12 h-12 text-primary-foreground animate-spin" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
            <p className="text-muted-foreground">
              Confirming transaction on Kaia network...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-success flex items-center justify-center shadow-success animate-bounce-in">
              <Check className="w-12 h-12 text-success-foreground" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-success">Payment Successful!</h3>
            <p className="text-muted-foreground mb-4">
              You've earned {scannedBusiness.offers.tokensEarned} ChaiCoins and supported a local business!
            </p>

            {/* Transaction Details */}
            <div className="p-4 rounded-lg bg-gradient-card border border-border/50 mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Discount Applied</span>
                <span className="font-semibold text-success">-₹{(amount * 0.2).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Tokens Earned</span>
                <span className="font-semibold text-primary">+{scannedBusiness.offers.tokensEarned} CHAI</span>
              </div>
              <div className="border-t border-border/50 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Final Amount</span>
                  <span className="font-bold text-lg">₹{(amount * 0.8).toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share to LINE
              </Button>
              <Button variant="cyber" className="flex-1" onClick={handleClose}>
                <Heart className="w-4 h-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
