/**
 * linkify — splits chatbot message text into text/link segments.
 *
 * `ChatMessages.tsx` renders message content as a plain React child (no
 * markdown parser, no `dangerouslySetInnerHTML`). This pure helper lets the
 * presentation layer render URLs as real `<a>` elements while keeping that
 * safety property: React escapes every segment value it renders, and this
 * module never touches the DOM or innerHTML.
 *
 * Rules:
 * - Only `https:` URLs are linkified — `http:`, `javascript:`, `data:` and
 *   any other scheme are left as plain text.
 * - Trailing punctuation (`. , ; : ) ! ?`) is stripped off the matched URL
 *   so "(https://example.com)." doesn't swallow the closing paren/period.
 * - `digitalizatenerife.es` and its subdomains are flagged `sameSite: true`
 *   (caller renders these without `target="_blank"`); everything else is
 *   `sameSite: false` (caller adds `target="_blank" rel="noopener noreferrer"`).
 */

export type LinkifySegment =
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'link'; readonly href: string; readonly sameSite: boolean };

const SAME_SITE_HOST = 'digitalizatenerife.es';
const HTTPS_URL_REGEX = /https:\/\/\S+/g;
const TRAILING_PUNCTUATION_REGEX = /[.,;:)!?]+$/;

function isSameSite(hostname: string): boolean {
  return hostname === SAME_SITE_HOST || hostname.endsWith(`.${SAME_SITE_HOST}`);
}

export function linkify(text: string): LinkifySegment[] {
  if (!text) return [];

  const segments: LinkifySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  HTTPS_URL_REGEX.lastIndex = 0;
  while ((match = HTTPS_URL_REGEX.exec(text)) !== null) {
    const rawMatch = match[0];
    const trailing = rawMatch.match(TRAILING_PUNCTUATION_REGEX)?.[0] ?? '';
    const href = trailing ? rawMatch.slice(0, -trailing.length) : rawMatch;
    const matchStart = match.index;

    if (!href) {
      // The entire match was punctuation (shouldn't happen given the regex
      // requires at least "https://"), skip defensively.
      continue;
    }

    let sameSite: boolean;
    try {
      sameSite = isSameSite(new URL(href).hostname);
    } catch {
      // Unparsable URL — leave the whole match as plain text.
      continue;
    }

    if (matchStart > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, matchStart) });
    }
    segments.push({ type: 'link', href, sameSite });
    // Advance past the URL only — the stripped trailing punctuation is left
    // in the source text, so it naturally reappears at the start of the
    // next text segment instead of being silently dropped.
    lastIndex = matchStart + href.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}
