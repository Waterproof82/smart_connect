# Proposal: i18n Translations for Landing Pages

## Intent

Replace hardcoded Spanish text in 4 landing pages with translation keys from the existing `LanguageContext`. This will enable full multilingual support for the project, particularly English, while maintaining consistency with the existing i18n infrastructure.

## Scope

### In Scope

- **Pages to translate**:
  - `SoftwareCanariasContainer.tsx` (most content hardcoded)
  - `WhatsappAutomationContainer.tsx` (most content hardcoded)
  - `AutomationN8nContainer.tsx` (partial - most keys exist)
  - `DigitalizationTenerifeContainer.tsx` (most content hardcoded)

- **Translation keys to add**:
  - BenefitsGrid titles, subtitles, and descriptions
  - HowItWorks titles, subtitles, and step descriptions
  - GeoCoverage titles, subtitles, and serviceArea
  - InternalLinks titles, labels, and descriptions
  - StatsBar labels
  - Testimonials and FAQs content
  - WhatsApp CTA button text

- **Existing keys to reference**:
  - All SEO and hero keys already exist for all 4 pages
  - `AutomationN8nContainer.tsx` already has most benefit, how-it-works, and internal link keys defined

### Out of Scope

- Translation of existing English content (only Spanish to translation keys)
- Adding new features or functionality
- Translating the `LanguageContext` itself
- Adding new languages beyond English/Spanish

## Capabilities

### New Capabilities

- `softwareCanariasBenefitsTitle`: Title for BenefitsGrid section
- `softwareCanariasBenefitsSubtitle`: Subtitle for BenefitsGrid section
- `softwareCanariasBenefit1Title`: Title for first benefit in BenefitsGrid
- `softwareCanariasBenefit1Desc`: Description for first benefit in BenefitsGrid
- `softwareCanariasBenefit2Title`: Title for second benefit in BenefitsGrid
- `softwareCanariasBenefit2Desc`: Description for second benefit in BenefitsGrid
- `softwareCanariasBenefit3Title`: Title for third benefit in BenefitsGrid
- `softwareCanariasBenefit3Desc`: Description for third benefit in BenefitsGrid
- `softwareCanariasBenefit4Title`: Title for fourth benefit in BenefitsGrid
- `softwareCanariasBenefit4Desc`: Description for fourth benefit in BenefitsGrid
- `softwareCanariasHowItWorksTitle`: Title for HowItWorks section
- `softwareCanariasHowItWorksSubtitle`: Subtitle for HowItWorks section
- `softwareCanariasStep1Title`: Title for first step in HowItWorks
- `softwareCanariasStep1Desc`: Description for first step in HowItWorks
- `softwareCanariasStep2Title`: Title for second step in HowItWorks
- `softwareCanariasStep2Desc`: Description for second step in HowItWorks
- `softwareCanariasStep3Title`: Title for third step in HowItWorks
- `softwareCanariasStep3Desc`: Description for third step in HowItWorks
- `softwareCanariasGeoCoverageTitle`: Title for GeoCoverage section
- `softwareCanariasGeoCoverageSubtitle`: Subtitle for GeoCoverage section
- `softwareCanariasServiceArea`: Service area description for GeoCoverage
- `softwareCanariasInternalLinksTitle`: Title for InternalLinks section
- `softwareCanariasInternalLink1Label`: Label for first internal link
- `softwareCanariasInternalLink1Desc`: Description for first internal link
- `softwareCanariasInternalLink2Label`: Label for second internal link
- `softwareCanariasInternalLink2Desc`: Description for second internal link
- `softwareCanariasInternalLink3Label`: Label for third internal link
- `softwareCanariasInternalLink3Desc`: Description for third internal link
- `softwareCanariasInternalLink4Label`: Label for fourth internal link
- `softwareCanariasInternalLink4Desc`: Description for fourth internal link
- `softwareCanariasStat1Label`: Label for first stat in StatsBar
- `softwareCanariasStat2Label`: Label for second stat in StatsBar
- `softwareCanariasStat3Label`: Label for third stat in StatsBar
- `softwareCanariasStat4Label`: Label for fourth stat in StatsBar
- `softwareCanariasWhatsAppText`: WhatsApp CTA button text

