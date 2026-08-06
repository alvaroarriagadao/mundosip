import { z } from 'zod';

/** Payloads de la API del admin de cotizaciones. */

export const loginSchema = z.object({
  usuario: z.string().trim().min(1, 'Ingresa el usuario').max(80),
  clave: z.string().min(1, 'Ingresa la contraseña').max(200),
});

export const itemUpdateSchema = z.object({
  descripcion: z.string().trim().min(2, 'Descripción muy corta').max(300),
  unidad: z.string().trim().min(1, 'Falta la unidad').max(20),
  cantidad: z.number().positive('Debe ser mayor a 0').max(1_000_000),
  precioUnitario: z.number().int('Pesos enteros').min(0).max(2_000_000_000),
});

export const itemCreateSchema = itemUpdateSchema.extend({
  seccionId: z.uuid(),
  codigo: z.string().trim().max(10).optional(),
});

export const plantillaUpdateSchema = z.object({
  titulo: z.string().trim().min(4, 'Título muy corto').max(120),
  descuentoNombre: z.string().trim().max(80).nullable(),
  descuentoPct: z.number().min(0).max(99.99),
  condicionesPago: z.string().trim().max(1000).nullable(),
  notas: z.array(z.string().trim().min(1).max(300)).max(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
export type PlantillaUpdateInput = z.infer<typeof plantillaUpdateSchema>;
