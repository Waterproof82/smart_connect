/**
 * TpvModuleFigure — shared, presentational photo wrapper for TPV module
 * sections (design.md D6). Plain eager default export — this component and
 * its callers must never use React's deferred-loading / async-boundary
 * APIs. `renderToString()` throws on those, and `entry-server.tsx`/
 * `entry-client.tsx` must keep an identical tree on server and client
 * (Theme/SSR Safety standard).
 *
 * No accent prop by design (design.md D1): the component reads
 * `var(--tpv-accent, var(--color-primary))` from the cascade via the
 * `.tpv-accent-frame` utility (`src/index.css` `@layer components`). It
 * MUST be rendered inside an element that sets `--tpv-accent` (e.g. via
 * `accentStyle()` on the parent section) — the brand-blue fallback
 * degrades gracefully if not.
 *
 * Both CLS defences apply: an intrinsic width/height on the rendered image
 * AND a CSS aspect-ratio wrapper div (matches the precedent in
 * `CartaDigitalDemoSection.tsx` / `CartaDigitalSolucionSection.tsx`).
 */
import React from "react";

export interface TpvModuleFigureProps {
  /** Public path, always `/assets/tpv/{module-id}.webp`. */
  src: string;
  /** Specific, non-decorative alt from i18n (`t.{module}FigureAlt`). Never "". */
  alt: string;
  /** Intrinsic px width of the WebP (1400 for the standard 4:3 asset). */
  width: number;
  /** Intrinsic px height of the WebP (1050 for the standard 4:3 asset). */
  height: number;
  /** CSS aspect-ratio for the CLS wrapper. Default "4/3". */
  ratio?: "4/3" | "3/2" | "16/9";
  /** Layout-only escape hatch, e.g. "lg:order-2" for side alternation. */
  className?: string;
}

const TpvModuleFigure: React.FC<TpvModuleFigureProps> = ({
  src,
  alt,
  width,
  height,
  ratio = "4/3",
  className,
}) => (
  <figure className={`m-0 ${className ?? ""}`}>
    <div
      className="relative w-full overflow-hidden rounded-2xl tpv-accent-frame"
      style={{ aspectRatio: ratio }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    </div>
  </figure>
);

export default TpvModuleFigure;
