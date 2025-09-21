import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { businessService, Business, BusinessDeal, BusinessStats } from '@/services/businessService';
import { useWeb3 } from './Web3Context';

interface BusinessContextType {
  // Business state
  currentBusiness: Business | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Business operations
  loginBusiness: (walletAddress: string) => Promise<boolean>;
  registerBusiness: (businessData: Partial<Business>) => Promise<boolean>;
  logoutBusiness: () => void;
  
  // Deal operations
  createDeal: (dealData: Partial<BusinessDeal>) => Promise<boolean>;
  updateDeal: (dealId: string, dealData: Partial<BusinessDeal>) => Promise<boolean>;
  deleteDeal: (dealId: string) => Promise<boolean>;
  getBusinessDeals: () => Promise<BusinessDeal[]>;
  
  // Statistics
  getBusinessStats: () => Promise<BusinessStats | null>;
  
  // Public data
  getAllBusinesses: () => Promise<Business[]>;
  getAllActiveDeals: () => Promise<BusinessDeal[]>;
  claimDeal: (dealId: string) => Promise<boolean>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useWeb3();

  // Check if business is logged in on mount
  useEffect(() => {
    const checkBusinessLogin = () => {
      const business = businessService.getCurrentBusiness();
      if (business) {
        setCurrentBusiness(business);
        setIsLoggedIn(true);
      }
    };

    checkBusinessLogin();
  }, []);

  // Auto-login business if wallet is connected
  useEffect(() => {
    if (account && !isLoggedIn) {
      const autoLoginBusiness = async () => {
        setIsLoading(true);
        try {
          const business = await businessService.loginBusiness(account);
          if (business) {
            setCurrentBusiness(business);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Auto-login business failed:', error);
        } finally {
          setIsLoading(false);
        }
      };

      autoLoginBusiness();
    }
  }, [account, isLoggedIn]);

  const loginBusiness = async (walletAddress: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const business = await businessService.loginBusiness(walletAddress);
      if (business) {
        setCurrentBusiness(business);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Business login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerBusiness = async (businessData: Partial<Business>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const business = await businessService.registerBusiness(businessData);
      if (business) {
        setCurrentBusiness(business);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Business registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutBusiness = () => {
    businessService.logout();
    setCurrentBusiness(null);
    setIsLoggedIn(false);
  };

  const createDeal = async (dealData: Partial<BusinessDeal>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const deal = await businessService.createDeal(dealData);
      return deal !== null;
    } catch (error) {
      console.error('Create deal failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeal = async (dealId: string, dealData: Partial<BusinessDeal>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const deal = await businessService.updateDeal(dealId, dealData);
      return deal !== null;
    } catch (error) {
      console.error('Update deal failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDeal = async (dealId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await businessService.deleteDeal(dealId);
      return success;
    } catch (error) {
      console.error('Delete deal failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getBusinessDeals = async (): Promise<BusinessDeal[]> => {
    try {
      return await businessService.getBusinessDeals();
    } catch (error) {
      console.error('Get business deals failed:', error);
      return [];
    }
  };

  const getBusinessStats = async (): Promise<BusinessStats | null> => {
    try {
      return await businessService.getBusinessStats();
    } catch (error) {
      console.error('Get business stats failed:', error);
      return null;
    }
  };

  const getAllBusinesses = async (): Promise<Business[]> => {
    try {
      return await businessService.getAllBusinesses();
    } catch (error) {
      console.error('Get all businesses failed:', error);
      return [];
    }
  };

  const getAllActiveDeals = async (): Promise<BusinessDeal[]> => {
    try {
      return await businessService.getAllActiveDeals();
    } catch (error) {
      console.error('Get all active deals failed:', error);
      return [];
    }
  };

  const claimDeal = async (dealId: string): Promise<boolean> => {
    if (!account) {
      console.error('No wallet connected');
      return false;
    }

    try {
      return await businessService.claimDeal(dealId, account);
    } catch (error) {
      console.error('Claim deal failed:', error);
      return false;
    }
  };

  const value: BusinessContextType = {
    currentBusiness,
    isLoggedIn,
    isLoading,
    loginBusiness,
    registerBusiness,
    logoutBusiness,
    createDeal,
    updateDeal,
    deleteDeal,
    getBusinessDeals,
    getBusinessStats,
    getAllBusinesses,
    getAllActiveDeals,
    claimDeal,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
