# Proposal: Enhance Structured Data for SmartConnect AI

## Intent

Improve the semantic structured data score for `https://digitalizatenerife.es/` by adding comprehensive JSON-LD schemas for services, testimonials, FAQs, and processes. This will enhance SEO, improve search engine visibility, and provide richer data for voice assistants and smart devices. The goal is to align with Google's structured data guidelines and leverage semantic markup to drive more qualified traffic and conversions.

## Scope

### In Scope

- **New JSON-LD Schemas**: Add `Service`, `Testimonial`, `FAQ`, and `HowTo` schemas to existing structured data components.
- **Service Documentation**: Implement schemas for QRIBAR, NFC Tap-to-Review, Chatbot RAG, Digitalization Services, and Automation Services.
- **Testimonials**: Add structured data for testimonials to enhance credibility and social proof.
- **FAQs**: Implement structured data for FAQs related to QRIBAR, NFC Tap-to-Review, and Chatbot RAG.
- **Processes**: Add structured data for processes like NFC Tap-to-Review and QRIBAR workflows.
- **Files Affected**:
  - `LandingContainer.tsx` (existing LocalBusiness, Product, Review, Offer, WebPage schemas)
  - `SeoSchema.tsx` (reusable components for Service, FAQPage, Review, BreadcrumbList)
  - `Features.tsx` (Service feature cards)
  - `FAQ.tsx` (FAQ UI)
  - `HowItWorks.tsx` (Process/HowTo UI)
  - Chatbot-related components (structured data for Chatbot RAG)

### Out of Scope

- **Existing Schemas**: No changes to existing schemas like LocalBusiness, Product, Review, Offer, WebPage, FAQPage, HowTo, or AggregateRating.
- **Dynamic Content**: No real-time dynamic generation of structured data for user-generated content.
- **Third-Party Integrations**: No integration with external platforms for structured data syndication.
- **Mobile App**: Structured data enhancements are limited to the web platform.

## Capabilities

### New Capabilities

- **service-json-ld**: Structured data for services like QRIBAR, NFC Tap-to-Review, Chatbot RAG, Digitalization Services, and Automation Services.
- **testimonial-json-ld**: Structured data for testimonials to enhance credibility.
- **faq-json-ld**: Structured data for FAQs related to QRIBAR, NFC Tap-to-Review, and Chatbot RAG.
- **process-json-ld**: Structured data for processes like NFC Tap-to-Review and QRIBAR workflows.

### Modified Capabilities

- **landing-container-json-ld**: Enhanced with new Service and Testimonial schemas.
- **seo-schema-components**: Extended to include new Service, FAQ, and Process schemas.

## Approach

1. **Schema Design**: Design JSON-LD schemas for each service, testimonial, FAQ, and process, ensuring they are semantically accurate and aligned with Google's guidelines.

2. **Component Integration**: Integrate new schemas into existing components:
   - Add `Service` schema to `Features.tsx` for service cards.
   - Add `Testimonial` schema to `TestimonialCarousel/index.tsx`.
   - Add `FAQ` schema to `FAQ.tsx`.
   - Add `HowTo` schema to `HowItWorks.tsx`.
   - Add `Service` and `Testimonial` schemas to `LandingContainer.tsx`.

3. **Reusable Components**: Create reusable components in `SeoSchema.tsx` for new schemas to ensure consistency and reduce duplication.

4. **i18n Compliance**: Ensure all structured data is compatible with the existing `LanguageContext.tsx` for Spanish and English support.

5. **Testing**: Implement unit tests for new schemas and ensure they render correctly in different contexts (SSR, SPA).

## Affected Areas

| Area                                                         | Impact   | Description                                         |
| ------------------------------------------------------------ | -------- | --------------------------------------------------- |
| `src/features/landing/presentation/LandingContainer.tsx`     | Modified | Enhanced with new Service and Testimonial schemas   |
| `src/features/landing/presentation/components/SeoSchema.tsx` | Modified | Extended with new Service, FAQ, and Process schemas |
| `src/features/features/Features.tsx`                         | New      | Added Service schema for service cards              |
| `src/features/faq/FAQ.tsx`                                   | New      | Added FAQ schema for FAQs                           |
| `src/features/how-it-works/HowItWorks.tsx`                   | New      | Added HowTo schema for processes                    |
| `src/features/chatbot/**`                                    | New      | Added structured data for Chatbot RAG               |
| `src/shared/context/LanguageContext.tsx`                     | Modified | Ensured i18n compatibility for structured data      |

## Risks

| Risk                         | Likelihood | Mitigation                                                                   |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------- |
| Incomplete schema validation | Medium     | Use Google's Rich Results Test tool to validate schemas before deployment.   |
| SSR hydration issues         | Medium     | Ensure structured data is rendered server-side and client-side consistently. |
| Type safety issues           | Low        | Use TypeScript interfaces for schema definitions to ensure type safety.      |
| Performance degradation      | Low        | Optimize schema generation to avoid excessive rendering overhead.            |

## Rollback Plan

- **Revert Changes**: Remove all new schema integrations from affected files.
- **Restore State**: Revert `LandingContainer.tsx`, `SeoSchema.tsx`, `Features.tsx`, `FAQ.tsx`, and `HowItWorks.tsx` to their previous states.
- **Remove Components**: Delete any new reusable components added to `SeoSchema.tsx`.
- **Test Validation**: Validate that the rollback does not break existing functionality using Google's Rich Results Test tool.

## Dependencies

- Existing structured data components in `SeoSchema.tsx` and `LandingContainer.tsx`.
- TypeScript interfaces for schema definitions.
- Google's Rich Results Test tool for validation.

## Success Criteria

- ✅ All new schemas (`Service`, `Testimonial`, `FAQ`, `HowTo`) are implemented and validated using Google's Rich Results Test tool.
- ✅ Structured data is correctly integrated into all affected components.
- ✅ No SSR hydration issues or type safety errors.
- ✅ All new schemas are compatible with i18n support.
- ✅ Unit tests pass for new schemas and components.
- ✅ Structured data improves semantic score and search engine visibility.

---
