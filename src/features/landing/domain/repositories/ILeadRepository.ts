/**
 * Lead Repository Interface
 * 
 * Contract for lead submission operations.
 * Implementations must handle the actual HTTP communication.
 */

import { Lead } from '../entities';

export interface ILeadRepository {
  /**
   * Submits a lead to the webhook endpoint
   * @param lead The lead entity to submit
   * @returns Promise resolving to true if successful, false otherwise
   */
  submitLead(lead: Lead): Promise<boolean>;
}
