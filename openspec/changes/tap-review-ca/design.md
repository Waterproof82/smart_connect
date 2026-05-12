# Design: TapReview Refactoring to Clean Architecture

## Technical Approach

The refactoring aims to adhere to Clean Architecture principles by:

- **Separating concerns**: Extracting data fetching logic from the presentation layer.
- **Standardizing components**: Moving inline components to `presentation/components/` and standardizing them with Lucide icons.
- **Integrating use cases**: Properly utilizing `GetAppSettingsUseCase` with the domain layer.
- **Creating a presentation container**: Developing `TapReviewContainerPresentation` to encapsulate data fetching logic.

This design ensures maintainability, testability, and scalability while preserving existing functionality.

---

## Architecture Decisions

### Decision: **Container Component Creation**

**Choice**: Create `TapReviewContainerPresentation.tsx` to encapsulate data fetching logic.
**Alternatives considered**:

- Keep data fetching logic in `TapReviewPage.tsx` (violates Clean Architecture).
- Use a context provider for state management (overkill for this use case).
  **Rationale**: Encapsulating data fetching in a container component ensures proper separation of concerns and adheres to Clean Architecture principles.

### Decision: **Component Standardization**

**Choice**: Extract and standardize 10 inline components from `TapReviewPage.tsx` into `presentation/components/`.
**Alternatives considered**:

- Leave components inline (reduces reusability and maintainability).
- Use a component library (not applicable here due to project scope).
  **Rationale**: Standardizing components improves code organization, reusability, and consistency.

### Decision: **Use Case Integration**

**Choice**: Integrate `GetAppSettingsUseCase` with `TapReviewContainerPresentation`.
**Alternatives considered**:

- Directly call `GetAppSettingsUseCase` from `TapReviewPage.tsx` (violates separation of concerns).
- Use a context provider for the use case (overly complex for this scenario).
  **Rationale**: Proper integration with the domain layer ensures clean separation and testability.

---

## Data Flow

The data flow for the refactored feature will be as follows:

```
    TapReviewContainerPresentation
       │
       ▼
┌───────────────────────────────────────────────────────┐
│                 Presentation Layer                    │
│   ┌─────────────────────────────────────────────────┐  │
│   │             TapReviewPage.tsx                   │  │
│   └───────────────┬─────────────────────────────────┘  │
│                   │                                   │
│                   ▼                                   │
│       ┌─────────────────────────────────────────────┐  │
│       │           Standardized Components          │  │
│       └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────────────────┐
│                 Domain Layer                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │           GetAppSettingsUseCase                  │  │
│   └───────────────┬─────────────────────────────────┘  │
│                   │                                   │
│                   ▼                                   │
│       ┌─────────────────────────────────────────────┐  │
│       │           ISettingsRepository               │  │
│       └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
       │
       ▼
┌───────────────────────────────────────────────────────┐
│                 Data Layer                           │
│   ┌─────────────────────────────────────────────────┐  │
│   │         SupabaseSettingsRepository             │  │
│   └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

---

## File Changes

| File                                                                      | Action    | Description                                                                                        |
| ------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `src/features/tap-review/presentation/TapReviewContainerPresentation.tsx` | Create    | Container component for encapsulating data fetching logic and integrating `GetAppSettingsUseCase`. |
| `src/features/tap-review/presentation/TapReviewPage.tsx`                  | Modify    | Refactor to a pure presentation component dependent on the domain layer.                           |
| `src/features/tap-review/presentation/components/`                        | Modify    | Extract and standardize 10 inline components using Lucide icons.                                   |
| `src/features/tap-review/domain/usecases/GetAppSettingsUseCase.ts`        | No change | Use case remains unchanged but will be integrated with the container.                              |

---

## Interfaces / Contracts

### Props for `TapReviewContainerPresentation`

```typescript
interface TapReviewContainerProps {
  children: React.ReactNode;
  getAppSettingsUseCase: GetAppSettingsUseCase;
}
```

### Props for `TapReviewPage`

```typescript
interface TapReviewPageProps {
  whatsappPhone: string;
  error?: string;
}
```

### Standardized Component Interface

```typescript
interface StandardizedComponentProps {
  icon?: React.ReactNode;
  text: string;
  className?: string;
}
```

---

## Testing Strategy

| Layer       | What to Test                                                               | Approach                                                |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| Unit        | `TapReviewContainerPresentation` component rendering with mock data.       | Jest + React Testing Library.                           |
| Unit        | Standardized components (e.g., `FeatureCheck.tsx`) with different props.   | Jest + React Testing Library.                           |
| Integration | `GetAppSettingsUseCase` integration with `TapReviewContainerPresentation`. | Mock `ISettingsRepository` and test use case execution. |
| Integration | `TapReviewPage` rendering with props from the container.                   | Jest + React Testing Library.                           |
| E2E         | End-to-end flow: Fetch settings, render page, and verify UI state.         | Cypress or Playwright.                                  |

---

## Migration / Rollout

- **No migration required**: The refactoring is backward compatible and does not affect existing functionality.
- **Feature flag**: Not required, as the refactoring is isolated to the `tap-review` feature.

---

## Open Questions

- [ ] Should the `TapReviewContainerPresentation` be a class component or a functional component with hooks?
- [ ] Are there any additional dependencies or configurations needed for the new container component?
