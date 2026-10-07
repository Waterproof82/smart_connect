// ========================================
// chat-with-rag — prompt grounding + redirect (Deno-free)
// ========================================
// This module MUST NOT import anything and MUST NOT reference `Deno.*`.
// Keeping it import-free lets `ts-jest` load and unit-test it directly, even
// though it runs on the Deno Edge runtime (see `_shared/generate.ts` and
// `notify-lead/_lib.ts` for the same pattern).
//
// See design `sdd/rag-knowledge-base-refresh/design` D6:
// - Rendered as the Gemini `systemInstruction` (not inlined into the user
//   turn), so it survives conversation history better.
// - Answer in the user's input language.
// - Ground strictly in the retrieved CONTEXT; never invent prices, timelines
//   or claims not present in it.
// - Unknown/ungrounded question -> redirect to the contact CTA instead of a
//   dead end ("No tengo información sobre eso").
// - Privacy/cookies/legal question -> redirect to the footer legal pages,
//   never answered from KB content.
// - Zero retrieved documents MUST still produce an instruction that lets the
//   model answer (greetings, small talk) and redirect unknowns to the CTA —
//   it must not hard-refuse.
//
// The chat UI (`ChatMessages.tsx`) renders `message.content` as plain text
// (no markdown parser, no dangerouslySetInnerHTML) — so links are NOT
// clickable. URLs below are intentionally spelled out in full so they read
// as a clear, copyable reference even though they won't render as <a> tags.

/** Contact CTA for questions the knowledge base cannot ground an answer to. */
export const CONTACT_URL = 'https://digitalizatenerife.es/#contacto';

/** Footer legal pages — privacy/cookie/legal questions MUST redirect here, never be answered from KB content. */
export const LEGAL_URLS = {
  privacy: 'https://digitalizatenerife.es/legal/privacidad',
  cookies: 'https://digitalizatenerife.es/legal/cookies',
  legalNotice: 'https://digitalizatenerife.es/legal/aviso',
} as const;

export interface RagDocument {
  readonly content: string;
  readonly source?: string | null;
  readonly similarity?: number;
  readonly metadata?: { readonly url?: string } | null;
}

export interface BuildSystemInstructionParams {
  readonly documents: readonly RagDocument[];
}

function formatDocument(doc: RagDocument, idx: number): string {
  const sourceLine = `Fuente: ${doc.source || 'Desconocida'}`;
  const urlLine = doc.metadata?.url ? `\nURL: ${doc.metadata.url}` : '';
  return `[Documento ${idx + 1}]\n${sourceLine}${urlLine}\nContenido: ${doc.content}`;
}

function buildContextBlock(documents: readonly RagDocument[]): string {
  if (documents.length === 0) {
    return '(No se encontraron documentos relevantes para esta pregunta. Si es un saludo o una pregunta general sobre Digitaliza Tenerife, responde con naturalidad; si es una pregunta concreta que no puedes responder con certeza, invita a contactar.)';
  }
  return documents.map(formatDocument).join('\n---\n');
}

/**
 * Builds the Gemini `systemInstruction` text for `chat-with-rag`. Pure
 * function of the retrieved documents — grounding, language and redirect
 * rules are constant; only the CONTEXT block changes per request.
 */
export function buildSystemInstruction(params: BuildSystemInstructionParams): string {
  const { documents } = params;

  return [
    'Eres el asistente virtual de Digitaliza Tenerife, que ayuda a negocios locales (restaurantes, bares, cafeterías y tiendas) con páginas web personalizadas, carta digital, TPV para restaurantes, chatbots con IA y tarjetas NFC para reseñas de Google.',
    '',
    'REGLAS (en orden de prioridad):',
    '1. Responde SIEMPRE en el mismo idioma en el que el usuario escribió su pregunta.',
    '2. Básate ÚNICAMENTE en el CONTEXTO de abajo. Nunca inventes precios, plazos de entrega, garantías ni ninguna afirmación que no esté explícitamente en el contexto.',
    `3. Si el contexto no contiene información suficiente para responder con certeza, NO digas simplemente que no tienes información: invita de forma natural a contactar en ${CONTACT_URL}.`,
    `4. Si preguntan sobre privacidad, cookies, protección de datos o aviso legal, NO respondas con contenido del contexto bajo ninguna circunstancia: redirige siempre a la página correspondiente — privacidad: ${LEGAL_URLS.privacy}, cookies: ${LEGAL_URLS.cookies}, aviso legal: ${LEGAL_URLS.legalNotice}.`,
    '5. Si no hay documentos relevantes (p. ej. un saludo o una pregunta genérica), responde con naturalidad y de forma breve; no la trates como un error.',
    '6. Sé conciso, directo y profesional.',
    '',
    'CONTEXTO:',
    buildContextBlock(documents),
  ].join('\n');
}
