-- ============================================================
--  MundoSIP — Esquema de base de datos (PostgreSQL / Neon)
--
--  Notas:
--   * gen_random_uuid() es nativo en Postgres 13+ (Neon: PG 18).
--   * Precios en INTEGER CLP (sin decimales).
--   * Las imágenes NO se guardan aquí: solo la URL del archivo;
--     el binario vive en object storage (Cloudinary/Blob/R2).
--   * Script idempotente: se puede re-ejecutar sin romper nada.
--   * Si en fase 2 se usa Payload CMS, Payload crea/migra sus
--     propias tablas; este esquema queda como referencia del
--     modelo o como vía "custom" con Drizzle/Prisma.
--
--  Aplicar:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f db/schema.sql
-- ============================================================

-- Trigger reutilizable para mantener updated_at al día
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
--  MODELOS  (casas / kits de autoconstrucción — producto estrella)
-- ------------------------------------------------------------
create table if not exists modelos (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),  -- URL: /modelos/tulipan
  nombre            text not null,
  superficie_m2     integer not null check (superficie_m2 > 0),
  habitaciones      integer not null default 0 check (habitaciones >= 0),
  banos             integer not null default 0 check (banos >= 0),
  precio_desde_clp  integer not null check (precio_desde_clp > 0),
  descripcion       text,
  destacado         boolean not null default false,  -- aparece en "más cotizados"
  publicado         boolean not null default true,   -- el admin oculta sin borrar
  orden             integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_modelos_listado
  on modelos (orden) where publicado;

drop trigger if exists trg_modelos_updated on modelos;
create trigger trg_modelos_updated
  before update on modelos
  for each row execute function set_updated_at();

-- Imágenes / renders de cada modelo (1 modelo → N imágenes)
create table if not exists modelo_imagenes (
  id         uuid primary key default gen_random_uuid(),
  modelo_id  uuid not null references modelos(id) on delete cascade,
  url        text not null,          -- URL en el storage, nunca el binario
  alt        text,                   -- accesibilidad / SEO
  orden      integer not null default 0
);
create index if not exists idx_modelo_imagenes_modelo
  on modelo_imagenes (modelo_id, orden);

-- Ítems del kit (Básico / Full) de cada modelo
create table if not exists kit_items (
  id         uuid primary key default gen_random_uuid(),
  modelo_id  uuid not null references modelos(id) on delete cascade,
  tipo       text not null check (tipo in ('basico','full')),
  texto      text not null,          -- ej: "Muros exteriores – panel SIP 94mm"
  orden      integer not null default 0
);
create index if not exists idx_kit_items_modelo
  on kit_items (modelo_id, tipo, orden);

