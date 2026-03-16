
import React, { Suspense, lazy, Component, ReactNode } from 'react';
import { Navbar } from '@features/landing/presentation/components/Navbar';
import { Hero } from '@features/landing/presentation/components/Hero';
import { Features } from '@features/landing/presentation/components/Features';
import { Contact } from '@features/landing/presentation/components/Contact';

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
    console.warn('ErrorBoundary caught an error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-base text-white flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Algo salió mal</h1>
            <p className="text-neutral-400 mb-4">Por favor, recarga la página.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy loading para componentes below-the-fold - reduce initial bundle
const SuccessStats = lazy(() => 
  import('@features/landing/presentation/components/SuccessStats').then(module => ({ 
    default: module.SuccessStats 
  }))
);

// Lazy loading para el Chatbot - solo se carga cuando el usuario interactúa
const ExpertAssistant = lazy(() =>
  import('@features/chatbot/presentation').then(module => ({ 
    default: module.ExpertAssistant 
  }))
);

const ChatbotLoading = () => (
  <div className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
  </div>
);

const SectionLoading = () => (
  <div className="py-20 md:py-32">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-8 rounded-[2.5rem] border border-white/5 animate-pulse">
            <div className="w-16 h-16 bg-white/5 rounded-2xl mb-6 mx-auto"></div>
            <div className="h-12 bg-white/5 rounded mb-3"></div>
            <div className="h-4 bg-white/5 rounded w-2/3 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize theme from localStorage (synchronous)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-base text-white">
      <a href="#inicio" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold">
        Saltar al contenido
      </a>
      <Navbar scrolled={scrolled} />
      <main>
        <section id="inicio"><Hero /></section>
        <section id="soluciones" className="py-20 md:py-32"><Features /></section>
        <section id="exito" className="py-20 md:py-32">
          <Suspense fallback={<SectionLoading />}>
            <SuccessStats />
          </Suspense>
        </section>
        <section id="contacto"><Contact /></section>
      </main>

      {/* AI Chatbot Assistant - Always visible */}
      <Suspense fallback={<ChatbotLoading />}>
        <ExpertAssistant />
      </Suspense>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-white/10 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <span className="font-bold text-xl text-white">SmartConnect <span className="text-blue-500">AI</span></span>
              <p className="text-neutral-500 text-sm mt-3 leading-relaxed">Tecnolog&iacute;a de pr&oacute;xima generaci&oacute;n para negocios locales.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Navegaci&oacute;n</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#soluciones" className="hover:text-white transition-colors">Soluciones</a></li>
                <li><a href="#exito" className="hover:text-white transition-colors">Casos de &Eacute;xito</a></li>
                <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><span className="cursor-default">Aviso Legal</span></li>
                <li><span className="cursor-default">Pol&iacute;tica de Privacidad</span></li>
                <li><span className="cursor-default">Cookies</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-neutral-500 text-sm">
            <p>&copy; 2026 SmartConnect AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
};

export default App;
