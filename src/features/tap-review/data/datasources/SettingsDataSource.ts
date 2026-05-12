import { Settings } from "../../domain/entities/Settings";

export interface SettingsDataSource {
  getSettings(): Promise<Settings>;
}

export class SettingsDataSourceImpl implements SettingsDataSource {
  async getSettings(): Promise<Settings> {
    return {
      id: "1",
      name: "appSettings",
      value: "enabled",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
