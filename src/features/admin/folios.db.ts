import { neon } from '@neondatabase/serverless';

/**
 * Correlativo de las cotizaciones — SOLO servidor.
 *
 * Cada tipo de cotización tiene su contador automático en la base: la
 * columna `folio_num` es "generated always as identity" y Postgres le
 * asigna el siguiente número al insertar. Aquí solo se LEE cuál será el
 * próximo y se ADELANTA el contador; nunca se toca un folio ya emitido.
 */

export type TipoFolio = 'casas' | 'paneles';

/** Tabla de cada tipo. Lista cerrada: el nombre nunca viene del usuario. */
const TABLA: Record<TipoFolio, 'cotizaciones_emitidas' | 'pedidos_paneles'> = {
  casas: 'cotizaciones_emitidas',
  paneles: 'pedidos_paneles',
};

export interface EstadoFolio {
  /** Número que llevará la próxima cotización */
  siguiente: number;
  /** Último folio ya emitido (0 si no hay ninguno) */
  ultimoEmitido: number;
}

function sqlCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  return neon(url);
}

export async function getEstadoFolio(tipo: TipoFolio): Promise<EstadoFolio> {
  const sql = sqlCliente();
  const tabla = TABLA[tipo];
  const [{ secuencia }] = (await sql.query(`select pg_get_serial_sequence('${tabla}', 'folio_num') as secuencia`)) as Array<{
    secuencia: string;
  }>;
  const [fila] = (await sql.query(
    `select
       (select case when is_called then last_value + 1 else last_value end from ${secuencia}) as siguiente,
       (select coalesce(max(folio_num), 0) from ${tabla}) as ultimo`,
  )) as Array<{ siguiente: string; ultimo: string }>;
  return { siguiente: Number(fila.siguiente), ultimoEmitido: Number(fila.ultimo) };
}

/**
 * Fija el número de la próxima cotización. Solo se acepta si es MAYOR
 * al último folio emitido, para que nunca haya dos documentos con el
 * mismo número; la comprobación y el cambio van en una sola sentencia,
 * así una cotización emitida en ese mismo instante no puede colarse.
 *
 * Devuelve false si el número quedó por debajo del último emitido.
 */
export async function fijarSiguienteFolio(tipo: TipoFolio, siguiente: number): Promise<boolean> {
  const sql = sqlCliente();
  const tabla = TABLA[tipo];
  const filas = (await sql.query(
    `select setval(pg_get_serial_sequence('${tabla}', 'folio_num'), $1::bigint, false) as valor
     where $1::bigint > (select coalesce(max(folio_num), 0) from ${tabla})`,
    [siguiente],
  )) as unknown[];
  return filas.length === 1;
}
