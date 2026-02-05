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
}
