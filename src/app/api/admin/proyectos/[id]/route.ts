import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { proyectoSchema } from '@/features/admin/admin.schema';
import { esAdmin } from '@/features/admin/auth';
import { regionPorSlug } from '@/features/proyectos/regiones';

interface Contexto {
  params: Promise<{ id: string }>;
}

/** Actualiza la ficha del proyecto (las fotos van por su propia ruta). */
export async function PUT(request: Request, { params }: Contexto) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ ok: false, error: 'Id inválido.' }, { status: 400 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 });
  }

  const parsed = proyectoSchema.safeParse(cuerpo);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: primero?.message ?? 'Revisa los datos.' }, { status: 422 });
  }

  const d = parsed.data;
  const region = regionPorSlug(d.regionSlug)!;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const filas = (await sql`
      update proyectos
      set nombre = ${d.nombre},
          region_slug = ${region.slug},
          region_nombre = ${region.nombre},
          ubicacion = ${`${d.lugar}, Región de ${region.nombre}`},
          superficie_m2 = ${d.superficieM2},
          ano_diseno = ${d.anoDiseno},
          ano_construccion = ${d.anoConstruccion},
          resumen = ${d.resumen},
          resena_destacada = ${d.resenaDestacada},
          resena = ${d.resena},
          video_url = ${d.videoUrl},
          video_en_resena = ${d.videoEnResena},
          estado = ${d.estado},
          destacado = ${d.destacado},
          publicado = ${d.publicado}
      where id = ${id}
      returning id, slug
    `) as Array<{ id: string; slug: string }>;

    if (filas.length === 0) {
      return NextResponse.json({ ok: false, error: 'El proyecto no existe.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, slug: filas[0].slug });
  } catch (error) {
    console.error('[admin/proyectos] error actualizando proyecto', error);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar.' }, { status: 500 });
  }
}

/** Elimina el proyecto con todas sus imágenes (cascade). */
export async function DELETE(_request: Request, { params }: Contexto) {
  if (!(await esAdmin())) {
    return NextResponse.json({ ok: false, error: 'Sesión expirada.' }, { status: 401 });
  }

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ ok: false, error: 'Id inválido.' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`delete from proyectos where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/proyectos] error eliminando proyecto', error);
    return NextResponse.json({ ok: false, error: 'No se pudo eliminar.' }, { status: 500 });
  }
}
