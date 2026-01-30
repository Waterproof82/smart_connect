# 2026-01-29 - A/B Testing Deployment & CORS Fix

- Deployed Edge Function with A/B testing and prompt variants
- Fixed CORS headers to allow Supabase JS SDK requests
- Validated all pending commit tests (A/B assignment, backend integration)
- User-facing bot is now operational and analytics ready

---

## Test Results & Outstanding Issues

- 17 test suites passed (core chatbot, repositories, main entities)
- 8 test suites failed:
	- **Jest/ESM compatibility:** Several tests fail due to `import.meta.env` usage (Vite/ESM) not supported by Jest. See `Logger.ts` and related modules.
	- **Entity validation:** `MessageEntity` tests do not throw expected errors for invalid/empty content or role. Review validation logic.

### Recommendations
- Refactor or mock `import.meta.env` usage in modules under test, or configure Jest for ESM support.
- Ensure entity constructors/validators throw as expected for invalid input.
- See Jest and Vite documentation for ESM/test compatibility.

**Next step:** Prioritize fixing Jest/ESM config and entity validation for full CI pass.
