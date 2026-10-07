/**
 * _shared/prompt Tests
 *
 * `buildSystemInstruction` is the pure (Deno-free) prompt-grounding module
 * used by `chat-with-rag`: it builds the Gemini `systemInstruction` text from
 * the retrieved RAG documents. Same pattern as `_shared/generate.ts`: no
 * imports, no `Deno.*`, so ts-jest can exercise it directly.
 *
 * See design `sdd/rag-knowledge-base-refresh/design` D6 and spec
 * "Prompt Redirect and Language Behavior".
 */

import { buildSystemInstruction, CONTACT_URL, LEGAL_URLS, type RagDocument } from './prompt';

const DOC: RagDocument = {
  content: 'Hacemos páginas web personalizadas para negocios locales.',
  source: 'site:/servicios',
  similarity: 0.82,
  metadata: { url: 'https://digitalizatenerife.es/servicios' },
};

describe('buildSystemInstruction', () => {
  it('always instructs the model to answer in the user\'s input language', () => {
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toMatch(/mismo idioma/i);
  });

  it('always instructs the model to redirect unanswerable questions to the contact CTA', () => {
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toContain(CONTACT_URL);
    expect(instruction).not.toMatch(/no tengo informaci[oó]n/i);
  });

  it('always instructs the model to redirect privacy/legal questions to the footer links, never answer from KB content', () => {
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toContain(LEGAL_URLS.privacy);
    expect(instruction).toContain(LEGAL_URLS.cookies);
    expect(instruction).toContain(LEGAL_URLS.legalNotice);
  });

  it('never instructs the model to invent prices or timelines', () => {
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toMatch(/nunca inventes|no inventes/i);
  });

  it('includes the retrieved documents, their source, and their url in the context block', () => {
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toContain(DOC.content);
    expect(instruction).toContain(DOC.source);
    expect(instruction).toContain(DOC.metadata!.url);
  });

  it('still produces an instruction that can answer (greetings) when no documents were found, instead of a dead end', () => {
    const instruction = buildSystemInstruction({ documents: [] });
    // Still carries every redirect/grounding rule...
    expect(instruction).toContain(CONTACT_URL);
    expect(instruction).toContain(LEGAL_URLS.privacy);
    // ...but does not contain the old hard-coded dead-end string, and does not
    // forbid responding to small talk.
    expect(instruction).not.toMatch(/no tengo informaci[oó]n/i);
    expect(instruction).not.toMatch(/No encontré información relevante/i);
  });
});
