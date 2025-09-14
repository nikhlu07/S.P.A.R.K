import React, { useState, useCallback, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, QrCode } from 'lucide-react';
import { PaymentScanner } from '@/components/PaymentScanner';
import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

// Kaia Kairos Testnet Configuration
const KAIA_CHAIN_ID = '0x3e9'; // 1001
const KAIA_NETWORK_PARAMS = {
  chainId: KAIA_CHAIN_ID,
  chainName: 'Kaia Kairos Testnet',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18,
  },
  rpcUrls: ['https://public-en-kairos.node.kaia.io'],
  blockExplorerUrls: ['https://kairos.kaiaexplorer.io/'],
};

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
  walletAddress?: string;
  walletBalance?: number;
  walletUsdBalance?: number;
  isLoggedIn: boolean;
  connectWallet: () => void;
};

const MainLayout = () => {
  const [showPaymentScanner, setShowPaymentScanner] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [walletBalance, setWalletBalance] = useState<number | undefined>();
  const [walletUsdBalance, setWalletUsdBalance] = useState<number | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateWalletState = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0 && accounts[0]) {
      const address = accounts[0];
      setWalletAddress(address);
      setIsLoggedIn(true);
      try {
        if (!window.ethereum) throw new Error("No crypto wallet found");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { chainId } = await provider.getNetwork();

        if (String(chainId) === "1001") {
            const balance = await provider.getBalance(address);
            const balanceInEth = parseFloat(ethers.formatEther(balance));
            setWalletBalance(balanceInEth);
            // Mock USD value, in a real app, you'd use a price oracle for KAIA price
            setWalletUsdBalance(balanceInEth * 0.15); 
        } else {
            setWalletBalance(0);
            setWalletUsdBalance(0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setWalletBalance(undefined);
        setWalletUsdBalance(undefined);
      }
    } else {
      setWalletAddress(undefined);
      setWalletBalance(undefined);
      setWalletUsdBalance(undefined);
      setIsLoggedIn(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { chainId } = await provider.getNetwork();

        if (String(chainId) !== "1001") {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: KAIA_CHAIN_ID }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [KAIA_NETWORK_PARAMS],
                });
              } catch (addError) {
                console.error('Failed to add Kaia network:', addError);
                alert("Failed to add the Kaia Kairos Testnet to your wallet. Please add it manually.");
                return;
              }
            } else {
                console.error('Failed to switch network:', switchError);
                alert("Failed to switch to the Kaia Kairos Testnet. Please switch manually in your wallet.");
                return;
            }
          }
        }
        
        const accounts = await provider.send("eth_requestAccounts", []);
        updateWalletState(accounts);

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  }, [updateWalletState]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
          updateWalletState(accounts);
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      const checkInitialConnection = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signers = await provider.listAccounts();
          if (signers.length > 0 && signers[0]) {
            const address = await signers[0].getAddress();
            updateWalletState([address]);
         }
        } catch (err) {
          console.error("Could not get accounts:", err);
        }
      };
      checkInitialConnection();

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [updateWalletState]);

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
          <Outlet context={{ 
            setShowPaymentScanner,
            walletAddress,
            walletBalance,
            walletUsdBalance,
            isLoggedIn,
            connectWallet 
          }} />
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
