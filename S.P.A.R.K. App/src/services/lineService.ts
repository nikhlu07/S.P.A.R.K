// LINE Mini Dapp Integration Service
class LineService {
  private liff: any = null;
  private isInitialized = false;

  async initialize() {
    try {
      // Load LIFF SDK
      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      document.head.appendChild(script);

      return new Promise((resolve, reject) => {
        script.onload = async () => {
          try {
            // Initialize LIFF
            this.liff = (window as any).liff;
            const liffId = import.meta.env.VITE_LIFF_ID || 'your-liff-id';
            await this.liff.init({ liffId });
            this.isInitialized = true;
            resolve(true);
          } catch (error) {
            console.error('LIFF initialization failed:', error);
            reject(error);
          }
        };
        script.onerror = reject;
      });
    } catch (error) {
      console.error('Failed to load LIFF SDK:', error);
      throw error;
    }
  }

  async getProfile() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const profile = await this.liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage
      };
    } catch (error) {
      console.error('Failed to get LINE profile:', error);
      throw error;
    }
  }

  async shareMessage(message: string, url?: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.liff.isApiAvailable('shareTargetPicker')) {
        await this.liff.shareTargetPicker([
          {
            type: 'text',
            text: message + (url ? `\n${url}` : '')
          }
        ]);
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(message + (url ? `\n${url}` : ''));
        alert('Message copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share message:', error);
      throw error;
    }
  }

  async shareCoupon(couponData: any) {
    const message = `🎁 SPARK Coupon Alert!\n\n${couponData.title}\n${couponData.description}\n\n💰 ${couponData.discountPercent}% OFF\n\nClaim your coupon now!`;
    const url = `${window.location.origin}/coupon/${couponData.id}`;
    
    await this.shareMessage(message, url);
  }

  async shareBusiness(businessData: any) {
    const message = `🏪 Check out ${businessData.name}!\n\n📍 ${businessData.location}\n⭐ Trust Score: ${businessData.trustScore}/10\n\nSupport local businesses with SPARK!`;
    const url = `${window.location.origin}/business/${businessData.id}`;
    
    await this.shareMessage(message, url);
  }

  async shareInvestment(amount: number) {
    const message = `💰 I just invested ${amount} USDT in the SPARK Community Pool!\n\nHelp local businesses grow and earn returns together! 🚀`;
    const url = `${window.location.origin}/invest`;
    
    await this.shareMessage(message, url);
  }

  isInLineApp() {
    return this.liff && this.liff.isInClient();
  }

  isLoggedIn() {
    return this.liff && this.liff.isLoggedIn();
  }

  async login() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.liff.isLoggedIn()) {
      this.liff.login();
    }
  }

  async logout() {
    if (this.liff && this.liff.isLoggedIn()) {
      this.liff.logout();
    }
  }

  // Get LINE user ID for blockchain integration
  async getLineUserId() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.liff.isLoggedIn()) {
      const profile = await this.getProfile();
      return profile.userId;
    }
    
    return null;
  }

  // Send notification to LINE
  async sendNotification(message: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // This would typically use LINE Notify API
      // For now, we'll use the share functionality
      await this.shareMessage(`🔔 SPARK Notification\n\n${message}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }
}

export const lineService = new LineService();
