/**
 * Submit Lead Use Case
 * 
 * Orchestrates the business logic for submitting a lead.
 * Validates the lead and delegates to the repository for submission.
 */

import { Lead, LeadEntity, LeadSubmissionMeta } from '../entities';
import { ILeadRepository } from '../repositories';

export interface SubmitLeadResult {
  success: boolean;
  errors?: Record<keyof Lead, string>;
}

export class SubmitLeadUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  /**
   * Executes the use case to submit a lead
   * @param lead The lead to submit
   * @param meta Optional anti-bot transport metadata (D12) — passed through untouched
   * @returns Result with success status and validation errors if any
   */
  async execute(lead: Lead, meta?: LeadSubmissionMeta): Promise<SubmitLeadResult> {
    // Ensure we have a LeadEntity for validation
    const leadEntity = lead instanceof LeadEntity ? lead : new LeadEntity(lead);

    // Validate lead
    const errors = leadEntity.validate();
    const hasErrors = Object.values(errors).some(error => error !== '');

    if (hasErrors) {
      return {
        success: false,
        errors,
      };
    }

    // Submit to repository
    try {
      const submitted = await this.leadRepository.submitLead(lead, meta);

      return {
        success: submitted,
      };
    } catch (error) {
      console.error('Error in SubmitLeadUseCase:', error);
      return {
        success: false,
      };
    }
  }
}
