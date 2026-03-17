import { z } from 'zod';
import DOMPurify from 'dompurify';

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<img[\s\S]*?onerror[\s\S]*?>/gi,
  /<svg[\s\S]*?onload[\s\S]*?>/gi,
  /data:text\/html/gi,
];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '¿Cómo te llamas?')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/,
      'Usa solo letras y espacios (2-50 caracteres)',
    ),
  company: z
    .string()
    .trim()
    .min(1, '¿Para qué empresa trabajas?')
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s&'.,\u002D]{2,100}$/,
      'El nombre debe tener entre 2 y 100 caracteres',
    ),
  email: z
    .string()
    .trim()
    .min(1, '¿Cuál es tu correo?')
    .email('El correo no parece válido. Ejemplo: tu@email.com'),
  service: z
    .string()
    .min(1, '¿Qué servicio te interesa?')
    .refine((val) => val !== 'Selecciona una opción', {
      message: 'Selecciona una opción de la lista',
    }),
  message: z
    .string()
    .trim()
    .min(1, '¿En qué podemos ayudarte?')
    .refine(
      (val) => !DANGEROUS_PATTERNS.some((p) => p.test(val)),
      'El mensaje contiene caracteres no permitidos',
    )
    .refine(
      (val) => {
        const sanitized = DOMPurify.sanitize(val, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true,
        });
        return sanitized.length >= 10;
      },
      'El mensaje es muy corto (mínimo 10 caracteres)',
    )
    .refine(
      (val) => {
        const sanitized = DOMPurify.sanitize(val, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true,
        });
        return sanitized.length <= 1000;
      },
      'El mensaje es muy largo (máximo 1000 caracteres)',
    ),
});

export type ContactFormData = z.infer<typeof contactSchema>;
