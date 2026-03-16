/**
 * Admin Context
 *
 * Clean Architecture: Presentation Layer
 *
 * Provides the DI container and current user via React Context,
 * eliminating prop drilling through AdminDashboard → child components.
 */

import React, { createContext, useContext } from 'react';
import { AdminContainer } from './AdminContainer';
import { AdminUser } from '../domain/entities/AdminUser';

interface AdminContextValue {
  container: AdminContainer;
  currentUser: AdminUser;
  onLogout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

interface AdminProviderProps {
  container: AdminContainer;
  currentUser: AdminUser;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({
  container,
  currentUser,
  onLogout,
  children,
}) => (
  <AdminContext.Provider value={{ container, currentUser, onLogout }}>
    {children}
  </AdminContext.Provider>
);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
