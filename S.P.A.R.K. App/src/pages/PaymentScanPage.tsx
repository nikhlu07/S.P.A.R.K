import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentScanner } from '@/components/PaymentScanner';

const PaymentScanPage = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(true);

  const handlePaymentComplete = (transaction: any) => {
    console.log('Payment completed:', transaction);
    // Navigate back to home or show success page
    navigate('/', { 
      state: { 
        message: `Payment successful! Earned ${transaction.tokensEarned} ChaiCoins.` 
      }
    });
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative antialiased">
      <div className="stars-container">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>
      <div id="mouse-glow"></div>
      <div className="scanline-overlay"></div>

      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={handleClose}
              variant="ghost"
              className="text-white hover:text-purple-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <h1 className="font-tech text-xl font-bold text-white">
              S.P.A.R.K. Pay
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          {showScanner && (
            <PaymentScanner
              onClose={handleClose}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentScanPage;
