import { NextResponse } from 'next/server';

import { ADMIN_COOKIE } from '@/features/admin/auth';

export async function POST() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return respuesta;
}
