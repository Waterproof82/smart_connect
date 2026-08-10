/**
 * Dependency Injection Container for Landing Feature
 *
 * This container follows Clean Architecture principles by wiring
 * dependencies from outer layers (infrastructure) to inner layers (domain).
 *
 * Dependency Flow: Data Sources → Repositories → Use Cases → UI Components
 *
 * Design ADR-2: this is a PURE factory — no module-level memoization.
 * `getLandingContainer`/`resetLandingContainer` (the old memoized singleton)
 * cached the FIRST instance and silently ignored every later config, which
 * meant an admin toggling `n8nEnabled` would appear to do nothing until a
 * full page reload. The container holds no expensive/stateful resource (three
 * `new` calls, no I/O), so the correct cache is the caller's own component-
 * scoped `useMemo`, keyed by the settings it derives from — not a global.
 */

import { N8NWebhookDataSource, EmailNotifyDataSource } from '../data/datasources';
import { LeadRepositoryImpl, EmailLeadRepositoryImpl } from '../data/repositories';
import { ILeadRepository } from '../domain/repositories';
import { SubmitLeadUseCase } from '../domain/usecases';

/**
 * Configuration required to select the lead delivery strategy.
 *
 * The container branches on exactly ONE axis: `n8nEnabled`. Webhook URL
 * validity is a data-layer concern owned by `N8NWebhookDataSource` (ADR-3) —
 * moving it up here would force this container to silently reroute on a bad
 * URL, which is the exact bug this design replaces.
 */
export interface LandingContainerConfig {
  readonly n8nEnabled: boolean;
  readonly n8nWebhookUrl: string;
}

/**
 * Container for all landing feature dependencies
 */
export class LandingContainer {
  // Use Cases (exposed to UI layer)
  public readonly submitLeadUseCase: SubmitLeadUseCase;

  /** Observable branch — for tests and logging (design ADR-2 regression guard). */
  public readonly leadChannel: 'n8n' | 'email';

  constructor(config: LandingContainerConfig) {
    // ===================================
    // 1. INFRASTRUCTURE LAYER (Data Sources) + 2. DATA LAYER (Repositories)
    // ===================================
    const leadRepository: ILeadRepository = config.n8nEnabled
      ? new LeadRepositoryImpl(new N8NWebhookDataSource(config.n8nWebhookUrl))
      : new EmailLeadRepositoryImpl(new EmailNotifyDataSource());

    this.leadChannel = config.n8nEnabled ? 'n8n' : 'email';

    // ===================================
    // 3. DOMAIN LAYER (Use Cases)
    // ===================================
    this.submitLeadUseCase = new SubmitLeadUseCase(leadRepository);
  }
}

/**
 * Creates a new LandingContainer from the given config.
 *
 * Pure factory — every call builds a fresh instance. Callers that need to
 * avoid rebuilding on every render (e.g. `Contact.tsx`) should memoize this
 * themselves, keyed by the config values they depend on.
 */
export function createLandingContainer(config: LandingContainerConfig): LandingContainer {
  return new LandingContainer(config);
}
