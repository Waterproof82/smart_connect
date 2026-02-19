/**
 * Supabase Auth Repository
 * 
 * Clean Architecture: Data Layer
 * 
 * Implementación del repositorio de autenticación usando Supabase Auth.
 * 
 * SECURITY: Verifica email específico (admin@smartconnect.ai) en lugar de roles.
 * El email en JWT está verificado por Supabase Auth y no puede ser modificado por el usuario.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@shared/supabaseClient';
import { 
  IAuthRepository, 
  LoginCredentials, 
  AuthSession 
} from '../../domain/repositories/IAuthRepository';
import { AdminUser } from '../../domain/entities/AdminUser';

const ADMIN_EMAIL = 'admin@smartconnect.ai';

export class SupabaseAuthRepository implements IAuthRepository {
  private readonly client: SupabaseClient = supabase;

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    // Autenticar con Supabase
    const { data: authData, error: authError } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError || !authData.user) {
      throw new Error('Authentication failed');
    }

    // SECURITY: Verificar email específico del admin
    // El email en JWT está verificado por Supabase Auth
    const email = authData.user.email;

    if (email !== ADMIN_EMAIL) {
      // Cerrar sesión si no es el admin
      await this.client.auth.signOut();
      throw new Error('Insufficient permissions');
    }

    // Crear entidad AdminUser con rol de super_admin
    const adminUser = AdminUser.create({
      id: authData.user.id,
      email: email,
      role: 'super_admin', // El único admin tiene acceso completo
      createdAt: new Date(authData.user.created_at),
      lastLogin: new Date(),
    });

    // Calcular expiración (por defecto 24h)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      user: adminUser,
      token: authData.session?.access_token || '',
      expiresAt,
    };
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    
    if (error) {
      throw new Error(`Failed to logout: ${error.message}`);
    }
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    const { data: { user }, error } = await this.client.auth.getUser();

    if (error || !user) {
      return null;
    }

    // SECURITY: Verificar email específico del admin
    const email = user.email;

    if (email !== ADMIN_EMAIL) {
      return null;
    }

    return AdminUser.create({
      id: user.id,
      email: email,
      role: 'super_admin',
      createdAt: new Date(user.created_at),
      lastLogin: new Date(),
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}
