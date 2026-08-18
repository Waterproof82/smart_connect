/**
 * Module accent transport (design.md D1). `accentStyle()` sets a single CSS
 * custom property, `--tpv-accent`, to an *indirection* onto one of the 13
 * `--color-icon-*` tokens defined in `src/index.css` (`:root` AND `.light`).
 * Descendants read `var(--tpv-accent)` so the accent re-resolves whenever
 * the `.light`/dark theme class toggles — zero JS, zero `matchMedia`, zero
 * `localStorage`. This keeps `getInitialTheme()` and SSR output unchanged
 * (Theme SSR Safety standard).
 */
import type { CSSProperties } from "react";

/** The 13 accent tokens defined in src/index.css (:root AND .light). */
export type AccentToken =
  | "--color-icon-coral"
  | "--color-icon-orange"
  | "--color-icon-amber"
  | "--color-icon-lime"
  | "--color-icon-green"
  | "--color-icon-jade"
  | "--color-icon-emerald"
  | "--color-icon-cyan"
  | "--color-icon-blue"
  | "--color-icon-indigo"
  | "--color-icon-purple"
  | "--color-icon-magenta"
  | "--color-icon-rose";

/** Tailwind-scannable literal form stored in `TpvModuleConfig.iconColor`. */
export type AccentClass = `text-[var(${AccentToken})]`;

/** Type-level inverse of AccentClass (no runtime parsing needed in app code). */
export type AccentTokenOf<C extends AccentClass> =
  C extends `text-[var(${infer T extends AccentToken})]` ? T : never;

/**
 * Sole `as` cast in the feature — TS's `CSSProperties` has no custom-prop
 * index signature. `--tpv-accent` is set to `var(${token})`, not a literal
 * colour, so the cascade (not this function) resolves the actual colour at
 * computed-value time, per theme.
 */
export const accentStyle = (token: AccentToken): CSSProperties =>
  ({ "--tpv-accent": `var(${token})` }) as CSSProperties;
