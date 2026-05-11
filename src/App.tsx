import React, { Suspense, lazy, Component, ReactNode } from "react";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import { Hero } from "@features/landing/presentation/components/Hero";
import { Features } from "@features/landing/presentation/components/Features";
import { Contact } from "@features/landing/presentation/components/Contact";
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

// Lazy loading para componentes below-the-fold - reduce initial bundle
const SuccessStats = lazy(() =>
  import("@features/landing/presentation/components/SuccessStats").then(
    (module) => ({
      default: module.SuccessStats,
    }),
  ),
);

// Lazy loading para el Chatbot - solo se carga cuando el usuario interactúa
const ExpertAssistant = lazy(() =>
  import("@features/chatbot/presentation").then((module) => ({
    default: module.ExpertAssistant,
  })),
);

const ChatbotLoading = () => (
  <div className="fixed bottom-4 right-4 w-16 h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-lg">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-on-accent)]"></div>
  </div>
);

const SectionLoading = () => (
  <div className="py-20 md:py-32">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main large card */}
        <div className="md:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-[2.5rem] animate-pulse">
          <div className="w-16 h-16 bg-[var(--color-border)] rounded-2xl mb-6"></div>
          <div className="h-12 bg-[var(--color-border)] rounded mb-4 w-2/3"></div>
          <div className="h-4 bg-[var(--color-border)] rounded w-full"></div>
          <div className="h-4 bg-[var(--color-border)] rounded w-4/5 mt-2"></div>
        </div>
        {/* Two smaller cards */}
        <div className="md:col-span-5 grid gap-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl animate-pulse">
            <div className="w-12 h-12 bg-[var(--color-border)] rounded-xl mb-4"></div>
            <div className="h-8 bg-[var(--color-border)] rounded w-1/2"></div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl animate-pulse">
            <div className="w-12 h-12 bg-[var(--color-border)] rounded-xl mb-4"></div>
            <div className="h-8 bg-[var(--color-border)] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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
        setTimeout(() => {
          document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    scrollToHash();
    globalThis.addEventListener("hashchange", scrollToHash);
    return () => globalThis.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <ErrorBoundary>
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
          <section
            id="soluciones"
            aria-label="Nuestras Soluciones"
            className="py-20 md:py-32"
          >
            <Features />
          </section>
          <section
            id="exito"
            aria-label="Casos de Éxito"
            className="py-20 md:py-32"
          >
            <Suspense fallback={<SectionLoading />}>
              <SuccessStats />
            </Suspense>
          </section>
          <section id="contacto" aria-label="Contacto">
            <Contact />
          </section>
        </main>

        {/* AI Chatbot Assistant - Always visible */}
        <Suspense fallback={<ChatbotLoading />}>
          <ExpertAssistant />
        </Suspense>

        {/* Footer */}
        <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] pt-16 pb-8">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-12">
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
                  {t.footerLegalTitle}
                </h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>
                    <a
                      href="mailto:legal@smartconnect.ai?subject=Aviso%20Legal"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerLegalAviso}
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:legal@smartconnect.ai?subject=Privacidad"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerLegalPrivacidad}
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:legal@smartconnect.ai?subject=Cookies"
                      className="hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors"
                    >
                      {t.footerLegalCookies}
                    </a>
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
