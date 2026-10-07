import React from "react";
import { linkify } from "../utils/linkify";

interface LinkifiedTextProps {
  text: string;
}

/**
 * Renders chat message content with any `https:` URL turned into a real,
 * accessible `<a>` element — safely: no `dangerouslySetInnerHTML`, no
 * markdown parser. Every segment is a plain React child, so React escapes
 * it as usual; only the splitting into text/link segments is custom (see
 * `../utils/linkify.ts`).
 */
export const LinkifiedText: React.FC<LinkifiedTextProps> = ({ text }) => {
  const segments = linkify(text);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "link" ? (
          <a
            key={index}
            href={segment.href}
            className="underline underline-offset-2 decoration-current hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
            {...(segment.sameSite
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" })}
          >
            {segment.href}
          </a>
        ) : (
          <React.Fragment key={index}>{segment.value}</React.Fragment>
        ),
      )}
    </>
  );
};

export default LinkifiedText;
