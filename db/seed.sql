-- ============================================================
--  MundoSIP — Datos semilla
--  Idempotente: re-ejecutar no duplica filas.
--  Aplicar:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f db/seed.sql
--
--  Nota: no se siembran URLs de imágenes falsas; modelo_imagenes
--  se llena cuando existan los renders reales en el storage.
-- ============================================================

-- ------------------------------------------------------------
--  Modelos
-- ------------------------------------------------------------
insert into modelos (slug, nombre, superficie_m2, habitaciones, banos, precio_desde_clp, descripcion, destacado, orden) values
  ('tulipan', 'Tulipán', 80, 3, 2, 8900000,
   'Casa de 80 m² en un piso, con tres dormitorios y dos baños. Distribución eficiente y luminosa, pensada para familias que buscan su primera vivienda definitiva en panel SIP.',
   true, 1),
  ('lupino', 'Lupino', 125, 3, 2, 12400000,
   'Casa de 125 m² con tres dormitorios, dos baños y amplios espacios comunes. Living-comedor integrado de doble altura y terraza cubierta.',
   true, 2),
  ('azucena', 'Azucena', 140, 4, 3, 14900000,
   'Casa de 140 m² con cuatro dormitorios y tres baños. Nuestro modelo más amplio: suite principal con baño privado y walk-in closet.',
   true, 3)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
--  Kits: Inicial (base común) + extras del Full (el piso)
--  El radier no va en ningún kit: se cotiza aparte por terreno.
-- ------------------------------------------------------------
insert into kit_items (modelo_id, tipo, texto, orden)
select m.id, 'inicial', t.texto, t.orden
from modelos m,
(values
  ('Muros exteriores – panel SIP 94 mm', 1),
  ('Muros interiores – panel SIP 94 mm', 2),
  ('Cubierta – panel SIP 169 mm', 3),
  ('Todas las maderas verticales y horizontales de unión', 4),
  ('Todas las fijaciones', 5),
  ('Espuma poliuretano', 6),
  ('Membrana hidrófuga', 7),
  ('Planos generales de arquitectura', 8),
  ('Planos de montaje', 9),
  ('Dimensionado de paneles listo para armar', 10),
  ('Instructivo de montaje', 11),
  ('Plano esquemático de electricidad', 12),
  ('Plano esquemático sanitario', 13),
  ('Capacitación en terreno antes de comenzar obra', 14)
) as t(texto, orden)
where m.slug in ('tulipan','lupino','azucena')
  and not exists (
    select 1 from kit_items k where k.modelo_id = m.id and k.tipo = 'inicial'
  );

insert into kit_items (modelo_id, tipo, texto, orden)
select m.id, 'full_extra', t.texto, t.orden
from modelos m,
(values
  ('Piso – panel SIP 169 mm: la plataforma estructural de tu casa', 1),
  ('Todas las maderas de piso', 2)
) as t(texto, orden)
where m.slug in ('tulipan','lupino','azucena')
  and not exists (
    select 1 from kit_items k where k.modelo_id = m.id and k.tipo = 'full_extra'
  );

-- ------------------------------------------------------------
--  Paneles SIP
-- ------------------------------------------------------------
insert into paneles (slug, nombre, precio_clp, dimensiones, espesor_osb, espesor_eps, densidad_eps, apto_para_madera, descripcion, orden) values
  ('panel-sip-94mm', 'Panel SIP 94 MM', 61000,
   '1220x2440x94 mm', '9.5 mm', '75 mm', '15 kg/m³', '2×3" calibrada',
   'Panel estructural aislado de 94 mm, ideal para muros interiores y exteriores en viviendas de un piso.', 1),
  ('panel-sip-119mm', 'Panel SIP 119 MM', 65000,
   '1220x2440x119 mm', '9.5 mm', '100 mm', '15 kg/m³', '2×4" calibrada',
   'Panel de 119 mm con mayor aislación térmica, recomendado para zonas de clima frío y muros perimetrales.', 2),
  ('panel-sip-122mm', 'Panel SIP 122.2 MM', 73000,
   '1220x2440x122 mm', '11 mm', '100 mm', '15 kg/m³', '2×4" calibrada',
   'Panel de 122.2 mm con OSB de 11 mm: mayor resistencia estructural para cubiertas y entrepisos.', 3)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
