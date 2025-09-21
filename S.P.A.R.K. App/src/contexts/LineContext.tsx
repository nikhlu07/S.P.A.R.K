import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { lineService, LineUser } from '@/services/lineService';

interface LineContextType {
  isLineMiniApp: boolean;
  lineUser: LineUser | null;
  isInitialized: boolean;
  shareDeal: (deal: any) => Promise<boolean>;
  shareBusiness: (business: any) => Promise<boolean>;
  sharePaymentSuccess: (tx: any) => Promise<boolean>;
  inviteFriends: () => Promise<boolean>;
  logout: () => void;
  environmentInfo: any;
}

const LineContext = createContext<LineContextType | undefined>(undefined);

export const useLine = () => {
  const context = useContext(LineContext);
  if (context === undefined) {
    throw new Error('useLine must be used within a LineProvider');
  }
  return context;
};

interface LineProviderProps {
  children: ReactNode;
}

export const LineProvider: React.FC<LineProviderProps> = ({ children }) => {
  const [isLineMiniApp, setIsLineMiniApp] = useState(false);
  const [lineUser, setLineUser] = useState<LineUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);

  useEffect(() => {
    const initializeLine = async () => {
      try {
        const initialized = await lineService.initialize();
        setIsLineMiniApp(initialized);
        
        const user = await lineService.getUserProfile();
        setLineUser(user);
        setEnvironmentInfo(lineService.getEnvironmentInfo());
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize LINE service:', error);
        setIsInitialized(true);
      }
    };

    initializeLine();
  }, []);

  const shareDeal = async (deal: any): Promise<boolean> => {
    try {
      return await lineService.shareDeal(deal);
    } catch (error) {
      console.error('Failed to share deal:', error);
      return false;
    }
  };

  const shareBusiness = async (business: any): Promise<boolean> => {
    try {
      return await lineService.shareBusiness(business);
    } catch (error) {
      console.error('Failed to share business:', error);
      return false;
    }
  };

  const sharePaymentSuccess = async (tx: any): Promise<boolean> => {
    try {
      return await lineService.sharePaymentSuccess(tx);
    } catch (error) {
      console.error('Failed to share payment success:', error);
      return false;
    }
  };

  const inviteFriends = async (): Promise<boolean> => {
    try {
      return await lineService.inviteFriends();
    } catch (error) {
      console.error('Failed to invite friends:', error);
      return false;
    }
  };

  const logout = () => {
    lineService.logout();
    setLineUser(null);
  };

  const value: LineContextType = {
    isLineMiniApp,
    lineUser,
    isInitialized,
    shareDeal,
    shareBusiness,
    sharePaymentSuccess,
    inviteFriends,
    logout,
    environmentInfo,
  };

  return (
    <LineContext.Provider value={value}>
      {children}
    </LineContext.Provider>
  );
};
