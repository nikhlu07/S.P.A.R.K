import axios from 'axios';

// LINE Messaging API Service for handling webhooks and messages
export class LineWebhookService {
  private static instance: LineWebhookService;
  private channelAccessToken: string;
  private baseURL = 'https://api.line.me/v2/bot';

  static getInstance(): LineWebhookService {
    if (!LineWebhookService.instance) {
      LineWebhookService.instance = new LineWebhookService();
    }
    return LineWebhookService.instance;
  }

  constructor() {
    this.channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
  }

  // Verify LINE signature for webhook security
  verifySignature(signature: string, body: string, channelSecret: string): boolean {
    // In production, you would use crypto to verify the signature
    // For demo purposes, we'll return true
    return true;
  }

  // Send text message to LINE user
  async sendTextMessage(userId: string, text: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseURL}/message/push`,
        {
          to: userId,
          messages: [{
            type: 'text',
            text: text
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.channelAccessToken}`
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Failed to send LINE message:', error);
      return false;
    }
  }

  // Send transaction notification
  async sendTransactionNotification(
    userId: string, 
    transaction: any
  ): Promise<boolean> {
    const message = `💳 Transaction Successful!\n\n` +
      `💰 Amount: ${transaction.amount} USDT\n` +
      `🏪 Merchant: ${transaction.merchant}\n` +
      `🎯 Status: Completed\n` +
      `📊 Rewards: +${transaction.rewards} ChaiCoins\n\n` +
      `View on Explorer: ${transaction.explorerUrl}`;

    return this.sendTextMessage(userId, message);
  }

  // Send deal alert
  async sendDealAlert(userId: string, deal: any): Promise<boolean> {
    const message = `🔥 Hot Deal Alert!\n\n` +
      `🏪 ${deal.businessName}\n` +
      `🎯 ${deal.title}\n` +
      `💰 ${deal.discount} OFF\n` +
      `⏰ Expires: ${deal.expiryDate}\n\n` +
      `Claim now: ${deal.dealUrl}`;

    return this.sendTextMessage(userId, message);
  }

  // Send rewards update
  async sendRewardsUpdate(userId: string, rewards: any): Promise<boolean> {
    const message = `🎉 Rewards Update!\n\n` +
      `💰 Total Rewards: ${rewards.total} ChaiCoins\n` +
      `📈 This month: +${rewards.monthly}\n` +
      `🏆 Level: ${rewards.level}\n\n` +
      `Redeem now: ${rewards.redeemUrl}`;

    return this.sendTextMessage(userId, message);
  }

  // Handle incoming webhook messages
  async handleWebhookEvent(event: any): Promise<void> {
    try {
      if (event.type === 'message' && event.message.type === 'text') {
        await this.handleTextMessage(event);
      } else if (event.type === 'follow') {
        await this.handleFollowEvent(event);
      } else if (event.type === 'unfollow') {
        await this.handleUnfollowEvent(event);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
    }
  }

  private async handleTextMessage(event: any): Promise<void> {
    const userId = event.source.userId;
    const messageText = event.message.text.toLowerCase();

    // Handle different command types
    if (messageText.includes('balance')) {
      await this.sendBalanceInfo(userId);
    } else if (messageText.includes('deal') || messageText.includes('offer')) {
      await this.sendLatestDeals(userId);
    } else if (messageText.includes('help')) {
      await this.sendHelpMessage(userId);
    } else if (messageText.includes('rewards')) {
      await this.sendRewardsInfo(userId);
    } else {
      await this.sendWelcomeMessage(userId);
    }
  }

  private async handleFollowEvent(event: any): Promise<void> {
    const userId = event.source.userId;
    await this.sendWelcomeMessage(userId);
  }

  private async handleUnfollowEvent(event: any): Promise<void> {
    // Handle user unfollowing the bot
    console.log(`User ${event.source.userId} unfollowed`);
  }

  private async sendWelcomeMessage(userId: string): Promise<void> {
    const message = `👋 Welcome to S.P.A.R.K.!\n\n` +
      `I'm your DeFi assistant on LINE! Here's what I can help with:\n\n` +
      `💼 Check balance & transactions\n` +
      `🔥 Get latest deals\n` +
      `🎯 Earn rewards\n` +
      `💰 Send payments\n\n` +
      `Try these commands:\n` +
      `• "balance" - Check your balance\n` +
      `• "deals" - See latest offers\n` +
      `• "rewards" - View your rewards\n` +
      `• "help" - Show this message`;

    await this.sendTextMessage(userId, message);
  }

  private async sendBalanceInfo(userId: string): Promise<void> {
    // In real implementation, fetch from blockchain
    const message = `💰 Your Balance\n\n` +
      `USDT: 125.50\n` +
      `ChaiCoins: 45.75\n` +
      `KAIA: 2.34\n\n` +
      `Recent transactions available in the app.`;

    await this.sendTextMessage(userId, message);
  }

  private async sendLatestDeals(userId: string): Promise<void> {
    const message = `🔥 Latest Deals\n\n` +
      `🏪 Coffee Shop - 50% OFF all drinks\n` +
      `   Expires: Today\n\n` +
      `🏪 Restaurant - Buy 1 Get 1 Free\n` +
      `   Expires: 2 days\n\n` +
      `🏪 Retail Store - 30% OFF everything\n` +
      `   Expires: 1 week\n\n` +
      `View all deals in the S.P.A.R.K. app!`;

    await this.sendTextMessage(userId, message);
  }

  private async sendRewardsInfo(userId: string): Promise<void> {
    const message = `🎯 Your Rewards\n\n` +
      `Total ChaiCoins: 45.75\n` +
      `This month: +12.50\n` +
      `Rewards Level: Silver\n\n` +
      `💎 Next milestone: 50 ChaiCoins\n` +
      `🎁 Unlocks: Premium deals & lower fees\n\n` +
      `Earn more by making payments and sharing deals!`;

    await this.sendTextMessage(userId, message);
  }

  private async sendHelpMessage(userId: string): Promise<void> {
    const message = `🆘 S.P.A.R.K. Help\n\n` +
      `Available commands:\n\n` +
      `💼 BALANCE - Check your crypto balance\n` +
      `🔥 DEALS - Discover latest offers\n` +
      `🎯 REWARDS - View earned rewards\n` +
      `💰 SEND - Send payment (in app)\n` +
      `📊 STATS - Your spending analytics\n\n` +
      `Need more help? Visit our support page.`;

    await this.sendTextMessage(userId, message);
  }

  // Get user profile from LINE
  async getUserProfile(userId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.line.me/v2/bot/profile/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.channelAccessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Broadcast message to multiple users (for announcements)
  async broadcastMessage(message: string, userIds: string[]): Promise<boolean> {
    try {
      // LINE has limits on broadcast messages
      // You might need to implement chunking for large user bases
      for (const userId of userIds) {
        await this.sendTextMessage(userId, message);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return true;
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      return false;
    }
  }
}