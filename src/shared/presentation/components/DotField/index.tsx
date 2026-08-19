import React from "react";

export interface DotFieldProps {
  /** CSS mask value, applied to both `mask-image` and `-webkit-mask-image` */
  mask?: string;
  /** Dot diameter in pixels */
  dotSize?: number;
  /** Grid spacing (background-size) in pixels */
  spacing?: number;
  /** Dot color — any valid CSS color, typically a `var(--color-*)` token */
  color?: string;
  /** Positioning/geometry classes only — DotField applies no default positioning */
  className?: string;
}

const DEFAULT_MASK =
  "radial-gradient(circle at 50% 45%, black 62%, transparent 72%)";

/**
 * Static, SSR-safe radial-dot backdrop, masked to a caller-supplied shape.
 * Presentational only — no logic, no client-only APIs, no animation.
 */
export const DotField: React.FC<DotFieldProps> = ({
  mask = DEFAULT_MASK,
  dotSize = 1.4,
  spacing = 16,
  color = "var(--color-border)",
  className = "",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(${color} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};
