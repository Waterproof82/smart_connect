/**
 * Admin Module Entry Point
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Componente principal que maneja autenticación y routing del admin.
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminProvider } from './AdminContext';
import UnauthorizedErrorPage from './components/errors/UnauthorizedErrorPage';
import { getAdminContainer } from './AdminContainer';
import { AdminUser } from '../domain/entities/AdminUser';
import { AuthSession } from '../domain/repositories/IAuthRepository';

export const AdminPanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const container = getAdminContainer();

  const noIndexHelmet = (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
      <title>Admin Panel - SmartConnect AI</title>
    </Helmet>
  );

  // Check authentication on mount and listen for session changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await container.authRepository.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
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

    // Listen for auth state changes (e.g., token refresh failures, sign-outs)
    const { data: { subscription } } = container.authRepository.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
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
      <div className="min-h-screen bg-base flex items-center justify-center">
        {noIndexHelmet}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[var(--color-accent-border)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[var(--color-primary)] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[var(--color-primary)] text-sm font-medium animate-pulse">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // General error (e.g., 404)
  if (generalError) {
    return <>{noIndexHelmet}<UnauthorizedErrorPage /></>;
  }

  // Not authenticated - show login
  if (!currentUser) {
    return (
      <>{noIndexHelmet}<Login
        loginUseCase={container.loginAdminUseCase}
        onLoginSuccess={handleLoginSuccess}
      /></>
    );
  }

  // Authenticated - show dashboard
  return (
    <AdminProvider container={container} currentUser={currentUser} onLogout={handleLogout}>
      {noIndexHelmet}
      <AdminDashboard />
    </AdminProvider>
  );
};

// Export components for external use
export { Login } from './components/Login';
export { AdminDashboard } from './components/AdminDashboard';
export { DocumentList } from './components/DocumentList';
export { StatsDashboard } from './components/StatsDashboard';
export { SettingsPanel } from './components/SettingsPanel';
