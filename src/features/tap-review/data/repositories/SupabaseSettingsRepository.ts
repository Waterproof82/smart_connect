/**
 * Supabase Settings Repository
 *
 * Clean Architecture: Data Layer
 *
 * Implementación del repositorio de settings usando Supabase.
 * REGLAS:
 * - Usar import.meta.env (no process.env) para variables de entorno
 * - Reutilizar el cliente supabase existente en shared/
 */

import { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { Settings } from "../../domain/entities/Settings";
import { supabase } from "@shared/supabaseClient";

export class SupabaseSettingsRepository implements ISettingsRepository {
  async getAppSettings(): Promise<Settings> {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as Settings;
  }
}
