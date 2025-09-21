import { LINE_CONFIG, LINE_API, isLineMiniApp, getLineUserInfo, saveLineUserInfo } from '@/config/lineConfig';

export interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export class LineService {
  private static instance: LineService;
  private user: LineUser | null = null;

  static getInstance(): LineService {
    if (!LineService.instance) {
      LineService.instance = new LineService();
    }
    return LineService.instance;
  }

  // Initialize LINE Mini Dapp
  async initialize(): Promise<boolean> {
    try {
      if (!isLineMiniApp()) {
        console.log('Not running in LINE Mini App environment');
        return false;
      }

      // Get user info from URL parameters or localStorage
      const userInfo = getLineUserInfo();
      if (userInfo.userId) {
        this.user = userInfo as LineUser;
        saveLineUserInfo(userInfo);
        return true;
      }

      // If no user info, try to get it from LINE API
      await this.getUserProfile();
      return true;
    } catch (error) {
      console.error('Failed to initialize LINE Mini Dapp:', error);
      return false;
    }
  }

  // Get LINE user profile
  async getUserProfile(): Promise<LineUser | null> {
    try {
      if (!isLineMiniApp()) {
        return null;
      }

      // In a real implementation, you would call LINE API here
      // For demo purposes, we'll use mock data
      const mockUser: LineUser = {
        userId: 'line_user_123',
        displayName: 'LINE User',
        pictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        statusMessage: 'Using S.P.A.R.K. for amazing deals!'
      };

      this.user = mockUser;
      saveLineUserInfo(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Failed to get LINE user profile:', error);
      return null;
    }
  }

  // Share deal to LINE
  async shareDeal(deal: any): Promise<boolean> {
    try {
      const shareData = {
        title: `🔥 ${deal.title}`,
        text: `${deal.description}\n\n💰 Save ${deal.discount} at ${deal.business?.name || 'this business'}!\n\nGet it on S.P.A.R.K. 👇`,
        url: `${window.location.origin}/deal/${deal.id}?ref=line_share&userId=${this.user?.userId || 'anonymous'}`
      };

      if (!isLineMiniApp()) {
        // Fallback to web sharing
        if (navigator.share) {
          await navigator.share(shareData);
          return true;
        }
        // Fallback to copying link
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        return true;
      }

      // LINE sharing implementation
      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
      window.open(shareUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Failed to share deal:', error);
      return false;
    }
  }

  // Share business to LINE
  async shareBusiness(business: any): Promise<boolean> {
    try {
      const shareData = {
        title: `🏪 ${business.name}`,
        text: `Discover amazing deals at ${business.name}!\n\n📍 ${business.location || 'Local business'}\n⭐ Trust Score: ${business.trustScore || 'N/A'}/100\n\nSupport local businesses on S.P.A.R.K. 👇`,
        url: `${window.location.origin}/business/${business.id}?ref=line_share&userId=${this.user?.userId || 'anonymous'}`
      };

      if (!isLineMiniApp()) {
        if (navigator.share) {
          await navigator.share(shareData);
          return true;
        }
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        return true;
      }

      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
      window.open(shareUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Failed to share business:', error);
      return false;
    }
  }

  // Share payment success to LINE
  async sharePaymentSuccess(transaction: any): Promise<boolean> {
    try {
      const shareData = {
        title: `💳 Payment Successful!`,
        text: `Just paid ₹${transaction.amount} at ${transaction.businessName} using S.P.A.R.K.!\n\n🎉 Earned ${transaction.tokensEarned} ChaiCoins\n💰 Saved money with crypto payments\n\nJoin the future of payments 👇`,
        url: `${window.location.origin}?ref=payment_share&userId=${this.user?.userId || 'anonymous'}`
      };

      if (!isLineMiniApp()) {
        if (navigator.share) {
          await navigator.share(shareData);
          return true;
        }
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        return true;
      }

      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
      window.open(shareUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Failed to share payment success:', error);
      return false;
    }
  }

  // Invite friends to S.P.A.R.K.
  async inviteFriends(): Promise<boolean> {
    try {
      const shareData = {
        title: `🚀 Join S.P.A.R.K. with me!`,
        text: `I'm using S.P.A.R.K. for amazing deals and crypto payments! 🔥\n\n✨ Get exclusive discounts\n💰 Earn rewards on every purchase\n🏪 Support local businesses\n\nJoin now and get bonus tokens! 👇`,
        url: `${window.location.origin}?ref=friend_invite&inviter=${this.user?.userId || 'anonymous'}`
      };

      if (!isLineMiniApp()) {
        if (navigator.share) {
          await navigator.share(shareData);
          return true;
        }
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        return true;
      }

      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
      window.open(shareUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Failed to invite friends:', error);
      return false;
    }
  }

  // Get current LINE user
  getCurrentUser(): LineUser | null {
    return this.user;
  }

  // Check if user is logged in via LINE
  isLoggedIn(): boolean {
    return this.user !== null;
  }

  // Logout from LINE
  logout(): void {
    this.user = null;
    localStorage.removeItem('lineUserId');
    localStorage.removeItem('lineDisplayName');
    localStorage.removeItem('linePictureUrl');
  }

  // Get LINE Mini App environment info
  getEnvironmentInfo() {
    return {
      isLineMiniApp: isLineMiniApp(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      dappId: LINE_CONFIG.dappId,
      dappName: LINE_CONFIG.dappName,
    };
  }
}

export const lineService = LineService.getInstance();