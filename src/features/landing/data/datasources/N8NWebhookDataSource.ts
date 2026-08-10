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
   * Guards against empty/malformed webhook URLs.
   *
   * Deliberately NOT a "looks like a placeholder" string check (ADR-3): magic-substring
   * routing was the root cause of the fake-success bypass this replaces. A reserved TLD
   * like `.invalid` is a syntactically valid URL — it is allowed through here and left to
   * fail honestly at the `fetch` call below.
   */
  private isUsableWebhookUrl(raw: string): boolean {
    if (!raw?.trim()) return false;
    try {
      const { protocol } = new URL(raw);
      return protocol === 'https:' || protocol === 'http:'; // http kept for self-hosted/LAN n8n
    } catch {
      return false;
    }
  }

  /**
   * Sends lead data to n8n webhook
   */
  async sendLead(payload: WebhookPayload): Promise<boolean> {
    if (!this.isUsableWebhookUrl(this.webhookUrl)) {
      logger.error('n8n enabled but webhook URL is missing or invalid');
      return false; // no fetch, no fake success
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
