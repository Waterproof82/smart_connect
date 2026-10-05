import React, { Component, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import { Section } from "@shared/presentation/layout";
import { Hero } from "@features/landing/presentation/components/Hero";
import { CartaDigitalReviews } from "@features/landing/presentation/components/CartaDigitalReviews";
import { DeferredExpertAssistant } from "@features/chatbot/presentation";
import HomeFaqSection, {
  useHomeFaqGroups,
} from "@features/landing/presentation/components/HomeFaqSection";
import Contact from "@features/landing/presentation/components/Contact";
import { ConsoleLogger } from "@core/domain/usecases/Logger";
import { useLanguage } from "@shared/context/LanguageContext";
import { SOLUTIONS } from "@shared/config/solutions";
import { buildHomeSchema } from "@shared/presentation/components/SeoSchema";
import HomeSolutionsSection from "@features/landing/presentation/components/HomeSolutionsSection";

const logger = new ConsoleLogger("[ErrorBoundary]");

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.warn("ErrorBoundary caught an error", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorBoundaryFallback />;
    }
    return this.props.children;
  }
}

const ErrorBoundaryFallback: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-base text-default flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">{t.errorBoundaryTitle}</h1>
        <p className="text-muted mb-4">{t.errorBoundaryMessage}</p>
        <button
          type="button"
          onClick={() => globalThis.location.reload()}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] px-6 py-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] min-h-[44px]"
        >
          {t.errorBoundaryButton}
        </button>
      </div>
    </div>
  );
};

// Note: every home section is eagerly imported (not lazy) because
// renderToString does not support Suspense boundaries — a lazy FAQ left the
// prerendered HTML without the FAQ that the FAQPage JSON-LD describes, and
// both modules are statically imported elsewhere, so lazy split nothing.
// Code-splitting these landing-page components provides negligible benefit
// since they're always rendered on the landing page.

/* Heading structure:
  / → H1 (Hero.tsx)
  H2: Dos herramientas para vender más (HomeSolutionsSection)
    H3: Carta digital → /carta-digital · H3: Tarjetas NFC → /tarjetas-nfc
  H2: Más servicios para tu negocio
    H3: Chatbots IA → /ia-chatbots-tenerife · H3: TPV → /tpv-restaurantes
  H2: ¿Por qué Digitaliza Tenerife? (stat strip only)
  H2: Opiniones (CartaDigitalReviews) · H2: FAQ · H2: Contacto
  Home is a hub: product content lives on each product's own URL (no
  duplicated content, no TPV module sections here — see /tpv-restaurantes).
  Hreflang: intentionally absent. Language is client state, not in the URL;
  do NOT re-add hreflang until URLs are language-addressable (change
  `i18n-url-routing`).
*/

const CANONICAL_URL = "https://digitalizatenerife.es/";
const PAGE_TITLE =
  "Digitaliza Tenerife | Carta digital, NFC e IA para negocios";
const PAGE_DESCRIPTION =
  "Carta digital sin comisiones, tarjetas NFC para reseñas de Google, chatbots con IA y TPV para restaurantes y negocios de Tenerife y Canarias.";

const App: React.FC = () => {
  const { t } = useLanguage();

  const faqGroups = useHomeFaqGroups();

  React.useEffect(() => {
    const scrollToHash = () => {
      const hash = globalThis.location.hash;
      if (hash) {
        // Strip query params (e.g. #contacto?servicio=X → #contacto)
        // to avoid invalid CSS selectors like '#contacto?servicio=X'
        const anchor = hash.includes("?") ? hash.split("?")[0] : hash;
        setTimeout(() => {
          document
            .querySelector(anchor)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    scrollToHash();
    globalThis.addEventListener("hashchange", scrollToHash);
    return () => globalThis.removeEventListener("hashchange", scrollToHash);
  }, []);

  const faqEntries = faqGroups.flatMap((group) =>
    group.items.map((item) => ({ question: item.q, answer: item.a })),
  );
  // Home is the hub: one Service node per product/service page.
  const schemaData = buildHomeSchema(SOLUTIONS, faqEntries);

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={CANONICAL_URL} />
        <link
          rel="author"
          href="https://digitalizatenerife.es/about"
          title="Digitaliza Tenerife"
        />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Digitaliza Tenerife" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og/home.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Digitaliza Tenerife: carta digital, NFC e IA para negocios locales"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://digitalizatenerife.es/og/home.png"
        />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>
      <PageShell extras={<DeferredExpertAssistant />}>
        <section id="inicio" aria-label="Inicio">
          <Hero />
        </section>
        {/* #soluciones anchor kept for the footer link and deep links. */}
        <div id="soluciones" aria-hidden="true" className="h-0" />
        <HomeSolutionsSection />
        <Section
          id="por-que"
          tone="alt"
          title="¿Por qué Digitaliza Tenerife?"
          intro="Democratizamos el acceso a la tecnología para los negocios locales de Canarias. No creemos en soluciones genéricas."
        >
          {/* Stats strip — i18n-driven. Values are verifiable facts stated
              elsewhere in the copy (5 languages: cartaFaqA3; 5s NFC review:
              tapReviewFeatSpeed; one-time payment: tapReviewHeroFeature1) —
              seo-trust-claims-cleanup PR2a, design.md D8. */}
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-md)] m-0 border-t border-[var(--color-border)] pt-[var(--space-lg)]">
            {[
              { value: t.statStrip1Value, label: t.statStrip1Label },
              { value: t.statStrip2Value, label: t.statStrip2Label },
              { value: t.statStrip3Value, label: t.statStrip3Label },
              { value: t.statStrip4Value, label: t.statStrip4Label },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="m-0 font-display text-3xl md:text-4xl font-bold text-default tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
        <section id="exito" aria-labelledby="exito-title" className="ds-section">
          <CartaDigitalReviews headingId="exito-title" />
        </section>
        <section
          id="faq"
          aria-labelledby="faq-title"
          className="ds-section ds-section--alt"
        >
          <HomeFaqSection />
        </section>
        <section id="contacto" aria-label="Contacto">
          <Contact />
        </section>
      </PageShell>
    </ErrorBoundary>
  );
};

export default App;
