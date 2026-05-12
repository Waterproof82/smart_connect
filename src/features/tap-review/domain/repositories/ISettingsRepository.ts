import { Settings } from "../entities/Settings";
export interface ISettingsRepository {
  getAppSettings(): Promise<Settings>;
}
