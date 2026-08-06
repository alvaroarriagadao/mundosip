import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Sesión del admin — fase 1, sin tabla de usuarios:
 * credenciales en variables de entorno y cookie firmada con HMAC.
 * (En fase 2, Payload CMS trae su propio sistema de usuarios.)
 *
 * Necesita en .env.local / Vercel:
 *   ADMIN_USER, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
 */

export const ADMIN_COOKIE = 'ms_admin';
const OCHO_HORAS_MS = 8 * 60 * 60 * 1000;

function secreto(): string {
  const valor = process.env.ADMIN_SESSION_SECRET;
  if (!valor) throw new Error('Falta ADMIN_SESSION_SECRET');
  return valor;
}

function firmar(payload: string): string {
  return createHmac('sha256', secreto()).update(payload).digest('hex');
}

/** Comparación en tiempo constante vía hash (admite largos distintos). */
function igualesSeguro(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function credencialesValidas(usuario: string, clave: string): boolean {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;
  // & no cortocircuito: siempre se comparan ambos campos
  return igualesSeguro(usuario, user) && igualesSeguro(clave, pass);
}

/** Token "expira.firma" para la cookie. */
export function crearToken(): { token: string; maxAgeSegundos: number } {
  const expira = Date.now() + OCHO_HORAS_MS;
  return { token: `${expira}.${firmar(String(expira))}`, maxAgeSegundos: OCHO_HORAS_MS / 1000 };
}

export function tokenValido(token: string | undefined): boolean {
  if (!token) return false;
  const [expira, firma] = token.split('.');
  if (!expira || !firma) return false;
  if (Number(expira) < Date.now()) return false;
  return igualesSeguro(firma, firmar(expira));
}

/** ¿La request actual trae sesión de admin vigente? */
export async function esAdmin(): Promise<boolean> {
  const jar = await cookies();
  return tokenValido(jar.get(ADMIN_COOKIE)?.value);
}

/** Para páginas del admin: sin sesión → al login. */
export async function exigirAdmin(): Promise<void> {
  if (!(await esAdmin())) redirect('/admin');
}
