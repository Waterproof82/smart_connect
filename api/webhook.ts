/**
 * Vercel Serverless Function - n8n Webhook Proxy
 * 
 * This proxies requests to n8n Railway to avoid CORS issues.
 * The browser calls this endpoint on the same domain (no CORS),
 * and this forwards the request to n8n.
 */

export const config = {
  runtime: 'edge',
};

const N8N_WEBHOOK_URL = 'https://n8n-production-12fbe.up.railway.app/webhook/hot-lead-intake';

export default async function handler(request: Request) {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get the body from the incoming request
    const body = await request.json();

    // Forward to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get response from n8n
    const data = await response.text();

    // Return with CORS headers
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to forward request' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