- `whatsappAutomationBenefitsTitle`: Title for BenefitsGrid section
- `whatsappAutomationBenefitsSubtitle`: Subtitle for BenefitsGrid section
- `whatsappAutomationBenefit1Title`: Title for first benefit in BenefitsGrid
- `whatsappAutomationBenefit1Desc`: Description for first benefit in BenefitsGrid
- `whatsappAutomationBenefit2Title`: Title for second benefit in BenefitsGrid
- `whatsappAutomationBenefit2Desc`: Description for second benefit in BenefitsGrid
- `whatsappAutomationBenefit3Title`: Title for third benefit in BenefitsGrid
- `whatsappAutomationBenefit3Desc`: Description for third benefit in BenefitsGrid
- `whatsappAutomationBenefit4Title`: Title for fourth benefit in BenefitsGrid
- `whatsappAutomationBenefit4Desc`: Description for fourth benefit in BenefitsGrid
- `whatsappAutomationHowItWorksTitle`: Title for HowItWorks section
- `whatsappAutomationHowItWorksSubtitle`: Subtitle for HowItWorks section
- `whatsappAutomationStep1Title`: Title for first step in HowItWorks
- `whatsappAutomationStep1Desc`: Description for first step in HowItWorks
- `whatsappAutomationStep2Title`: Title for second step in HowItWorks
- `whatsappAutomationStep2Desc`: Description for second step in HowItWorks
- `whatsappAutomationStep3Title`: Title for third step in HowItWorks
- `whatsappAutomationStep3Desc`: Description for third step in HowItWorks
- `whatsappAutomationGeoCoverageTitle`: Title for GeoCoverage section
- `whatsappAutomationGeoCoverageSubtitle`: Subtitle for GeoCoverage section
- `whatsappAutomationServiceArea`: Service area description for GeoCoverage
- `whatsappAutomationInternalLinksTitle`: Title for InternalLinks section
- `whatsappAutomationInternalLink1Label`: Label for first internal link
- `whatsappAutomationInternalLink1Desc`: Description for first internal link
- `whatsappAutomationInternalLink2Label`: Label for second internal link
- `whatsappAutomationInternalLink2Desc`: Description for second internal link
- `whatsappAutomationInternalLink3Label`: Label for third internal link
- `whatsappAutomationInternalLink3Desc`: Description for third internal link
- `whatsappAutomationInternalLink4Label`: Label for fourth internal link
- `whatsappAutomationInternalLink4Desc`: Description for fourth internal link
- `whatsappAutomationStat1Label`: Label for first stat in StatsBar
- `whatsappAutomationStat2Label`: Label for second stat in StatsBar
- `whatsappAutomationStat3Label`: Label for third stat in StatsBar
- `whatsappAutomationStat4Label`: Label for fourth stat in StatsBar
- `whatsappAutomationWhatsAppText`: WhatsApp CTA button text

- `digitalizationTenerifeBenefitsTitle`: Title for BenefitsGrid section
- `digitalizationTenerifeBenefitsSubtitle`: Subtitle for BenefitsGrid section
- `digitalizationTenerifeBenefit1Title`: Title for first benefit in BenefitsGrid
- `digitalizationTenerifeBenefit1Desc`: Description for first benefit in BenefitsGrid
- `digitalizationTenerifeBenefit2Title`: Title for second benefit in BenefitsGrid
- `digitalizationTenerifeBenefit2Desc`: Description for second benefit in BenefitsGrid
- `digitalizationTenerifeBenefit3Title`: Title for third benefit in BenefitsGrid
- `digitalizationTenerifeBenefit3Desc`: Description for third benefit in BenefitsGrid
- `digitalizationTenerifeBenefit4Title`: Title for fourth benefit in BenefitsGrid
- `digitalizationTenerifeBenefit4Desc`: Description for fourth benefit in BenefitsGrid
- `digitalizationTenerifeHowItWorksTitle`: Title for HowItWorks section
- `digitalizationTenerifeHowItWorksSubtitle`: Subtitle for HowItWorks section
- `digitalizationTenerifeStep1Title`: Title for first step in HowItWorks
- `digitalizationTenerifeStep1Desc`: Description for first step in HowItWorks
- `digitalizationTenerifeStep2Title`: Title for second step in HowItWorks
- `digitalizationTenerifeStep2Desc`: Description for second step in HowItWorks
- `digitalizationTenerifeStep3Title`: Title for third step in HowItWorks
- `digitalizationTenerifeStep3Desc`: Description for third step in HowItWorks
- `digitalizationTenerifeGeoCoverageTitle`: Title for GeoCoverage section
- `digitalizationTenerifeGeoCoverageSubtitle`: Subtitle for GeoCoverage section
- `digitalizationTenerifeServiceArea`: Service area description for GeoCoverage
- `digitalizationTenerifeInternalLinksTitle`: Title for InternalLinks section
- `digitalizationTenerifeInternalLink1Label`: Label for first internal link
- `digitalizationTenerifeInternalLink1Desc`: Description for first internal link
- `digitalizationTenerifeInternalLink2Label`: Label for second internal link
- `digitalizationTenerifeInternalLink2Desc`: Description for second internal link
- `digitalizationTenerifeInternalLink3Label`: Label for third internal link
- `digitalizationTenerifeInternalLink3Desc`: Description for third internal link
- `digitalizationTenerifeInternalLink4Label`: Label for fourth internal link
- `digitalizationTenerifeInternalLink4Desc`: Description for fourth internal link
- `digitalizationTenerifeStat1Label`: Label for first stat in StatsBar
- `digitalizationTenerifeStat2Label`: Label for second stat in StatsBar
- `digitalizationTenerifeStat3Label`: Label for third stat in StatsBar
- `digitalizationTenerifeStat4Label`: Label for fourth stat in StatsBar
- `digitalizationTenerifeWhatsAppText`: WhatsApp CTA button text

