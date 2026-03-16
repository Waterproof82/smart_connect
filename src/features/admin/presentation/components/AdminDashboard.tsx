
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogOut, User } from 'lucide-react';
import { StatsDashboard } from './StatsDashboard';
import { DocumentList } from './DocumentList';
import { SettingsPanel } from './SettingsPanel';
import { useAdmin } from '../AdminContext';

export const AdminDashboard: React.FC = () => {
  const { container, currentUser, onLogout } = useAdmin();

  const handleLogout = async () => {
    try {
      await container.authRepository.logout();
      onLogout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-sc-dark pb-10">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 text-neutral-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Back to Home">
                <Home className="w-5 h-5" />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold text-white">SmartConnect</h1>
                <span className="text-[10px] md:text-xs text-neutral-400 font-medium tracking-wide">ADMIN PANEL</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm text-gray-200">{currentUser.email}</span>
                <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded text-[10px] border border-blue-800">
                  {currentUser.role}
                </span>
              </div>
              <div className="md:hidden text-neutral-400">
                <User className="w-5 h-5" />
              </div>
              <div className="h-6 w-px bg-gray-700 mx-1"></div>
              <button onClick={handleLogout} className="p-2 text-neutral-300 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsDashboard getStatsUseCase={container.getDocumentStatsUseCase} />
        
        <div className="md:flex md:items-center md:justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Knowledge Base</h2>
            <p className="text-neutral-400 text-sm mt-1">Chatbot RAG - Manage documents and embeddings</p>
          </div>
        </div>

        <DocumentList />

        <div className="md:flex md:items-center md:justify-between mb-2 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Configuración</h2>
            <p className="text-neutral-400 text-sm mt-1">Parámetros globales de la aplicación</p>
          </div>
        </div>

        <SettingsPanel />
      </main>
    </div>
  );
};