import fs from "node:fs";
import path from "node:path";

// PR8 scope: ChatWelcome's default prompt used to read "¿Qué es QRIBAR?" and
// its lead paragraph referenced QRIBAR by name. Per spec's
// chatbot-knowledge-base delta ("UI Copy No Longer Names QRIBAR"), the
// widget must reflect the new TPV platform positioning without naming the
// deleted product. RAG document content in Supabase is explicitly out of
// scope and untouched by this test.
const COMPONENT_PATH = path.resolve(
  __dirname,
  "../../../../src/features/chatbot/presentation/components/ChatWelcome.tsx",
);

describe("ChatWelcome (PR8 QRIBAR-free copy)", () => {
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("has zero case-insensitive 'qribar' matches anywhere in the file", () => {
    expect(source).not.toMatch(/qribar/i);
  });

  it("still exports a defaultPrompts array with suggested prompts", () => {
    expect(source).toMatch(/const defaultPrompts = \[/);
  });

  it("keeps the NFC review-card prompt (still a real, live capability)", () => {
    expect(source).toMatch(/¿Cómo funcionan las tarjetas NFC\?/);
  });
});
