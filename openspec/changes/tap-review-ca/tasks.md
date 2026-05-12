# Tasks: TapReview Refactoring to Clean Architecture

## Review Workload Forecast

| Field                   | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| Estimated changed lines | 350-450                                                             |
| 400-line budget risk    | Medium                                                              |
| Chained PRs recommended | Yes                                                                 |
| Suggested split         | PR 1: Infrastructure & Core Implementation, PR 2: Testing & Cleanup |
| Delivery strategy       | ask-on-risk                                                         |

**Decision needed before apply:** Yes
**Chained PRs recommended:** Yes
**Chain strategy:** stacked-to-main
**400-line budget risk:** Medium

---

## Phase 1: Infrastructure

- [ ] 1.1 Create `TapReviewContainerPresentation.tsx` with the `TapReviewContainerProps` interface and basic container structure.
- [ ] 1.2 Extract and standardize the following inline components from `TapReviewPage.tsx` into `presentation/components/`:
  - FeatureCheck.tsx (for the checkmark features)
  - WhatsAppButton.tsx (for the WhatsApp contact button)
  - ProductButton.tsx (for the product button)
  - HeroEyebrow.tsx (for the smartphone icon and eyebrow text)
  - HeroTitle.tsx (for the hero title with accent text)
  - HeroSubtitle.tsx (for the hero subtitle)
  - FeatureList.tsx (for the feature list items)
  - ErrorDisplay.tsx (for error states)
  - LoadingSpinner.tsx (for loading states)

- [ ] 1.3 Update `TapReviewPage.tsx` to use the standardized components and receive props from `TapReviewContainerPresentation`.

---

## Phase 2: Core Implementation

- [ ] 2.1 Integrate `GetAppSettingsUseCase` into `TapReviewContainerPresentation` to fetch app settings.
- [ ] 2.2 Modify `TapReviewPage.tsx` to accept `whatsappPhone` and `error` props from `TapReviewContainerPresentation`.
- [ ] 2.3 Update `TapReviewContainerPresentation.tsx` to pass the fetched `whatsappPhone` and any errors to `TapReviewPage`.

---

## Phase 3: Testing

- [ ] 3.1 Write unit tests for `TapReviewContainerPresentation` using Jest and React Testing Library to verify rendering with mock data.
- [ ] 3.2 Write unit tests for each standardized component (e.g., `FeatureCheck.tsx`, `WhatsAppButton.tsx`) with different props.
- [ ] 3.3 Write integration tests to verify `GetAppSettingsUseCase` integration with `TapReviewContainerPresentation`.
- [ ] 3.4 Write integration tests for `TapReviewPage` rendering with props from the container.
- [ ] 3.5 Write end-to-end tests using Cypress or Playwright to verify the complete flow: fetching settings, rendering the page, and verifying UI state.

---

## Phase 4: Cleanup and Documentation

- [ ] 4.1 Update documentation in `TapReviewPage.tsx` and `TapReviewContainerPresentation.tsx` to reflect the new structure.
- [ ] 4.2 Remove any unused or redundant code from the `presentation/components/` directory.
- [ ] 4.3 Ensure all components use Lucide icons consistently.
