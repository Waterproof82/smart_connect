// ========================================
// notify-lead — pure helpers (Deno-free)
// ========================================
// This module MUST NOT import anything and MUST NOT reference `Deno.*`.
// Keeping it import-free lets `ts-jest` load and unit-test it directly,
// even though the rest of this function runs on the Deno Edge runtime.

export interface LeadPayload {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly service: string;
  readonly message: string;
  readonly submittedAt: string;
}

export interface BrevoEmailPayload {
  readonly sender: { readonly name: string; readonly email: string };
  readonly to: ReadonlyArray<{ readonly email: string }>;
  readonly replyTo: { readonly email: string; readonly name: string };
  readonly subject: string;
  readonly htmlContent: string;
  readonly textContent: string;
}

/** Legacy Spanish-key shape expected by the external n8n workflow (D4 — contract unchanged). */
export interface N8nWebhookPayload {
  readonly nombre: string;
  readonly empresa: string;
  readonly email: string;
  readonly servicio_interes: string;
  readonly mensaje_cuerpo: string;
  readonly timestamp?: string;
}

/** Routing settings resolved from the `app_settings` service-role read. */
export interface LeadRouting {
  readonly contactEmail: string | null;
  readonly n8nUrl: string | null;
}

export const ALLOWED_ORIGINS = [
  'https://digitalizatenerife.es',
  'http://localhost:5173',
  'http://localhost:3000',
] as const;

const SENDER_NAME = 'SmartConnect AI';
const SENDER_EMAIL = 'info@digitalizatenerife.es';

/** Hard timeout for the server-side n8n forward (D3). */
export const N8N_FORWARD_TIMEOUT_MS = 5000;

const FIELD_LIMITS = {
  name: 100,
  company: 100,
  email: 255,
  service: 100,
  message: 2000,
} as const;

// Simple, deliberately conservative email shape check — mirrors client-side validation,
// not RFC 5322. Anything containing whitespace (including CR/LF) is rejected.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CRLF_REGEX = /[\r\n]/;

/**
 * Neutralizes the five HTML-significant characters. Order matters: `&` MUST
 * be replaced first, otherwise the entities produced by the other replacements
 * would themselves get re-escaped.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converts newlines to `<br>`. MUST run AFTER `escapeHtml` — escaping after
 * nl2br would encode the `<br>` tags themselves and break line breaks.
 */
function nl2br(escaped: string): string {
  return escaped.replace(/\n/g, '<br>');
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= maxLength;
}

/**
 * Validates and normalizes the raw request body into a `LeadPayload`.
 * Returns `null` on ANY validation failure — callers must respond with a
 * generic 400 `{ error: 'Invalid payload' }` (no field-level detail, no
 * enumeration oracle for attackers).
 */
export function validateLeadPayload(body: unknown): LeadPayload | null {
  if (!body || typeof body !== 'object') return null;
  const candidate = body as Record<string, unknown>;

  const { name, company, email, service, message, submittedAt } = candidate;

  if (!isNonEmptyString(name, FIELD_LIMITS.name)) return null;
  if (!isNonEmptyString(company, FIELD_LIMITS.company)) return null;
  if (!isNonEmptyString(email, FIELD_LIMITS.email)) return null;
  if (!isNonEmptyString(service, FIELD_LIMITS.service)) return null;
  if (!isNonEmptyString(message, FIELD_LIMITS.message)) return null;

  if (CRLF_REGEX.test(name)) return null;
  if (CRLF_REGEX.test(service)) return null;
  if (!EMAIL_REGEX.test(email)) return null;

  if (submittedAt !== undefined && typeof submittedAt !== 'string') return null;

  return {
    name,
    company,
    email,
    service,
    message,
    submittedAt: typeof submittedAt === 'string' ? submittedAt : new Date().toISOString(),
  };
}

/**
 * Builds the email subject line. CR/LF is stripped (header-injection
 * defense) and the result is capped at 120 chars.
 */
export function buildSubject(payload: LeadPayload): string {
  const raw = `Nuevo lead: ${payload.name} — ${payload.service}`.replace(/[\r\n]/g, ' ');
  return raw.length > 120 ? raw.slice(0, 120) : raw;
}