--  Preguntas frecuentes
-- ------------------------------------------------------------
insert into faqs (pregunta, respuesta, orden)
select t.pregunta, t.respuesta, t.orden
from (values
  ('¿Qué es un panel SIP?',
   'Un panel SIP (Structural Insulated Panel) es un panel estructural aislado compuesto por un núcleo de poliestireno expandido (EPS) entre dos placas de OSB. Combina estructura y aislación térmica en un solo elemento, lo que permite construir más rápido y con mejor eficiencia energética que la construcción tradicional.', 1),
  ('¿El kit incluye el montaje de la casa?',
   'El kit está pensado para autoconstrucción: incluye planos, instructivo y todos los materiales estructurales. El Kit Full agrega además capacitación de montaje en terreno para guiar a tu equipo en el armado.', 2),
  ('¿Cuál es la diferencia entre el Kit Básico y el Kit Full?',
   'El Kit Básico incluye los paneles de muros y cubierta, maderas de unión, fijaciones, planos de arquitectura e instructivo de montaje. El Kit Full suma espuma de poliuretano, membrana hidrófuga, planos de montaje detallados, dimensionado listo para armar, planos eléctricos y sanitarios, y capacitación en terreno.', 3),
  ('¿Hacen despacho a regiones?',
   'Sí, despachamos a todo Chile. El costo del flete se cotiza según destino y volumen del pedido.', 4),
  ('¿Puedo panelizar mi propio proyecto?',
   'Sí. Si ya tienes tus planos, nuestro servicio de panelizado los optimiza: te asesoramos y cotizamos, panelizamos de forma eficiente, elaboramos los paneles dimensionados y los despachamos a tu obra.', 5)
) as t(pregunta, respuesta, orden)
where not exists (select 1 from faqs);

-- ------------------------------------------------------------
--  Proyectos construidos (galería)
--  URLs locales por ahora; en fase 2 serán URLs de Cloudinary.
-- ------------------------------------------------------------
insert into proyectos (slug, nombre, region_slug, region_nombre, ubicacion, superficie_m2, ano_diseno, ano_construccion, resumen, resena_destacada, resena, destacado, orden) values
  ('casa-lago-panguipulli', 'Casa Lago Panguipulli', 'los-rios', 'Los Ríos', 'Panguipulli, Región de Los Ríos', 170, 2023, 2024,
   'Refugio sureño en primera línea de lago, revestido en tejuela de alerce.',
   'Inspirada en los galpones tradicionales del sur, la casa combina tejuelas de alerce reciclado con planchas de zinc prepintado. El panel SIP dejó la estructura lista en cinco semanas, con la aislación resuelta desde fábrica.',
   'Ubicada en la primera línea del lago Panguipulli, la vivienda se organiza en dos volúmenes que abrazan la vista al agua. Los ventanales del living se orientan al poniente para capturar la última luz de la tarde.',
   true, 1),
  ('casa-ladera-ranco', 'Casa Ladera Ranco', 'los-rios', 'Los Ríos', 'Lago Ranco, Región de Los Ríos', 185, 2022, 2024,
   'Volumen contemporáneo suspendido sobre la pendiente, con vista abierta al valle.',
   'La casa se posa sobre pilotes para tocar lo menos posible la ladera. Sus dos pisos en panel SIP se montaron en cuatro semanas, y el revestimiento mixto de zinc negro y madera nativa dialoga con el paisaje sin imitarlo.',
   'Cada recinto busca una vista distinta del valle: el estar se abre en esquina con termopaneles de piso a cielo, mientras la terraza en voladizo extiende el living hacia el exterior durante el verano.',
   true, 2),
  ('refugio-bosque-nativo', 'Refugio Bosque Nativo', 'los-lagos', 'Los Lagos', 'Puerto Varas, Región de Los Lagos', 124, 2023, 2024,
   'Casa de dos pisos escondida entre coigües, pensada para desconectarse.',
   'El encargo era claro: una casa que desapareciera en el bosque. El volumen compacto en panel SIP minimiza la huella sobre el terreno y el zinc negro del revestimiento se funde con las sombras de los coigües.',
   'La aislación térmica del SIP permitió reducir la calefacción a una sola estufa de pellet. Los ventanales del segundo piso enmarcan las copas de los árboles, como vivir en una casa-mirador.',
   false, 3),
  ('casa-costa-pacifico', 'Casa Costa Pacífico', 'los-lagos', 'Los Lagos', 'Maicolpué, Región de Los Lagos', 98, 2024, 2025,
   'Casa compacta frente al mar, diseñada para resistir el clima costero.',
   'Frente al Pacífico el clima no perdona: viento, sal y lluvia horizontal. El panel SIP con revestimiento ventilado protege la estructura, y la planta compacta concentra el calor en los meses de invierno.',
   'La casa se orienta hacia la rompiente y abre su fachada norte a un patio protegido del viento sur. Todo el programa cabe en un piso, pensado para habitarse todo el año.',
   false, 4)
on conflict (slug) do nothing;

