# Video Captions — Drive-By Accessibility Fix

**Date**: 2026-08-19
**Author**: Claude Code
**Trigger**: Follow-up item explicitly deferred out of the `landing-performance-a11y` SDD cycle (flagged during that change's exploration as trivial, but never actually implemented until now). User requested it be resolved before any further work.

## Objective

`CartaDigitalDemoSection.tsx` renders a `<video autoPlay loop muted playsInline>` element (a silent screen recording demonstrating the digital menu UI) with no `<track>` child, which Lighthouse's accessibility audit flags — the audit checks for the presence of a captions track structurally, independent of whether the source file actually contains an audio stream.

## Verification before editing

- Confirmed via `find public/assets` that no `.vtt` caption file existed anywhere in the repo.
- Confirmed the `<video>` element is `muted` with no audio-related props, consistent with it being a purely visual screen-capture demo (not narrated content).
- Confirmed the project's `useLanguage()` context exposes a `language: "es" | "en"` value already used throughout the landing page for i18n.

## Fix applied

1. Added two new WebVTT files:
   - `public/assets/video-captions-es.vtt`
   - `public/assets/video-captions-en.vtt`

   Each contains a single cue stating the video has no audio (`[Vídeo sin audio: grabación de pantalla de la carta digital]` / `[Video has no audio: screen recording of the digital menu]`), rather than an empty/fake transcript — this is honest about the video's actual (silent) content instead of just satisfying the checker with a no-op file.

2. `src/features/landing/presentation/components/CartaDigitalDemoSection.tsx`:
   - Destructured `language` alongside `t` from `useLanguage()`.
   - Converted the self-closing `<video ... />` to `<video ...>...</video>` and added a `<track kind="captions" src={...} srcLang={language} label={...} default />` child, selecting the ES/EN VTT file and label based on the active language.

## Scope

Single-file mechanical change (plus 2 static asset files) — inline per the project's SDD Enforcement Threshold (1-3 files, no new logic beyond a locale ternary already used elsewhere in the same file).

## Verification run

- `npx tsc --noEmit` — clean.
- `npm run lint` (`--max-warnings 0`) — clean.
- `npx jest --config=jest.config.js` — 77/77 suites, 973/973 tests passing (no regressions; no existing test file covered this component, none was added since this is a structural markup change with no branching logic worth a dedicated unit test beyond what tsc/lint already catch).
- No build was run (per user's global "never build after changes" rule).

## Known limitations

- The VTT cues are a static "no audio" notice, not a real transcript — appropriate here since the video genuinely has no dialogue, but if the source video is ever replaced with a narrated version, these files must be revisited.
