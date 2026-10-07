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
  it('presents the current brand and services, not the pre-rebrand ones', () => {
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toContain('Digitaliza Tenerife');
    expect(instruction).not.toMatch(/SmartConnect|QRIBAR/);
    expect(instruction).toMatch(/páginas web personalizadas/);
    expect(instruction).toMatch(/tiendas/);
  });

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

  it('instructs the model to answer in plain text, never Markdown formatting', () => {
    // Production smoke test showed the model emitting "**15 € a 35 €**" —
    // ChatMessages.tsx renders plain text, so the asterisks showed up
    // literally. Forbid Markdown syntax at the source instead of trying to
    // strip it client-side. Bare https URLs stay allowed (linkified in the UI).
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toMatch(/texto plano/i);
    expect(instruction).toMatch(/markdown/i);
    expect(instruction).toMatch(/\*\*/); // names the forbidden ** syntax explicitly
    expect(instruction).toMatch(/URLs? .*https/i);
  });

  it('answers price questions for custom projects with "depends on type and complexity" plus the contact CTA', () => {
    // Owner decision 2026-10-07: no prices for websites, digital menu, TPV or
    // chatbots — the price depends on the project's type and complexity.
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toMatch(/depende del tipo/i);
    expect(instruction).toMatch(/complejidad/i);
    expect(instruction).toMatch(/páginas web.*carta digital.*TPV.*chatbots/i);
    expect(instruction).not.toContain('${'); // every placeholder interpolated
  });

  it('requires Spanish from Spain (tuteo, peninsular/Canarian vocabulary), never voseo or Latin American usage', () => {
    // The business and its customers are in Tenerife: "celular", "computadora"
    // or voseo would make the bot sound generic and foreign.
    const instruction = buildSystemInstruction({ documents: [DOC] });
    expect(instruction).toMatch(/español de España/i);
    expect(instruction).toMatch(/tuteo|tú/i);
    expect(instruction).toMatch(/voseo/i);
    expect(instruction).toMatch(/móvil/i);
  });
});
