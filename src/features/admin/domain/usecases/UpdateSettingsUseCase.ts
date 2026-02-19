/**
 * UpdateSettings Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para actualizar la configuración global de la aplicación.
 */

import { ISettingsRepository, SettingsUpdateInput } from '../repositories/ISettingsRepository';
import { Settings } from '../entities/Settings';

export class UpdateSettingsUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async execute(updates: SettingsUpdateInput): Promise<Settings> {
    // Validar que al menos un campo tenga valor
    const hasValues = Object.values(updates).some(v => v !== undefined && v !== '');
    
    if (!hasValues) {
      throw new Error('At least one field must be provided to update');
    }

    // Validar formato de email si se proporciona
    if (updates.contactEmail && !this.isValidEmail(updates.contactEmail)) {
      throw new Error('Invalid contact email format');
    }

    // Validar formato de URL si se proporciona
    if (updates.n8nWebhookUrl && !this.isValidUrl(updates.n8nWebhookUrl)) {
      throw new Error('Invalid n8n webhook URL format');
    }

    return await this.settingsRepository.updateSettings(updates);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
