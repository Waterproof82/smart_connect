/**
 * Supabase Settings Repository
 * 
 * Clean Architecture: Data Layer
 * 
 * Implementación del repositorio de settings usando Supabase.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@shared/supabaseClient';
import { ISettingsRepository, SettingsUpdateInput } from '../../domain/repositories/ISettingsRepository';
import { Settings } from '../../domain/entities/Settings';

export class SupabaseSettingsRepository implements ISettingsRepository {
  private readonly client: SupabaseClient = supabase;
  private readonly settingsId = 'global';

  /**
   * Obtiene la configuración global de la aplicación
   */
  async getSettings(): Promise<Settings> {
    const { data, error } = await this.client
      .from('app_settings')
      .select('*')
      .eq('id', this.settingsId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No existe, crear默认值
        return Settings.createDefault();
      }
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  /**
   * Actualiza la configuración global
   */
  async updateSettings(updates: SettingsUpdateInput): Promise<Settings> {
    // Construir payload solo con los campos proporcionados
    const updateData: Record<string, string> = {};
    
    if (updates.n8nWebhookUrl !== undefined) {
      updateData.n8n_webhook_url = updates.n8nWebhookUrl;
    }
    if (updates.contactEmail !== undefined) {
      updateData.contact_email = updates.contactEmail;
    }
    if (updates.whatsappPhone !== undefined) {
      updateData.whatsapp_phone = updates.whatsappPhone;
    }
    if (updates.physicalAddress !== undefined) {
      updateData.physical_address = updates.physicalAddress;
    }

    // Si no hay nada que actualizar, devolver settings actuales
    if (Object.keys(updateData).length === 0) {
      return this.getSettings();
    }

    const { data, error } = await this.client
      .from('app_settings')
      .update(updateData)
      .eq('id', this.settingsId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  /**
   * Convierte la fila de la DB a la entidad Settings
   */
  private mapToDomain(row: Record<string, unknown>): Settings {
    return Settings.create({
      id: row.id as string,
      n8nWebhookUrl: (row.n8n_webhook_url as string) || '',
      contactEmail: (row.contact_email as string) || '',
      whatsappPhone: (row.whatsapp_phone as string) || '',
      physicalAddress: (row.physical_address as string) || '',
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