-- ------------------------------------------------------------
--  PANELES  (venta de paneles SIP sueltos — secundario)
--  Specs como texto: son datos de ficha técnica para mostrar,
--  no se calcula con ellos.
-- ------------------------------------------------------------
create table if not exists paneles (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre            text not null,
  precio_clp        integer not null check (precio_clp > 0),
  dimensiones       text,             -- "1220x2440x94 mm"
  espesor_osb       text,             -- "9.5 mm"
  espesor_eps       text,             -- "75 mm"
  densidad_eps      text,             -- "15 kg/m³"
  apto_para_madera  text,             -- '2×3" calibrada'
  imagen_url        text,
  imagen_alt        text,
  descripcion       text,
  publicado         boolean not null default true,
  orden             integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_paneles_listado
  on paneles (orden) where publicado;

drop trigger if exists trg_paneles_updated on paneles;
create trigger trg_paneles_updated
  before update on paneles
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
--  FAQS  (sección Preguntas Frecuentes — editable en fase 2)
-- ------------------------------------------------------------
create table if not exists faqs (
  id          uuid primary key default gen_random_uuid(),
  pregunta    text not null,
  respuesta   text not null,
  publicado   boolean not null default true,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_faqs_listado
  on faqs (orden) where publicado;

drop trigger if exists trg_faqs_updated on faqs;
create trigger trg_faqs_updated
  before update on faqs
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
--  LEADS  (envíos del formulario de contacto)
--  Se guardan aunque el correo salga por Resend: red de seguridad,
--  y en fase 2 el admin los gestiona con `estado`.
-- ------------------------------------------------------------
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  apellidos   text,
  email       text not null,
  telefono    text,
  mensaje     text,
  origen      text,                   -- página/sección desde donde se envió
  estado      text not null default 'nuevo'
              check (estado in ('nuevo','contactado','cerrado')),
  created_at  timestamptz not null default now()
);
create index if not exists idx_leads_created on leads (created_at desc);
create index if not exists idx_leads_estado on leads (estado)
  where estado <> 'cerrado';

-- ------------------------------------------------------------
--  USERS  (acceso al panel admin — fase 2)
--  Con Payload, esta tabla la gestiona Payload (no crear a mano
--  en ese caso). Email único sin distinguir mayúsculas.
-- ------------------------------------------------------------
create table if not exists users (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,
  password_hash  text not null,
  rol            text not null default 'editor' check (rol in ('admin','editor')),
  created_at     timestamptz not null default now()
);
create unique index if not exists uq_users_email on users (lower(email));

-- ------------------------------------------------------------
--  PROYECTOS  (obras construidas — galería del sitio)
--  Espejo del shape TS features/proyectos/proyecto.types.ts:
--  cada campo será un campo del formulario del admin (fase 2).
-- ------------------------------------------------------------
create table if not exists proyectos (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre             text not null,
  region_slug        text not null,           -- "los-rios" (filtro de galería)
  region_nombre      text not null,           -- "Los Ríos"
  ubicacion          text not null,           -- "Panguipulli, Región de Los Ríos"
  superficie_m2      integer not null check (superficie_m2 > 0),
  ano_diseno         integer not null,
  ano_construccion   integer not null,
  resumen            text not null,           -- 1 línea para la card
  resena_destacada   text not null,           -- párrafo grande de la reseña
  resena             text not null,           -- párrafo de apoyo
  destacado          boolean not null default false,
  publicado          boolean not null default true,
  orden              integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists idx_proyectos_listado
  on proyectos (orden) where publicado;
create index if not exists idx_proyectos_region
  on proyectos (region_slug) where publicado;

drop trigger if exists trg_proyectos_updated on proyectos;
create trigger trg_proyectos_updated
  before update on proyectos
  for each row execute function set_updated_at();

-- Imágenes del proyecto con rol fijo: portada / reseña / galería
create table if not exists proyecto_imagenes (
  id           uuid primary key default gen_random_uuid(),
  proyecto_id  uuid not null references proyectos(id) on delete cascade,
  tipo         text not null check (tipo in ('portada','resena','galeria')),
  url          text not null,          -- URL en el storage (no el binario)
  alt          text not null,          -- accesibilidad / SEO
  orden        integer not null default 0
);
create index if not exists idx_proyecto_imagenes
  on proyecto_imagenes (proyecto_id, tipo, orden);

-- ------------------------------------------------------------
--  MIGRACIÓN 002 — Fichas de modelo administrables
-- ------------------------------------------------------------
-- Resumen corto para la card del listado (la descripción larga vive en `descripcion`)
alter table modelos add column if not exists resumen text;

-- Rol de cada imagen del modelo: portada (card/carrusel) o galería
alter table modelo_imagenes add column if not exists tipo text not null default 'galeria';

-- Puntos fuertes del diseño, ordenados (sección "El diseño" de la ficha)
create table if not exists modelo_caracteristicas (
  id         uuid primary key default gen_random_uuid(),
  modelo_id  uuid not null references modelos(id) on delete cascade,
  texto      text not null,
  orden      integer not null default 0
);
create index if not exists idx_modelo_caracteristicas
  on modelo_caracteristicas (modelo_id, orden);

-- ------------------------------------------------------------
--  MIGRACIÓN 003 — Kits: Inicial + extras del Full
--  El Kit Full no repite la lista del Inicial: solo guarda lo que
--  agrega (el piso). El radier no va en ningún kit: se cotiza aparte.
-- ------------------------------------------------------------
alter table kit_items drop constraint if exists kit_items_tipo_check;
update kit_items set tipo = 'inicial' where tipo = 'basico';
delete from kit_items where tipo = 'full';
alter table kit_items add constraint kit_items_tipo_check
  check (tipo in ('inicial','full_extra'));
