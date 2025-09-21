import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseService, SupabaseBusiness, SupabaseDeal, SupabaseRewardToken, SupabaseLeaderboard, SupabaseUserStats, SupabaseCommunityStats, SupabaseTransaction } from '@/services/supabaseService';

interface SupabaseContextType {
  // Data
  businesses: SupabaseBusiness[];
  deals: SupabaseDeal[];
  dealsWithBusinesses: (SupabaseDeal & { business: SupabaseBusiness })[];
  trendingDeals: SupabaseDeal[];
  nftCouponDeals: SupabaseDeal[];
  rewardTokens: SupabaseRewardToken[];
  leaderboard: SupabaseLeaderboard[];
  userStats: SupabaseUserStats | null;
  communityStats: SupabaseCommunityStats | null;
  userTransactions: SupabaseTransaction[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadBusinesses: () => Promise<void>;
  loadDeals: () => Promise<void>;
  loadDealsWithBusinesses: () => Promise<void>;
  loadTrendingDeals: () => Promise<void>;
  loadNFTCouponDeals: () => Promise<void>;
  loadRewardTokens: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
  loadCommunityStats: () => Promise<void>;
  loadUserTransactions: (userId: string) => Promise<void>;
  searchBusinesses: (query: string) => Promise<SupabaseBusiness[]>;
  searchDeals: (query: string) => Promise<SupabaseDeal[]>;
  createBusiness: (businessData: any) => Promise<SupabaseBusiness>;
  getBusinessByEmail: (email: string) => Promise<SupabaseBusiness | null>;
  getBusinessByWalletAddress: (walletAddress: string) => Promise<SupabaseBusiness | null>;
  refreshAll: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  // Data state
  const [businesses, setBusinesses] = useState<SupabaseBusiness[]>([]);
  const [deals, setDeals] = useState<SupabaseDeal[]>([]);
  const [dealsWithBusinesses, setDealsWithBusinesses] = useState<(SupabaseDeal & { business: SupabaseBusiness })[]>([]);
  const [trendingDeals, setTrendingDeals] = useState<SupabaseDeal[]>([]);
  const [nftCouponDeals, setNftCouponDeals] = useState<SupabaseDeal[]>([]);
  const [rewardTokens, setRewardTokens] = useState<SupabaseRewardToken[]>([]);
  const [leaderboard, setLeaderboard] = useState<SupabaseLeaderboard[]>([]);
  const [userStats, setUserStats] = useState<SupabaseUserStats | null>(null);
  const [communityStats, setCommunityStats] = useState<SupabaseCommunityStats | null>(null);
  const [userTransactions, setUserTransactions] = useState<SupabaseTransaction[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load businesses
  const loadBusinesses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getBusinesses();
      setBusinesses(data);
    } catch (err) {
      console.error('Failed to load businesses:', err);
      setError('Failed to load businesses');
    } finally {
      setIsLoading(false);
    }
  };

  // Load deals
  const loadDeals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getDeals();
      setDeals(data);
    } catch (err) {
      console.error('Failed to load deals:', err);
      setError('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  // Load deals with businesses
  const loadDealsWithBusinesses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getDealsWithBusinesses();
      setDealsWithBusinesses(data);
    } catch (err) {
      console.error('Failed to load deals with businesses:', err);
      setError('Failed to load deals with businesses');
    } finally {
      setIsLoading(false);
    }
  };

  // Load trending deals
  const loadTrendingDeals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getTrendingDeals();
      setTrendingDeals(data);
    } catch (err) {
      console.error('Failed to load trending deals:', err);
      setError('Failed to load trending deals');
    } finally {
      setIsLoading(false);
    }
  };

  // Load NFT coupon deals
  const loadNFTCouponDeals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getNFTCouponDeals();
      setNftCouponDeals(data);
    } catch (err) {
      console.error('Failed to load NFT coupon deals:', err);
      setError('Failed to load NFT coupon deals');
    } finally {
      setIsLoading(false);
    }
  };

  // Load reward tokens
  const loadRewardTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getRewardTokens();
      setRewardTokens(data);
    } catch (err) {
      console.error('Failed to load reward tokens:', err);
      setError('Failed to load reward tokens');
    } finally {
      setIsLoading(false);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user stats
  const loadUserStats = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getUserStats(userId);
      setUserStats(data);
    } catch (err) {
      console.error('Failed to load user stats:', err);
      setError('Failed to load user stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Load community stats
  const loadCommunityStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getCommunityStats();
      setCommunityStats(data);
    } catch (err) {
      console.error('Failed to load community stats:', err);
      setError('Failed to load community stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user transactions
  const loadUserTransactions = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseService.getUserTransactions(userId);
      setUserTransactions(data);
    } catch (err) {
      console.error('Failed to load user transactions:', err);
      setError('Failed to load user transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Search businesses
  const searchBusinesses = async (query: string): Promise<SupabaseBusiness[]> => {
    try {
      setError(null);
      return await supabaseService.searchBusinesses(query);
    } catch (err) {
      console.error('Failed to search businesses:', err);
      setError('Failed to search businesses');
      return [];
    }
  };

  // Search deals
  const searchDeals = async (query: string): Promise<SupabaseDeal[]> => {
    try {
      setError(null);
      return await supabaseService.searchDeals(query);
    } catch (err) {
      console.error('Failed to search deals:', err);
      setError('Failed to search deals');
      return [];
    }
  };

  // Create business
  const createBusiness = async (businessData: any): Promise<SupabaseBusiness> => {
    try {
      setIsLoading(true);
      setError(null);
      const newBusiness = await supabaseService.createBusiness(businessData);
      // Refresh businesses list
      await loadBusinesses();
      return newBusiness;
    } catch (err) {
      console.error('Failed to create business:', err);
      setError('Failed to create business');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get business by email
  const getBusinessByEmail = async (email: string): Promise<SupabaseBusiness | null> => {
    try {
      setError(null);
      return await supabaseService.getBusinessByEmail(email);
    } catch (err) {
      console.error('Failed to get business by email:', err);
      setError('Failed to get business by email');
      return null;
    }
  };

  // Get business by wallet address
  const getBusinessByWalletAddress = async (walletAddress: string): Promise<SupabaseBusiness | null> => {
    try {
      setError(null);
      return await supabaseService.getBusinessByWalletAddress(walletAddress);
    } catch (err) {
      console.error('Failed to get business by wallet address:', err);
      setError('Failed to get business by wallet address');
      return null;
    }
  };
  const refreshAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        loadBusinesses(),
        loadDeals(),
        loadDealsWithBusinesses(),
        loadTrendingDeals(),
        loadNFTCouponDeals(),
        loadRewardTokens(),
        loadLeaderboard(),
        loadCommunityStats()
      ]);
    } catch (err) {
      console.error('Failed to refresh all data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    refreshAll();
  }, []);

  const value: SupabaseContextType = {
    // Data
    businesses,
    deals,
    dealsWithBusinesses,
    trendingDeals,
    nftCouponDeals,
    rewardTokens,
    leaderboard,
    userStats,
    communityStats,
    userTransactions,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    loadBusinesses,
    loadDeals,
    loadDealsWithBusinesses,
    loadTrendingDeals,
    loadNFTCouponDeals,
    loadRewardTokens,
    loadLeaderboard,
    loadUserStats,
    loadCommunityStats,
    loadUserTransactions,
    searchBusinesses,
    searchDeals,
    createBusiness,
    getBusinessByEmail,
    getBusinessByWalletAddress,
    refreshAll
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};
