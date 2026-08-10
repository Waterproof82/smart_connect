/**
 * Email Lead Repository Implementation
 *
 * Implements ILeadRepository using the EmailNotifyDataSource (Brevo channel).
 * Mirrors LeadRepositoryImpl's shape (design ADR-5).
 */

import { Lead } from '../../domain/entities';
import { ILeadRepository } from '../../domain/repositories';
import { EmailNotifyDataSource } from '../datasources';

export class EmailLeadRepositoryImpl implements ILeadRepository {
  constructor(private readonly emailDataSource: EmailNotifyDataSource) {}

  async submitLead(lead: Lead): Promise<boolean> {
    const payload = {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      service: lead.service,
      message: lead.message,
      submittedAt: new Date().toISOString(),
    };

    return await this.emailDataSource.sendLead(payload);
  }
}
