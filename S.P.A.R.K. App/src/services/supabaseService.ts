import { createClient } from '@supabase/supabase-js';

// Create a direct client without types for now
const supabaseUrl = 'https://nkcgmbjaimrgapdnaqrc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY2dtYmphaW1yZ2FwZG5hcXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTQ3ODQsImV4cCI6MjA3MzkzMDc4NH0.o6M_etzbp1wCtrxoZPOG7bNuNXFzTGwGlOwpcXnSa3A';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface SupabaseBusiness {
  id: string;
  name: string;
  image: string;
  category: string;
  distance: string;
  rating: number;
  friends_love: number;
  location: string;
  owner: string;
  email: string;
  wallet_address: string;
  is_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseDeal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount: string;
  valid_until: string;
  nft_coupon: boolean;
  trending: boolean;
  category: string;
  image: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseRewardToken {
  name: string;
  symbol: string;
  balance: number;
  business: string;
  color: string;
  trend: string;
  trend_value: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseLeaderboard {
  rank: number;
  name: string;
  avatar: string;
  achievement: string;
  score: number;
  badge: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserStats {
  id: number;
  user_id: string;
  total_spent: number;
  businesses_supported: number;
  friends_referred: number;
  tokens_earned: number;
  nft_coupons_collected: number;
  community_rank: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCommunityStats {
  id: number;
  total_users: number;
  active_businesses: number;
  monthly_volume: number;
  community_pool: number;
  loans_active: number;
  average_yield: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseTransaction {
  id: number;
  user_id: string;
  business_id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  transaction_hash: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseInvestment {
  id: number;
  user_id: string;
  wallet_address: string;
  amount: number;
  apy: number;
  status: string;
  transaction_hash?: string;
  start_date: string;
  maturity_date?: string;
  earned_interest: number;
  last_interest_payment?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabasePoolStatistics {
  id: number;
  total_invested: number;
  total_borrowed: number;
  available_liquidity: number;
  total_investors: number;
  current_apy: number;
  utilization_rate: number;
  default_rate: number;
  average_loan_size: number;
  total_loans_funded: number;
  updated_at: string;
}

export interface SupabaseInvestmentTransaction {
  id: number;
  user_id: string;
  wallet_address: string;
  investment_id?: number;
  transaction_type: string;
  amount: number;
  transaction_hash?: string;
  status: string;
  created_at: string;
}

class SupabaseService {
  // Get all businesses
  async getBusinesses(): Promise<SupabaseBusiness[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }
  }

  // Get all deals
  async getDeals(): Promise<SupabaseDeal[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  }

  // Get deals with business information
  async getDealsWithBusinesses(): Promise<(SupabaseDeal & { business: SupabaseBusiness })[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          business:businesses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deals with businesses:', error);
        return [];
      }

      return data?.map(deal => ({
        ...deal,
        business: deal.business
      })) || [];
    } catch (error) {
      console.error('Error fetching deals with businesses:', error);
      return [];
    }
  }

  // Get trending deals
  async getTrendingDeals(): Promise<SupabaseDeal[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('trending', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trending deals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching trending deals:', error);
      return [];
    }
  }

  // Get NFT coupon deals
  async getNFTCouponDeals(): Promise<SupabaseDeal[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('nft_coupon', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching NFT coupon deals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching NFT coupon deals:', error);
      return [];
    }
  }

  // Get reward tokens
  async getRewardTokens(): Promise<SupabaseRewardToken[]> {
    try {
      const { data, error } = await supabase
        .from('reward_tokens')
        .select('*')
        .order('balance', { ascending: false });

      if (error) {
        console.error('Error fetching reward tokens:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching reward tokens:', error);
      return [];
    }
  }

  // Get leaderboard
  async getLeaderboard(): Promise<SupabaseLeaderboard[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Get user stats
  async getUserStats(userId: string): Promise<SupabaseUserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // Get community stats
  async getCommunityStats(): Promise<SupabaseCommunityStats | null> {
    try {
      const { data, error } = await supabase
        .from('community_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching community stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching community stats:', error);
      return null;
    }
  }

  // Get user transactions
  async getUserTransactions(userId: string): Promise<SupabaseTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // Search businesses
  async searchBusinesses(query: string): Promise<SupabaseBusiness[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching businesses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching businesses:', error);
      return [];
    }
  }

  // Search deals
  async searchDeals(query: string): Promise<SupabaseDeal[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching deals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching deals:', error);
      return [];
    }
  }

  // Get business by email for login
  async getBusinessByEmail(email: string): Promise<SupabaseBusiness | null> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching business by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching business by email:', error);
      return null;
    }
  }

  // Get business by wallet address for login
  async getBusinessByWalletAddress(walletAddress: string): Promise<SupabaseBusiness | null> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching business by wallet address:', JSON.stringify(error, null, 2));
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching business by wallet address:', JSON.stringify(error, null, 2));
      return null;
    }
  }
  async createBusiness(businessData: {
    name: string;
    category: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    wallet_address: string;
    transaction_hash?: string;
    status?: string;
  }): Promise<SupabaseBusiness> {
    try {
      // Generate a unique ID for the business
      const businessId = `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          id: businessId,
          name: businessData.name,
          category: businessData.category,
          email: businessData.email,
          phone: businessData.phone,
          address: businessData.address,
          city: businessData.city,
          state: businessData.state,
          country: businessData.country,
          pincode: businessData.pincode,
          location: `${businessData.city}, ${businessData.state}`,
          owner: businessData.wallet_address,
          wallet_address: businessData.wallet_address,
          transaction_hash: businessData.transaction_hash,
          status: businessData.status || 'pending_verification',
          image: '/placeholder-business.svg',
          distance: '0 km',
          rating: 0,
          friends_love: 0,
          is_verified: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Supabase error: ${error.message || error.details || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }

  // Get user investments
  async getUserInvestments(userId: string): Promise<SupabaseInvestment[]> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user investments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
  }

  // Create investment
  async createInvestment(investmentData: {
    user_id: string;
    wallet_address: string;
    amount: number;
    apy: number;
    transaction_hash?: string;
    maturity_date?: string;
  }): Promise<SupabaseInvestment> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          user_id: investmentData.user_id,
          wallet_address: investmentData.wallet_address,
          amount: investmentData.amount,
          apy: investmentData.apy,
          transaction_hash: investmentData.transaction_hash,
          maturity_date: investmentData.maturity_date,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating investment:', error);
        throw new Error('Failed to create investment');
      }

      return data;
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  }

  // Get pool statistics
  async getPoolStatistics(): Promise<SupabasePoolStatistics | null> {
    try {
      const { data, error } = await supabase
        .from('pool_statistics')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching pool statistics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching pool statistics:', error);
      return null;
    }
  }

  // Get investment transactions
  async getInvestmentTransactions(userId: string): Promise<SupabaseInvestmentTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('investment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching investment transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching investment transactions:', error);
      return [];
    }
  }

  // Create investment transaction
  async createInvestmentTransaction(transactionData: {
    user_id: string;
    wallet_address: string;
    investment_id?: number;
    transaction_type: string;
    amount: number;
    transaction_hash?: string;
  }): Promise<SupabaseInvestmentTransaction> {
    try {
      const { data, error } = await supabase
        .from('investment_transactions')
        .insert([{
          user_id: transactionData.user_id,
          wallet_address: transactionData.wallet_address,
          investment_id: transactionData.investment_id,
          transaction_type: transactionData.transaction_type,
          amount: transactionData.amount,
          transaction_hash: transactionData.transaction_hash,
          status: 'completed'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating investment transaction:', error);
        throw new Error('Failed to create investment transaction');
      }

      return data;
    } catch (error) {
      console.error('Error creating investment transaction:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();
