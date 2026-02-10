/**
 * Supabase Auth Repository
 * 
 * Clean Architecture: Data Layer
 * 
 * Implementación del repositorio de autenticación usando Supabase Auth.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@shared/supabaseClient';
import { 
  IAuthRepository, 
  LoginCredentials, 
  AuthSession 
} from '../../domain/repositories/IAuthRepository';
import { AdminUser } from '../../domain/entities/AdminUser';

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

    // Verificar que el usuario tiene rol de admin en metadata
    const role = authData.user.user_metadata?.role as string;
    
    if (!role || !['admin', 'super_admin'].includes(role)) {
      // Cerrar sesión si no es admin
      await this.client.auth.signOut();
      throw new Error('Insufficient permissions');
    }

    // Crear entidad AdminUser
    const adminUser = AdminUser.create({
      id: authData.user.id,
      email: authData.user.email || '',
      role: role as 'admin' | 'super_admin',
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

    // Verificar rol
    const role = user.user_metadata?.role as string;
    
    if (!role || !['admin', 'super_admin'].includes(role)) {
      return null;
    }

    return AdminUser.create({
      id: user.id,
      email: user.email || '',
      role: role as 'admin' | 'super_admin',
      createdAt: new Date(user.created_at),
      lastLogin: new Date(),
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}
