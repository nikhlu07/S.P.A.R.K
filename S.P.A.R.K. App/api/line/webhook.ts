// Vercel-style serverless function for LINE Messaging API webhook
// Handles webhook events and uses existing LineWebhookService logic
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple webhook service implementation for Vercel
class SimpleLineWebhookService {
  // Remove eager env read to avoid crashing in non-Node runtimes
  private baseURL = 'https://api.line.me/v2/bot';

  // Safe env accessor that works even if process is undefined (e.g., edge runtimes)
  private getEnv(key: string): string | undefined {
    try {
      // typeof process is safe even if process is not defined
      return typeof process !== 'undefined' ? (process.env?.[key] as string | undefined) : undefined;
    } catch {
      return undefined;
    }
  }

  // Verify LINE signature for webhook security
  verifySignature(signature: string, body: string, channelSecret: string): boolean {
    // In production, you would use crypto to verify the signature
    // For demo purposes, we'll return true
    return true;
  }

  // Handle webhook event
  async handleWebhookEvent(event: any): Promise<void> {
    console.log('Processing LINE webhook event:', event?.type);
    
    if (event?.type === 'message' && event.message?.type === 'text') {
      const userId = event.source?.userId;
      const messageText = event.message?.text ?? '';
      if (userId) {
        // Simple echo response
        await this.sendTextMessage(userId, `Echo: ${messageText}`);
      }
    }
  }

  // Send text message to LINE user
  async sendTextMessage(userId: string, text: string): Promise<boolean> {
    try {
      const channelAccessToken = this.getEnv('LINE_CHANNEL_ACCESS_TOKEN') ?? '';
      if (!channelAccessToken) {
        console.log('No LINE_CHANNEL_ACCESS_TOKEN found, skipping message send');
        return false;
      }

      const response = await fetch(`${this.baseURL}/message/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${channelAccessToken}`
        },
        body: JSON.stringify({
          to: userId,
          messages: [{
            type: 'text',
            text: text
          }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send LINE message:', error);
      return false;
    }
  }
}

const service = new SimpleLineWebhookService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Basic health check (useful for verifying deployment)
    if (req.method === 'GET') {
      const hasProcess = typeof process !== 'undefined';
      const hasAccessToken = hasProcess ? !!process.env?.LINE_CHANNEL_ACCESS_TOKEN : false;
      const hasChannelSecret = hasProcess ? !!process.env?.LINE_CHANNEL_SECRET : false;
      return res.status(200).json({ 
        status: 'LINE webhook is running',
        timestamp: new Date().toISOString(),
        environment: {
          runtime: hasProcess ? 'node' : 'edge_like',
          hasAccessToken,
          hasChannelSecret
        }
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log('Webhook received:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    const signature = (req.headers['x-line-signature'] as string) || '';

    // Handle both string and object body formats
    let bodyObj: any;
    try {
      bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const channelSecret = (typeof process !== 'undefined' ? process.env?.LINE_CHANNEL_SECRET : undefined) || '';

    // NOTE: Our verifySignature currently returns true (demo), but we keep the call for future hardening
    const verified = service.verifySignature(signature, JSON.stringify(bodyObj || {}), channelSecret);
    if (!verified) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process events from the request body
    const events = bodyObj?.events || [];
    console.log(`Processing ${events.length} events`);
    
    for (const event of events) {
      await service.handleWebhookEvent(event);
    }

    return res.status(200).json({ message: 'OK', processed: events.length });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}