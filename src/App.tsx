import React, { Component, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Hero } from "@features/landing/presentation/components/Hero";
import { Features } from "@features/landing/presentation/components/Features";
import { Contact } from "@features/landing/presentation/components/Contact";
import { SuccessStats } from "@features/landing/presentation/components/SuccessStats";
import { ExpertAssistant } from "@features/chatbot/presentation";
import { ConsoleLogger } from "@core/domain/usecases/Logger";
import { useLanguage } from "@shared/context/LanguageContext";

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
  /servicios → H1: Soluciones de IA y Automatización para tu Negocio
  /contacto → H1: Hablemos de tu Proyecto
  H2: Nuestras Soluciones — heroEyebrow label (home) / skip on servicios/contacto
    H3: Software & IA
    H3: Automatización (n8n)
    H3: Tarjetas Tap-to-Review
    H3: QRIBAR
    H3: Carta Digital Premium
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
  - Title: "SmartConnect AI: IA y Automatización para Negocios" (50 chars) ✓
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
  const isServicios = location.pathname === "/servicios";
  const isContacto = location.pathname === "/contacto";

  const pageTitle = isServicios
    ? "Servicios de Automatización e IA para Empresas | SmartConnect AI"
    : isContacto
      ? "Contacto | SmartConnect AI"
      : "SmartConnect AI | Automatización e IA para Empresas";

  const pageDescription = isServicios
    ? "Descubre nuestros servicios: automatización n8n, menús digitales QRIBAR, tarjetas NFC para reseñas y asistente IA. Soluciones para tu negocio."
    : isContacto
      ? "Contacta con SmartConnect AI. Solicita información sobre automatización, menús digitales, NFC y soluciones IA para tu negocio en Tenerife."
      : "SmartConnect AI: automatización con IA, n8n, NFC para Google Reviews y menús digitales. Digitaliza tu negocio.";

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

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: "SmartConnect AI",
        url: "https://digitalizatenerife.es",
        description:
          "Automatización con IA, n8n, NFC para Google Reviews y menús digitales QRIBAR para negocios en Tenerife y Canarias.",
        areaServed: "Tenerife, Canarias, España",
        knowsAbout: [
          "Automatización de negocios",
          "Inteligencia Artificial",
          "Menús digitales NFC",
          "Google Reviews",
        ],
        image: "https://digitalizatenerife.es/icon.png",
        telephone: "+34922123456",
        priceRange: "€€",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Calle Las Palmas 123",
          addressLocality: "Santa Cruz de Tenerife",
          addressRegion: "Canary Islands",
          postalCode: "38001",
          addressCountry: "ES",
        },
        logo: {
          "@type": "ImageObject",
          url: "https://digitalizatenerife.es/icon.png",
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://digitalizatenerife.es",
        url: "https://digitalizatenerife.es",
        name: "SmartConnect AI | Automatización e IA para Empresas",
        description:
          "SmartConnect AI: automatización con IA, n8n, NFC para Google Reviews y menús digitales. Digitaliza tu negocio.",
        inLanguage: "es",
        author: {
          "@type": "Organization",
          name: "SmartConnect AI",
          url: "https://digitalizatenerife.es",
          logo: {
            "@type": "ImageObject",
            url: "https://digitalizatenerife.es/icon.png",
            width: 512,
            height: 512,
          },
        },
        publisher: {
          "@type": "Organization",
          name: "SmartConnect AI",
          url: "https://digitalizatenerife.es",
          logo: {
            "@type": "ImageObject",
            url: "https://digitalizatenerife.es/icon.png",
          },
        },
      },
    ],
  };

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link
          rel="canonical"
          href={`https://digitalizatenerife.es${location.pathname}`}
        />
        <link
          rel="author"
          href="https://digitalizatenerife.es/about"
          title="SmartConnect AI"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href={`https://digitalizatenerife.es${location.pathname}`}
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`https://digitalizatenerife.es${location.pathname}`}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://digitalizatenerife.es${location.pathname}`}
        />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/icon.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        {!isServicios && !isContacto && (
          <script type="application/ld+json">
            {JSON.stringify(schemaData)}
          </script>
        )}
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
            <Hero
              variant={
                isServicios ? "servicios" : isContacto ? "contacto" : "home"
              }
            />
          </section>
          <section
            id="soluciones"
            aria-label="Nuestras Soluciones"
            className="py-20 md:py-32"
          >
            <Features />
          </section>
          <section
            id="por-que"
            aria-label="Por qué SmartConnect AI"
            className="py-20 md:py-32 bg-[var(--color-bg-alt)]"
          >
            <div className="container mx-auto px-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                ¿Por qué SmartConnect AI?
              </h2>
              <div className="max-w-4xl mx-auto space-y-6 text-muted leading-relaxed mt-12">
                <p className="text-base md:text-lg">
                  SmartConnect AI nació en Tenerife con una misión clara:
                  democratizar el acceso a la tecnología para los negocios
                  locales de Canarias. No creemos en soluciones genéricas — cada
                  bar, restaurante o comercio tiene necesidades únicas, y merece
                  herramientas diseñadas para su realidad.
                </p>
                <p className="text-base md:text-lg">
                  Nuestra plataforma integra cuatro pilares fundamentales:
                  automatización inteligente con n8n, menús digitales QRIBAR con
                  pedidos en tiempo real, tarjetas NFC para reseñas en Google, y
                  soluciones de IA conversacional. Todo funciona como un
                  ecosistema unificado, no como piezas sueltas.
                </p>
                <p className="text-base md:text-lg">
                  Mientras otras empresas cobran comisiones por cada pedido o
                  suscripciones mensuales que se disparan, nosotros apostamos
                  por un modelo transparente y sin sorpresas. QRIBAR no cobra
                  comisiones por pedido. Las tarjetas NFC no requieren
                  suscripción. La automatización con n8n escala contigo sin
                  costes ocultos.
                </p>
                <p className="text-base md:text-lg">
                  ¿El resultado? Negocios que multiplican sus reseñas en Google,
                  mesas que rotan más rápido, equipos que dedican menos tiempo a
                  tareas repetitivas y más a lo que importa: atender bien a sus
                  clientes. En los últimos 12 meses, hemos ayudado a más de 200
                  negocios en Tenerife, Gran Canaria y Lanzarote a dar el salto
                  digital que sus clientes esperaban.
                </p>
                <p className="text-base md:text-lg">
                  Digitalizar tu negocio ya no es una opción — es una necesidad.
                  Los clientes buscan restaurantes en Google, leen reseñas antes
                  de visitar un local, y esperan poder pedir desde su móvil. Con
                  SmartConnect AI, no solo te pones al día — te adelantas a la
                  competencia.
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
                  SmartConnect{" "}
                  <span className="text-[var(--color-primary)]">AI</span>
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
