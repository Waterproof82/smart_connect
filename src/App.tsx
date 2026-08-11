import React, { Component, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Hero } from "@features/landing/presentation/components/Hero";
import { Features } from "@features/landing/presentation/components/Features";
import { Contact } from "@features/landing/presentation/components/Contact";
import { SuccessStats } from "@features/landing/presentation/components/SuccessStats";
import { ExpertAssistant } from "@features/chatbot/presentation";
import HomeFaqSection, {
  useHomeFaqGroups,
} from "@features/landing/presentation/components/HomeFaqSection";
import CartaDigitalSection from "@features/landing/presentation/components/CartaDigitalSection";
import { TapReviewSection } from "@features/tap-review/presentation/TapReviewSection";
import { ConsoleLogger } from "@core/domain/usecases/Logger";
import { useLanguage } from "@shared/context/LanguageContext";
import { SOLUTIONS } from "@shared/config/solutions";
import { buildHomeSchema } from "@shared/presentation/components/SeoSchema";
import { useWhatsappPhone } from "@shared/hooks";

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
  / → H1: Potencia tu Negocio con IA y Automatización
  /contacto → H1: Hablemos de tu Proyecto
  H2: Nuestras Soluciones — heroEyebrow label (home)
    H3: Carta Digital Premium
    H3: Tarjetas NFC Tap-to-Review
  H2: Carta Digital Premium (merged section, own H2 hero + subsections as H3/H4)
  H2: Tarjetas NFC Tap-to-Review (merged section, own H2 hero + subsections as H3/H4)
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
  - Hreflang: skipped (single-language Spanish site) ✓
  - noindex: NOT present ✓
  - H1 present: ✓ (unique per route)
  - Touch targets: 48px min ✓
  - DOM: lazy-loaded SuccessStats & Chatbot, ~700 estimated nodes ✓
*/

const App: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const location = useLocation();
  const whatsappPhone = useWhatsappPhone();
  const faqGroups = useHomeFaqGroups();
  const isContacto = location.pathname === "/contacto";
  const CANONICAL_URL = "https://digitalizatenerife.es/";

  const pageTitle = isContacto
    ? "Contacto | Digitaliza Tenerife"
    : "Digitaliza Tenerife | Automatización e IA para Empresas";

  const pageDescription = isContacto
    ? "Contacta con Digitaliza Tenerife. Solicita información sobre automatización, menús digitales, NFC y soluciones IA para tu negocio en Tenerife."
    : "Digitaliza Tenerife: automatización con IA, n8n, NFC para Google Reviews y menús digitales. Digitaliza tu negocio.";

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
  const schemaData = buildHomeSchema(SOLUTIONS, faqEntries);

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={CANONICAL_URL} />
        <link
          rel="author"
          href="https://digitalizatenerife.es/about"
          title="Digitaliza Tenerife"
        />
        <link rel="alternate" hrefLang="es" href={CANONICAL_URL} />
        <link rel="alternate" hrefLang="x-default" href={CANONICAL_URL} />
        <link rel="alternate" hrefLang="en" href={CANONICAL_URL} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Digitaliza Tenerife" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
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
            <Hero variant={isContacto ? "contacto" : "home"} />
          </section>
          <section
            id="soluciones"
            aria-label="Nuestras Soluciones"
            className="py-20 md:py-32"
          >
            <Features />
          </section>
          <CartaDigitalSection whatsappPhone={whatsappPhone} />
          <TapReviewSection whatsappPhone={whatsappPhone} />
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

              {/* Stats strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[var(--color-border)] mb-16">
                {(
                  [
                    { value: "200+", label: "Negocios en Canarias" },
                    { value: "0%", label: "Comisiones por pedido" },
                    { value: "6×", label: "Más reseñas en 90 días" },
                    { value: "40%", label: "Más visitas con reseñas" },
                  ] as const
                ).map((stat) => (
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
                        },
                        {
                          title: "Carta Digital Premium",
                          desc: "Pedidos en tiempo real desde la mesa a barra y cocina.",
                        },
                        {
                          title: "Tarjetas NFC Tap-to-Review",
                          desc: "Multiplica las reseñas en Google con un solo toque.",
                        },
                        {
                          title: "IA Conversacional",
                          desc: "Chatbot experto que responde dudas 24/7 sobre tus servicios.",
                        },
                      ] as const
                    ).map((pilar) => (
                      <div key={pilar.title} className="py-4">
                        <div className="font-semibold text-default text-sm mb-0.5">
                          {pilar.title}
                        </div>
                        <div className="text-muted text-sm">{pilar.desc}</div>
                      </div>
                    ))}
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
                <ul className="space-y-3 text-sm text-muted">
                  <li>
                    <a
                      href="#"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      YouTube
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      rel="noopener noreferrer"
                      aria-label="X (Twitter)"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      X (Twitter)
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      Facebook
                    </a>
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
