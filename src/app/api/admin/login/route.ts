import { NextResponse } from 'next/server';

import { loginSchema } from '@/features/admin/admin.schema';
import { ADMIN_COOKIE, credencialesValidas, crearToken } from '@/features/admin/auth';

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Completa usuario y contraseña.' }, { status: 422 });
  }

  if (!credencialesValidas(parsed.data.usuario, parsed.data.clave)) {
    return NextResponse.json({ ok: false, error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  const { token, maxAgeSegundos } = crearToken();
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSegundos,
  });
  return respuesta;
}
