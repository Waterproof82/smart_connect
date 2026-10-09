/**
 * Lead Repository Interface
 * 
 * Contract for lead submission operations.
 * Implementations must handle the actual HTTP communication.
 */

import { Lead, LeadSubmissionMeta } from '../entities';

export interface ILeadRepository {
  /**
   * Submits a lead to the webhook endpoint
   * @param lead The lead entity to submit
   * @param meta Optional anti-bot transport metadata (D12) — honeypot value + fill-time
   * @returns Promise resolving to true if successful, false otherwise
   */
  submitLead(lead: Lead, meta?: LeadSubmissionMeta): Promise<boolean>;
}
