/**
 * Importa las cotizaciones llave en mano desde assets/cotizaciones/*.xlsx
 * hacia Neon (cotizacion_plantillas / secciones / items).
 *
 *   npm run cotizaciones:importar
 *
 * Flujo del equipo en fase 1: editan el Excel como siempre, corren este
 * comando y la web queda actualizada. Es idempotente: cada corrida
 * reemplaza la plantilla completa del modelo+kit correspondiente.
 *
 * Convención de nombres de archivo:
 *   "TULIPAN 80M2 APOYO (KIT FULL).xlsx"     → tulipan / full
 *   "TULIPAN 80M2 RADIER (KIT INICIAL).xlsx" → tulipan / inicial
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import ExcelJS from 'exceljs';
import pg from 'pg';

const CARPETA = 'assets/cotizaciones';

/** Secciones que el cliente no puede desmarcar: sin ellas no hay casa. */
const SECCIONES_OBLIGATORIAS = new Set(['OBRAS PRELIMINARES', 'TABIQUERIAS']);

/** Nombres amigables para los checkboxes (los Excel vienen en mayúsculas y con typos). */
const NOMBRES_SECCION = new Map([
  ['OBRAS PRELIMINARES', 'Obras preliminares'],
  ['OBRA GRUESA', 'Obra gruesa'],
  ['TABIQUERIAS', 'Tabiquerías'],
  ['REVESTIMIENTOS EXTERIORES', 'Revestimientos exteriores'],
  ['REVESTIENTOS INTERIOR', 'Revestimientos interiores'],
  ['PUERTAS Y VENTANAS', 'Puertas y ventanas'],
  ['HOJALATERIAS PRE-PINTADA', 'Hojalaterías pre-pintadas'],
  ['ARTEFACTOS SANITARIOS Y QUINCALLERIA', 'Artefactos sanitarios y quincallería'],
  ['ARTEFACTOS ELECTRICOS', 'Artefactos eléctricos'],
  ['PROYECTOS', 'Proyectos (empalmes e instalaciones)'],
  ['ESPECIALIDADES TECNICAS', 'Especialidades técnicas'],
  ['EXTRA', 'Extras de obra'],
]);

function cargarEnvLocal() {
  try {
    const contenido = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const linea of contenido.split('\n')) {
      const match = linea.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* sin .env.local: se espera DATABASE_URL en el entorno */
  }
}

/** Valor plano de una celda exceljs (resuelve fórmulas y richText). */
function valor(celda) {
  const v = celda?.value;
  if (v == null) return null;
  if (typeof v === 'object') {
    if ('result' in v) return v.result ?? null;
    if ('richText' in v) return v.richText.map((t) => t.text).join('');
    if ('text' in v) return v.text;
  }
  return v;
}

function texto(celda) {
  const v = valor(celda);
  return v == null ? '' : String(v).trim();
}

