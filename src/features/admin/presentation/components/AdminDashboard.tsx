
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, LogOut, User } from 'lucide-react';
import { StatsDashboard } from './StatsDashboard';
import { DocumentList } from './DocumentList';
import { SettingsPanel } from './SettingsPanel';
import { useAdmin } from '../AdminContext';
import { ConsoleLogger } from '@core/domain/usecases/Logger';

const logger = new ConsoleLogger('[AdminDashboard]');

export const AdminDashboard: React.FC = () => {
  const { container, currentUser, onLogout } = useAdmin();
  const [statsKey, setStatsKey] = useState(0);

  const handleDocumentChange = () => {
    setStatsKey(prev => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await container.authRepository.logout();
      onLogout();
    } catch (err) {
      logger.error('Logout failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-base pb-10">
      <a href="#admin-main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--color-accent)] focus:text-[var(--color-on-accent)] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold">
        Saltar al contenido principal
      </a>
      <header className="bg-[var(--color-bg-alt)] border-b border-[var(--color-border)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-default hover:bg-[var(--color-surface)] rounded-lg transition-colors" aria-label="Volver al inicio">
                <Home className="w-5 h-5" />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold text-default">SmartConnect</h1>
                <span className="text-xs text-muted font-medium tracking-wide">PANEL ADMIN</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm text-default">{currentUser.email}</span>
                <span className="px-1.5 py-0.5 bg-[var(--color-accent-subtle)] text-[var(--color-primary)] rounded text-xs border border-[var(--color-accent-border)]">
                  {currentUser.role}
                </span>
              </div>
              <div className="md:hidden text-muted">
                <User className="w-5 h-5" />
              </div>
              <div className="h-6 w-px bg-[var(--color-border)] mx-1"></div>
              <button onClick={handleLogout} className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-[var(--color-error-text)] hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error-text)] rounded-lg transition-colors" aria-label="Cerrar sesión">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="admin-main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsDashboard key={statsKey} getStatsUseCase={container.getDocumentStatsUseCase} />

        <div className="md:flex md:items-center md:justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-default">Base de Conocimiento</h2>
            <p className="text-muted text-sm mt-1">Chatbot RAG - Gestión de documentos y embeddings</p>
          </div>
        </div>

        <DocumentList onDocumentChange={handleDocumentChange} />

        <div className="md:flex md:items-center md:justify-between mb-2 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-default">Configuración</h2>
            <p className="text-muted text-sm mt-1">Parámetros globales de la aplicación</p>
          </div>
        </div>

        <SettingsPanel />
      </main>
    </div>
  );
};