// Vercel-style serverless function for LINE Messaging API webhook
// Handles webhook events and uses existing LineWebhookService logic
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { LineWebhookService } from '../../src/services/lineWebhookService.ts';

const service = LineWebhookService.getInstance();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic health check (useful for verifying deployment)
  if (req.method === 'GET') {
    return res.status(200).send('LINE webhook is running');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const signature = (req.headers['x-line-signature'] as string) || '';
    const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

    // NOTE: Our verifySignature currently returns true (demo), but we keep the call for future hardening
    const bodyObj: any = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const verified = service.verifySignature(signature, JSON.stringify(bodyObj || {}), channelSecret);
    if (!verified) {
      return res.status(401).json({ ok: false, error: 'Invalid signature' });
    }

    if (bodyObj && Array.isArray(bodyObj.events)) {
      for (const event of bodyObj.events) {
        await service.handleWebhookEvent(event);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}