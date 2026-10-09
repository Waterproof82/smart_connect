/**
 * notify-lead/_lib Tests
 *
 * Pure helpers: escaping, payload validation, Brevo payload construction,
 * origin allowlist. Deno-free by design so ts-jest can load this module
 * directly (see _lib.ts header comment).
 */

import {
  ALLOWED_ORIGINS,
  buildBrevoPayload,
  buildEmailHtml,
  buildEmailText,
  buildN8nPayload,
  buildSubject,
  escapeHtml,
  evaluateBotSignals,
  isOriginAllowed,
  MIN_FILL_MS,
  resolveLeadRouting,
  validateLeadPayload,
  type LeadPayload,
} from './_lib';

describe('escapeHtml', () => {
  it('neutralizes <script> tags', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('neutralizes double quotes', () => {
    expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
  });

  it('neutralizes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('neutralizes ampersands without double-escaping other entities', () => {
    expect(escapeHtml('Tom & Jerry <b>')).toBe('Tom &amp; Jerry &lt;b&gt;');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Restaurante La Terraza')).toBe('Restaurante La Terraza');
  });
});

describe('validateLeadPayload', () => {
  const valid = {
    name: 'Ana Pérez',
    company: 'Bar El Puerto',
    email: 'ana@example.com',
    service: 'QRIBAR',
    message: 'Quiero más info',
  };

  it('accepts a well-formed payload and stamps submittedAt when absent', () => {
    const result = validateLeadPayload(valid);
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Ana Pérez');
    expect(typeof result?.submittedAt).toBe('string');
    expect(result?.submittedAt.length).toBeGreaterThan(0);
  });

  it('preserves a caller-supplied submittedAt string', () => {
    const result = validateLeadPayload({ ...valid, submittedAt: '2026-08-10T10:00:00.000Z' });
    expect(result?.submittedAt).toBe('2026-08-10T10:00:00.000Z');
  });

  it('rejects null/non-object bodies', () => {
    expect(validateLeadPayload(null)).toBeNull();
    expect(validateLeadPayload('string')).toBeNull();
    expect(validateLeadPayload(undefined)).toBeNull();
  });

  it('rejects missing required fields', () => {
    const { message: _drop, ...rest } = valid;
    expect(validateLeadPayload(rest)).toBeNull();
  });

  it('rejects fields exceeding their length caps', () => {
    expect(validateLeadPayload({ ...valid, name: 'a'.repeat(101) })).toBeNull();
    expect(validateLeadPayload({ ...valid, company: 'a'.repeat(101) })).toBeNull();
    expect(validateLeadPayload({ ...valid, email: `${'a'.repeat(250)}@x.com` })).toBeNull();
    expect(validateLeadPayload({ ...valid, service: 'a'.repeat(101) })).toBeNull();
    expect(validateLeadPayload({ ...valid, message: 'a'.repeat(2001) })).toBeNull();
  });

  it('rejects an empty string field', () => {
    expect(validateLeadPayload({ ...valid, name: '' })).toBeNull();
  });

  it('rejects malformed email addresses', () => {
    expect(validateLeadPayload({ ...valid, email: 'not-an-email' })).toBeNull();
    expect(validateLeadPayload({ ...valid, email: 'missing@domain' })).toBeNull();
    expect(validateLeadPayload({ ...valid, email: '@no-local.com' })).toBeNull();
  });

  it('rejects CR/LF injection in name', () => {
    expect(validateLeadPayload({ ...valid, name: 'Ana\r\nBcc: evil@x.com' })).toBeNull();
  });

  it('rejects CR/LF injection in service', () => {
    expect(validateLeadPayload({ ...valid, service: 'QRIBAR\nX-Injected: true' })).toBeNull();
  });

  it('rejects CR/LF injection in email (whitespace fails the email regex)', () => {
    expect(validateLeadPayload({ ...valid, email: 'ana@example.com\r\nBcc: evil@x.com' })).toBeNull();
  });

  it('rejects a non-string submittedAt', () => {
    expect(validateLeadPayload({ ...valid, submittedAt: 12345 })).toBeNull();
  });
});

describe('buildSubject', () => {
  const base: LeadPayload = {
    name: 'Ana Pérez',
    company: 'Bar El Puerto',
    email: 'ana@example.com',
    service: 'QRIBAR',
    message: 'hola',
    submittedAt: '2026-08-10T10:00:00.000Z',
  };

  it('builds the expected format', () => {
    expect(buildSubject(base)).toBe('Nuevo lead: Ana Pérez — QRIBAR');
  });

  it('strips CR/LF from name/service before building the subject', () => {
    const withCrlf: LeadPayload = { ...base, name: 'Ana\r\nBcc:evil@x.com' };
    expect(buildSubject(withCrlf)).not.toMatch(/[\r\n]/);
  });

  it('caps the subject at 120 characters', () => {
    const long: LeadPayload = { ...base, name: 'a'.repeat(200) };
    expect(buildSubject(long).length).toBeLessThanOrEqual(120);
  });
});

