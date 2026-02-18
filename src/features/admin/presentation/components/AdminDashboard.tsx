import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogOut, User } from 'lucide-react';
import { StatsDashboard } from './StatsDashboard';
import { DocumentList } from './DocumentList';
import { SettingsPanel } from './SettingsPanel';
import { GetAllDocumentsUseCase } from '../../domain/usecases/GetAllDocumentsUseCase';
import { GetDocumentStatsUseCase } from '../../domain/usecases/GetDocumentStatsUseCase';
import { DeleteDocumentUseCase } from '../../domain/usecases/DeleteDocumentUseCase';
import { UpdateDocumentUseCase } from '../../domain/usecases/UpdateDocumentUseCase';
import { CreateDocumentUseCase } from '../../domain/usecases/CreateDocumentUseCase';
import { GetSettingsUseCase } from '../../domain/usecases/GetSettingsUseCase';
import { UpdateSettingsUseCase } from '../../domain/usecases/UpdateSettingsUseCase';
import { AdminUser } from '../../domain/entities/AdminUser';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

interface AdminDashboardProps {
  getAllDocumentsUseCase: GetAllDocumentsUseCase;
  getStatsUseCase: GetDocumentStatsUseCase;
  deleteDocumentUseCase: DeleteDocumentUseCase;
  updateDocumentUseCase: UpdateDocumentUseCase;
  createDocumentUseCase: CreateDocumentUseCase;
  getSettingsUseCase: GetSettingsUseCase;
  updateSettingsUseCase: UpdateSettingsUseCase;
  authRepository: IAuthRepository;
  currentUser: AdminUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  getAllDocumentsUseCase,
  getStatsUseCase,
  deleteDocumentUseCase,
  updateDocumentUseCase,
  createDocumentUseCase,
  getSettingsUseCase,
  updateSettingsUseCase,
  authRepository,
  currentUser,
  onLogout,
}) => {
  const [statsKey, setStatsKey] = React.useState(0);

  const handleLogout = async () => {
    try {
      await authRepository.logout();
      onLogout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const refreshStats = () => {
    setStatsKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#020408] pb-10">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <Link 
                to="/"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Back to Home"
              >
                <Home className="w-5 h-5" />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold text-white leading-tight">SmartConnect</h1>
                <span className="text-[10px] md:text-xs text-gray-400 font-medium tracking-wide">ADMIN PANEL</span>
              </div>
            </div>

            {/* User Area */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm text-gray-200">{currentUser.email}</span>
                <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded text-[10px] border border-blue-800">
                  {currentUser.role}
                </span>
              </div>
              
              {/* Mobile User Icon (replacing full email) */}
              <div className="md:hidden text-gray-400">
                <User className="w-5 h-5" />
              </div>

              <div className="h-6 w-px bg-gray-700 mx-1"></div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsDashboard key={statsKey} getStatsUseCase={getStatsUseCase} />
        
        <div className="md:flex md:items-center md:justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Knowledge Base</h2>
            <p className="text-gray-400 text-sm mt-1">Manage documents and embeddings</p>
          </div>
        </div>

        <DocumentList
          getAllDocumentsUseCase={getAllDocumentsUseCase}
          deleteDocumentUseCase={deleteDocumentUseCase}
          updateDocumentUseCase={updateDocumentUseCase}
          createDocumentUseCase={createDocumentUseCase}
          currentUser={currentUser}
          onDocumentChange={refreshStats}
        />

        {/* Settings Section */}
        <div className="md:flex md:items-center md:justify-between mb-2 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Configuración</h2>
            <p className="text-gray-400 text-sm mt-1">Parámetros globales de la aplicación</p>
          </div>
        </div>

        <SettingsPanel
          getSettingsUseCase={getSettingsUseCase}
          updateSettingsUseCase={updateSettingsUseCase}
        />
      </main>
    </div>
  );
};