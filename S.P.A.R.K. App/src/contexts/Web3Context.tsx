import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { web3Service } from '../services/web3Service';
import { lineService } from '../services/lineService';

interface Web3ContextType {
  // Wallet state
  isConnected: boolean;
  account: string | null;
  balance: string;
  usdtBalance: string;
  
  // LINE state
  lineProfile: any | null;
  isLineConnected: boolean;
  
  // Connection methods
  connectWallet: () => Promise<void>;
  connectLine: () => Promise<void>;
  disconnect: () => void;
  
  // Blockchain data
  businesses: any[];
  campaigns: any[];
  poolInfo: any | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [lineProfile, setLineProfile] = useState<any | null>(null);
  const [isLineConnected, setIsLineConnected] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [poolInfo, setPoolInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const walletInfo = await web3Service.connectWallet();
      setAccount(walletInfo.address);
      setBalance(ethers.formatEther(walletInfo.balance));
      setIsConnected(true);
      
      // Get USDT balance
      const usdtBal = await web3Service.getUSDTBalance();
      setUsdtBalance(usdtBal);
      
      // Load blockchain data
      await loadBlockchainData();
      
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectLine = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await lineService.initialize();
      const profile = await lineService.getProfile();
      setLineProfile(profile);
      setIsLineConnected(true);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to connect LINE:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance('0');
    setUsdtBalance('0');
    setLineProfile(null);
    setIsLineConnected(false);
    setBusinesses([]);
    setCampaigns([]);
    setPoolInfo(null);
  };

  const loadBlockchainData = async () => {
    try {
      // Load businesses
      const businessData = await web3Service.getBusinesses();
      setBusinesses(businessData);
      
      // Load campaigns
      const campaignData = await web3Service.getCampaigns();
      setCampaigns(campaignData);
      
      // Load pool info
      const poolData = await web3Service.getPoolInfo();
      setPoolInfo(poolData);
      
    } catch (err: any) {
      console.error('Failed to load blockchain data:', err);
    }
  };

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      try {
        // Check if wallet is already connected
        if (window.ethereum && window.ethereum.selectedAddress) {
          await connectWallet();
        }
        
        // Try to connect LINE
        await connectLine();
      } catch (err) {
        // Silently fail for auto-connect
        console.log('Auto-connect failed:', err);
      }
    };
    
    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          connectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account]);

  const value: Web3ContextType = {
    isConnected,
    account,
    balance,
    usdtBalance,
    lineProfile,
    isLineConnected,
    connectWallet,
    connectLine,
    disconnect,
    businesses,
    campaigns,
    poolInfo,
    isLoading,
    error,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
