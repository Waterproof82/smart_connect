import { z } from 'zod';

export const settingsSchema = z.object({
  n8nWebhookUrl: z
    .string()
    .url('URL inválida')
    .or(z.literal('')),
  contactEmail: z
    .string()
    .email('Formato de email inválido')
    .or(z.literal('')),
  whatsappPhone: z
    .string()
    .regex(/^(\+?\d{7,15})?$/, 'Formato de teléfono inválido'),
  physicalAddress: z
    .string()
    .max(200, 'Máximo 200 caracteres'),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
