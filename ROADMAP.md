# MundoSIP — Roadmap cronológico

> Orden de trabajo hasta el lanzamiento y después de él.
> **El sitio se publica al final de la Fase 1** (paso 4). No necesitas el backoffice ni las promos para publicar: los datos viven tipados en `src/data/*.ts` detrás de `repository.ts`, y el CMS se enchufa después sin tocar el resto del sitio.

---

## FASE 1 — Terminar el sitio público (antes de publicar)

### 1. Páginas pendientes
- [ ] **/paneles** — hoy es un stub de 17 líneas. Página con los 3 paneles (94/119/122 mm), specs técnicas, ventajas del SIP. Datos ya existen en Neon (`paneles`) y deben quedar en `src/data/` tras `repository.ts` como el resto.
- [ ] **/contacto** — hoy es un stub. Formulario (nombre, email, teléfono, mensaje, modelo de interés) que escriba en la tabla `leads` de Neon vía Server Action. Mientras no esté Resend (Fase 2), el aviso por email puede esperar: el lead queda guardado en la DB y además botón directo a WhatsApp (wa.me/56940367867).

### 2. Contenido real
- [ ] Reemplazar fotos placeholder de **Process** (`public/images/proceso-*.jpg` son frames del video) por fotos reales de equipo/proceso.
- [ ] Revisar fotos de **proyectos** (algunas no corresponden al proyecto real — estaba pendiente).
- [ ] Revisión final de textos, precios y datos de los 3 modelos (Tulipán / Lupino / Azucena) y kits.

### 3. Pre-lanzamiento (QA + SEO)
- [ ] Metadata por página (title/description), Open Graph + imagen OG, favicon definitivo.
- [ ] `sitemap.xml` y `robots.txt` (Next los genera con `app/sitemap.ts` y `app/robots.ts`).
- [ ] QA responsive (mobile/tablet/desktop) y modo oscuro si aplica.
- [ ] `npm run build` limpio, revisar Lighthouse (peso del video hero, imágenes).
- [ ] Analytics (Vercel Analytics o GA4).

### 4. 🚀 PUBLICAR — **este es el momento**
- [ ] Subir el repo a GitHub (primer push real; `.env.local` NUNCA al repo).
- [ ] Deploy en **Vercel**: importar repo, setear `DATABASE_URL` (Neon) en variables de entorno.
- [ ] Conectar el **dominio** (mundosip.cl o el que corresponda) + verificar SSL.
- [ ] Smoke test en producción: todas las rutas, formulario de contacto → lead en Neon, WhatsApp, video hero.

**El sitio queda público y funcionando aquí.** Todo lo que sigue es administración interna y no bloquea el lanzamiento.

---

## FASE 2 — Backoffice y administración (después de publicar)

### 5. Payload CMS 3 (el backoffice)
- [ ] Instalar Payload 3 sobre el mismo proyecto Next + Neon. **Ojo**: Payload crea sus propias tablas — no correr `db/schema.sql` sobre esa base; migrar los datos de seed a las colecciones de Payload.
- [ ] Colecciones espejo de los contratos ya definidos: `modelos` (`features/modelos/modelo.types.ts`), `proyectos` (`features/proyectos/proyecto.types.ts`), `paneles`, `faqs`, `leads`, `users`.
- [ ] Media en **Cloudinary** (solo URLs en la DB).
- [ ] Cambiar **solo `src/data/repository.ts`** para leer desde Payload — el resto del sitio no se toca (para eso existe esa capa).
- [ ] Acceso admin para el equipo no técnico + carga de un modelo/proyecto de prueba de punta a punta.

### 6. Promos y ofertas
- [ ] Campos de promoción en la colección `modelos` (precio normal / precio oferta / vigencia / badge).
- [ ] UI de oferta en `ModeloCard` y ficha (el diseño de "precio tipo oferta" ya existe; se vuelve administrable).
- [ ] Banner/CTA de campaña administrable desde el CMS (opcional).

### 7. Emails y extras
- [ ] **Resend**: notificación por email al recibir un lead + autorespuesta al cliente.
- [ ] Pagos/reservas online (si se confirma que va).

### 8. Redeploy con backoffice
- [ ] Deploy de la versión con Payload (mismo dominio, mismo repo). El sitio nunca se cae: es un redeploy sobre lo ya publicado.

---

## Resumen en una línea

**Paneles → Contacto → fotos/textos reales → SEO/QA → GitHub + Vercel + dominio = PUBLICAR → Payload (backoffice) → promos → Resend → redeploy.**
