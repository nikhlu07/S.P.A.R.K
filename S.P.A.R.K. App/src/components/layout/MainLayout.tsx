import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, QrCode, Menu, X } from 'lucide-react';
import { PaymentScanner } from '@/components/PaymentScanner';
import { cn } from '@/lib/utils';
import { ethers } from 'ethers';

const KAIA_TESTNET = {
  chainId: '0x3E9', // 1001
  chainName: 'Kaia Kairos Testnet',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
  rpcUrls: ['https://public-en-kairos.node.kaia.io'],
  blockExplorerUrls: ['https://kairos.kaiaexplorer.io/'],
};

const Header = ({ onScanClick, isLoggedIn, logout }: { onScanClick: () => void; isLoggedIn: boolean; logout: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
      const timer = setInterval(() => {
          const now = new Date();
          const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
          setTime(now.toLocaleTimeString('en-US', options).replace(' ', '') + ' IST');
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore-viral-deals', label: '🔥 Viral Deals' },
    { to: '/local-marketplace', label: '🏪 Marketplace' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/discover-rewards', label: 'Discover Rewards' },
    // ...(isLoggedIn ? [{ to: '/profile', label: 'Profile' }] : [{ to: '/login', label: 'Login/Register' }]),
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/logo.png" alt="S.P.A.R.K. Logo" width="40"/>
                        <span className="font-tech text-2xl font-bold tracking-wider text-white text-glow">S.P.A.R.K.</span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-4">
                  {navLinks.map(link => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          "font-tech text-sm uppercase tracking-wider transition-colors",
                          isActive ? "text-purple-400 text-glow" : "text-gray-400 hover:text-white"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  {isLoggedIn && <Button onClick={logout} variant="ghost" className="font-tech text-sm uppercase tracking-wider text-gray-400 hover:text-white">Logout</Button>}
                </nav>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 font-tech text-sm text-gray-400">
                      <span className="status-light"></span>
                      <span>{time}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onScanClick} className="text-gray-300 hover:text-purple-400">
                        <QrCode className="w-6 h-6" />
                    </Button>
                    <div className="md:hidden">
                      <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                      </Button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
              <nav className="md:hidden py-4 space-y-2">
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block font-tech text-lg uppercase tracking-wider transition-colors py-2 text-center",
                        isActive ? "text-purple-400 text-glow bg-purple-500/10 rounded-lg" : "text-gray-400 hover:text-white"
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                {isLoggedIn && <Button onClick={() => { logout(); setIsMenuOpen(false); }} variant="ghost" className="w-full font-tech text-lg uppercase tracking-wider text-gray-400 hover:text-white">Logout</Button>}
              </nav>
            )}
        </div>
    </header>
  );
}

const FloatingScanButton = ({ onClick }: { onClick: () => void }) => (
  <div className="fixed bottom-6 right-6 z-40 hidden md:flex">
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
  walletAddress: string | null;
  walletBalance: number;
  walletUsdBalance: number;
  isLoggedIn: boolean;
  connectWallet: () => Promise<void>;
  logout: () => void;
};

const MainLayout = () => {
  const [showPaymentScanner, setShowPaymentScanner] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletUsdBalance, setWalletUsdBalance] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(KAIA_TESTNET.chainId)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: KAIA_TESTNET.chainId }],
          });
        } catch (switchError: unknown) {
          const error = switchError as { code?: number };
          if (error.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [KAIA_TESTNET],
            });
          } else {
            console.error("Failed to switch wallet:", error);
            alert("Failed to switch wallet. See console for more details.");
            return;
          }
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      const formattedBalance = parseFloat(ethers.formatUnits(balance, 18));
      
      let kaiaUsdPrice = 0.15; // Default price
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaia&vs_currencies=usd');
        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }
        const data = await response.json();
        if (data.kaia && data.kaia.usd) {
          kaiaUsdPrice = data.kaia.usd;
        }
      } catch (priceError) {
        console.error("Could not fetch KAIA price, using default:", priceError);
      }

      setWalletAddress(address);
      setWalletBalance(formattedBalance);
      setWalletUsdBalance(formattedBalance * kaiaUsdPrice);
      setIsLoggedIn(true);

    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. See console for more details.");
    }
  };

  const logout = () => {
    setWalletAddress(null);
    setWalletBalance(0);
    setWalletUsdBalance(0);
    setIsLoggedIn(false);
  };

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
        <Header onScanClick={() => setShowPaymentScanner(true)} isLoggedIn={isLoggedIn} logout={logout} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Outlet context={{ setShowPaymentScanner, walletAddress, walletBalance, walletUsdBalance, isLoggedIn, connectWallet, logout }} />
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
