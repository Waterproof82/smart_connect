/**
 * linkify Tests (U3 scope addition — safe URL linkification)
 *
 * `ChatMessages.tsx` used to render bot message content as a plain React
 * child, so URLs the model emits (contact CTA, legal pages) were not
 * clickable. `linkify` splits message text into text/link segments so the
 * presentation layer can render URLs as real `<a>` elements — NO
 * `dangerouslySetInnerHTML`, no markdown parser dependency.
 *
 * Rules:
 * - Only `https:` URLs become links (never `javascript:`, `data:`, `http:`).
 * - Trailing punctuation (`.,;:)!?`) is stripped from the matched URL.
 * - `digitalizatenerife.es` (or a subdomain of it) is flagged `sameSite:
 *   true`; everything else is `sameSite: false` (caller opens external links
 *   in a new tab).
 */

import { linkify } from './linkify';

describe('linkify', () => {
  it('returns a single text segment when there is no URL', () => {
    expect(linkify('Hola, ¿en qué puedo ayudarte?')).toEqual([
      { type: 'text', value: 'Hola, ¿en qué puedo ayudarte?' },
    ]);
  });

  it('splits text around a same-site https URL and flags it sameSite', () => {
    const result = linkify(
      'Escríbenos en https://digitalizatenerife.es/#contacto y te ayudamos.',
    );
    expect(result).toEqual([
      { type: 'text', value: 'Escríbenos en ' },
      { type: 'link', href: 'https://digitalizatenerife.es/#contacto', sameSite: true },
      { type: 'text', value: ' y te ayudamos.' },
    ]);
  });

  it('flags an external https URL as NOT sameSite', () => {
    const result = linkify('Más info: https://example.com/page.');
    expect(result).toEqual([
      { type: 'text', value: 'Más info: ' },
      { type: 'link', href: 'https://example.com/page', sameSite: false },
      { type: 'text', value: '.' },
    ]);
  });

  it('strips trailing punctuation from the matched URL', () => {
    const result = linkify(
      'Visita (https://digitalizatenerife.es/legal/privacidad).',
    );
    expect(result).toEqual([
      { type: 'text', value: 'Visita (' },
      { type: 'link', href: 'https://digitalizatenerife.es/legal/privacidad', sameSite: true },
      { type: 'text', value: ').' },
    ]);
  });

  it('never links a bare http:// URL', () => {
    expect(linkify('Visita http://digitalizatenerife.es ahora')).toEqual([
      { type: 'text', value: 'Visita http://digitalizatenerife.es ahora' },
    ]);
  });

  it('never links javascript: or data: pseudo-schemes', () => {
    expect(linkify('javascript:alert(1) y data:text/html,x')).toEqual([
      { type: 'text', value: 'javascript:alert(1) y data:text/html,x' },
    ]);
  });

  it('handles multiple URLs in the same message', () => {
    const result = linkify(
      'Privacidad: https://digitalizatenerife.es/legal/privacidad. Cookies: https://digitalizatenerife.es/legal/cookies.',
    );
    expect(result.filter((s) => s.type === 'link')).toHaveLength(2);
    expect(result).toEqual([
      { type: 'text', value: 'Privacidad: ' },
      { type: 'link', href: 'https://digitalizatenerife.es/legal/privacidad', sameSite: true },
      { type: 'text', value: '. Cookies: ' },
      { type: 'link', href: 'https://digitalizatenerife.es/legal/cookies', sameSite: true },
      { type: 'text', value: '.' },
    ]);
  });

  it('treats a subdomain of digitalizatenerife.es as sameSite too', () => {
    const result = linkify('https://app.digitalizatenerife.es/dashboard');
    expect(result).toEqual([
      { type: 'link', href: 'https://app.digitalizatenerife.es/dashboard', sameSite: true },
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(linkify('')).toEqual([]);
  });
});
