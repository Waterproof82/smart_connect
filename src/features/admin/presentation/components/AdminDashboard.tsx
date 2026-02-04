/**
 * Admin Dashboard Page
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Página principal del panel de administración.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { StatsDashboard } from './StatsDashboard';
import { DocumentList } from './DocumentList';
import { GetAllDocumentsUseCase } from '../../domain/usecases/GetAllDocumentsUseCase';
import { GetDocumentStatsUseCase } from '../../domain/usecases/GetDocumentStatsUseCase';
import { DeleteDocumentUseCase } from '../../domain/usecases/DeleteDocumentUseCase';
import { UpdateDocumentUseCase } from '../../domain/usecases/UpdateDocumentUseCase';
import { AdminUser } from '../../domain/entities/AdminUser';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

interface AdminDashboardProps {
  getAllDocumentsUseCase: GetAllDocumentsUseCase;
  getStatsUseCase: GetDocumentStatsUseCase;
  deleteDocumentUseCase: DeleteDocumentUseCase;
  updateDocumentUseCase: UpdateDocumentUseCase;
  authRepository: IAuthRepository;
  currentUser: AdminUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  getAllDocumentsUseCase,
  getStatsUseCase,
  deleteDocumentUseCase,
  updateDocumentUseCase,
  authRepository,
  currentUser,
  onLogout,
}) => {
  const handleLogout = async () => {
    try {
      await authRepository.logout();
      onLogout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408]">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                title="Back to Home"
              >
                <Home className="w-5 h-5" />
              </Link>
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-white">SmartConnect Admin</h1>
                <span className="ml-4 text-sm text-gray-400">RAG Document Management</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {currentUser.email}
                <span className="ml-2 px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-md hover:border-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsDashboard getStatsUseCase={getStatsUseCase} />
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Documents</h2>
          <p className="text-gray-400">Manage RAG knowledge base documents</p>
        </div>

        <DocumentList
          getAllDocumentsUseCase={getAllDocumentsUseCase}
          deleteDocumentUseCase={deleteDocumentUseCase}
          updateDocumentUseCase={updateDocumentUseCase}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
};
