/**
 * Vercel Serverless Function - n8n Webhook Proxy
 * 
 * This proxies requests to n8n Railway to avoid CORS issues.
 * The browser calls this endpoint on the same domain (no CORS),
 * and this forwards the request to n8n.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const N8N_WEBHOOK_URL = 'https://n8n-production-12fbe.up.railway.app/webhook/hot-lead-intake';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Get response from n8n
    const data = await response.text();

    // Return with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Failed to forward request' });
  }
}
