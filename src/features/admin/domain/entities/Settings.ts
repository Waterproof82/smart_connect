/**
 * Settings Entity (Admin View)
 * 
 * Clean Architecture: Domain Layer
 * 
 * Representa la configuración global de la aplicación.
 */

export interface SettingsProps {
  id: string;
  n8nWebhookUrl: string;
  n8nEnabled: boolean;
  contactEmail: string;
  whatsappPhone: string;
  physicalAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Settings {
  public readonly id: string;
  public readonly n8nWebhookUrl: string;
  public readonly n8nEnabled: boolean;
  public readonly contactEmail: string;
  public readonly whatsappPhone: string;
  public readonly physicalAddress: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: SettingsProps) {
    this.id = props.id;
    this.n8nWebhookUrl = props.n8nWebhookUrl;
    this.n8nEnabled = props.n8nEnabled;
    this.contactEmail = props.contactEmail;
    this.whatsappPhone = props.whatsappPhone;
    this.physicalAddress = props.physicalAddress;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.validate();
  }

  /**
   * Factory method para crear Settings
   */
  static create(props: SettingsProps): Settings {
    return new Settings(props);
  }

  /**
   * Crea una instancia vacía para默认值
   */
  static createDefault(): Settings {
    const now = new Date();
    return new Settings({
      id: 'global',
      n8nWebhookUrl: '',
      n8nEnabled: false,
      contactEmail: '',
      whatsappPhone: '',
      physicalAddress: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validación de reglas de negocio
   */
  private validate(): void {
    // Validar email de contacto si no está vacío
    if (this.contactEmail && !this.isValidEmail(this.contactEmail)) {
      throw new Error('Invalid contact email format');
    }

    // Validar URL de webhook si no está vacía
    if (this.n8nWebhookUrl && !this.isValidUrl(this.n8nWebhookUrl)) {
      throw new Error('Invalid n8n webhook URL format');
    }
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crea una copia con valores actualizados
   */
  withUpdates(updates: Partial<Omit<SettingsProps, 'id' | 'createdAt' | 'updatedAt'>>): Settings {
    return new Settings({
      id: this.id,
      n8nWebhookUrl: updates.n8nWebhookUrl ?? this.n8nWebhookUrl,
      n8nEnabled: updates.n8nEnabled ?? this.n8nEnabled,
      contactEmail: updates.contactEmail ?? this.contactEmail,
      whatsappPhone: updates.whatsappPhone ?? this.whatsappPhone,
      physicalAddress: updates.physicalAddress ?? this.physicalAddress,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Verifica si hay cambios pendientes (si updatedAt es muy reciente)
   */
  hasRecentChanges(): boolean {
    const now = new Date();
    const diff = now.getTime() - this.updatedAt.getTime();
    // Consideramos "reciente" si es menor a 5 segundos
    return diff < 5000;
  }
}
