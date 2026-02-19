/**
 * GetSettings Use Case
 * 
 * Clean Architecture: Domain Layer
 * 
 * Caso de uso para obtener la configuración global de la aplicación.
 */

import { ISettingsRepository } from '../repositories/ISettingsRepository';
import { Settings } from '../entities/Settings';

export class GetSettingsUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async execute(): Promise<Settings> {
    return await this.settingsRepository.getSettings();
  }
}
