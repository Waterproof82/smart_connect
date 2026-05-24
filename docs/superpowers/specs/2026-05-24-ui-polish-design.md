# UI Polish Pass — taste-skill + emil-design-eng

**Date:** 2026-05-24
**Approach:** A — Surgical CSS-only (no new dependencies)
**Scope:** 4 files — index.css, Hero.tsx, Features.tsx, Navbar.tsx
**Skills applied:** taste-skill (Variance 8, Motion 6, Density 4) + emil-design-eng

---

## Goal

Apply all improvements identified by the taste-skill and emil-design-eng lenses to the SmartConnect AI landing page. Every change is a quality correction — wrong values replaced with correct ones. No architecture, no logic, no new dependencies.

---

## 1. index.css

### 1.1 Custom Easing Variables
Add to `:root`:
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```
**Why:** Emil's rule — built-in CSS easings are too weak. These provide the "punchy, intentional" feel.

### 1.2 revealUp keyframe
- `translateY(30px)` → `translateY(16px)` — 30px is too dramatic, feels heavy
- `ease-out` → `cubic-bezier(0.23, 1, 0.32, 1)` — use the new strong easing variable

### 1.3 shimmer-move animation
- `3s ease-in-out` → `2.5s linear`
**Why:** Shimmer is constant motion. Emil's rule: constant motion → linear easing.

### 1.4 animateIn keyframe (mobile drawer)
The drawer is conditionally rendered (`{isMobileMenuOpen && ...}`), so a full CSS transition swap would require always-rendering the `<dialog>` element, which breaks focus semantics. Instead, fix the existing keyframe to only animate `transform` and `opacity` (not all properties), and tighten its easing:
```css
@keyframes animateIn {
  from {
    opacity: 0;
    transform: translateX(var(--tw-enter-translate-x, 0)) translateY(var(--tw-enter-translate-y, 0)) scale(var(--tw-enter-scale, 1));
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0) scale(1);
  }
}
```
Replace `animation: animateIn 0.3s ease-out` with `animation: animateIn 0.25s cubic-bezier(0.23, 1, 0.32, 1)`.
**Why:** Keyframe is kept (conditional rendering constraint) but tightened — correct easing, faster duration, only transform+opacity animated.

---

## 2. Hero.tsx

### 2.1 Viewport height
- `min-h-[90vh]` → `min-h-[100dvh]`
**Why:** `vh` causes layout jump on iOS Safari when the address bar hides/shows. `dvh` (dynamic viewport height) is stable.

### 2.2 Liquid glass refraction on hero card
Add to the main card div:
```
shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
```
Plus ensure the border has slight white tint: `border-white/5` alongside existing `border-[var(--color-border)]`.
**Why:** Taste-skill liquid glass rule — go beyond backdrop-blur. A 1px inner border + inner shadow simulates physical edge refraction.

### 2.3 Floating badge refraction
Apply same `shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]` treatment to the floating AI Core badge and Uplink Stable badge.
**Why:** Consistency — all floating glass surfaces get the refraction treatment.

### 2.4 Button transition specificity
Replace `transition-all` implicit on buttons with `transition-[transform,background-color,box-shadow]`.
**Why:** `transition-all` animates every CSS property on every state change. Wasteful and causes jank on complex elements.

---

## 3. Features.tsx

### 3.1 Card reveal timing
- `transition-all duration-700` → `transition-[opacity,transform] duration-300`
**Why:** 700ms is 2.3x over Emil's 300ms ceiling for UI animations. Also fixes the `transition-all` anti-pattern.

### 3.2 Stagger delay
- `idx * 100ms` → `idx * 60ms`
**Why:** Emil's rule — stagger delays should be 30–80ms between items. 100ms makes the grid feel slow to load.

### 3.3 Section title alignment
- `text-center max-w-3xl mx-auto` → `text-left max-w-none`
**Why:** Taste-skill ANTI-CENTER BIAS rule — at DESIGN_VARIANCE 8, centered section titles are banned. Left-aligned with asymmetric layout reads as more intentional and premium.

### 3.4 Icon hover easing
Add `ease-[cubic-bezier(0.23,1,0.32,1)]` to the existing `transition-transform` on icon containers.
**Why:** Use the custom easing system instead of the default ease.

### 3.5 Section heading transition
- `transition-all duration-1000` on the header block → `transition-[opacity,transform] duration-500`
**Why:** Fix transition-all; 1000ms entry for a heading is slow. 500ms is acceptable for a section intro.

---

## 4. Navbar.tsx

### 4.1 Navbar shrink transition
- `transition-all duration-300` → `transition-[padding,background-color] duration-200`
**Why:** The navbar only changes padding and bg on scroll — animate exactly those properties. 200ms is sufficient.

### 4.2 Dropdown reveal animation
Current: `opacity + translateY(16px)` (translates down from invisible position)
After: `opacity 0 + scale(0.95)` → `opacity 1 + scale(1)`, with `transform-origin: top center`
```css
transition: opacity 150ms cubic-bezier(0.23,1,0.32,1),
            transform 150ms cubic-bezier(0.23,1,0.32,1);
```
**Why:** Two Emil rules — (1) nothing appears from nowhere, start from scale(0.95); (2) popovers must scale from their trigger point (top center), not from center.

### 4.3 Dropdown container transition
- `transition-all duration-300` → `transition-[opacity,transform] duration-150`
**Why:** Emil's table — dropdowns: 150–250ms. 300ms is sluggish.

### 4.4 ChevronDown transition
- `transition-transform duration-300` → `transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]`
**Why:** Chevron should feel snappy. 300ms for an icon rotation is too slow.

### 4.5 Mobile drawer animation
Keep `animate-in slide-in-from-right` class but update the underlying `animateIn` keyframe in `index.css` (see §1.4) — faster duration (0.25s vs 0.3s) and strong easing. No structural change to the conditional rendering.
**Why:** Conditional rendering constraint prevents a full transition-based approach. Keyframe quality improvement is sufficient.

### 4.6 DropdownMenuItem icon hover
- `group-hover/item:scale-110 transition-transform` → add `ease-[cubic-bezier(0.23,1,0.32,1)] duration-150`
**Why:** Apply the custom easing system consistently.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/index.css` | Easing variables, revealUp keyframe, shimmer timing, drawer transition |
| `src/features/landing/presentation/components/Hero.tsx` | dvh viewport, glass refraction on card + badges, button transitions |
| `src/features/landing/presentation/components/Features.tsx` | Card timing, stagger delay, title alignment, easing on icons |
| `src/features/landing/presentation/components/Navbar.tsx` | Navbar transition, dropdown scale+origin, drawer transition, chevron timing |

## Not In Scope

- Service pages (TapReview, CartaDigital, AutomationN8n, etc.)
- Admin dashboard
- Chatbot UI
- Font changes (Space Grotesk + Instrument Sans is acceptable per both skills)
- framer-motion installation
- Any logic, routing, or data changes

## Success Criteria

- No `transition-all` remaining in the 4 touched files
- Dropdown scales from `transform-origin: top center`
- Feature cards reveal in ≤300ms
- Stagger ≤80ms between items
- Hero uses `min-h-[100dvh]`
- Features title is left-aligned
- Hero card has inset refraction shadow
- `npx tsc --noEmit` passes
- `npm run lint` passes (0 warnings)
