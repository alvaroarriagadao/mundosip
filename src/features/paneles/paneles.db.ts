import { neon } from '@neondatabase/serverless';

import type { PanelProducto } from './panel.types';

/**
 * Acceso a datos de la tienda de paneles — SOLO servidor.
 * Los productos los administra el equipo en /admin/paneles.
 */

function sqlCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  return neon(url);
}

interface FilaPanel {
  id: string;
  slug: string;
  nombre: string;
  precio_clp: number;
  dimensiones: string | null;
  espesor_osb: string | null;
  espesor_eps: string | null;
  densidad_eps: string | null;
  apto_para_madera: string | null;
  imagen_url: string | null;
  descripcion: string | null;
  publicado: boolean;
  orden: number;
}

function mapear(f: FilaPanel): PanelProducto {
  return {
    id: f.id,
    slug: f.slug,
    nombre: f.nombre,
    precioClp: f.precio_clp,
    dimensiones: f.dimensiones,
    espesorOsb: f.espesor_osb,
    espesorEps: f.espesor_eps,
    densidadEps: f.densidad_eps,
    aptoParaMadera: f.apto_para_madera,
    imagenUrl: f.imagen_url,
    descripcion: f.descripcion,
    publicado: f.publicado,
    orden: f.orden,
  };
}

const COLUMNAS = `id, slug, nombre, precio_clp, dimensiones, espesor_osb, espesor_eps,
                  densidad_eps, apto_para_madera, imagen_url, descripcion, publicado, orden`;

/** Catálogo visible en la tienda pública */
export async function getPanelesPublicados(): Promise<PanelProducto[]> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from paneles where publicado order by orden, precio_clp`,
  )) as FilaPanel[];
  return filas.map(mapear);
}

/** Todos los productos, publicados u ocultos (admin) */
export async function getPanelesAdmin(): Promise<PanelProducto[]> {
  const sql = sqlCliente();
  const filas = (await sql.query(
    `select ${COLUMNAS} from paneles order by orden, precio_clp`,
  )) as FilaPanel[];
  return filas.map(mapear);
}

export interface PedidoResumen {
  id: string;
  folioNum: number;
  nombre: string;
  email: string;
  telefono: string | null;
  totalClp: number;
  createdAt: string;
}

/** Últimos pedidos de paneles emitidos desde la tienda (admin) */
export async function getPedidosPaneles(limite = 100): Promise<PedidoResumen[]> {
  const sql = sqlCliente();
  const filas = (await sql`
    select id, folio_num, nombre, email, telefono, total_clp, created_at
    from pedidos_paneles
    order by created_at desc
    limit ${limite}
  `) as Array<{
    id: string;
    folio_num: string;
    nombre: string;
    email: string;
    telefono: string | null;
    total_clp: number;
    created_at: string;
  }>;
  return filas.map((f) => ({
    id: f.id,
    folioNum: Number(f.folio_num),
    nombre: f.nombre,
    email: f.email,
    telefono: f.telefono,
    totalClp: f.total_clp,
    createdAt: new Date(f.created_at).toISOString(),
  }));
}
