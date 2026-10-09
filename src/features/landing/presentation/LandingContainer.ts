/**
 * Dependency Injection Container for Landing Feature
 *
 * This container follows Clean Architecture principles by wiring
 * dependencies from outer layers (infrastructure) to inner layers (domain).
 *
 * Dependency Flow: Data Sources → Repositories → Use Cases → UI Components
 *
 * sdd/notify-lead-antibot (D13, D14): `notify-lead` is now the SINGLE lead
 * entry point — there is no more n8n-vs-email branch to wire here. The
 * container takes no config and needs no settings to be built, which is why
 * `Contact.tsx` can build it with `useMemo(() => createLandingContainer(), [])`
 * instead of waiting on `getAppSettings()`.
 *
 * Still a PURE factory (design ADR-2 regression guard carried forward): no
 * module-level memoization, every call builds a fresh instance.
 */

import { NotifyLeadDataSource } from '../data/datasources';
import { NotifyLeadRepositoryImpl } from '../data/repositories';
import { ILeadRepository } from '../domain/repositories';
import { SubmitLeadUseCase } from '../domain/usecases';

/**
 * Container for all landing feature dependencies
 */
export class LandingContainer {
  // Use Cases (exposed to UI layer)
  public readonly submitLeadUseCase: SubmitLeadUseCase;

  constructor() {
    // ===================================
    // 1. INFRASTRUCTURE LAYER (Data Sources) + 2. DATA LAYER (Repositories)
    // ===================================
    const leadRepository: ILeadRepository = new NotifyLeadRepositoryImpl(new NotifyLeadDataSource());

    // ===================================
    // 3. DOMAIN LAYER (Use Cases)
    // ===================================
    this.submitLeadUseCase = new SubmitLeadUseCase(leadRepository);
  }
}

/**
 * Creates a new LandingContainer.
 *
 * Pure factory — every call builds a fresh instance. Callers that need to
 * avoid rebuilding on every render (e.g. `Contact.tsx`) should memoize this
 * themselves.
 */
export function createLandingContainer(): LandingContainer {
  return new LandingContainer();
}
