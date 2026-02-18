/**
 * Admin Container (Dependency Injection)
 * 
 * Clean Architecture: Presentation Layer
 * 
 * Contenedor que maneja las dependencias del módulo Admin.
 */

import { SupabaseDocumentRepository } from '../data/repositories/SupabaseDocumentRepository';
import { SupabaseAuthRepository } from '../data/repositories/SupabaseAuthRepository';
import { SupabaseSettingsRepository } from '../data/repositories/SupabaseSettingsRepository';
import { GetAllDocumentsUseCase } from '../domain/usecases/GetAllDocumentsUseCase';
import { GetDocumentStatsUseCase } from '../domain/usecases/GetDocumentStatsUseCase';
import { DeleteDocumentUseCase } from '../domain/usecases/DeleteDocumentUseCase';
import { UpdateDocumentUseCase } from '../domain/usecases/UpdateDocumentUseCase';
import { CreateDocumentUseCase } from '../domain/usecases/CreateDocumentUseCase';
import { LoginAdminUseCase } from '../domain/usecases/LoginAdminUseCase';
import { GetSettingsUseCase } from '../domain/usecases/GetSettingsUseCase';
import { UpdateSettingsUseCase } from '../domain/usecases/UpdateSettingsUseCase';

let containerInstance: AdminContainer | null = null;

export class AdminContainer {
  // Repositories
  public readonly documentRepository: SupabaseDocumentRepository;
  public readonly authRepository: SupabaseAuthRepository;
  public readonly settingsRepository: SupabaseSettingsRepository;

  // Use Cases
  public readonly getAllDocumentsUseCase: GetAllDocumentsUseCase;
  public readonly getDocumentStatsUseCase: GetDocumentStatsUseCase;
  public readonly deleteDocumentUseCase: DeleteDocumentUseCase;
  public readonly updateDocumentUseCase: UpdateDocumentUseCase;
  public readonly createDocumentUseCase: CreateDocumentUseCase;
  public readonly loginAdminUseCase: LoginAdminUseCase;
  public readonly getSettingsUseCase: GetSettingsUseCase;
  public readonly updateSettingsUseCase: UpdateSettingsUseCase;

  constructor(_supabaseUrl: string, _supabaseKey: string) {
    // Initialize repositories
    this.documentRepository = new SupabaseDocumentRepository();
    this.authRepository = new SupabaseAuthRepository();
    this.settingsRepository = new SupabaseSettingsRepository();

    // Initialize use cases
    this.getAllDocumentsUseCase = new GetAllDocumentsUseCase(this.documentRepository);
    this.getDocumentStatsUseCase = new GetDocumentStatsUseCase(this.documentRepository);
    this.deleteDocumentUseCase = new DeleteDocumentUseCase(this.documentRepository);
    this.updateDocumentUseCase = new UpdateDocumentUseCase(this.documentRepository);
    this.createDocumentUseCase = new CreateDocumentUseCase(this.documentRepository);
    this.loginAdminUseCase = new LoginAdminUseCase(this.authRepository);
    this.getSettingsUseCase = new GetSettingsUseCase(this.settingsRepository);
    this.updateSettingsUseCase = new UpdateSettingsUseCase(this.settingsRepository);
  }
}

/**
 * Obtiene la instancia del contenedor (Singleton)
 */
export function getAdminContainer(): AdminContainer {
  if (!containerInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    containerInstance = new AdminContainer(supabaseUrl, supabaseKey);
  }

  return containerInstance;
}
