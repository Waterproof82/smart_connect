/**
 * Notify Lead Data Source
 *
 * Invokes the `notify-lead` Supabase Edge Function — the SINGLE lead
 * entry point (sdd/notify-lead-antibot, D13). notify-lead itself decides
 * server-side whether to forward to n8n or send via Brevo; the browser
 * never calls n8n directly and never sees its webhook URL.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@shared/supabaseClient';
import { ConsoleLogger } from '@core/domain/usecases';

const logger = new ConsoleLogger('[NotifyLead]');

/**
 * Payload sent to the `notify-lead` Edge Function.
 *
 * Deliberately NOT the n8n workflow's Spanish-key shape — this is our own
 * domain-aligned contract. notify-lead maps it internally (`buildN8nPayload`)
 * when it forwards to n8n, so this contract stays independent of the n8n
 * channel's shape (D4).
 */
export interface LeadNotificationPayload {
  name: string;
  company: string;
  email: string;
  service: string;
  message: string;
  submittedAt: string;
}

export class NotifyLeadDataSource {
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
