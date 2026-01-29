/**
 * Dependency Injection Container for Landing Feature
 * 
 * This container follows Clean Architecture principles by wiring
 * dependencies from outer layers (infrastructure) to inner layers (domain).
 * 
 * Dependency Flow: Data Sources → Repositories → Use Cases → UI Components
 */

import { N8NWebhookDataSource } from '../data/datasources';
import { LeadRepositoryImpl } from '../data/repositories';
import { SubmitLeadUseCase } from '../domain/usecases';

/**
 * Container for all landing feature dependencies
 */
export class LandingContainer {
  // Use Cases (exposed to UI layer)
  public readonly submitLeadUseCase: SubmitLeadUseCase;

  constructor(webhookUrl: string) {
    // ===================================
    // 1. INFRASTRUCTURE LAYER (Data Sources)
    // ===================================
    const webhookDataSource = new N8NWebhookDataSource(webhookUrl);

    // ===================================
    // 2. DATA LAYER (Repository Implementations)
    // ===================================
    const leadRepository = new LeadRepositoryImpl(webhookDataSource);

    // ===================================
    // 3. DOMAIN LAYER (Use Cases)
    // ===================================
    this.submitLeadUseCase = new SubmitLeadUseCase(leadRepository);
  }
}

/**
 * Singleton instance for application-wide use
 */
let containerInstance: LandingContainer | null = null;

/**
 * Get or create the landing container singleton
 */
export function getLandingContainer(webhookUrl: string): LandingContainer {
  if (!containerInstance) {
    containerInstance = new LandingContainer(webhookUrl);
  }
  return containerInstance;
}

/**
 * Reset the container (useful for testing)
 */
export function resetLandingContainer(): void {
  containerInstance = null;
}
