/**
 * N8N Webhook Data Source
 * 
 * Handles HTTP communication with n8n webhook endpoint.
 * Responsible for sending lead data to the automation backend.
 */

import { NetworkError } from '@core/domain/entities';
import { ConsoleLogger } from '@core/domain/usecases';

const logger = new ConsoleLogger('[N8NWebhook]');

export interface WebhookPayload {
  nombre: string;
  empresa: string;
  email: string;
  servicio_interes: string;
  mensaje_cuerpo: string;
  timestamp?: string;
}

export class N8NWebhookDataSource {
  constructor(private readonly webhookUrl: string) {}

  /**
   * Sends lead data to n8n webhook
   */
  async sendLead(payload: WebhookPayload): Promise<boolean> {
    // Skip webhook if URL is not configured (development mode)
    if (!this.webhookUrl || 
        this.webhookUrl.trim() === '' || 
        this.webhookUrl.includes('placeholder') ||
        this.webhookUrl.includes('your_') ||
        this.webhookUrl.includes('.invalid')) {
      return true; // Return success to avoid blocking form submission
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.error('Webhook error', new NetworkError(`HTTP ${response.status}`, response.status));
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error al enviar lead a n8n', error);
      return false;
    }
  }
}
