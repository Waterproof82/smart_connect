import React, { Component, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { SiteFooter } from "@shared/components/SiteFooter";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Hero } from "@features/landing/presentation/components/Hero";
import { SuccessStats } from "@features/landing/presentation/components/SuccessStats";
import { ExpertAssistant } from "@features/chatbot/presentation";
import { useHomeFaqGroups } from "@features/landing/presentation/components/HomeFaqSection";
import { ConsoleLogger } from "@core/domain/usecases/Logger";
import { useLanguage } from "@shared/context/LanguageContext";
import { SOLUTIONS } from "@shared/config/solutions";
import { buildHomeSchema } from "@shared/presentation/components/SeoSchema";
import HomeSolutionsSection from "@features/landing/presentation/components/HomeSolutionsSection";

const LazyHomeFaqSection = React.lazy(
  () => import("@features/landing/presentation/components/HomeFaqSection"),
);
const LazyContact = React.lazy(
  () => import("@features/landing/presentation/components/Contact"),
);

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

// Note: SuccessStats and ExpertAssistant are eagerly imported (not lazy)
// because renderToString does not support Suspense boundaries.
// Code-splitting these landing-page components provides negligible benefit
// since they're always rendered on the landing page.

/* Heading structure:
  / → H1 (Hero.tsx)
  H2: Dos herramientas para vender más (HomeSolutionsSection)
    H3: Carta digital → /carta-digital · H3: Tarjetas NFC → /tarjetas-nfc
  H2: Más servicios para tu negocio
    H3: Chatbots IA → /ia-chatbots-tenerife · H3: TPV → /tpv-restaurantes
  H2: ¿Por qué Digitaliza Tenerife? (stat strip only)
  H2: Resultados reales (SuccessStats) · H2: FAQ · H2: Contacto
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
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const faqGroups = useHomeFaqGroups();

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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
          content="https://digitalizatenerife.es/icon.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>
      <div className="min-h-screen bg-base text-default">
        <div
          ref={sentinelRef}
          className="absolute top-[50px] h-px w-px"
          aria-hidden="true"
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--color-accent)] focus:text-[var(--color-on-accent)] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
        >
          {t.skipLink}
        </a>
        <Navbar scrolled={scrolled} />
        <main id="main" aria-label="Contenido principal">
          <section id="inicio" aria-label="Inicio">
            <Hero />
          </section>
          {/* #soluciones anchor kept for the footer link and deep links. */}
          <div id="soluciones" aria-hidden="true" className="h-0" />
          <HomeSolutionsSection />
          <section
            id="por-que"
            aria-label="Por qué Digitaliza Tenerife"
            className="py-16 md:py-24 bg-[var(--color-bg-alt)]"
          >
            <div className="container mx-auto px-6">
              {/* Left-aligned header */}
              <div className="max-w-2xl mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  ¿Por qué Digitaliza Tenerife?
                </h2>
                <p className="text-muted leading-relaxed text-lg">
                  Democratizamos el acceso a la tecnología para los negocios
                  locales de Canarias. No creemos en soluciones genéricas.
                </p>
              </div>

              {/* Stats strip — i18n-driven (PR4), same truthful values as before */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[var(--color-border)]">
                {[
                  { value: t.statStrip1Value, label: t.statStrip1Label },
                  { value: t.statStrip2Value, label: t.statStrip2Label },
                  { value: t.statStrip3Value, label: t.statStrip3Label },
                  { value: t.statStrip4Value, label: t.statStrip4Label },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl md:text-4xl font-bold text-default tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section
            id="exito"
            aria-label="Casos de Éxito"
            className="py-20 md:py-32"
          >
            <SuccessStats />
          </section>
          <section
            id="faq"
            aria-label="Preguntas Frecuentes"
            className="py-20 md:py-32"
          >
            <React.Suspense fallback={<div style={{ height: "300px" }} />}>
              <LazyHomeFaqSection />
            </React.Suspense>
          </section>
          <section id="contacto" aria-label="Contacto">
            <React.Suspense fallback={<div style={{ height: "600px" }} />}>
              <LazyContact />
            </React.Suspense>
          </section>
        </main>

        {/* AI Chatbot Assistant */}
        <ExpertAssistant />

        <SiteFooter />
      </div>
    </ErrorBoundary>
  );
};

export default App;
