import React from "react";

interface SectionProps {
  id?: string;
  /** Visible heading. Omit for headless sections (then pass `label`). */
  title?: React.ReactNode;
  /** Heading level — defaults to h2. */
  as?: "h2" | "h3";
  intro?: React.ReactNode;
  /** aria-label for sections without a visible title. */
  label?: string;
  tone?: "base" | "alt";
  width?: "wide" | "prose";
  align?: "start" | "center";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Shared section rhythm (design.md § Spacing): one vertical padding token,
 * one container width pair, one stacked heading pattern for every page.
 */
export const Section: React.FC<SectionProps> = ({
  id,
  title,
  as: Heading = "h2",
  intro,
  label,
  tone = "base",
  width = "wide",
  align = "start",
  className = "",
  children,
}) => {
  const autoId = React.useId();
  const headingId = title ? `${id ?? autoId.replaceAll(":", "")}-title` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : label}
      className={[
        "ds-section",
        tone === "alt" ? "ds-section--alt" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={`ds-container ${width === "prose" ? "ds-container--prose" : ""}`}
      >
        {title && (
          <div
            className={`ds-section-head ${align === "center" ? "ds-section-head--center" : ""}`}
          >
            <Heading id={headingId} className="ds-h2">
              {title}
            </Heading>
            {intro && <p className="ds-lede">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
