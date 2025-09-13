import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, QrCode } from 'lucide-react';
import { PaymentScanner } from '@/components/PaymentScanner';

const Header = ({ onScanClick }: { onScanClick: () => void }) => (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/logo.png" alt="S.P.A.R.K. Logo" width="40"/>
                        <span className="font-tech text-2xl font-bold tracking-wider text-white text-glow">S.P.A.R.K.</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/notifications">
                        <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-purple-400">
                            <Bell className="w-5 h-5" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={onScanClick} className="text-gray-300 hover:text-purple-400">
                        <QrCode className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    </header>
);

const FloatingScanButton = ({ onClick }: { onClick: () => void }) => (
  <div className="fixed bottom-6 right-6 z-40">
    <button
      className="glow-button rounded-full w-16 h-16 flex items-center justify-center"
      onClick={onClick}
    >
      <QrCode className="w-8 h-8 text-white" />
    </button>
  </div>
);

export type AppContext = {
  setShowPaymentScanner: React.Dispatch<React.SetStateAction<boolean>>;
};

const MainLayout = () => {
  const [showPaymentScanner, setShowPaymentScanner] = useState(false);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans relative antialiased">
      <div className="stars-container">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>
      <div id="mouse-glow"></div>
      <div className="scanline-overlay"></div>

      <div className="relative z-10">
        <Header onScanClick={() => setShowPaymentScanner(true)} />
        <main className="container mx-auto px-4 py-6 space-y-8">
          <Outlet context={{ setShowPaymentScanner }} />
        </main>
        <FloatingScanButton onClick={() => setShowPaymentScanner(true)} />
      </div>
      <PaymentScanner
        isOpen={showPaymentScanner}
        onClose={() => setShowPaymentScanner(false)}
      />
    </div>
  );
};

export default MainLayout;
