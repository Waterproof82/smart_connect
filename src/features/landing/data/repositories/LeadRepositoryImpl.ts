/**
 * Lead Repository Implementation
 * 
 * Implements ILeadRepository using N8N webhook data source.
 * Maps domain entities to data transfer objects.
 */

import { Lead } from '../../domain/entities';
import { ILeadRepository } from '../../domain/repositories';
import { N8NWebhookDataSource } from '../datasources';

export class LeadRepositoryImpl implements ILeadRepository {
  constructor(private readonly webhookDataSource: N8NWebhookDataSource) {}

  async submitLead(lead: Lead): Promise<boolean> {
    // Convert domain entity to webhook payload
    const webhookPayload = {
      nombre: lead.name,
      empresa: lead.company,
      email: lead.email,
      servicio_interes: lead.service,
      mensaje_cuerpo: lead.message,
      timestamp: new Date().toISOString(),
    };

    return await this.webhookDataSource.sendLead(webhookPayload);
  }
}
