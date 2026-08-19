/**
 * Email Notify Data Source
 *
 * Handles the Brevo email fallback channel by invoking the `notify-lead`
 * Supabase Edge Function. Symmetric to N8NWebhookDataSource, but for the
 * `n8nEnabled === false` path (ADR-1, ADR-5).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@shared/supabaseClient';
import { ConsoleLogger } from '@core/domain/usecases';

const logger = new ConsoleLogger('[EmailNotify]');

/**
 * Payload sent to the `notify-lead` Edge Function.
 *
 * Deliberately NOT the same shape as `WebhookPayload` (n8n's Spanish keys):
 * this is our own domain-aligned contract, independent of the n8n channel,
 * so changing one channel cannot break the other (ADR-5).
 */
export interface LeadNotificationPayload {
  name: string;
  company: string;
  email: string;
  service: string;
  message: string;
  submittedAt: string;
}

export class EmailNotifyDataSource {
  constructor(private readonly client?: SupabaseClient) {}

  /**
   * Sends lead data via the `notify-lead` Edge Function (Brevo).
   *
   * Resolves the client via the async `getSupabase()` chokepoint (U3) when
   * no explicit client was injected — never a static import.
   */
  async sendLead(payload: LeadNotificationPayload): Promise<boolean> {
    try {
      const client = this.client ?? (await getSupabase());
      const { data, error } = await client.functions.invoke('notify-lead', {
        body: payload,
      });

      if (error) {
        logger.error('notify-lead invocation failed', error);
        return false;
      }

      return data?.ok === true;
    } catch (error) {
      logger.error('notify-lead threw', error);
      return false;
    }
  }
}
