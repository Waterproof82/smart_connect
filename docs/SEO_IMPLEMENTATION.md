# 📡 SEO Implementation Guide - Landing Page

## Overview

Implementation of SEO optimization for the Landing Page using i18n translation keys, following Clean Architecture and SDD orchestrator workflow.

**Date**: 2026-05-06  
**SDD Phases**: sdd-init → sdd-explore → sdd-propose → sdd-apply → sdd-verify → sdd-archive ✅

---

## 🎯 Objective

Optimize Landing Page SEO by:

1. Adding meta tags (title, description) via i18n translation keys
2. Implementing structured data (JSON-LD Product schema)
3. Ensuring no hardcoded strings (full i18n compliance)
4. Maintaining Clean Architecture separation of concerns

---

## 🏗️ Architecture

### Files Modified

| File                                                       | Purpose           | Changes                                                                                                  |
| ---------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `src/shared/context/LanguageContext.tsx`                   | i18n translations | Added SEO keys: `seoTitle`, `seoDescription`, `seoProductDescription` in both `es` and `en` objects      |
| `src/features/landing/presentation/LandingContainer.tsx`   | Meta tags         | Helmet integration with `t.seoTitle`, `t.seoDescription`, structured data with `t.seoProductDescription` |
| `src/features/landing/presentation/components/Contact.tsx` | Content           | Updated headings to use `t.contactTitle`, `t.contactSubtitle`                                            |

---

## 🔤 Technical Implementation

### 1. Translation Keys (LanguageContext.tsx)

```typescript
interface Translation {
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoProductDescription: string;
  // ... other keys
}
```

**Spanish**:

```json
{
  "seoTitle": "Atrae Más Clientes a Tu Restaurante | Menú QR, NFC y Sistema de Pedidos - SmartConnect QRIBAR",
  "seoDescription": "Aumenta las ventas de tu restaurante y atrae más clientes con QRIBAR...",
  "seoProductDescription": "Plataforma de crecimiento para restaurantes..."
}
```

**English**:

```json
{
  "seoTitle": "Get More Customers for Your Restaurant | QR Menu, NFC & Ordering System - SmartConnect QRIBAR",
  "seoDescription": "Increase restaurant sales and attract more customers with QRIBAR...",
  "seoProductDescription": "Restaurant growth platform with digital menu..."
}
```

### 2. Meta Tags (LandingContainer.tsx)

```tsx
const LandingContainer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.seoTitle}</title>
        <meta name="description" content={t.seoDescription} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "QRIBAR",
            description: t.seoProductDescription,
            // ... other structured data
          })}
        </script>
      </Helmet>
      {/* Components */}
    </>
  );
};
```

### 3. Structured Data (JSON-LD)

- **Type**: Product
- **Properties**: name, description, brand, offers
- **Validation**: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## ✅ SDD Orchestrator Workflow

### Phases Executed

| Phase       | Model Used                   | Status |
| ----------- | ---------------------------- | ------ |
| sdd-init    | mistral/mistral-large-latest | ✅     |
| sdd-explore | mistral/open-mixtral-8x22b   | ✅     |
| sdd-propose | mistral/mistral-large-latest | ✅     |
| sdd-apply   | mistral/codestral-latest     | ✅     |
| sdd-verify  | mistral/codestral-latest     | ✅     |
| sdd-archive | opencode/big-pickle          | ✅     |

### Key Decisions

1. **i18n Compliance**: All SEO text uses translation keys (`t.seoTitle`, etc.) instead of hardcoded strings
2. **Clean Architecture**: Separation of concerns maintained - translations in `shared/context`, UI in `features/landing/presentation`
3. **TypeSafety**: Both `es` and `en` objects updated to satisfy `Record<Language, Translation>` type

---

## 🔍 SEO Features Implemented

### On-Page SEO

- ✅ Meta title with keywords: "QR Menu", "NFC", "Ordering System", "QRIBAR"
- ✅ Meta description with call-to-action and value proposition
- ✅ H1 tags optimized for "QRIBAR" and "Digital Menu"
- ✅ Keyword usage: "NFC cards for Google Reviews", "Digital menu", "QR ordering"

### Technical SEO

- ✅ Structured data (JSON-LD Product schema)
- ✅ Semantic HTML: `<section>`, `<article>` elements
- ✅ Internal linking: Links to `/tap-review` and `/chatbot`
- ✅ Performance: Lazy-loaded non-critical media

### Content SEO

- ✅ Keyword density optimized
- ✅ Readability maintained
- ✅ Internal linking strategy implemented

---

