// ========================================
// chat-with-rag — generation failover (Deno-free)
// ========================================
// This module MUST NOT import anything and MUST NOT reference `Deno.*`.
// Keeping it import-free lets `ts-jest` load and unit-test it directly,
// even though it runs on the Deno Edge runtime (see `notify-lead/_lib.ts`
// for the same pattern).
//
// See design `sdd/rag-knowledge-base-refresh/design` D1-D3:
// - D1: primary model + single backup model retry, model names validated
//   against MODEL_NAME_REGEX before being interpolated into the request URL.
// - D2: 20s total budget (caller-supplied via `deadlineMs`), 10s primary,
//   backup capped at min(8s, remaining-500ms), skipped if remaining<3s.
// - D3: failover on timeout/network error, 429, 404, 5xx, or a 200 with no
//   candidates (unless `promptFeedback.blockReason` is set); NOT on
//   400/401/403 (same fault on both models).

/** Guards every Gemini model name before it is interpolated into a request URL. */
export const MODEL_NAME_REGEX = /^gemini-[a-z0-9.-]+$/;

const GENERATE_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const DEFAULT_PRIMARY_TIMEOUT_MS = 10_000;
const DEFAULT_BACKUP_TIMEOUT_MS = 8_000;
const DEFAULT_MIN_REMAINING_FOR_BACKUP_MS = 3_000;
const BACKUP_SAFETY_MARGIN_MS = 500;

/** Same generationConfig chat-with-rag has always sent — unchanged by this refactor. */
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.3,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
  thinkingConfig: { thinkingLevel: 'low' },
} as const;

export interface GenerateContentPart {
  readonly text: string;
}

export interface GenerateContentMessage {
  readonly role: 'user' | 'model';
  readonly parts: ReadonlyArray<GenerateContentPart>;
}

export interface GenerateRequestConfig {
  readonly contents: ReadonlyArray<GenerateContentMessage>;
  readonly generationConfig?: Record<string, unknown>;
}

/** Minimal fetch surface this module depends on — real `fetch` satisfies it. */
export type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  }
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export interface GenerateWithFailoverParams {
  /** `[primaryModel, backupModel]`. */
  readonly models: readonly [string, string];
  readonly apiKey: string;
  readonly request: GenerateRequestConfig;
  readonly fetchFn: FetchLike;
  /** Injected clock, e.g. `() => Date.now()`. */
  readonly now: () => number;
  /** Remaining time budget (ms) for this call, from the 20s request ceiling. */
  readonly deadlineMs: number;
  readonly primaryTimeoutMs?: number;
  readonly backupTimeoutMs?: number;
  readonly minRemainingForBackupMs?: number;
}

export type GenerateAttemptOutcome = 'success' | 'retryable-error' | 'terminal-error';

export interface GenerateAttempt {
  readonly model: string;
  readonly outcome: GenerateAttemptOutcome;
  readonly status?: number;
  readonly reason?: 'timeout' | 'network-error' | 'blocked' | 'empty-response';
}

export interface GenerateSuccess {
  readonly ok: true;
  readonly text: string;
  readonly modelUsed: string;
  readonly attempts: readonly GenerateAttempt[];
}

export interface GenerateFailure {
  readonly ok: false;
  readonly attempts: readonly GenerateAttempt[];
}

export type GenerateResult = GenerateSuccess | GenerateFailure;

interface GeminiCandidatePart {
  readonly text?: string;
}

interface GeminiResponseBody {
  readonly candidates?: ReadonlyArray<{
    readonly content?: { readonly parts?: ReadonlyArray<GeminiCandidatePart> };
  }>;
  readonly promptFeedback?: { readonly blockReason?: string };
}

/** 429/404/5xx are worth retrying on a different model; 400/401/403 are not (D3). */
function isFailoverStatus(status: number): boolean {
  return status === 429 || status === 404 || status >= 500;
}

type SuccessAttemptResult = { readonly kind: 'success'; readonly text: string };
type ErrorAttemptResult = {
  readonly kind: 'retryable-error' | 'terminal-error';
  readonly status?: number;
  readonly reason?: GenerateAttempt['reason'];
};
type AttemptResult = SuccessAttemptResult | ErrorAttemptResult;

