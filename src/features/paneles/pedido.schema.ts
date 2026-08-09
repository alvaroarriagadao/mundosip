import { z } from 'zod';

/** Payload del POST /api/paneles/cotizar: el carrito + datos del cliente. */
export const cotizarPanelesSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Producto inválido'),
        cantidad: z.number().int().min(1).max(500),
      }),
    )
    .min(1, 'Agrega al menos un panel')
    .max(30),
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
  /** Honeypot anti-spam */
  web: z.string().max(0).optional(),
});

export type CotizarPanelesInput = z.infer<typeof cotizarPanelesSchema>;

/** 7 → "PAN-00007" — folio de los pedidos de paneles. */
export function formatearFolioPedido(folioNum: number | string): string {
  return `PAN-${String(folioNum).padStart(5, '0')}`;
}
