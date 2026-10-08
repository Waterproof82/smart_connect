// ========================================
// SUPABASE EDGE FUNCTION - notify-lead
// ========================================
// Single lead entry point (sdd/notify-lead-antibot). Receives a lead
// payload, resolves routing SERVER-SIDE from `app_settings` using the
// service role (`contact_email`, `n8n_enabled`, `n8n_webhook_url` — none
// of which the browser can read anymore), forwards to n8n when enabled,
// and ALWAYS falls back to Brevo on any n8n failure so a lead is never
// lost. The browser never sees the n8n webhook URL.
//
// See design sdd/notify-lead-antibot/design for the full contract.
// @ts-nocheck - Deno runtime types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import {
  buildBrevoPayload,
  buildN8nPayload,
  isOriginAllowed,
  N8N_FORWARD_TIMEOUT_MS,
  resolveLeadRouting,
  validateLeadPayload,
} from './_lib.ts';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = isOriginAllowed(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? (origin as string) : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    ...SECURITY_HEADERS,
  };
}

// In-memory rate limiter (per-isolate, best-effort defence in depth — the
// client-side `rateLimiter` in Contact.tsx is the primary control).
// Pattern reused from gemini-generate/index.ts.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3;
const CLEANUP_INTERVAL_MS = 60000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function cleanupRateLimitMap(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) rateLimitMap.delete(key);
  }
  if (rateLimitMap.size > 1000) {
    Array.from(rateLimitMap.keys())
      .slice(0, 500)
      .forEach((k) => rateLimitMap.delete(k));
  }
}

function checkRateLimit(key: string): boolean {
  cleanupRateLimitMap();
  const now = Date.now();
  let entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(key, entry);
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function firstIpFromForwardedFor(header: string | null): string {
  if (!header) return 'unknown';
  return header.split(',')[0]?.trim() || 'unknown';
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Deviation from chat-with-rag/gemini-generate (documented in design ADR-4,
  // intentional): this function has a SIDE EFFECT (it sends mail). CORS
  // headers alone do nothing against a direct `curl` call, so a disallowed
  // or absent Origin is rejected with an explicit 403 BEFORE any work.
  if (!isOriginAllowed(origin)) {
    console.warn('SECURITY: notify-lead — forbidden origin', origin);
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lead = validateLeadPayload(body);
    if (!lead) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientIp = firstIpFromForwardedFor(req.headers.get('x-forwarded-for'));
    // Log hygiene (D6): the rate-limit key still needs to be per client+email
    // to be effective, but it MUST NOT be logged verbatim (name/email is PII).
    const rateLimitKey = `${clientIp}|${lead.email}`;
    if (!checkRateLimit(rateLimitKey)) {
      console.warn('SECURITY: notify-lead — rate limit exceeded');
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', retryAfter: 600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey || !brevoApiKey) {
      console.error('SECURITY: notify-lead — missing server configuration (Supabase/Brevo env)');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service role on purpose (D2): `anon` no longer holds SELECT on the
    // delivery-secret columns (`n8n_enabled`, `n8n_webhook_url`), so this is
    // the only role that can resolve routing. The query is a fixed
    // single-row read with zero user input.
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: settingsRow, error: settingsError } = await supabase
      .from('app_settings')
      .select('contact_email,n8n_enabled,n8n_webhook_url')
      .eq('id', 'global')
      .single();

    if (settingsError) {
      console.error('notify-lead: settings lookup failed', settingsError.message);
      return new Response(JSON.stringify({ error: 'Notification recipient not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { contactEmail, n8nUrl } = resolveLeadRouting(settingsRow);

    if (n8nUrl) {
      const forwarded = await forwardToN8n(n8nUrl, lead);
      if (forwarded.ok) {
        console.log('notify-lead: delivered channel=n8n');
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.warn(`notify-lead: n8n_fallback reason=${forwarded.reason}`);
      // Falls through to Brevo below — "never lose a lead" (D3).
    }

    if (typeof contactEmail !== 'string' || contactEmail.trim() === '') {
      console.error('notify-lead: recipient not configured');
      return new Response(JSON.stringify({ error: 'Notification recipient not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const brevoPayload = buildBrevoPayload(lead, contactEmail);

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!brevoResponse.ok) {
      const errorBody = await brevoResponse.text().catch(() => '');
      // Brevo's error body is logged server-side only — NEVER echoed to the client.
      console.error('notify-lead: Brevo API error', brevoResponse.status, errorBody);
      return new Response(JSON.stringify({ error: 'Notification provider error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('notify-lead: delivered channel=brevo');
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('notify-lead: unexpected error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

type ForwardResult = { ok: true } | { ok: false; reason: string };

/**
 * Forwards the lead to n8n server-side, with a hard timeout (D3). ANY
 * failure (network error, timeout, non-2xx) is reported as a tagged
 * `ForwardResult` so the caller can fall back to Brevo — this function
 * never throws.
 */
async function forwardToN8n(n8nUrl: string, lead: Parameters<typeof buildN8nPayload>[0]): Promise<ForwardResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), N8N_FORWARD_TIMEOUT_MS);

  try {
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(buildN8nPayload(lead)),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, reason: `http_${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timeoutId);
  }
}