## 🛠️ Fixes Applied

### Issue: Corrupted LanguageContext.tsx

**Problem**: Duplicate keys and mixed translations after multiple edits  
**Solution**: Rebuilt entire file with clean `es` and `en` objects  
**Learning**: When file corruption occurs, rebuild from scratch instead of multiple incremental edits

### Issue: TypeScript esModuleInterop Error

**Problem**: `react-router` types trying to default-import `@types/react`  
**Solution**: Added `esModuleInterop: true` to `tsconfig.json`  
**Status**: ✅ Type-check passes

---

## 📊 Validation Checklist

- ✅ Linting: `npm run lint` passed
- ✅ Type checking: `npm run type-check` passed
- ✅ No hardcoded strings: All user-facing text via `t.*` keys
- ✅ i18n compliance: SEO keys in both `es` and `en`
- ✅ Structured data: Valid JSON-LD format
- ✅ Security: No API keys leaked
- ✅ Accessibility: ARIA attributes maintained

---

## 🚀 Next Steps

1. **Test Structured Data**: Use [Google Rich Results Test](https://search.google.com/test/rich-results)
2. **Monitor SEO**: Set up Google Search Console for performance tracking
3. **A/B Test**: Try different meta descriptions to optimize CTR
4. **Expand SEO**: Apply same pattern to other pages (`/tap-review`, `/qribar`, `/chatbot`)

---

## 🤖 GEO Agent Readiness (AI Agent Optimization)

**Date**: 2026-05-13  
**Agent Readiness Score**: 32/100 → ~85/100 (projected)

### Overview

GEO (Generative Engine Optimization) improves discoverability and interaction capabilities for AI agents and LLMs. This complements traditional SEO by adding machine-readable files, AI bot access control, and protocol discovery.

### Files Created

| File                                          | Purpose                            | Score Impact |
| --------------------------------------------- | ---------------------------------- | ------------ |
| `public/.well-known/llms.txt`                 | Machine-readable markdown for LLMs | +20 pts      |
| `public/.well-known/mcp/server-card.json`     | MCP Server Card                    | +15 pts      |
| `public/.well-known/agent-skills/index.json`  | Agent Skills discovery             | +12 pts      |
| `public/.well-known/api-catalog`              | API Catalog (linkset+json)         | +7 pts       |
| `public/.well-known/openid-configuration`     | OAuth/OIDC metadata                | +10 pts      |
| `public/.well-known/oauth-protected-resource` | Protected APIs documentation       | +8 pts       |
| `public/.well-known/jwks.json`                | JWKS stub                          | —            |

### Files Modified

| File                   | Change                                   |
| ---------------------- | ---------------------------------------- |
| `public/robots.txt`    | AI bot rules + Content-Signal directives |
| `LandingContainer.tsx` | JSON-LD @graph with author/publisher     |
| `vite.config.ts`       | Link headers for dev                     |
| `vercel.json`          | Link headers for production              |

### AI Bot Rules Added

```
User-agent: GPTBot, ClaudeBot, ChatGPT-User, PerplexityBot, Google-Extended, OAI-SearchBot
Allow: /

Content-Signal: ai-train=no
Content-Signal: search=yes
Content-Signal: ai-input=no
```

### Protected APIs Documented

| API              | Auth Required | Rate Limit | Anonymous |
| ---------------- | :-----------: | :--------: | :-------: |
| gemini-embedding |    ✅ JWT     |     No     |    No     |
| gemini-generate  |    ✅ JWT     |   10/min   |    No     |
| chat-with-rag    | Optional JWT  |     No     |    ✅     |

### Validation

```bash
# Test llms.txt accessibility
curl https://smart-connect-olive.vercel.app/llms.txt

# Test API catalog
curl -H "Accept: application/linkset+json" https://smart-connect-olive.vercel.app/.well-known/api-catalog

# Test Link headers
curl -I https://smart-connect-olive.vercel.app/
```

### References

- [Agent Readiness Score](https://agentreadyscore.com)
- [llms.txt specification](https://llmstxt.llc/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Content-Signal IETF Draft](https://datatracker.ietf.org/doc/html/draft-moderow-httpbis-content-signals-00)

---

## 📝 Notes

- **Helmet Library**: Already installed (`react-helmet`), no additional setup needed
- **Translation Keys**: Must be added to BOTH language objects to satisfy TypeScript
- **SDD Profile**: Follows `.opencode/sdd-profile-free.json` with Mistral models for each phase
- **Engram Memory**: SEO implementation saved to Engram (ID: 1, Topic: `seo/landing-page-i18n`)
