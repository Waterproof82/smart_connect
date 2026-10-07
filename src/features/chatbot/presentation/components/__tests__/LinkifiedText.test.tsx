/**
 * LinkifiedText — component tests (U3 scope addition).
 *
 * Behavioral test (jsdom render via Testing Library), routed to Vitest by
 * `vite.config.ts`'s `src/features/**\/*.test.tsx` include entry — this
 * repo's Jest config has no `jest-environment-jsdom` wired for `.tsx`
 * component rendering (see `ExpertAssistantWithRAG.structure.test.ts`'s
 * header comment for the same rationale). The pure splitting logic itself
 * (`linkify.ts`) is unit-tested under Jest via strict TDD.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LinkifiedText from "../LinkifiedText";

describe("LinkifiedText", () => {
  it("renders a same-site https URL as a link, without target=_blank", () => {
    render(
      <LinkifiedText text="Escríbenos en https://digitalizatenerife.es/#contacto y te ayudamos." />,
    );
    const link = screen.getByRole("link", {
      name: "https://digitalizatenerife.es/#contacto",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://digitalizatenerife.es/#contacto",
    );
    expect(link).not.toHaveAttribute("target");
  });

  it("renders an external https URL with target=_blank and rel=noopener noreferrer", () => {
    render(<LinkifiedText text="Más info: https://example.com/page." />);
    const link = screen.getByRole("link", { name: "https://example.com/page" });
    expect(link).toHaveAttribute("href", "https://example.com/page");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("strips trailing punctuation from the rendered link", () => {
    render(
      <LinkifiedText text="Visita (https://digitalizatenerife.es/legal/privacidad)." />,
    );
    const link = screen.getByRole("link", {
      name: "https://digitalizatenerife.es/legal/privacidad",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://digitalizatenerife.es/legal/privacidad",
    );
  });

  it("does not render a link for non-https schemes", () => {
    render(<LinkifiedText text="javascript:alert(1) y data:text/html,x" />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("renders surrounding plain text unchanged", () => {
    render(
      <LinkifiedText text="Antes https://digitalizatenerife.es/#contacto despues" />,
    );
    expect(screen.getByText(/Antes/)).toBeInTheDocument();
    expect(screen.getByText(/despues/)).toBeInTheDocument();
  });

  it("renders plain text with no links as-is", () => {
    render(<LinkifiedText text="Hola, ¿en qué puedo ayudarte?" />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("Hola, ¿en qué puedo ayudarte?")).toBeInTheDocument();
  });
});
