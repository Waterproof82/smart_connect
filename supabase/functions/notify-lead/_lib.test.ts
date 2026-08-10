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
  buildSubject,
  escapeHtml,
  isOriginAllowed,
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
});
