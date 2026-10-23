# Audit: Carta Digital ordering copy

- **Timestamp:** 2026-10-23
- **Action:** Corrected Carta Digital copy (ES/EN) so Telegram is described only as the pickup-order channel; table orders go to the own waiter app, synced with bar and kitchen tablets in real time.
- **Files:** `LanguageContext.tsx`, `CartaDigitalTelegramSection.tsx` (icons), `WebMCP.ts`, related tests.
- **Validation:** vitest (212 passed), type-check and lint clean.