async function attemptGenerate(
  model: string,
  apiKey: string,
  request: GenerateRequestConfig,
  fetchFn: FetchLike,
  budgetMs: number
): Promise<AttemptResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Math.max(budgetMs, 0));

  try {
    const response = await fetchFn(`${GENERATE_URL_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: request.contents,
        generationConfig: request.generationConfig ?? DEFAULT_GENERATION_CONFIG,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return isFailoverStatus(response.status)
        ? { kind: 'retryable-error', status: response.status }
        : { kind: 'terminal-error', status: response.status };
    }

    const data = (await response.json()) as GeminiResponseBody;
    const content = data.candidates?.[0]?.content;
    if (!content) {
      if (data.promptFeedback?.blockReason) {
        return { kind: 'terminal-error', reason: 'blocked' };
      }
      return { kind: 'retryable-error', reason: 'empty-response' };
    }

    const text = (content.parts ?? []).map((part) => part.text ?? '').join('');
    return { kind: 'success', text };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { kind: 'retryable-error', reason: 'timeout' };
    }
    return { kind: 'retryable-error', reason: 'network-error' };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Calls the primary Gemini model, aborting via `AbortController` on timeout,
 * and retries exactly once on the backup model when the failure is
 * retry-worthy (D3) and enough of the caller's `deadlineMs` budget remains
 * (D2). Never exceeds `deadlineMs` by more than `backupTimeoutMs`.
 */
export async function generateWithFailover(
  params: GenerateWithFailoverParams
): Promise<GenerateResult> {
  const {
    models,
    apiKey,
    request,
    fetchFn,
    now,
    deadlineMs,
    primaryTimeoutMs = DEFAULT_PRIMARY_TIMEOUT_MS,
    backupTimeoutMs = DEFAULT_BACKUP_TIMEOUT_MS,
    minRemainingForBackupMs = DEFAULT_MIN_REMAINING_FOR_BACKUP_MS,
  } = params;

  const [primaryModel, backupModel] = models;
  for (const model of models) {
    if (!MODEL_NAME_REGEX.test(model)) {
      throw new Error(`Invalid Gemini model name: "${model}"`);
    }
  }

  const attempts: GenerateAttempt[] = [];
  if (deadlineMs <= 0) {
    return { ok: false, attempts };
  }

  const startTime = now();
  const primaryBudget = Math.min(primaryTimeoutMs, deadlineMs);
  const primaryResult = await attemptGenerate(primaryModel, apiKey, request, fetchFn, primaryBudget);

  if (primaryResult.kind === 'success') {
    attempts.push({ model: primaryModel, outcome: 'success' });
    return { ok: true, text: primaryResult.text, modelUsed: primaryModel, attempts };
  }

  attempts.push({
    model: primaryModel,
    outcome: primaryResult.kind,
    status: primaryResult.status,
    reason: primaryResult.reason,
  });

  if (primaryResult.kind === 'terminal-error') {
    return { ok: false, attempts };
  }

  const elapsedAfterPrimary = now() - startTime;
  const remainingForBackup = deadlineMs - elapsedAfterPrimary;
  if (remainingForBackup < minRemainingForBackupMs) {
    return { ok: false, attempts };
  }

  const backupBudget = Math.min(backupTimeoutMs, remainingForBackup - BACKUP_SAFETY_MARGIN_MS);
  if (backupBudget <= 0) {
    return { ok: false, attempts };
  }

  const backupResult = await attemptGenerate(backupModel, apiKey, request, fetchFn, backupBudget);
  if (backupResult.kind === 'success') {
    attempts.push({ model: backupModel, outcome: 'success' });
    return { ok: true, text: backupResult.text, modelUsed: backupModel, attempts };
  }

  attempts.push({
    model: backupModel,
    outcome: backupResult.kind,
    status: backupResult.status,
    reason: backupResult.reason,
  });
  return { ok: false, attempts };
}
