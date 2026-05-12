import { ISettingsRepository } from "../repositories/ISettingsRepository";
import { Settings } from "../entities/Settings";

export class GetAppSettingsUseCase {
  constructor(private settingsRepository: ISettingsRepository) {}

  async execute(): Promise<Settings> {
    return this.settingsRepository.getAppSettings();
  }
}