/**
 * Builds the HTML email body. Every interpolated lead-supplied field is
 * escaped before it touches the template — this is the injection boundary.
 */
export function buildEmailHtml(payload: LeadPayload): string {
  const name = escapeHtml(payload.name);
  const company = escapeHtml(payload.company);
  const email = escapeHtml(payload.email);
  const service = escapeHtml(payload.service);
  const message = nl2br(escapeHtml(payload.message));
  const submittedAt = escapeHtml(payload.submittedAt);

  return `<!DOCTYPE html>
<html lang="es">
  <body style="font-family: sans-serif; color: #111827;">
    <h2>Nuevo lead — SmartConnect AI</h2>
    <table cellpadding="4" cellspacing="0">
      <tr><td><strong>Nombre</strong></td><td>${name}</td></tr>
      <tr><td><strong>Empresa</strong></td><td>${company}</td></tr>
      <tr><td><strong>Email</strong></td><td>${email}</td></tr>
      <tr><td><strong>Servicio de interés</strong></td><td>${service}</td></tr>
      <tr><td><strong>Enviado</strong></td><td>${submittedAt}</td></tr>
    </table>
    <p><strong>Mensaje</strong></p>
    <p>${message}</p>
  </body>
</html>`;
}

/** Plain-text alternative, sent alongside the HTML body. No escaping needed — not HTML. */
export function buildEmailText(payload: LeadPayload): string {
  return [
    'Nuevo lead — SmartConnect AI',
    `Nombre: ${payload.name}`,
    `Empresa: ${payload.company}`,
    `Email: ${payload.email}`,
    `Servicio de interés: ${payload.service}`,
    `Enviado: ${payload.submittedAt}`,
    '',
    'Mensaje:',
    payload.message,
  ].join('\n');
}

/** Origin allowlist check, shared by the CORS header builder and the pre-work 403 gate. */
export function isOriginAllowed(origin: string | null | undefined): boolean {
  return typeof origin === 'string' && (ALLOWED_ORIGINS as readonly string[]).includes(origin);
}

/**
 * Assembles the exact body sent to Brevo's `/v3/smtp/email`. `recipientEmail`
 * MUST come from a server-side lookup (`app_settings.contact_email`) — NEVER
 * from the client payload.
 */
export function buildBrevoPayload(payload: LeadPayload, recipientEmail: string): BrevoEmailPayload {
  return {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: recipientEmail }],
    replyTo: { email: payload.email, name: payload.name },
    subject: buildSubject(payload),
    htmlContent: buildEmailHtml(payload),
    textContent: buildEmailText(payload),
  };
}

/**
 * Builds the body forwarded to the n8n workflow. Keeps the legacy Spanish
 * keys (D4) — the external workflow's contract is independent of this
 * refactor.
 */
export function buildN8nPayload(payload: LeadPayload): N8nWebhookPayload {
  return {
    nombre: payload.name,
    empresa: payload.company,
    email: payload.email,
    servicio_interes: payload.service,
    mensaje_cuerpo: payload.message,
    timestamp: payload.submittedAt,
  };
}

function isUsableHttpsUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string' || raw.trim() === '') return false;
  try {
    return new URL(raw).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Resolves routing from the `app_settings` row (service-role read). The
 * n8n URL is surfaced ONLY when `n8n_enabled === true` (strict boolean —
 * no truthy coercion) AND the URL is a well-formed `https:` URL. Any other
 * combination silently falls through to the Brevo fallback (D3).
 */
export function resolveLeadRouting(row: unknown): LeadRouting {
  if (!row || typeof row !== 'object') return { contactEmail: null, n8nUrl: null };
  const candidate = row as Record<string, unknown>;

  const contactEmail = typeof candidate.contact_email === 'string' ? candidate.contact_email : null;
  const n8nEnabled = candidate.n8n_enabled === true;
  const n8nUrl = n8nEnabled && isUsableHttpsUrl(candidate.n8n_webhook_url)
    ? (candidate.n8n_webhook_url as string)
    : null;

  return { contactEmail, n8nUrl };
}
