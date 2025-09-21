import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, X, CheckCircle, AlertCircle, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { lineService } from '@/services/lineService';

interface PaymentData {
  type: string;
  businessId: string;
  businessName: string;
  businessAddress?: string;
  amount?: number;
  description?: string;
  timestamp: number;
  version: string;
}

interface PaymentScannerProps {
  onClose?: () => void;
  onPaymentComplete?: (transaction: any) => void;
}

function PaymentScanner({ onClose, onPaymentComplete }: PaymentScannerProps) {
  const { toast } = useToast();
  const { isConnected, account, balance } = useWeb3();
  const [isScanning, setIsScanning] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    // Simulate scanning a QR code for demo purposes
    const mockPaymentData: PaymentData = {
      type: 'spark_payment',
      businessId: 'elykid-private-limited',
      businessName: 'Elykid Private Limited',
      businessAddress: '0x1234...5678',
      amount: 250,
      description: 'Coffee and snacks',
      timestamp: Date.now(),
      version: '1.0'
    };
    
    setPaymentData(mockPaymentData);
    stopCamera();
  };

  const processPayment = async () => {
    if (!paymentData || !isConnected || !account) {
      toast({
        title: "Payment Failed",
        description: "Please connect your wallet to make payments.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transaction = {
        id: `tx_${Date.now()}`,
        businessName: paymentData.businessName,
        amount: paymentData.amount || 0,
        tokensEarned: Math.floor((paymentData.amount || 0) * 0.1), // 10% back in tokens
        timestamp: new Date(),
        status: 'completed'
      };

      toast({
        title: "Payment Successful! 🎉",
        description: `Paid ₹${paymentData.amount} to ${paymentData.businessName}. Earned ${transaction.tokensEarned} ChaiCoins!`,
      });

      // Share success on LINE
      try {
        await lineService.sharePaymentSuccess(transaction);
      } catch (error) {
        console.warn('Failed to share on LINE:', error);
      }

      onPaymentComplete?.(transaction);
      onClose?.();

    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (paymentData) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Confirm Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">{paymentData.businessName}</h3>
            {paymentData.amount && (
              <p className="text-3xl font-bold text-green-400 mt-2">
                ₹{paymentData.amount}
              </p>
            )}
            {paymentData.description && (
              <p className="text-gray-400 mt-1">{paymentData.description}</p>
            )}
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Your Balance:</span>
              <span className="text-white">{parseFloat(balance).toFixed(4)} KAIA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">You'll Earn:</span>
              <span className="text-green-400">
                {Math.floor((paymentData.amount || 0) * 0.1)} ChaiCoins
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setPaymentData(null)}
              variant="outline"
              className="flex-1 text-white border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              disabled={isProcessing || !isConnected}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Scan to Pay
          </span>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-sm">
                Please connect your wallet to make payments
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black rounded-lg object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <div className="absolute inset-0 border-2 border-purple-500 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 border-2 border-white rounded-lg opacity-50"></div>
                </div>
              </div>
              <Badge className="absolute top-2 left-2 bg-green-600">
                Scanning...
              </Badge>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Camera not active</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isScanning ? (
            <>
              <Button
                onClick={stopCamera}
                variant="outline"
                className="flex-1 text-white border-gray-600"
              >
                Stop Camera
              </Button>
              <Button
                onClick={simulateQRScan}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Simulate Scan
              </Button>
            </>
          ) : (
            <Button
              onClick={startCamera}
              disabled={!isConnected}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Point your camera at a S.P.A.R.K. QR code to pay
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { PaymentScanner };
