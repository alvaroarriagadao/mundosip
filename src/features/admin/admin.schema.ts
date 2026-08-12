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
  ivaPct: z.number().min(0).max(50),
  superficieM2: z.number().int().positive().max(10_000).nullable(),
  condicionesPago: z.string().trim().max(1000).nullable(),
  notas: z.array(z.string().trim().min(1).max(300)).max(20),
});

export const seccionCreateSchema = z.object({
  plantillaId: z.uuid(),
  nombre: z.string().trim().min(2, 'Nombre muy corto').max(80),
});

export const seccionUpdateSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre muy corto').max(80),
  obligatoria: z.boolean(),
});

/** Campo de texto opcional del formulario de panel: '' → null */
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullable();

export const panelSchema = z.object({
  nombre: z.string().trim().min(3, 'Nombre muy corto').max(80),
  precioClp: z.number().int('Pesos enteros').positive('Debe ser mayor a 0').max(100_000_000),
  dimensiones: textoOpcional(60),
  espesorOsb: textoOpcional(30),
  espesorEps: textoOpcional(30),
  densidadEps: textoOpcional(30),
  aptoParaMadera: textoOpcional(60),
  descripcion: textoOpcional(400),
  /** Ruta local (/images/…) o URL https; vacío = imagen estándar del panel */
  imagenUrl: textoOpcional(300).refine(
    (v) => v == null || v.startsWith('/') || v.startsWith('https://'),
    'La imagen debe ser una ruta /images/… o una URL https',
  ),
  publicado: z.boolean(),
});

export type PanelInput = z.infer<typeof panelSchema>;

/** Ficha del modelo de casa: los datos de cabecera */
export const modeloSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre muy corto').max(60),
  superficieM2: z.number().int().positive('Debe ser mayor a 0').max(2000),
  habitaciones: z.number().int().min(0).max(20),
  banos: z.number().int().min(0).max(20),
  precioDesdeCLP: z.number().int('Pesos enteros').positive('Debe ser mayor a 0').max(2_000_000_000),
  resumen: z.string().trim().max(200),
  descripcion: z.string().trim().max(1200),
  destacado: z.boolean(),
  publicado: z.boolean(),
});

/** Listas de texto del modelo, guardadas en bloque (reemplazo total) */
export const modeloListasSchema = z.object({
  caracteristicas: z.array(z.string().trim().min(2).max(200)).max(20),
  kitInicial: z.array(z.string().trim().min(2).max(200)).max(40),
  kitFullExtras: z.array(z.string().trim().min(2).max(200)).max(20),
});

const imagenSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(400)
    .refine((v) => v.startsWith('/') || v.startsWith('https://'), 'Imagen inválida'),
  alt: z.string().trim().max(160),
});

/** Portada + galería, guardadas en bloque y en orden */
export const modeloImagenesSchema = z.object({
  portada: imagenSchema.nullable(),
  galeria: z.array(imagenSchema).max(12),
});

export type ModeloInput = z.infer<typeof modeloSchema>;
export type ModeloListasInput = z.infer<typeof modeloListasSchema>;
export type ModeloImagenesInput = z.infer<typeof modeloImagenesSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
export type PlantillaUpdateInput = z.infer<typeof plantillaUpdateSchema>;
