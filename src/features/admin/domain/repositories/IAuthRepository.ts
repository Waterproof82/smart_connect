/**
 * Auth Repository Interface
 * 
 * Clean Architecture: Domain Layer
 * 
 * Define el contrato para autenticación de administradores.
 */

import { AdminUser } from '../entities/AdminUser';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: Date;
}

export type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

export interface AuthSubscription {
  unsubscribe(): void;
}

export interface IAuthRepository {
  /**
   * Autentica un usuario administrador
   */
  login(credentials: LoginCredentials): Promise<AuthSession>;

  /**
   * Cierra sesión del usuario
   */
  logout(): Promise<void>;

  /**
   * Obtiene el usuario actual autenticado
   */
  getCurrentUser(): Promise<AdminUser | null>;

  /**
   * Verifica si hay una sesión activa
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Listens for auth state changes (sign-in, sign-out, token refresh)
   */
  onAuthStateChange(callback: (event: AuthEvent) => void): { data: { subscription: AuthSubscription } };
}
