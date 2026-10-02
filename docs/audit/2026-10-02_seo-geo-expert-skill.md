# Added `seo-geo-expert` project skill

**Timestamp:** 2026-10-02 UTC
**Scope:** `.claude/skills/seo-geo-expert/`
**Type:** implementation

## Actions
- Created the project skill `seo-geo-expert` (`SKILL.md` plus six reference files) from the user-supplied SEO/GEO/Google Search prompt.
- Restructured the prompt into a lean entry point with progressive disclosure: technical audit, content/entity/E-E-A-T, GEO/AEO, structured data, Search Console/GA4/local/international, and report templates.
- Corrected points that would otherwise mislead: Next.js sections made conditional (project is React + Vite with custom SSR), FAQ rich results restricted by Google, HowTo retired, `llms.txt` not used by Google Search, no special markup for AI Overviews/AI Mode, self-serving review markup prohibited.
- Added project context: official domain `https://digitalizatenerife.es/`, `Content-Signal` consistency, `llms.txt` sha256 sync, prior GSC audit reference.

## Validation
- Frontmatter and file structure checked manually; skill is not application code, so lint/build are unaffected.

## Follow-ups
- Invoke the skill in a new session (`/seo-geo-expert`) and refine on first real use.
