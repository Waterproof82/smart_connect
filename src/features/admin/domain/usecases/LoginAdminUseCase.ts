/**
 * LoginAdmin Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para autenticación de administradores.
 * Implementa validaciones de seguridad OWASP.
 */

import { IAuthRepository, LoginCredentials, AuthSession } from '../repositories/IAuthRepository';

export class LoginAdminUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthSession> {
    // Validar inputs (OWASP A03: Injection)
    this._validateCredentials(credentials);

    // Intentar login
    try {
      const session = await this.authRepository.login(credentials);
      return session;
    } catch {
      // No revelar información específica sobre qué falló (OWASP A04: Insecure Design)
      throw new Error('Invalid credentials');
    }
  }

  private _validateCredentials(credentials: LoginCredentials): void {
    if (!credentials.email?.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (!credentials.password || credentials.password.length < 8) {
      throw new Error('Invalid password format');
    }

    // Sanitizar email (prevenir injection)
    const sanitizedEmail = credentials.email.trim().toLowerCase();
    if (sanitizedEmail !== credentials.email) {
      throw new Error('Invalid email format');
    }
  }
}
