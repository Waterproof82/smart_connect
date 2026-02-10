/**
 * Admin User Entity
 * 
 * Clean Architecture: Domain Layer
 * 
 * Representa un usuario administrador del sistema.
 * Contiene lógica de validación y reglas de negocio.
 */

export interface AdminUserProps {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'anonymous';
  createdAt: Date;
  lastLogin?: Date;
}

export class AdminUser {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: 'admin' | 'super_admin' | 'anonymous',
    public readonly createdAt: Date,
    public readonly lastLogin?: Date
  ) {
    this.validate();
  }

  /**
   * Factory method para crear un AdminUser
   */
  static create(props: AdminUserProps): AdminUser {
    return new AdminUser(
      props.id,
      props.email,
      props.role,
      props.createdAt,
      props.lastLogin
    );
  }

  /**
   * Validación de reglas de negocio
   */
  private validate(): void {
    if (!this.email?.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (!['admin', 'super_admin', 'anonymous'].includes(this.role)) {
      throw new Error('Invalid role');
    }
  }

  /**
   * Verifica si el usuario tiene permisos de super admin
   */
  isSuperAdmin(): boolean {
    return this.role === 'super_admin';
  }

  /**
   * Verifica si puede realizar una acción específica
   * Solo 'super_admin' puede modificar, crear o eliminar.
   * 'admin' solo puede leer.
   */
  canPerform(action: 'read' | 'write' | 'delete' | 'update' | 'create' | 'edit'): boolean {
    if (this.role === 'super_admin') {
      return true;
    }
    // 'admin' solo puede leer
    if (this.role === 'admin') {
      return action === 'read';
    }
    // 'anonymous' solo puede leer (usar el chatbot)
    if (this.role === 'anonymous') {
      return action === 'read';
    }
    return false;
  }
}
