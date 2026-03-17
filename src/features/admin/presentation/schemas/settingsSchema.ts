import { z } from 'zod';

export const settingsSchema = z.object({
  n8nWebhookUrl: z
    .string()
    .url('La URL no parece válida. Ejemplo: https://tu-n8n.com/webhook')
    .or(z.literal('')),
  contactEmail: z
    .string()
    .email('El correo no parece válido. Ejemplo: tu@email.com')
    .or(z.literal('')),
  whatsappPhone: z
    .string()
    .regex(/^(\+?\d{7,15})?$/, 'Usa formato internacional. Ejemplo: +5491112345678'),
  physicalAddress: z
    .string()
    .max(200, 'La dirección es muy larga (máximo 200 caracteres)'),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
