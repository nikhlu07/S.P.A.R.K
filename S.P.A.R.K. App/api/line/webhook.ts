// Force Node.js runtime explicitly to avoid Edge runtime mismatches
export const config = { memory: 1024 };


// Vercel-style serverless function for LINE Messaging API webhook
// Handles webhook events with a self-contained service implementation
// Safe JSON responder to support both Vercel res.status().json() and Node http
function sendJson(res: any, status: number, data: any) {
  try {
    if (typeof res?.status === 'function' && typeof res?.json === 'function') {
      return res.status(status).json(data);
    }
    if (typeof res?.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res?.writeHead === 'function') {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }
    return res?.end ? res.end(JSON.stringify(data)) : undefined;
  } catch (e) {
    try {
      return res?.end ? res.end(JSON.stringify({ error: 'Failed to send response', detail: String(e) })) : undefined;
    } catch { /* ignore */ }
  }
}

class SimpleLineWebhookService {
  private baseURL = 'https://api.line.me/v2/bot';

  private getEnv(key: string): string | undefined {
    try {
      return typeof process !== 'undefined' ? (process.env?.[key] as string | undefined) : undefined;
    } catch {
      return undefined;
    }
  }

  verifySignature(signature: string, body: string, channelSecret: string): boolean {
    // TODO: implement real HMAC-SHA256 validation
    return true;
  }

  async handleWebhookEvent(event: any, requestId: string): Promise<void> {
    console.log(`[LINE_WEBHOOK][${requestId}] event:`, {
      type: event?.type,
      messageType: event?.message?.type,
      hasUserId: !!event?.source?.userId
    });

    if (event?.type === 'message' && event.message?.type === 'text') {
      const userId = event.source?.userId;
      const messageText = String(event.message?.text ?? '');
      if (userId) {
        const truncated = messageText.length > 120 ? `${messageText.slice(0, 120)}…` : messageText;
        console.log(`[LINE_WEBHOOK][${requestId}] sending echo to user`, { userId: `${userId.slice(0,5)}***`, textLen: messageText.length, preview: truncated });
        await this.sendTextMessage(userId, `Echo: ${messageText}`, requestId);
      }
    }
  }

  async sendTextMessage(userId: string, text: string, requestId: string): Promise<boolean> {
    try {
      const channelAccessToken = this.getEnv('LINE_CHANNEL_ACCESS_TOKEN') ?? '';
      if (!channelAccessToken) {
        console.warn(`[LINE_WEBHOOK][${requestId}] missing LINE_CHANNEL_ACCESS_TOKEN; skip push message`);
        return false;
      }

      const response = await fetch(`${this.baseURL}/message/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // do not log token
          'Authorization': `Bearer ${channelAccessToken}`
        },
        body: JSON.stringify({
          to: userId,
          messages: [{ type: 'text', text }]
        })
      });

      console.log(`[LINE_WEBHOOK][${requestId}] push response`, { ok: response.ok, status: response.status, statusText: response.statusText });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[LINE_WEBHOOK][${requestId}] push response body`, errText?.slice(0, 300));
      }
      return response.ok;
    } catch (error) {
      console.error(`[LINE_WEBHOOK][${requestId}] Failed to send LINE message:`, error);
      return false;
    }
  }
}

const service = new SimpleLineWebhookService();

export default async function handler(req: any, res: any) {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const hasProcess = typeof process !== 'undefined';
  try {
    const method = req?.method;
    const headerKeys = Object.keys(req?.headers || {});
    const url = (() => { try { return req?.url; } catch { return undefined; } })();
    const query = (() => { try { return req?.query; } catch { return undefined; } })();
    console.log(`[LINE_WEBHOOK][${requestId}] request start`, { method, headerKeys, url, query });

    if (method === 'GET') {
      const hasAccessToken = hasProcess ? !!process.env?.LINE_CHANNEL_ACCESS_TOKEN : false;
      const hasChannelSecret = hasProcess ? !!process.env?.LINE_CHANNEL_SECRET : false;
      const vercelRegion = hasProcess ? process.env?.VERCEL_REGION : undefined;
      console.log(`[LINE_WEBHOOK][${requestId}] health check`, { hasAccessToken, hasChannelSecret, vercelRegion });
      return sendJson(res, 200, {
        status: 'LINE webhook is running',
        requestId,
        timestamp: new Date().toISOString(),
        environment: {
          runtime: hasProcess ? 'node' : 'edge_like',
          hasAccessToken,
          hasChannelSecret,
          vercelRegion
        }
      });
    }

    if (method !== 'POST') {
      console.warn(`[LINE_WEBHOOK][${requestId}] method not allowed`, { method });
      return sendJson(res, 405, { error: 'Method Not Allowed', requestId });
    }

    console.log(`[LINE_WEBHOOK][${requestId}] webhook received`);

    const signature = (req?.headers?.['x-line-signature'] as string) || '';
    console.log(`[LINE_WEBHOOK][${requestId}] signature presence`, { hasSignature: !!signature });

    let rawBody = req?.body;
    let bodyObj: any;
    try {
      const isString = typeof rawBody === 'string';
      const size = isString ? rawBody.length : (rawBody ? JSON.stringify(rawBody).length : 0);
      console.log(`[LINE_WEBHOOK][${requestId}] body summary`, { isString, size });
      bodyObj = isString ? JSON.parse(rawBody as string) : rawBody;
    } catch (parseError) {
      const preview = typeof rawBody === 'string' ? rawBody.slice(0, 500) : '[non-string body]';
      console.error(`[LINE_WEBHOOK][${requestId}] failed to parse JSON body`, parseError, { preview });
      return sendJson(res, 400, { error: 'Invalid JSON body', requestId });
    }

    const channelSecret = (hasProcess ? process.env?.LINE_CHANNEL_SECRET : undefined) || '';
    const verified = service.verifySignature(signature, JSON.stringify(bodyObj || {}), channelSecret);
    if (!verified) {
      console.warn(`[LINE_WEBHOOK][${requestId}] invalid signature`);
      return sendJson(res, 401, { error: 'Invalid signature', requestId });
    }

    const events = Array.isArray(bodyObj?.events) ? bodyObj.events : [];
    console.log(`[LINE_WEBHOOK][${requestId}] processing events`, { count: events.length });

    for (const event of events) {
      await service.handleWebhookEvent(event, requestId);
    }

    console.log(`[LINE_WEBHOOK][${requestId}] success`);
    return sendJson(res, 200, { message: 'OK', processed: events.length, requestId });
  } catch (error) {
    console.error(`[LINE_WEBHOOK][${requestId}] unhandled error`, error);
    return sendJson(res, 500, {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });
  }
}
