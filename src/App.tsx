import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Workflow, Utensils, Monitor, Bot } from "lucide-react";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Hero } from "@features/landing/presentation/components/Hero";
import { Contact } from "@features/landing/presentation/components/Contact";
import { SuccessStats } from "@features/landing/presentation/components/SuccessStats";
import { ExpertAssistant } from "@features/chatbot/presentation";
import HomeFaqSection, {
  useHomeFaqGroups,
} from "@features/landing/presentation/components/HomeFaqSection";
import { TpvModulesSection } from "@shared/components/tpv/TpvModulesSection";
import { ConsoleLogger } from "@core/domain/usecases/Logger";
import { useLanguage } from "@shared/context/LanguageContext";
import { TPV_MODULES } from "@shared/config/tpvModules";
import { buildHomeSchema } from "@shared/presentation/components/SeoSchema";
import { useWhatsappPhone } from "@shared/hooks";
import { accentStyle } from "@shared/config/accents";

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
  / → H1: Aumenta tu facturación, ahorra horas cada semana (outcome-first, PR4)
  (PR4: TpvModulesSection renders 13 TPV module sections, each its own H2,
   sorted by TPV_MODULES' frozen `order` — see shared/config/tpvModules.ts.
   "tienda-carta-digital" (order 13, last) mounts the existing
   CartaDigitalSection sub-tree; the other 12 are PR5-7 placeholders.)
  (PR3: NFC review cards un-merged to their own /tarjetas-nfc route — no longer on home)
  (PR9: Features.tsx's "Nuestras Soluciones" grid retired — it only
   duplicated the fuller tienda-carta-digital module below and still
   rendered a real NFC teaser card, which violated the "no NFC content on
   home" requirement. #soluciones now wraps TpvModulesSection directly.)
  H2: Resultados reales que transforman negocios
    H3: Aumento Promedio
    H3: Satisfacción
    H3: Reseñas Ganadas
    H3: Clientes Activos
  H2: Impulsa tu Negocio Hoy
    H3: [Email]
    H3: [WhatsApp]
    H3: [Location]
    H3: Síguenos (Social Media)
  (No heading levels skipped — valid H1→H2→H3→H4 hierarchy)
  SEO checklist verification:
  - Title: "Digitaliza Tenerife: IA y Automatización para Negocios" (50 chars) ✓
  - Meta desc: 111 chars ✓ (100-130 range)
  - Viewport: width=device-width, initial-scale=1.0 ✓
  - Hreflang: intentionally absent. Language is client state
    (LanguageContext useState + localStorage), never in the URL, so every
    language would resolve to this same canonical — an invalid alternate set
    that Google ignores. Do NOT re-add hreflang until URLs are language-
    addressable; that is change `i18n-url-routing`. ✓
  - noindex: NOT present ✓
  - H1 present: ✓ (unique per route)
  - Touch targets: 48px min ✓
  - DOM: lazy-loaded SuccessStats & Chatbot, ~700 estimated nodes ✓
*/

const CANONICAL_URL = "https://digitalizatenerife.es/";
const PAGE_TITLE = "Digitaliza Tenerife | Automatización e IA para Empresas";
const PAGE_DESCRIPTION =
  "Digitaliza Tenerife: automatización con IA, n8n, NFC para Google Reviews y menús digitales. Digitaliza tu negocio.";

const App: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const whatsappPhone = useWhatsappPhone();
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
  // PR4: home's structured data reflects the 13 TPV modules, not the
  // top-level SOLUTIONS catalog — no NFC Service node (NFC lives at its own
  // /tarjetas-nfc route with its own schema, see TapReviewPage.tsx).
  const schemaData = buildHomeSchema(TPV_MODULES, faqEntries);

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
          {/* Scroll-anchor sentinel (no own landmark/aria-label — each TPV
              module section below owns its own <section id> + heading) so
              the footer's #soluciones link and any existing deep links keep
              resolving after Features.tsx's grid was retired (PR9). */}
          <div id="soluciones" aria-hidden="true" className="h-0" />
          <TpvModulesSection whatsappPhone={whatsappPhone} />
          <section
            id="por-que"
            aria-label="Por qué Digitaliza Tenerife"
            className="py-20 md:py-32 bg-[var(--color-bg-alt)]"
          >
            <div className="container mx-auto px-6">
              {/* Left-aligned header */}
              <div className="max-w-2xl mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  ¿Por qué Digitaliza Tenerife?
                </h2>
                <p className="text-muted leading-relaxed text-lg">
                  Democratizamos el acceso a la tecnología para los negocios
                  locales de Canarias. No creemos en soluciones genéricas.
                </p>
              </div>

              {/* Stats strip — i18n-driven (PR4), same truthful values as before */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[var(--color-border)] mb-16">
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

              {/* Asymmetric grid: Misión (1fr) + Pilares (2fr) */}
              <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
                <div>
                  <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 opacity-70">
                    Misión y Visión
                  </p>
                  <p className="text-muted leading-relaxed text-base mb-4">
                    Cada bar, restaurante o comercio tiene necesidades únicas y
                    merece herramientas diseñadas para su realidad.
                  </p>
                  <p className="text-muted leading-relaxed text-base">
                    Nuestra plataforma funciona como un ecosistema unificado,
                    no como piezas sueltas.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 opacity-70">
                    Pilares Tecnológicos
                  </p>
                  <div className="divide-y divide-[var(--color-border)]">
                    {(
                      [
                        {
                          title: "Automatización con n8n",
                          desc: "Flujos que conectan CRM, email, WhatsApp y redes sociales.",
                          icon: Workflow,
                          accent: "--color-icon-indigo",
                        },
                        {
                          title: "Carta Digital Premium",
                          desc: "Pedidos en tiempo real desde la mesa a barra y cocina.",
                          icon: Utensils,
                          accent: "--color-icon-emerald",
                        },
                        {
                          title: "Plataforma TPV Todo-en-Uno",
                          desc: "Cobro, comandero, cocina, stock y reservas en un solo sistema.",
                          icon: Monitor,
                          accent: "--color-icon-coral",
                        },
                        {
                          title: "IA Conversacional",
                          desc: "Chatbot experto que responde dudas 24/7 sobre tus servicios.",
                          icon: Bot,
                          accent: "--color-icon-magenta",
                        },
                      ] as const
                    ).map((pilar) => {
                      const Icon = pilar.icon;
                      return (
                        <div
                          key={pilar.title}
                          className="py-4 flex gap-3"
                          style={accentStyle(pilar.accent)}
                        >
                          <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[color:var(--tpv-accent)] tpv-accent-chip">
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="font-semibold text-default text-sm mb-0.5">
                              {pilar.title}
                            </div>
                            <div className="text-muted text-sm">{pilar.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Closing statement */}
              <div className="border-t border-[var(--color-border)] pt-10">
                <p className="text-base text-muted leading-relaxed max-w-3xl">
                  Digitalizar tu negocio ya no es una opción — es una necesidad.
                  Los clientes buscan restaurantes en Google, leen reseñas antes
                  de visitar un local, y esperan poder pedir desde su móvil. Con
                  Digitaliza Tenerife, no solo te ponés al día — te adelantás
                  a la competencia.
                </p>
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
            <HomeFaqSection />
          </section>
          <section id="contacto" aria-label="Contacto">
            <Contact />
          </section>
        </main>

        {/* AI Chatbot Assistant */}
        <ExpertAssistant />

        {/* Footer */}
        <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] pt-16 pb-8">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12 mb-12">
              <div>
                <span className="font-bold text-xl text-default">
                  Digitaliza{" "}
                  <span className="text-[var(--color-primary)]">Tenerife</span>
                </span>
                <p className="text-muted text-sm mt-3 leading-relaxed">
                  {t.footerTagline}
                </p>
              </div>
              <nav aria-label="Navegación del footer">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
                  {t.footerNavTitle}
                </h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>
                    <a
                      href="#inicio"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerNavInicio}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#soluciones"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerNavSoluciones}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#exito"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerNavExito}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#por-que"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      Por Qué Nosotros
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contacto"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerNavContacto}
                    </a>
                  </li>
                </ul>
              </nav>
              <div>
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
                  {t.footerSocialTitle}
                </h3>
                {/* Social accounts not live yet — non-interactive placeholders
                    (S6844: an href="#" is not a valid, navigable address).
                    Swap each <span> back to an <a href="..."> once the real
                    account URL exists. */}
                <ul className="space-y-3 text-sm text-muted">
                  <li>
                    <span>YouTube</span>
                  </li>
                  <li>
                    <span>X (Twitter)</span>
                  </li>
                  <li>
                    <span>LinkedIn</span>
                  </li>
                  <li>
                    <span>Instagram</span>
                  </li>
                  <li>
                    <span>Facebook</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
                  {t.footerLegalTitle}
                </h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>
                    <Link
                      to="/about"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      Sobre Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal/aviso"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerLegalAviso}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal/privacidad"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerLegalPrivacidad}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/legal/cookies"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerLegalCookies}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[var(--color-border)] pt-8 text-center text-muted text-sm">
              <p>&copy; {t.footerCopyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
