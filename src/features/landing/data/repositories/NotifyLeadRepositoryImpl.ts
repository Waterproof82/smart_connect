/**
 * Notify Lead Repository Implementation
 *
 * Implements ILeadRepository using NotifyLeadDataSource — the single lead
 * entry point (sdd/notify-lead-antibot, D13).
 */

import { Lead } from '../../domain/entities';
import { ILeadRepository } from '../../domain/repositories';
import { NotifyLeadDataSource } from '../datasources';

export class NotifyLeadRepositoryImpl implements ILeadRepository {
  constructor(private readonly notifyLeadDataSource: NotifyLeadDataSource) {}

  async submitLead(lead: Lead): Promise<boolean> {
    const payload = {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      service: lead.service,
      message: lead.message,
      submittedAt: new Date().toISOString(),
    };

    return await this.notifyLeadDataSource.sendLead(payload);
  }
}
