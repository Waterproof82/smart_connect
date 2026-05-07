# Skill Registry — smart-connect

_Last updated: 2026-05-07_

## Project Conventions

| File | Description |
|------|-------------|
| `CLAUDE.md` | Main agent instructions, SDD orchestrator protocol, design context, brand personality, project conventions |
| `AGENTS_AND_SKILLS.md` | Reference for agents (Code Reviewer, Security Engineer, etc.) and slash-command skills |
| `.impeccable.md` | Design guidelines and persistent design context |
| `.opencode/sdd-profile-free.json` | SDD FREE profile — model assignments per phase, blocked models, fallback logic |

### Referenced Files from Conventions

No index files with path references found in convention files.

## Installed Skills

### User-Level Skills

| Skill | Directory | Triggers |
|-------|-----------|----------|
| adapt | `.claude/skills/adapt/` | Adapt designs across screen sizes, devices, contexts |
| animate | `.claude/skills/animate/` | Add purposeful animations, micro-interactions, motion |
| audit | `.claude/skills/audit/` | Full interface quality audit (accessibility, perf, theming, responsive) |
| bolder | `.claude/skills/bolder/` | Amplify safe/boring designs, increase visual impact |
| branch-pr | `.config/opencode/skills/branch-pr/` | PR creation workflow, issue-first enforcement |
| chained-pr | `.config/opencode/skills/chained-pr/` | Split large PRs into chained/stacked PRs, 400-line budget |
| clarify | `.claude/skills/clarify/` | Improve UX copy, error messages, microcopy, labels |
| cognitive-doc-design | `.config/opencode/skills/cognitive-doc-design/` | Documentation that reduces cognitive load |
| colorize | `.claude/skills/colorize/` | Add strategic color to monochromatic interfaces |
| comment-writer | `.config/opencode/skills/comment-writer/` | Write warm, human PR/issue/chat comments |
| critique | `.claude/skills/critique/` | UX design evaluation, actionable feedback |
| delight | `.claude/skills/delight/` | Add moments of joy, personality, unexpected touches |
| distill | `.claude/skills/distill/` | Strip designs to essence, remove unnecessary complexity |
| extract | `.claude/skills/extract/` | Extract reusable components, design tokens, patterns |
| frontend-design | `.claude/skills/frontend-design/` | Production-grade frontend interfaces, high design quality |
| go-testing | `.config/opencode/skills/go-testing/` | Go testing patterns, Bubbletea TUI testing |
| harden | `.claude/skills/harden/` | Improve resilience: error handling, i18n, edge cases |
| issue-creation | `.config/opencode/skills/issue-creation/` | GitHub issue creation, bug reports, feature requests |
| judgment-day | `.config/opencode/skills/judgment-day/` | Parallel adversarial review, dual blind judges |
| normalize | `.claude/skills/normalize/` | Normalize design to match design system |
| onboard | `.claude/skills/onboard/` | Design onboarding flows, empty states, first-time UX |
| optimize | `.claude/skills/optimize/` | Improve interface performance: loading, rendering, bundle |
| polish | `.claude/skills/polish/` | Final quality pass: alignment, spacing, consistency |
| quieter | `.claude/skills/quieter/` | Reduce visual intensity, tone down bold designs |
| skill-creator | `.config/opencode/skills/skill-creator/` | Create new AI agent skills following spec |
| teach-impeccable | `.claude/skills/teach-impeccable/` | One-time design context setup, persistent guidelines |
| work-unit-commits | `.config/opencode/skills/work-unit-commits/` | Structure commits as deliverable work units |

### Project-Level Skills

None found.

## SDD Skills (Managed by SDD Orchestrator)

| Skill | Path |
|-------|------|
| sdd-init | `.config/opencode/skills/sdd-init/` |
| sdd-explore | `.config/opencode/skills/sdd-explore/` |
| sdd-propose | `.config/opencode/skills/sdd-propose/` |
| sdd-spec | `.config/opencode/skills/sdd-spec/` |
| sdd-design | `.config/opencode/skills/sdd-design/` |
| sdd-tasks | `.config/opencode/skills/sdd-tasks/` |
| sdd-apply | `.config/opencode/skills/sdd-apply/` |
| sdd-verify | `.config/opencode/skills/sdd-verify/` |
| sdd-archive | `.config/opencode/skills/sdd-archive/` |
| sdd-onboard | `.config/opencode/skills/sdd-onboard/` |
| _shared | `.config/opencode/skills/_shared/` (internal refs) |
