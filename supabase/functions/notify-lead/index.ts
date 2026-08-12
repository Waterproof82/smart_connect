// ========================================
// SUPABASE EDGE FUNCTION - notify-lead
// ========================================
// Email fallback channel for the contact form (used when `n8n_enabled` is
// false). Receives a lead payload, resolves the recipient SERVER-SIDE from
// `app_settings.contact_email`, and sends it via Brevo.
//
// See design ADR-4 (sdd/contact-form-n8n-toggle/design) for the full contract.
// @ts-nocheck - Deno runtime types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import {
  buildBrevoPayload,
  isOriginAllowed,
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
    const rateLimitKey = `${clientIp}|${lead.email}`;
    if (!checkRateLimit(rateLimitKey)) {
      console.warn('SECURITY: notify-lead — rate limit exceeded for', rateLimitKey);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', retryAfter: 600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !brevoApiKey) {
      console.error('SECURITY: notify-lead — missing server configuration (Supabase/Brevo env)');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ANON key on purpose — least privilege. `anon` already holds SELECT on
    // `app_settings`, the query is a fixed single-row read with zero user
    // input, and a public `verify_jwt=false` function has no business
    // holding a service-role credential (design ADR-4).
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: settingsRow, error: settingsError } = await supabase
      .from('app_settings')
      .select('contact_email')
      .eq('id', 'global')
      .single();

    const contactEmail = settingsRow?.contact_email;
    if (settingsError || typeof contactEmail !== 'string' || contactEmail.trim() === '') {
      console.error(
        'notify-lead: recipient not configured',
        settingsError?.message ?? 'empty contact_email'
      );
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
