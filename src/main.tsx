
import React, { Suspense, Component, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';

// Lazy loading para rutas - AdminPanel solo se carga cuando se necesita
const AdminPanel = React.lazy(() =>
  import('@features/admin/presentation').then(module => ({
    default: module.AdminPanel
  }))
);

const NotFound = React.lazy(() =>
  import('@features/landing/presentation/components/NotFound').then(module => ({
    default: module.NotFound
  }))
);

const LoadingFallback = () => (
  <div className="min-h-screen bg-base flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
  </div>
);

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-default mb-4">Error al cargar la página</h1>
            <p className="text-muted mb-6">Hubo un problema cargando esta sección. Puede ser un error de red.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-xl font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Ensure dark mode only — remove any stale light theme class/storage
document.documentElement.classList.remove('light');
localStorage.removeItem('theme');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
