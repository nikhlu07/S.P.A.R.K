import { supabase } from '@/integrations/supabase/client';

export interface Business {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  description?: string;
  image?: string;
  wallet_address?: string;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessDeal {
  id?: string;
  business_id?: string;
  title?: string;
  description?: string;
  discount?: string;
  original_price?: number | null;
  discounted_price?: number | null;
  category?: string;
  image?: string;
  start_date?: string;
  end_date?: string;
  max_claims?: number | null;
  current_claims?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessStats {
  total_deals: number;
  active_deals: number;
  total_claims: number;
  total_revenue: number;
  total_investments: number;
}

export class BusinessService {
  private static instance: BusinessService;
  private currentBusiness: Business | null = null;

  static getInstance(): BusinessService {
    if (!BusinessService.instance) {
      BusinessService.instance = new BusinessService();
    }
    return BusinessService.instance;
  }

  // Business Authentication
  async loginBusiness(walletAddress: string): Promise<Business | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        console.error('Business login error:', error);
        return null;
      }

      this.currentBusiness = (data as unknown as Business) || null;
      return this.currentBusiness;
    } catch (error) {
      console.error('Business login failed:', error);
      return null;
    }
  }

  async registerBusiness(businessData: Partial<Business>): Promise<Business | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('businesses')
        .insert([businessData])
        .select()
        .single();

      if (error) {
        console.error('Business registration error:', error);
        return null;
      }

      this.currentBusiness = (data as unknown as Business) || null;
      return this.currentBusiness;
    } catch (error) {
      console.error('Business registration failed:', error);
      return null;
    }
  }

  // Business Deals Management
  async createDeal(dealData: Partial<BusinessDeal>): Promise<BusinessDeal | null> {
    try {
      if (!this.currentBusiness) {
        throw new Error('No business logged in');
      }

      const { data, error } = await (supabase as any)
        .from('deals')
        .insert([{
          ...dealData,
          business_id: this.currentBusiness.id,
          is_active: true,
          current_claims: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Deal creation error:', error);
        return null;
      }

      return (data as unknown as BusinessDeal) || null;
    } catch (error) {
      console.error('Deal creation failed:', error);
      return null;
    }
  }

  async updateDeal(dealId: string, dealData: Partial<BusinessDeal>): Promise<BusinessDeal | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('deals')
        .update(dealData)
        .eq('id', dealId)
        .select()
        .single();

      if (error) {
        console.error('Deal update error:', error);
        return null;
      }

      return (data as unknown as BusinessDeal) || null;
    } catch (error) {
      console.error('Deal update failed:', error);
      return null;
    }
  }

  async deleteDeal(dealId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) {
        console.error('Deal deletion error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Deal deletion failed:', error);
      return false;
    }
  }

  async getBusinessDeals(): Promise<BusinessDeal[]> {
    try {
      if (!this.currentBusiness) {
        return [];
      }

      const { data, error } = await (supabase as any)
        .from('deals')
        .select('*')
        .eq('business_id', this.currentBusiness.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get business deals error:', error);
        return [];
      }

      return (data as unknown as BusinessDeal[]) || [];
    } catch (error) {
      console.error('Get business deals failed:', error);
      return [];
    }
  }

  // Business Statistics
  async getBusinessStats(): Promise<BusinessStats | null> {
    try {
      if (!this.currentBusiness) {
        return null;
      }

      const { data: deals, error: dealsError } = await (supabase as any)
        .from('deals')
        .select('*')
        .eq('business_id', this.currentBusiness.id);

      if (dealsError) {
        console.error('Get business stats error:', dealsError);
        return null;
      }

      const totalDeals = deals?.length || 0;
      const activeDeals = (deals || []).filter((deal: any) => !!deal?.is_active).length || 0;
      const totalClaims = (deals || []).reduce((sum: number, deal: any) => sum + (Number(deal?.current_claims) || 0), 0) || 0;
      const totalRevenue = (deals || []).reduce((sum: number, deal: any) => sum + ((Number(deal?.discounted_price) || 0) * (Number(deal?.current_claims) || 0)), 0) || 0;

      return {
        total_deals: totalDeals,
        active_deals: activeDeals,
        total_claims: totalClaims,
        total_revenue: totalRevenue,
        total_investments: 0 // This would come from investment data
      };
    } catch (error) {
      console.error('Get business stats failed:', error);
      return null;
    }
  }

  // Get all businesses for user app
  async getAllBusinesses(): Promise<Business[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get all businesses error:', error);
        return [];
      }

      return (data as unknown as Business[]) || [];
    } catch (error) {
      console.error('Get all businesses failed:', error);
      return [];
    }
  }

  // Get all active deals for user app
  async getAllActiveDeals(): Promise<BusinessDeal[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('deals')
        .select(`
          *,
          businesses (
            id,
            name,
            image,
            category,
            address
          )
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get all active deals error:', error);
        return [];
      }

      return (data as unknown as BusinessDeal[]) || [];
    } catch (error) {
      console.error('Get all active deals failed:', error);
      return [];
    }
  }

  // Claim a deal
  async claimDeal(dealId: string, userId: string): Promise<boolean> {
    try {
      // First, check if deal is still available
      const { data: deal, error: dealError } = await (supabase as any)
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError || !deal) {
        console.error('Deal not found:', dealError);
        return false;
      }

      if ((deal as any).current_claims >= (deal as any).max_claims) {
        console.error('Deal is fully claimed');
        return false;
      }

      // Update the deal's claim count
      const { error: updateError } = await (supabase as any)
        .from('deals')
        .update({ current_claims: (deal as any).current_claims + 1 })
        .eq('id', dealId);

      if (updateError) {
        console.error('Failed to update deal claims:', updateError);
        return false;
      }

      // Record the claim
      const { error: claimError } = await (supabase as any)
        .from('deal_claims')
        .insert([{
          deal_id: dealId,
          user_id: userId,
          claimed_at: new Date().toISOString()
        }]);

      if (claimError) {
        console.error('Failed to record claim:', claimError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Claim deal failed:', error);
      return false;
    }
  }

  // Get current business
  getCurrentBusiness(): Business | null {
    return this.currentBusiness;
  }

  // Logout business
  logout(): void {
    this.currentBusiness = null;
  }

  // Check if business is logged in
  isLoggedIn(): boolean {
    return this.currentBusiness !== null;
  }
}

export const businessService = BusinessService.getInstance();
