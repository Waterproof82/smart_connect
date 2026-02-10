/**
 * Admin Module Entry Point
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Componente principal que maneja autenticación y routing del admin.
 */

import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import UnauthorizedErrorPage from './components/errors/UnauthorizedErrorPage';
import { getAdminContainer } from './AdminContainer';
import { AdminUser } from '../domain/entities/AdminUser';
import { AuthSession } from '../domain/repositories/IAuthRepository';

export const AdminPanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const container = getAdminContainer();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await container.authRepository.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        // If error is a general error (not just unauthenticated), set error state
        if (err && typeof err === 'object' && 'code' in err && err.code === 'NOT_FOUND') {
          setGeneralError('NOT_FOUND');
        } else {
          setCurrentUser(null);
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSuccess = (session: AuthSession) => {
    setCurrentUser(session.user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };


  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-white">Checking authentication...</div>
      </div>
    );
  }

  // General error (e.g., 404)
  if (generalError) {
    return <UnauthorizedErrorPage />;
  }

  // Not authenticated - show login
  if (!currentUser) {
    return (
      <Login
        loginUseCase={container.loginAdminUseCase}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Authenticated - show dashboard
  return (
    <AdminDashboard
      getAllDocumentsUseCase={container.getAllDocumentsUseCase}
      getStatsUseCase={container.getDocumentStatsUseCase}
      deleteDocumentUseCase={container.deleteDocumentUseCase}
      updateDocumentUseCase={container.updateDocumentUseCase}
      createDocumentUseCase={container.createDocumentUseCase}
      authRepository={container.authRepository}
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
};

// Export components for external use
export { Login } from './components/Login';
export { AdminDashboard } from './components/AdminDashboard';
export { DocumentList } from './components/DocumentList';
export { StatsDashboard } from './components/StatsDashboard';