-- Imágenes de cada proyecto (portada / reseña / galería)
insert into proyecto_imagenes (proyecto_id, tipo, url, alt, orden)
select p.id, t.tipo, t.url, t.alt, t.orden
from proyectos p
join (values
  ('casa-lago-panguipulli', 'portada', '/images/proyectos/casa-lago-panguipulli/portada.jpg', 'Casa Lago Panguipulli revestida en tejuelas junto al lago', 0),
  ('casa-lago-panguipulli', 'resena',  '/images/proyectos/casa-lago-panguipulli/resena.jpg', 'Vista aérea de Casa Lago Panguipulli entre árboles', 0),
  ('casa-lago-panguipulli', 'galeria', '/images/proyectos/casa-lago-panguipulli/galeria-1.jpg', 'Fachada principal hacia el lago', 1),
  ('casa-lago-panguipulli', 'galeria', '/images/proyectos/casa-lago-panguipulli/galeria-2.jpg', 'Detalle de revestimiento en tejuela', 2),
  ('casa-lago-panguipulli', 'galeria', '/images/proyectos/casa-lago-panguipulli/galeria-3.jpg', 'Emplazamiento en el bosque', 3),
  ('casa-lago-panguipulli', 'galeria', '/images/proyectos/casa-lago-panguipulli/galeria-4.jpg', 'Vista del volumen principal', 4),
  ('casa-lago-panguipulli', 'galeria', '/images/proyectos/casa-lago-panguipulli/galeria-5.jpg', 'Casa vista desde el acceso', 5),
  ('casa-ladera-ranco', 'portada', '/images/proyectos/casa-ladera-ranco/portada.jpg', 'Casa Ladera Ranco sobre pilotes en la pendiente', 0),
  ('casa-ladera-ranco', 'resena',  '/images/proyectos/casa-ladera-ranco/resena.jpg', 'Fachada de Casa Ladera Ranco con revestimiento mixto', 0),
  ('casa-ladera-ranco', 'galeria', '/images/proyectos/casa-ladera-ranco/galeria-1.jpg', 'Vista lateral del volumen principal', 1),
  ('casa-ladera-ranco', 'galeria', '/images/proyectos/casa-ladera-ranco/galeria-2.jpg', 'La casa en su contexto de pradera', 2),
  ('casa-ladera-ranco', 'galeria', '/images/proyectos/casa-ladera-ranco/galeria-3.jpg', 'Detalle de balcones y celosías', 3),
  ('casa-ladera-ranco', 'galeria', '/images/proyectos/casa-ladera-ranco/galeria-4.jpg', 'Vista desde el camino de acceso', 4),
  ('casa-ladera-ranco', 'galeria', '/images/proyectos/casa-ladera-ranco/galeria-5.jpg', 'Fachada poniente al atardecer', 5),
  ('refugio-bosque-nativo', 'portada', '/images/proyectos/refugio-bosque-nativo/portada.jpg', 'Refugio Bosque Nativo entre coigües', 0),
  ('refugio-bosque-nativo', 'resena',  '/images/proyectos/refugio-bosque-nativo/resena.jpg', 'Fachada del refugio con revestimiento negro', 0),
  ('refugio-bosque-nativo', 'galeria', '/images/proyectos/refugio-bosque-nativo/galeria-1.jpg', 'La casa camuflada en el bosque', 1),
  ('refugio-bosque-nativo', 'galeria', '/images/proyectos/refugio-bosque-nativo/galeria-2.jpg', 'Acceso principal entre árboles', 2),
  ('refugio-bosque-nativo', 'galeria', '/images/proyectos/refugio-bosque-nativo/galeria-3.jpg', 'Detalle de fachada y ventanas', 3),
  ('refugio-bosque-nativo', 'galeria', '/images/proyectos/refugio-bosque-nativo/galeria-4.jpg', 'Vista del entorno de pradera y bosque', 4),
  ('casa-costa-pacifico', 'portada', '/images/proyectos/casa-costa-pacifico/portada.jpg', 'Casa Costa Pacífico frente al mar', 0),
  ('casa-costa-pacifico', 'resena',  '/images/proyectos/casa-costa-pacifico/resena.jpg', 'Vista aérea de la casa y la costa', 0),
  ('casa-costa-pacifico', 'galeria', '/images/proyectos/casa-costa-pacifico/galeria-1.jpg', 'La casa sobre la pradera costera', 1),
  ('casa-costa-pacifico', 'galeria', '/images/proyectos/casa-costa-pacifico/galeria-2.jpg', 'Vista hacia la rompiente', 2),
  ('casa-costa-pacifico', 'galeria', '/images/proyectos/casa-costa-pacifico/galeria-3.jpg', 'Volumen principal al atardecer', 3),
  ('casa-costa-pacifico', 'galeria', '/images/proyectos/casa-costa-pacifico/galeria-4.jpg', 'Contexto costero del proyecto', 4)
) as t(slug, tipo, url, alt, orden) on t.slug = p.slug
where not exists (
  select 1 from proyecto_imagenes pi where pi.proyecto_id = p.id
);