### Modified Capabilities

None (this is a new feature, not a modification of existing capabilities)

## Approach

1. **Review existing translation keys**: Analyze the `LanguageContext.tsx` to identify existing keys and patterns for naming new keys.

2. **Add new translation keys**: Add the new keys to the `LanguageContext.tsx` file under the appropriate sections for each landing page.

3. **Replace hardcoded text**: Replace all hardcoded Spanish text in the 4 landing pages with the appropriate translation keys from the `t` object.

4. **Add missing `hrefLang="en"` tags**: Ensure all pages have proper `hrefLang="en"` link tags in their Helmet for SEO and language support.

5. **Test translations**: Verify that all translations render correctly in both Spanish and English contexts.

## Affected Areas

| Area                                  | Impact             | Description                                                                 |
| ------------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `LanguageContext.tsx`                 | New                | Add new translation keys for all landing pages                              |
| `SoftwareCanariasContainer.tsx`       | Modified           | Replace hardcoded text with translation keys                                |
| `WhatsappAutomationContainer.tsx`     | Modified           | Replace hardcoded text with translation keys                                |
| `AutomationN8nContainer.tsx`          | Modified (partial) | Add missing translation keys for benefits, how-it-works, and internal links |
| `DigitalizationTenerifeContainer.tsx` | Modified           | Replace hardcoded text with translation keys                                |
| Helmet components                     | Modified           | Add missing `hrefLang="en"` link tags for SEO                               |

## Risks

| Risk                                    | Likelihood | Mitigation                                                           |
| --------------------------------------- | ---------- | -------------------------------------------------------------------- |
| Incomplete translation keys             | Medium     | Thorough review of existing keys and patterns before adding new ones |
| Missing some hardcoded text             | Medium     | Systematic search and replacement of all hardcoded Spanish text      |
| Inconsistent key naming                 | Medium     | Follow existing naming conventions in `LanguageContext.tsx`          |
| SEO impact from missing `hrefLang` tags | Low        | Add missing `hrefLang="en"` tags during implementation               |

## Rollback Plan

1. **Restore hardcoded text**: Revert all changes made to replace hardcoded text with translation keys.

2. **Remove new translation keys**: Remove all newly added translation keys from `LanguageContext.tsx`.

3. **Verify functionality**: Ensure all pages render correctly with hardcoded text restored.

4. **Test SEO**: Verify that SEO functionality remains intact after rollback.

## Dependencies

- Existing `LanguageContext.tsx` with translation keys infrastructure
- Existing i18n setup and hooks in the project
- Existing translation files for Spanish and English

## Success Criteria

- [ ] All hardcoded Spanish text in the 4 landing pages replaced with translation keys
- [ ] All new translation keys added to `LanguageContext.tsx`
- [ ] All pages render correctly in both Spanish and English contexts
- [ ] All missing `hrefLang="en"` link tags added to Helmet components
- [ ] No broken functionality or rendering issues
- [ ] SEO remains intact with proper language tags

## Proposal Created

**Change**: i18n-landing-silo-pages
**Location**: `openspec/changes/i18n-landing-silo-pages/proposal.md`

### Summary

- **Intent**: Enable full multilingual support for 4 landing pages by replacing hardcoded Spanish text with translation keys
- **Scope**: 4 pages affected, ~100+ new translation keys required
- **Approach**: Systematic replacement of hardcoded text with translation keys following existing patterns
- **Risk Level**: Medium (potential for missing keys or inconsistent naming)

### Next Step

Ready for specs (sdd-spec) or design (sdd-design).
