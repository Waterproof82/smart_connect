/**
 * ExpertAssistantWithRAG.tsx — structure tests (U3 chokepoint wiring).
 *
 * `.tsx` files cannot be behaviorally rendered under this repo's Jest
 * config (no `jest-environment-jsdom`, and — separately — RTL isn't wired
 * for this suite either; see `useWhatsappPhone.test.ts` for the same
 * rationale). This file asserts design.md's exact wiring instead:
 *   - no static `import { supabase }` (the Presentation-layer client leak
 *     removed by U3)
 *   - `createChatbotContainer()` is called with NO arguments (async,
 *     resolves its own client — see ChatbotContainer.test.ts)
 *   - the container promise is stored in a ref, populated on the
 *     `onToggle` OPEN transition (not on first send — see design.md's
 *     "trigger = first open" decision)
 *   - `handleSendMessage` awaits that ref
 *   - a rejection resets the ref to `null` (retry-safe — a cached
 *     rejected promise would otherwise permanently brick the widget)
 *   - the dynamic-import chokepoint is never referenced at module scope,
 *     preserving SSR/hydration parity
 */

import fs from "node:fs";
import path from "node:path";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "../../../../src/features/chatbot/presentation/ExpertAssistantWithRAG.tsx",
);

describe("ExpertAssistantWithRAG.tsx (U3 chatbot chokepoint wiring)", () => {
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("does NOT statically import the `supabase` client", () => {
    expect(source).not.toMatch(
      /import\s*\{[^}]*\bsupabase\b[^}]*\}\s*from\s*["']@shared\/supabaseClient["']/,
    );
  });

  it("calls createChatbotContainer() with no arguments", () => {
    expect(source).toMatch(/createChatbotContainer\(\s*\)/);
    expect(source).not.toMatch(/createChatbotContainer\(\s*supabase\s*\)/);
  });

  it("stores the container promise in a ref (containerPromiseRef)", () => {
    expect(source).toMatch(/containerPromiseRef\s*=\s*useRef/);
  });

  it("populates the container promise ref inside the toggle/open handler, not at module or render top level", () => {
    const onToggleIndex = source.search(/onToggle\s*=\s*\{?\s*\(\s*\)\s*=>/);
    expect(onToggleIndex).toBeGreaterThan(-1);
  });

  it("handleSendMessage awaits containerPromiseRef", () => {
    const handleSendMessageIndex = source.indexOf("const handleSendMessage");
    expect(handleSendMessageIndex).toBeGreaterThan(-1);
    const nextFunctionIndex = source.indexOf("const handleSend =");
    const body = source.slice(handleSendMessageIndex, nextFunctionIndex);
    expect(body).toMatch(/await\s+containerPromiseRef\.current/);
  });

  it("resets containerPromiseRef.current to null in the catch path (retry-safe)", () => {
    const handleSendMessageIndex = source.indexOf("const handleSendMessage");
    const nextFunctionIndex = source.indexOf("const handleSend =");
    const body = source.slice(handleSendMessageIndex, nextFunctionIndex);
    expect(body).toMatch(/catch/);
    const catchIndex = body.indexOf("catch");
    const catchBlock = body.slice(catchIndex);
    expect(catchBlock).toMatch(/containerPromiseRef\.current\s*=\s*null/);
  });

  it("never references the dynamic import chokepoint at module top level (no import.meta/dynamic import literal outside a function)", () => {
    // The component itself must not perform any dynamic import directly —
    // that responsibility lives entirely inside ChatbotContainer.ts /
    // supabaseClient.ts (Data layer). Presentation only calls
    // createChatbotContainer().
    expect(source).not.toMatch(/await\s+import\(/);
  });

  it("keeps ExpertAssistant as a plain named/default export (still eagerly imported by App.tsx, never React.lazy)", () => {
    expect(source).toMatch(/export const ExpertAssistant/);
    expect(source).toMatch(/export default ExpertAssistant/);
  });
});
