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

-- ------------------------------------------------------------
--  MIGRACIÓN 004 — Sistema de cotizaciones llave en mano
--
--  Una PLANTILLA por modelo × kit (Tulipán/full, Tulipán/inicial…)
--  espeja los Excel de assets/cotizaciones: secciones N°1..N°12,
--  cada una con ítems (cantidad × precio unitario). Los totales
--  NUNCA se guardan en la plantilla: se calculan siempre.
--
--  Cada cotización que un cliente genera queda en
--  cotizaciones_emitidas con un SNAPSHOT jsonb de lo cotizado:
--  si mañana cambian los precios, el folio emitido sigue siendo
--  reproducible tal como se entregó (validez de 7 días).
-- ------------------------------------------------------------
create table if not exists cotizacion_plantillas (
  id                uuid primary key default gen_random_uuid(),
  modelo_slug       text not null
                    check (modelo_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kit               text not null check (kit in ('inicial','full')),
  titulo            text not null,             -- "Modelo Tulipán 80 m² llave en mano"
  descuento_nombre  text,                      -- "Desc. Invierno" (null = sin descuento)
  descuento_pct     numeric(5,2) not null default 0 check (descuento_pct >= 0 and descuento_pct < 100),
  iva_pct           numeric(5,2) not null default 19,
  validez_dias      integer not null default 7,
  condiciones_pago  text,
  notas             text[] not null default '{}',
  publicado         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (modelo_slug, kit)
);

drop trigger if exists trg_cotizacion_plantillas_updated on cotizacion_plantillas;
create trigger trg_cotizacion_plantillas_updated
  before update on cotizacion_plantillas
  for each row execute function set_updated_at();

-- Las categorías que el cliente marca/desmarca (Obras preliminares, Obra gruesa…)
create table if not exists cotizacion_secciones (
  id            uuid primary key default gen_random_uuid(),
  plantilla_id  uuid not null references cotizacion_plantillas(id) on delete cascade,
  codigo        text not null,                 -- "N°1"
  nombre        text not null,                 -- "Obras preliminares"
  obligatoria   boolean not null default false, -- sin esto no hay casa: va marcada y bloqueada
  orden         integer not null default 0
);
create index if not exists idx_cotizacion_secciones
  on cotizacion_secciones (plantilla_id, orden);

-- El desglose de cada sección. total = cantidad × precio_unitario, calculado.
create table if not exists cotizacion_items (
  id               uuid primary key default gen_random_uuid(),
  seccion_id       uuid not null references cotizacion_secciones(id) on delete cascade,
  codigo           text,                       -- "1.1"
  descripcion      text not null,
  unidad           text not null,              -- gl, m2, m3, ml, uni, unidad, ct, hrs
  cantidad         numeric(12,3) not null check (cantidad > 0),
  precio_unitario  integer not null check (precio_unitario >= 0),  -- CLP
  orden            integer not null default 0
);
create index if not exists idx_cotizacion_items
  on cotizacion_items (seccion_id, orden);

-- Cotizaciones generadas por clientes desde el sitio (también son leads)
create table if not exists cotizaciones_emitidas (
  id             uuid primary key default gen_random_uuid(),
  folio_num      bigint generated always as identity,  -- correlativo → "COT-000123"
  modelo_slug    text not null,
  kit            text not null,
  nombre         text not null,
  email          text not null,
  telefono       text,
  snapshot       jsonb not null,   -- secciones+ítems+precios tal como se emitió
  neto_clp       integer not null,
  descuento_clp  integer not null default 0,
  iva_clp        integer not null,
  total_clp      integer not null,
  created_at     timestamptz not null default now()
);
create index if not exists idx_cotizaciones_emitidas_created
  on cotizaciones_emitidas (created_at desc);
create index if not exists idx_cotizaciones_emitidas_modelo
  on cotizaciones_emitidas (modelo_slug, kit);

-- ------------------------------------------------------------
--  MIGRACIÓN 005 — Superficie por plantilla
--
--  El "costo x m²" de las notas ya no es un texto fijo: se calcula
--  en cada emisión como neto con descuento ÷ superficie. La
--  superficie viene del Excel ("TULIPAN 80M2 …") y es editable
--  en el admin.
-- ------------------------------------------------------------
alter table cotizacion_plantillas add column if not exists superficie_m2 integer
  check (superficie_m2 is null or superficie_m2 > 0);

-- ------------------------------------------------------------
--  MIGRACIÓN 006 — Pedidos de paneles (tienda /paneles)
--
--  Cada "cotización de paneles" que arma un cliente en la tienda
--  queda aquí con folio propio (PAN-#####) y snapshot de los
--  productos y precios al momento de emitirse. Los productos
--  viven en la tabla `paneles` (existente) y los administra el
--  equipo desde /admin/paneles.
-- ------------------------------------------------------------
create table if not exists pedidos_paneles (
  id          uuid primary key default gen_random_uuid(),
  folio_num   bigint generated always as identity,   -- correlativo → "PAN-00001"
  nombre      text not null,
  email       text not null,
  telefono    text,
  snapshot    jsonb not null,   -- items con nombre/precio/cantidad tal como se emitió
  total_clp   integer not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_pedidos_paneles_created
  on pedidos_paneles (created_at desc);

-- ------------------------------------------------------------
--  MIGRACIÓN 007 — Imágenes subidas desde el admin
--
--  El equipo sube fotos desde su computador (no pega URLs). El
--  archivo se guarda aquí en base64 y se sirve por
--  /api/imagenes/<id> con cache inmutable, así el HTML del sitio
--  no carga con el peso de la foto. Base64 y no bytea para no
--  depender de cómo cada driver serializa binarios.
-- ------------------------------------------------------------
create table if not exists imagenes (
  id          uuid primary key default gen_random_uuid(),
  mime        text not null check (mime in ('image/webp','image/jpeg','image/png')),
  datos       text not null,          -- contenido del archivo en base64
  nombre      text,                   -- nombre original, como referencia
  bytes       integer not null check (bytes > 0),
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
--  MIGRACIÓN 008 — Proyectos administrables (CMS de obras)
--
--  La tabla `proyectos` existía desde el diseño inicial; recién
--  ahora se usa. Se suman dos campos:
--   * estado: obra terminada u obra en proceso — el sitio la
--     distingue con una etiqueta "En construcción".
--   * video_url: link de YouTube/Vimeo opcional; la página del
--     proyecto lo muestra embebido entre la reseña y la galería.
-- ------------------------------------------------------------
alter table proyectos add column if not exists estado text not null default 'terminada'
  check (estado in ('terminada','en_proceso'));
alter table proyectos add column if not exists video_url text;

-- ------------------------------------------------------------
--  MIGRACIÓN 009 — El video puede reemplazar la foto de la reseña
--
--  Si video_en_resena es true (y hay video_url), la sección "La casa"
--  muestra el video embebido en vez de la foto vertical, y la sección
--  de video propia no se repite más abajo.
-- ------------------------------------------------------------
alter table proyectos add column if not exists video_en_resena boolean not null default false;
