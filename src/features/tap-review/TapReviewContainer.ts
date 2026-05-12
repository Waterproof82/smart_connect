import { GetAppSettingsUseCase } from "./domain/usecases/GetAppSettingsUseCase";
import { SupabaseSettingsRepository } from "./data/repositories/SupabaseSettingsRepository";

class TapReviewContainer {
  private static instance: TapReviewContainer;
  private settingsRepository: SupabaseSettingsRepository;
  private getAppSettingsUseCase: GetAppSettingsUseCase;

  private constructor() {
    this.settingsRepository = new SupabaseSettingsRepository();
    this.getAppSettingsUseCase = new GetAppSettingsUseCase(
      this.settingsRepository,
    );
  }

  public static getInstance(): TapReviewContainer {
    if (!TapReviewContainer.instance) {
      TapReviewContainer.instance = new TapReviewContainer();
    }
    return TapReviewContainer.instance;
  }

  public getGetAppSettingsUseCase(): GetAppSettingsUseCase {
    return this.getAppSettingsUseCase;
  }
}

export default TapReviewContainer;
