import { z } from 'zod';

/** Motivos de contacto: definen el flujo comercial del lead */
export const INTERESES = [
  { valor: 'modelo', label: 'Un modelo de casa' },
  { valor: 'panelizado', label: 'Panelizar mis planos' },
  { valor: 'paneles', label: 'Comprar paneles sueltos' },
  { valor: 'otro', label: 'Otra consulta' },
] as const;

export const contactoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Cuéntanos tu nombre')
    .max(80, 'Nombre demasiado largo'),
  // zod v4: el validador de email es de primer nivel, no un método de string
  email: z.email('Revisa el formato de tu correo').trim(),
  telefono: z
    .string()
    .trim()
    .max(30, 'Teléfono demasiado largo')
    .optional()
    .or(z.literal('')),
  interes: z.enum(['modelo', 'panelizado', 'paneles', 'otro']),
  mensaje: z
    .string()
    .trim()
    .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)')
    .max(2000, 'Mensaje demasiado largo'),
  /** Honeypot anti-spam: los bots lo rellenan, las personas no lo ven */
  web: z.string().max(0).optional(),
});

export type ContactoInput = z.infer<typeof contactoSchema>;