function numero(celda) {
  const v = valor(celda);
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** "REVESTIENTOS INTERIOR " → clave sin acentos/espacios extra para los mapas. */
function claveSeccion(nombre) {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/** "1.1" | 3.1 | 9.1 → código como texto estable. */
function codigoItem(v) {
  if (v == null) return null;
  if (typeof v === 'number') {
    // 3.1 → "3.1"; evita colas binarias tipo 3.1000000000000001
    return String(Math.round(v * 100) / 100);
  }
  const s = String(v).trim();
  return s || null;
}

function parsearArchivo(nombreArchivo) {
  const slug = nombreArchivo
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  const kit = /KIT\s+FULL/i.test(nombreArchivo)
    ? 'full'
    : /KIT\s+INICIAL/i.test(nombreArchivo)
      ? 'inicial'
      : null;
  if (!kit) throw new Error(`No pude deducir el kit desde el nombre: ${nombreArchivo}`);
  return { slug, kit };
}

async function leerCotizacion(ruta) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(ruta);
  const ws = wb.worksheets[0];

  const plantilla = {
    titulo: null,
    descuentoNombre: null,
    descuentoPct: 0,
    condicionesPago: null,
    notas: [],
    secciones: [],
  };

  let seccionActual = null;
  let zona = 'items'; // items | notas | condiciones

  ws.eachRow({ includeEmpty: false }, (fila) => {
    const a = texto(fila.getCell(1));
    const b = texto(fila.getCell(2));
    const c = texto(fila.getCell(3));
    const d = fila.getCell(4);
    const e = fila.getCell(5);
    const dTexto = texto(d);

    if (!plantilla.titulo && /^MODELO\s/i.test(a)) {
      plantilla.titulo = a.replace(/\s+/g, ' ').trim();
      return;
    }

    // Zonas finales del documento
    if (/^2\s*\.\s*Notas/i.test(a)) {
      zona = 'notas';
      return;
    }
    if (/^3\s*\.\s*Condiciones/i.test(a)) {
      zona = 'condiciones';
      return;
    }
    if (/Esperando buena acogida/i.test(a)) {
      zona = 'fin';
      return;
    }
    if (zona === 'notas') {
      if (a.startsWith('-')) plantilla.notas.push(a.replace(/^-\s*/, ''));
      return;
    }
    if (zona === 'condiciones') {
      if (a) plantilla.condicionesPago = plantilla.condicionesPago ? `${plantilla.condicionesPago}\n${a}` : a;
      return;
    }
    if (zona === 'fin') return;

    // Descuento: fila "DESC. INVIERNO 3%" en la columna D
    const matchDesc = dTexto.match(/^DESC\.?\s*(.*?)\s*(\d+(?:[.,]\d+)?)\s*%/i);
    if (matchDesc) {
      plantilla.descuentoNombre = `Desc. ${matchDesc[1].trim() || 'especial'}`
        .toLowerCase()
        .replace(/(^|\s)\S/g, (t) => t.toUpperCase());
      plantilla.descuentoPct = Number(matchDesc[2].replace(',', '.'));
      return;
    }

    // Nueva sección: "N°1" en columna A
    if (/^N°\s*\d+$/.test(a)) {
      const clave = claveSeccion(b);
      seccionActual = {
        codigo: a.replace(/\s+/g, ''),
        nombre: NOMBRES_SECCION.get(clave) ?? b.replace(/\s+/g, ' ').trim(),
        obligatoria: SECCIONES_OBLIGATORIAS.has(clave),
        items: [],
      };
      plantilla.secciones.push(seccionActual);
      return;
    }

    // Ítem: descripción + unidad + cantidad + precio unitario numéricos.
    // Los "sub total" y totales no cumplen esto (van en D/E como texto) y se ignoran:
    // siempre se recalculan.
    const cantidad = numero(d);
    const precio = numero(e);
    if (seccionActual && b && c && cantidad != null && precio != null && cantidad > 0) {
      seccionActual.items.push({
        codigo: codigoItem(valor(fila.getCell(1))),
        descripcion: b.replace(/\s+/g, ' ').trim(),
        unidad: c,
        cantidad: Math.round(cantidad * 1000) / 1000,
        precioUnitario: Math.round(precio),
      });
    }
  });

  if (!plantilla.titulo) throw new Error(`Sin fila "MODELO …" en ${ruta}`);
  if (plantilla.secciones.length === 0) throw new Error(`Sin secciones en ${ruta}`);
  return plantilla;
}

async function importar() {
  cargarEnvLocal();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Falta DATABASE_URL (en .env.local o el entorno).');
    process.exit(1);
  }

  const archivos = readdirSync(resolve(process.cwd(), CARPETA)).filter((f) => f.endsWith('.xlsx') && !f.startsWith('~'));
  if (archivos.length === 0) {
    console.error(`No hay .xlsx en ${CARPETA}.`);
    process.exit(1);
  }

  const cliente = new pg.Client({ connectionString: url });
  await cliente.connect();

  try {
    for (const archivo of archivos.sort()) {
      const { slug, kit } = parsearArchivo(archivo);
      const plantilla = await leerCotizacion(resolve(process.cwd(), CARPETA, archivo));

      await cliente.query('begin');
      try {
        const res = await cliente.query(
          `insert into cotizacion_plantillas
             (modelo_slug, kit, titulo, descuento_nombre, descuento_pct, condiciones_pago, notas)
           values ($1, $2, $3, $4, $5, $6, $7)
           on conflict (modelo_slug, kit) do update set
             titulo = excluded.titulo,
             descuento_nombre = excluded.descuento_nombre,
             descuento_pct = excluded.descuento_pct,
             condiciones_pago = excluded.condiciones_pago,
             notas = excluded.notas
           returning id`,
          [
            slug,
            kit,
            plantilla.titulo,
            plantilla.descuentoNombre,
            plantilla.descuentoPct,
            plantilla.condicionesPago,
            plantilla.notas,
          ],
        );
        const plantillaId = res.rows[0].id;

        // Reemplazo completo: borrar secciones borra los ítems en cascada
        await cliente.query('delete from cotizacion_secciones where plantilla_id = $1', [plantillaId]);

        let ordenSeccion = 0;
        let totalItems = 0;
        for (const seccion of plantilla.secciones) {
          const resSec = await cliente.query(
            `insert into cotizacion_secciones (plantilla_id, codigo, nombre, obligatoria, orden)
             values ($1, $2, $3, $4, $5) returning id`,
            [plantillaId, seccion.codigo, seccion.nombre, seccion.obligatoria, ordenSeccion++],
          );
          const seccionId = resSec.rows[0].id;

          let ordenItem = 0;
          for (const item of seccion.items) {
            await cliente.query(
              `insert into cotizacion_items
                 (seccion_id, codigo, descripcion, unidad, cantidad, precio_unitario, orden)
               values ($1, $2, $3, $4, $5, $6, $7)`,
              [seccionId, item.codigo, item.descripcion, item.unidad, item.cantidad, item.precioUnitario, ordenItem++],
            );
            totalItems++;
          }
        }

        await cliente.query('commit');
        console.log(
          `✔ ${slug}/${kit}: ${plantilla.secciones.length} secciones, ${totalItems} ítems` +
            (plantilla.descuentoPct ? `, ${plantilla.descuentoNombre} ${plantilla.descuentoPct}%` : ''),
        );
      } catch (error) {
        await cliente.query('rollback');
        throw new Error(`Importando ${archivo}: ${error.message}`);
      }
    }
  } finally {
    await cliente.end();
  }
}

await importar();
