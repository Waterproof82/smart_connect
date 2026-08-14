/**
 * Decides whether a route is in scope for GA4 / analytics consent at all.
 *
 * `/admin`, `/panel`, `/login` are internal, auth-gated tooling — not public
 * visitor traffic — so they're excluded from analytics entirely rather than
 * gated behind the consent banner (design.md A2).
 *
 * `index.html`'s inline consent script mirrors this exact regex (plain HTML
 * can't import a TS module) to set `window.__scAnalyticsScope` before React
 * ever mounts — see `indexHtml.consentMode.structure.test.ts`, which
 * cross-checks the mirrored regex string against this one and against
 * `vercel.json`'s rewrite prefixes. If you change this regex, update both.
 */
const EXCLUDED_PATH_PREFIXES = /^\/(admin|panel|login)(\/|$)/;

export function isPublicAnalyticsPath(pathname: string): boolean {
  return !EXCLUDED_PATH_PREFIXES.test(pathname);
}
