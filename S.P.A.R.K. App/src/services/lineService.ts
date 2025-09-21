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
  private liff: any | null = null;

  static getInstance(): LineService {
    if (!LineService.instance) {
      LineService.instance = new LineService();
    }
    return LineService.instance;
  }

  // Initialize LINE Mini Dapp using LIFF SDK
  async initialize(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;

      // Only attempt LIFF init inside LINE or when LIFF is explicitly available
      if (!isLineMiniApp()) {
        // Fallback: still allow web users to proceed without LIFF
        const userInfo = getLineUserInfo();
        if (userInfo.userId) {
          this.user = userInfo as LineUser;
          saveLineUserInfo(userInfo);
        }
        return false;
      }

      // Dynamic import to avoid bundling issues
      const liff = (await import('@line/liff')).default;
      await liff.init({ liffId: LINE_CONFIG.dappId });

      // Ensure login
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: LINE_CONFIG.redirectUri });
        return false; // Will redirect
      }

      this.liff = liff;

      // Fetch profile and cache
      const profile = await liff.getProfile();
      const user: LineUser = {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      };
      this.user = user;
      saveLineUserInfo(user);
      return true;
    } catch (error) {
      console.error('Failed to initialize LINE Mini Dapp:', error);
      return false;
    }
  }

  // Get LINE user profile (via LIFF if available)
  async getUserProfile(): Promise<LineUser | null> {
    try {
      if (this.user) return this.user;

      if (this.liff) {
        const profile = await this.liff.getProfile();
        const user: LineUser = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
        };
        this.user = user;
        saveLineUserInfo(user);
        return user;
      }

      // Fallback to any stored info
      const stored = getLineUserInfo();
      if (stored.userId && stored.displayName) {
        this.user = stored as LineUser;
        return this.user;
      }

      return null;
    } catch (error) {
      console.error('Failed to get LINE user profile:', error);
      return null;
    }
  }

  // Share deal to LINE (prefer LIFF shareTargetPicker when available)
  async shareDeal(deal: any): Promise<boolean> {
    try {
      const shareText = `🔥 ${deal.title}\n${deal.description}\n\n💰 Save ${deal.discount} at ${deal.business?.name || 'this business'}!\n\nGet it on S.P.A.R.K. 👇`;
      const url = `${window.location.origin}/deal/${deal.id}?ref=line_share&userId=${this.user?.userId || 'anonymous'}`;

      if (this.liff && this.liff.isApiAvailable('shareTargetPicker')) {
        await this.liff.shareTargetPicker([
          { type: 'text', text: `${shareText}\n${url}` },
        ]);
        return true;
      }

      // Fallbacks when not in LIFF
      if (navigator.share) {
        await navigator.share({ title: deal.title, text: shareText, url });
        return true;
      }

      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
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
      const shareText = `🏪 ${business.name}\nDiscover amazing deals at ${business.name}!\n\n📍 ${business.location || 'Local business'}\n⭐ Trust Score: ${business.trustScore || 'N/A'}/100\n\nSupport local businesses on S.P.A.R.K. 👇`;
      const url = `${window.location.origin}/business/${business.id}?ref=line_share&userId=${this.user?.userId || 'anonymous'}`;

      if (this.liff && this.liff.isApiAvailable('shareTargetPicker')) {
        await this.liff.shareTargetPicker([{ type: 'text', text: `${shareText}\n${url}` }]);
        return true;
      }

      if (navigator.share) {
        await navigator.share({ title: business.name, text: shareText, url });
        return true;
      }

      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
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
      const shareText = `💳 Payment Successful!\n\nJust paid ₹${transaction.amount} at ${transaction.businessName} using S.P.A.R.K.!\n\n🎉 Earned ${transaction.tokensEarned} ChaiCoins\n💰 Saved money with crypto payments\n\nJoin the future of payments 👇`;
      const url = `${window.location.origin}?ref=payment_share&userId=${this.user?.userId || 'anonymous'}`;

      if (this.liff && this.liff.isApiAvailable('shareTargetPicker')) {
        await this.liff.shareTargetPicker([{ type: 'text', text: `${shareText}\n${url}` }]);
        return true;
      }

      if (navigator.share) {
        await navigator.share({ title: 'Payment Successful', text: shareText, url });
        return true;
      }

      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
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
      const shareText = `🚀 Join S.P.A.R.K. with me!\n\nI'm using S.P.A.R.K. for amazing deals and crypto payments! 🔥\n\n✨ Get exclusive discounts\n💰 Earn rewards on every purchase\n🏪 Support local businesses\n\nJoin now and get bonus tokens! 👇`;
      const url = `${window.location.origin}?ref=friend_invite&inviter=${this.user?.userId || 'anonymous'}`;

      if (this.liff && this.liff.isApiAvailable('shareTargetPicker')) {
        await this.liff.shareTargetPicker([{ type: 'text', text: `${shareText}\n${url}` }]);
        return true;
      }

      if (navigator.share) {
        await navigator.share({ title: 'Join S.P.A.R.K.', text: shareText, url });
        return true;
      }

      const shareUrl = `${LINE_API.share}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
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
    try {
      if (this.liff && this.liff.isLoggedIn()) {
        this.liff.logout();
      }
    } catch (e) {
      // ignore
    }
    this.user = null;
    localStorage.removeItem('lineUserId');
    localStorage.removeItem('lineDisplayName');
    localStorage.removeItem('linePictureUrl');
  }

  // Get LINE Mini App environment info
  getEnvironmentInfo() {
    return {
      isLineMiniApp: isLineMiniApp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      dappId: LINE_CONFIG.dappId,
      dappName: LINE_CONFIG.dappName,
    };
  }
}

export const lineService = LineService.getInstance();