describe('buildEmailHtml', () => {
  const maliciousPayload: LeadPayload = {
    name: '<script>alert(1)</script>',
    company: '"><img src=x onerror=alert(2)>',
    email: 'ana@example.com',
    service: "QRIBAR' onmouseover='alert(3)",
    message: 'Line one\nLine two <b>bold</b>',
    submittedAt: '2026-08-10T10:00:00.000Z',
  };

  it('contains no raw "<" originating from lead input', () => {
    const html = buildEmailHtml(maliciousPayload);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>bold</b>');
  });

  it('escapes double and single quotes from lead fields', () => {
    const html = buildEmailHtml(maliciousPayload);
    expect(html).not.toContain('"><img');
    expect(html).not.toContain("onmouseover='alert(3)");
  });

  it('converts newlines in message to <br> AFTER escaping (nl2br ordering)', () => {
    const html = buildEmailHtml(maliciousPayload);
    expect(html).toContain('Line one<br>Line two');
  });

  it('includes the escaped values in the output', () => {
    const html = buildEmailHtml(maliciousPayload);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});

describe('buildEmailText', () => {
  const base: LeadPayload = {
    name: 'Ana Pérez',
    company: 'Bar El Puerto',
    email: 'ana@example.com',
    service: 'QRIBAR',
    message: 'Quiero más info',
    submittedAt: '2026-08-10T10:00:00.000Z',
  };

  it('includes every field in the plain-text alternative', () => {
    const text = buildEmailText(base);
    expect(text).toContain('Ana Pérez');
    expect(text).toContain('Bar El Puerto');
    expect(text).toContain('ana@example.com');
    expect(text).toContain('QRIBAR');
    expect(text).toContain('Quiero más info');
  });
});

describe('isOriginAllowed', () => {
  it('accepts every origin in the allowlist', () => {
    for (const origin of ALLOWED_ORIGINS) {
      expect(isOriginAllowed(origin)).toBe(true);
    }
  });

  it('rejects an unknown origin', () => {
    expect(isOriginAllowed('https://evil.example.com')).toBe(false);
  });

  it('rejects null/undefined origin', () => {
    expect(isOriginAllowed(null)).toBe(false);
    expect(isOriginAllowed(undefined)).toBe(false);
  });

  it('rejects an empty string origin', () => {
    expect(isOriginAllowed('')).toBe(false);
  });
});

describe('buildBrevoPayload', () => {
  const base: LeadPayload = {
    name: 'Ana Pérez',
    company: 'Bar El Puerto',
    email: 'ana@example.com',
    service: 'QRIBAR',
    message: 'Quiero más info',
    submittedAt: '2026-08-10T10:00:00.000Z',
  };

  it('uses the fixed verified sender, never a value derived from the payload', () => {
    const result = buildBrevoPayload(base, 'owner@digitalizatenerife.es');
    expect(result.sender).toEqual({ name: 'SmartConnect AI', email: 'info@digitalizatenerife.es' });
  });

  it('sends to the server-resolved recipient, not any field from the lead payload', () => {
    const result = buildBrevoPayload(base, 'owner@digitalizatenerife.es');
    expect(result.to).toEqual([{ email: 'owner@digitalizatenerife.es' }]);
  });

  it('sets replyTo to the lead email and name', () => {
    const result = buildBrevoPayload(base, 'owner@digitalizatenerife.es');
    expect(result.replyTo).toEqual({ email: 'ana@example.com', name: 'Ana Pérez' });
  });

  it('includes both htmlContent and textContent', () => {
    const result = buildBrevoPayload(base, 'owner@digitalizatenerife.es');
    expect(result.htmlContent.length).toBeGreaterThan(0);
    expect(result.textContent.length).toBeGreaterThan(0);
  });

  it('prefixes the subject with [Posible spam] when the lead is flagged as suspect', () => {
    const result = buildBrevoPayload(base, 'owner@digitalizatenerife.es', { suspect: true });
    expect(result.subject).toBe('[Posible spam] Nuevo lead: Ana Pérez — QRIBAR');
  });

  it('keeps the plain subject when the lead is not flagged', () => {
    const result = buildBrevoPayload(base, 'owner@digitalizatenerife.es', { suspect: false });
    expect(result.subject).toBe('Nuevo lead: Ana Pérez — QRIBAR');
  });
});

describe('resolveLeadRouting', () => {
  it('returns null n8nUrl when the settings row is null/non-object', () => {
    expect(resolveLeadRouting(null)).toEqual({ contactEmail: null, n8nUrl: null });
    expect(resolveLeadRouting(undefined)).toEqual({ contactEmail: null, n8nUrl: null });
    expect(resolveLeadRouting('string')).toEqual({ contactEmail: null, n8nUrl: null });
  });

  it('returns null n8nUrl when n8n_enabled is not strictly true', () => {
    expect(
      resolveLeadRouting({
        contact_email: 'owner@digitalizatenerife.es',
        n8n_enabled: false,
        n8n_webhook_url: 'https://n8n.example.com/webhook/abc',
      })
    ).toEqual({ contactEmail: 'owner@digitalizatenerife.es', n8nUrl: null });

    expect(
      resolveLeadRouting({
        contact_email: 'owner@digitalizatenerife.es',
        n8n_enabled: 'true', // truthy but not === true
        n8n_webhook_url: 'https://n8n.example.com/webhook/abc',
      })
    ).toEqual({ contactEmail: 'owner@digitalizatenerife.es', n8nUrl: null });
  });

  it('returns null n8nUrl when the webhook url is missing, empty, or malformed', () => {
    expect(
      resolveLeadRouting({ contact_email: 'a@b.com', n8n_enabled: true, n8n_webhook_url: null })
    ).toEqual({ contactEmail: 'a@b.com', n8nUrl: null });

    expect(
      resolveLeadRouting({ contact_email: 'a@b.com', n8n_enabled: true, n8n_webhook_url: '' })
    ).toEqual({ contactEmail: 'a@b.com', n8nUrl: null });

    expect(
      resolveLeadRouting({
        contact_email: 'a@b.com',
        n8n_enabled: true,
        n8n_webhook_url: 'not a url',
      })
    ).toEqual({ contactEmail: 'a@b.com', n8nUrl: null });
  });

  it('returns null n8nUrl for a non-https url, even if n8n_enabled is true', () => {
    expect(
      resolveLeadRouting({
        contact_email: 'a@b.com',
        n8n_enabled: true,
        n8n_webhook_url: 'http://n8n.example.com/webhook/abc',
      })
    ).toEqual({ contactEmail: 'a@b.com', n8nUrl: null });
  });

  it('returns the n8nUrl when enabled, https, and well-formed', () => {
    expect(
      resolveLeadRouting({
        contact_email: 'a@b.com',
        n8n_enabled: true,
        n8n_webhook_url: 'https://n8n.example.com/webhook/abc',
      })
    ).toEqual({ contactEmail: 'a@b.com', n8nUrl: 'https://n8n.example.com/webhook/abc' });
  });

  it('resolves contactEmail to null when missing or not a string', () => {
    expect(resolveLeadRouting({ n8n_enabled: false })).toEqual({ contactEmail: null, n8nUrl: null });
    expect(resolveLeadRouting({ contact_email: 123, n8n_enabled: false })).toEqual({
      contactEmail: null,
      n8nUrl: null,
    });
  });
});

describe('buildN8nPayload', () => {
  const base: LeadPayload = {
    name: 'Ana Pérez',
    company: 'Bar El Puerto',
    email: 'ana@example.com',
    service: 'QRIBAR',
    message: 'Quiero más info',
    submittedAt: '2026-08-10T10:00:00.000Z',
  };

  it('maps to the legacy Spanish keys expected by the n8n workflow', () => {
    expect(buildN8nPayload(base)).toEqual({
      nombre: 'Ana Pérez',
      empresa: 'Bar El Puerto',
      email: 'ana@example.com',
      servicio_interes: 'QRIBAR',
      mensaje_cuerpo: 'Quiero más info',
      timestamp: '2026-08-10T10:00:00.000Z',
    });
  });
});

describe('evaluateBotSignals', () => {
  const tolerant = { requireSignals: false };
  const strict = { requireSignals: true };

  describe('honeypot (website field)', () => {
    it('is NOT a bot when website is an empty string and elapsedMs clears the threshold', () => {
      expect(evaluateBotSignals({ website: '', elapsedMs: MIN_FILL_MS }, tolerant)).toEqual({
        isBot: false,
      });
    });

    // Hotfix 2026-10-09: Chrome autofill ignores autocomplete="off" and filled
    // the honeypot for a real human in production. A filled string honeypot
    // alone must never drop a lead — it is delivered flagged as suspect.
    it('flags as suspect (NOT a bot) when website is a non-empty string and elapsedMs clears the threshold', () => {
      expect(
        evaluateBotSignals({ website: 'https://bar-el-puerto.es', elapsedMs: MIN_FILL_MS }, tolerant)
      ).toEqual({ isBot: false, suspect: true });
    });

    it('flags as suspect when website is filled and elapsedMs is missing in tolerant mode', () => {
      expect(evaluateBotSignals({ website: 'https://bar-el-puerto.es' }, tolerant)).toEqual({
        isBot: false,
        suspect: true,
      });
    });

    it('still rejects a filled website with missing elapsedMs in strict mode', () => {
      expect(evaluateBotSignals({ website: 'https://bar-el-puerto.es' }, strict)).toEqual({
        isBot: true,
        reason: 'missing_signals',
      });
    });

    it('trims before checking — whitespace-only website is NOT honeypot-filled', () => {
      expect(evaluateBotSignals({ website: '   ', elapsedMs: MIN_FILL_MS }, tolerant)).toEqual({
        isBot: false,
      });
    });

    it('is a bot when website is present but not a string (wrong type, suspicious)', () => {
      expect(evaluateBotSignals({ website: 123, elapsedMs: MIN_FILL_MS }, tolerant)).toEqual({
        isBot: true,
        reason: 'honeypot',
      });
      expect(evaluateBotSignals({ website: true, elapsedMs: MIN_FILL_MS }, tolerant)).toEqual({
        isBot: true,
        reason: 'honeypot',
      });
      expect(evaluateBotSignals({ website: {}, elapsedMs: MIN_FILL_MS }, tolerant)).toEqual({
        isBot: true,
        reason: 'honeypot',
      });
    });

    it('honeypot takes priority over an also-too-fast elapsedMs', () => {
      expect(evaluateBotSignals({ website: 'filled', elapsedMs: 10 }, tolerant)).toEqual({
        isBot: true,
        reason: 'honeypot',
      });
    });

    it('a website key entirely absent is NOT treated as honeypot-filled (falls through to the elapsedMs check)', () => {
      expect(evaluateBotSignals({ elapsedMs: MIN_FILL_MS }, tolerant)).toEqual({ isBot: false });
    });
  });

  describe('elapsedMs (fill-time)', () => {
    it('rejects as too_fast when elapsedMs is below the default threshold', () => {
      expect(evaluateBotSignals({ website: '', elapsedMs: MIN_FILL_MS - 1 }, tolerant)).toEqual({
        isBot: true,
        reason: 'too_fast',
      });
    });

    it('rejects as too_fast when elapsedMs is negative', () => {
      expect(evaluateBotSignals({ website: '', elapsedMs: -50 }, tolerant)).toEqual({
        isBot: true,
        reason: 'too_fast',
      });
    });

    it('rejects as too_fast when elapsedMs is present but not a finite number (string)', () => {
      expect(evaluateBotSignals({ website: '', elapsedMs: 'soon' }, tolerant)).toEqual({
        isBot: true,
        reason: 'too_fast',
      });
    });

    it('rejects as too_fast when elapsedMs is present but not finite (Infinity/NaN)', () => {
      expect(evaluateBotSignals({ website: '', elapsedMs: Infinity }, tolerant)).toEqual({
        isBot: true,
        reason: 'too_fast',
      });
      expect(evaluateBotSignals({ website: '', elapsedMs: NaN }, tolerant)).toEqual({
        isBot: true,
        reason: 'too_fast',
      });
    });

    it('accepts elapsedMs exactly at the threshold', () => {
      expect(evaluateBotSignals({ website: '', elapsedMs: MIN_FILL_MS }, tolerant)).toEqual({
        isBot: false,
      });
    });

    it('respects a custom minFillMs override', () => {
      expect(evaluateBotSignals({ website: '', elapsedMs: 1500 }, { requireSignals: false, minFillMs: 1000 })).toEqual({
        isBot: false,
      });
      expect(evaluateBotSignals({ website: '', elapsedMs: 900 }, { requireSignals: false, minFillMs: 1000 })).toEqual({
        isBot: true,
        reason: 'too_fast',
      });
    });

    it('tolerant mode (default): missing elapsedMs ALLOWS the submission through (no reject)', () => {
      expect(evaluateBotSignals({ website: '' }, tolerant)).toEqual({ isBot: false });
    });

    it('strict mode: missing elapsedMs rejects as missing_signals', () => {
      expect(evaluateBotSignals({ website: '' }, strict)).toEqual({
        isBot: true,
        reason: 'missing_signals',
      });
    });
  });

  describe('malformed body', () => {
    it('treats a null/non-object body as having no signals (tolerant mode allows it)', () => {
      expect(evaluateBotSignals(null, tolerant)).toEqual({ isBot: false });
      expect(evaluateBotSignals(undefined, tolerant)).toEqual({ isBot: false });
      expect(evaluateBotSignals('oops', tolerant)).toEqual({ isBot: false });
    });

    it('treats a null/non-object body as missing signals in strict mode', () => {
      expect(evaluateBotSignals(null, strict)).toEqual({ isBot: true, reason: 'missing_signals' });
    });
  });
});
