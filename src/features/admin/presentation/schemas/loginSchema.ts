import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Introduce tu correo electrónico')
    .email('El correo no parece válido. Ejemplo: tu@email.com'),
  password: z
    .string()
    .min(1, 'Introduce tu contraseña'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
