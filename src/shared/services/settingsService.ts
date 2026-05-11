/**
 * Settings Service
 *
 * Shared service to fetch application settings from Supabase.
 * Used by Landing page to display dynamic contact information.
 */

import { supabase } from "@shared/supabaseClient";

export interface AppSettings {
  n8nWebhookUrl: string;
  contactEmail: string;
  whatsappPhone: string;
  physicalAddress: string;
}

/**
 * Fetches application settings from Supabase
 */
export async function getAppSettings(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (error) {
      console.warn("Failed to fetch app settings:", error.message || error);
      return getDefaultSettings();
    }

    if (!data) {
      return getDefaultSettings();
    }

    return {
      n8nWebhookUrl: data.n8n_webhook_url || "",
      contactEmail: data.contact_email || "",
      whatsappPhone: data.whatsapp_phone || "",
      physicalAddress: data.physical_address || "",
    };
  } catch (error) {
    console.warn("Error fetching app settings:", error);
    return getDefaultSettings();
  }
}

/**
 * Returns default settings
 */
function getDefaultSettings(): AppSettings {
  return {
    n8nWebhookUrl: "",
    contactEmail: "",
    whatsappPhone: "",
    physicalAddress: "",
  };
}
