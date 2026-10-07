# Audit — Knowledge-base cleanup and no-prices rule

**Timestamp:** 2026-10-07T22:30Z
**Scope:** production table `public.documents`; `supabase/functions/_shared/prompt.ts`

## Trigger

A production smoke test of `chat-with-rag` returned stale data from the knowledge base:
- the pre-rebrand "QRIBAR" brand;
- two conflicting digital-menu prices ("1450 € one-off or 50 €/month" and "from 100 €/month").

The owner then made two decisions:
- Never quote prices for websites or the digital menu. Instead, answer that the price depends on the project's type and complexity.
- Delete every outdated or unrelated knowledge-base answer.

## Actions

1. **Backup.** Created `kb_backup.documents_20261007` (7 rows, embeddings included) in a new `kb_backup` schema. Revoked all privileges from `public`, `anon` and `authenticated`, so the public API cannot read it.
2. **Deleted 4 rows:**
   - `0c39ab9d…` — Carta Digital, 1450 € / 50 €/month.
   - `aa708e16…` — QRIBAR, from 100 €/month.
   - `db28cd51…` and `2d7ed8aa…` — n8n automation, a service no longer on the site; one of the two rows included prices.
3. **Rewrote 2 rows** (embeddings kept; the topic is unchanged, and a full re-embed is planned in Units 7–8 of `rag-knowledge-base-refresh`):
   - `54088c6b…` → source `Carta Digital`: brand-neutral and price-free. Covers shops and restaurants (owner-stated); ordering from the table straight to the bar and kitchen.
   - `e5abdb44…` → source `Páginas web`: "páginas web personalizadas" (owner-stated). The price depends on the type of website and its complexity.
4. **Kept** `ace6c06e…` — NFC cards, 15–35 € per unit with volume discounts (owner-confirmed today).
5. **Prompt rule 2:** price questions about websites, the digital menu, TPV or chatbots get "it depends on the project's type and complexity", plus a link to the contact form. TDD: the test failed first, then passed. While writing it, a single-quoted `${CONTACT_URL}` bug was caught; the test now also asserts that no `${` remains in the prompt.

## Restore

```sql
insert into public.documents select * from kb_backup.documents_20261007 where id not in (select id from public.documents);
```
