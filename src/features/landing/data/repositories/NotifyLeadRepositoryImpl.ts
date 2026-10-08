/**
 * Notify Lead Repository Implementation
 *
 * Implements ILeadRepository using NotifyLeadDataSource — the single lead
 * entry point (sdd/notify-lead-antibot, D13).
 */

import { Lead, LeadSubmissionMeta } from '../../domain/entities';
import { ILeadRepository } from '../../domain/repositories';
import { LeadNotificationPayload, NotifyLeadDataSource } from '../datasources';

export class NotifyLeadRepositoryImpl implements ILeadRepository {
  constructor(private readonly notifyLeadDataSource: NotifyLeadDataSource) {}

  async submitLead(lead: Lead, meta?: LeadSubmissionMeta): Promise<boolean> {
    const payload: LeadNotificationPayload = {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      service: lead.service,
      message: lead.message,
      submittedAt: new Date().toISOString(),
      // Only attached when the caller supplied meta — omitting the keys
      // entirely (rather than sending `undefined`) keeps a stale cached
      // client without anti-bot support tolerant-mode-compatible (D11).
      ...(meta ? { website: meta.website, elapsedMs: meta.elapsedMs } : {}),
    };

    return await this.notifyLeadDataSource.sendLead(payload);
  }
}
