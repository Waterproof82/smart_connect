/**
 * Settings Repository Interface
 * 
 * Clean Architecture: Domain Layer
 * 
 * Define el contrato para acceder a la configuración global.
 * La implementación concreta estará en la capa Data.
 */

import { Settings } from '../entities/Settings';

export interface SettingsUpdateInput {
  n8nWebhookUrl?: string;
  contactEmail?: string;
  whatsappPhone?: string;
  physicalAddress?: string;
}

export interface ISettingsRepository {
  /**
   * Obtiene la configuración global
   * @returns Settings con la configuración actual
   * @throws Error si no se puede obtener la configuración
   */
  getSettings(): Promise<Settings>;

  /**
   * Actualiza la configuración global
   * @param updates - Campos a actualizar
   * @returns Settings con la configuración actualizada
   * @throws Error si la actualización falla
   */
  updateSettings(updates: SettingsUpdateInput): Promise<Settings>;
}
