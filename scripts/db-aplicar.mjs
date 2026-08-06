/**
 * Aplica db/schema.sql completo contra Neon (el esquema es idempotente).
 *
 *   npm run db:aplicar
 *
 * Usa `pg` en vez del driver serverless porque el archivo trae varias
 * sentencias y funciones plpgsql ($$…$$) en un solo script.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import pg from 'pg';

// .env.local a mano: sin dependencia de dotenv
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

cargarEnvLocal();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL (en .env.local o el entorno).');
  process.exit(1);
}

const archivo = process.argv[2] ?? 'db/schema.sql';
const sql = readFileSync(resolve(process.cwd(), archivo), 'utf8');

const cliente = new pg.Client({ connectionString: url });
await cliente.connect();
try {
  await cliente.query(sql);
  console.log(`✔ ${archivo} aplicado sin errores.`);
} finally {
  await cliente.end();
}
