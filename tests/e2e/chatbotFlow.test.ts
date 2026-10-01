// Polyfill fetch for Node.js (required by supabase-js Edge Functions)
import "cross-fetch/polyfill";
// ========================================
// E2E TEST: Public RAG Chatbot Flow
// ========================================
// The chatbot talks to a single public Edge Function, `chat-with-rag`, which
// embeds the question, searches the knowledge base and generates the answer
// server-side. Visitors have no Supabase session (anonymous sign-ins are
// disabled), so the browser sends only the public API key.
import { describe, it, expect } from "@jest/globals";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

// Skip E2E tests if Supabase credentials are not configured
const describeIfConfigured =
  SUPABASE_URL && SUPABASE_ANON_KEY ? describe : describe.skip;

// A structurally valid but expired JWT, like the stale session a browser may
// still hold after sign-in settings change.
const STALE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4Iiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjE3MDAwMDAwMDB9.abc";

async function askChatbot(
  query: string,
  extraHeaders: Record<string, string> = {},
) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-with-rag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Origin: "https://digitalizatenerife.es",
      ...extraHeaders,
    },
    body: JSON.stringify({
      query,
      conversationHistory: [],
      topK: 5,
      threshold: 0.4,
      source: null,
    }),
  });
  const body = (await res.json()) as {
    response?: string;
    metadata?: { documentsFound?: number };
    error?: string;
  };
  return { status: res.status, body };
}

describeIfConfigured("RAG Chatbot E2E Flow (public, no session)", () => {
  it("answers a question using only the public API key", async () => {
    const { status, body } = await askChatbot("¿Qué es la carta digital?");

    expect(status).toBe(200);
    expect(typeof body.response).toBe("string");
    expect(body.response?.length).toBeGreaterThan(0);
    expect(body.metadata?.documentsFound).toBeGreaterThan(0);
  }, 30000);

  it("still answers when the browser sends the public key as Bearer token", async () => {
    const { status, body } = await askChatbot("¿Cómo funcionan las tarjetas NFC?", {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    });

    expect(status).toBe(200);
    expect(body.response).toBeTruthy();
  }, 30000);

  it("still answers when the browser holds a stale/invalid session token", async () => {
    const { status, body } = await askChatbot("¿Qué servicios ofrecéis?", {
      Authorization: `Bearer ${STALE_JWT}`,
    });

    expect(status).toBe(200);
    expect(body.response).toBeTruthy();
  }, 30000);
});
