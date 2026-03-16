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
    .min(1, 'El nombre es requerido')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/,
      'Solo letras y espacios (2-50 caracteres)',
    ),
  company: z
    .string()
    .trim()
    .min(1, 'La empresa es requerida')
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s&'.,\u002D]{2,100}$/,
      'Nombre de empresa válido (2-100 caracteres)',
    ),
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido (ejemplo@dominio.com)'),
  service: z
    .string()
    .min(1, 'Debes seleccionar un servicio')
    .refine((val) => val !== 'Selecciona una opción', {
      message: 'Debes seleccionar un servicio',
    }),
  message: z
    .string()
    .trim()
    .min(1, 'El mensaje es requerido')
    .refine(
      (val) => !DANGEROUS_PATTERNS.some((p) => p.test(val)),
      'El mensaje contiene caracteres o código no permitido',
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
      'Mínimo 10 caracteres',
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
      'Máximo 1000 caracteres',
    ),
});

export type ContactFormData = z.infer<typeof contactSchema>;
