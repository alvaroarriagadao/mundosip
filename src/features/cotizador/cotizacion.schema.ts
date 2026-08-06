import { z } from 'zod';

/** Payload del POST /api/cotizaciones: la selección + los datos del cliente. */
export const emitirCotizacionSchema = z.object({
  modeloSlug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Modelo inválido'),
  kit: z.enum(['inicial', 'full']),
  /** Ids de secciones OPCIONALES marcadas (las obligatorias van siempre) */
  seccionIds: z.array(z.uuid()).max(40),
  nombre: z
    .string()
    .trim()
    .min(2, 'Cuéntanos tu nombre')
    .max(80, 'Nombre demasiado largo'),
  email: z.email('Revisa el formato de tu correo').trim(),
  telefono: z
    .string()
    .trim()
    .max(30, 'Teléfono demasiado largo')
    .optional()
    .or(z.literal('')),
  /** Honeypot anti-spam: los bots lo rellenan, las personas no lo ven */
  web: z.string().max(0).optional(),
});

export type EmitirCotizacionInput = z.infer<typeof emitirCotizacionSchema>;
