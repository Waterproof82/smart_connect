# Protocolo SEO — Digitaliza Tenerife

**Dominio oficial:** `https://digitalizatenerife.es` (nunca `smartconnectai.es`). **Fecha:** 2026-10-01.
**Fuentes:** `docs/PLAN_SEO_CARTA_DIGITAL_LANDING.md` (GSC 2026-10-01), `docs/SEO_IMPLEMENTATION.md`, código actual del repo.
**Plantilla de referencia por página:** `src/features/tap-review/presentation/TapReviewPage.tsx` (Helmet + canonical + hreflang + OG/Twitter + `ServiceSchema` + `BreadcrumbListSchema` + `SeoFaqSchema`).

> **Aviso de datos:** la muestra de GSC es mínima (25 clics, ~420 impresiones; 24 de 25 clics anonimizados). Las keywords marcadas **[NO VALIDADA]** no tienen volumen medido: antes de fijar H1/title definitivos hay que comprobarlas en Keyword Planner / Trends (geo España y Canarias). Los títulos propuestos son hipótesis de trabajo, no decisiones cerradas.

---

## 1. Especificación SEO por página

Reglas comunes: título ≤ 60 caracteres, descripción 110–155, un único H1, canonical absoluta sin barra final (salvo `/`), `hreflang` `es` + `x-default` apuntando a sí misma (no existen URLs `/en/`), `og:image` ver nota inferior. Todo el texto vía i18n (`t.*`, es/en).

### 1.1 Tabla resumen

| Ruta | Keyword objetivo (evidencia) | Title (long.) | Meta description (long.) | H1 (long.) | Canonical |
|---|---|---|---|---|---|
| `/` | Marca + hub. "digitalizatenerife.es" (20 impr.), "digitaliza" (4). Home hoy: pos. 44 | `Digitaliza Tenerife \| Carta digital, NFC e IA para negocios` (59) | `Carta digital sin comisiones, tarjetas NFC para reseñas de Google, chatbots con IA y TPV para restaurantes y negocios de Tenerife y Canarias.` (141) | Mantener `Hero.tsx:22`; reescribir para reflejar los 2 productos estrella + hub | `https://digitalizatenerife.es/` |
| `/carta-digital` | `carta digital restaurante` **[NO VALIDADA]** (GSC: 0 impr.); secundarias `carta qr restaurante`, `pedidos sin comisiones`, `alternativa a glovo` **[NO VALIDADAS]** | `Carta digital sin comisiones \| Digitaliza Tenerife` (50) | `Glovo se lleva en torno al 30 % de comisión. Con nuestra carta digital para restaurantes pagas 0 %: pedidos en mesa y recogida, clientes tuyos.` (143) | `Carta digital para restaurantes con pedidos sin comisiones` (58) | `https://digitalizatenerife.es/carta-digital` |
| `/tarjetas-nfc` | **NO CAMBIAR.** `tap to review` (5), `tap nfc` (4), `tapstar` (3, único clic). Pos. 7,3, CTR 15 % | **Mantener** `Tarjetas NFC Tap-to-Review \| Digitaliza Tenerife` (49) — `TapReviewPage.tsx:19` | **Mantener** (135) — `TapReviewPage.tsx:25-26` | **Mantener** `TapReviewPage.tsx:23-24` | `https://digitalizatenerife.es/tarjetas-nfc` |
| `/ia-chatbots-tenerife` | Principal `chatbots ia tenerife` (20 impr.); cluster: `ia para empresas tenerife` (35), `aplicaciones ia tenerife` (10), `robots de atención al público tenerife` (9), `inteligencia artificial empresas tenerife` (8), `chatbots whatsapp tenerife` (1). Cluster total 84 impr., pos. 61–94. Automatización: `automatización procesos tenerife` (12), `automatización empresas tenerife` (5), `automatización n8n tenerife` (2). Cluster total 20 impr. | `Chatbots IA y automatización en Tenerife \| Digitaliza` (53) | `Chatbots con IA, WhatsApp y automatización de procesos con n8n para empresas de Tenerife: atiende a tus clientes 24/7 y ahorra horas de gestión.` (144) | `Chatbots con IA y automatización para empresas en Tenerife` (58) | `https://digitalizatenerife.es/ia-chatbots-tenerife` |
| `/tpv-restaurantes` | `tpv restaurantes` / `tpv para restaurantes canarias` **[NO VALIDADAS]**; término muy competitivo y sin señal GSC | `TPV para restaurantes: 13 módulos \| Digitaliza Tenerife` (55) | `TPV para restaurantes y bares en Canarias: cobro, comandero, KDS de cocina, reservas, stock, alérgenos y más. 13 módulos integrados en un solo sistema.` (151) | `TPV para restaurantes con 13 módulos integrados` (47) | `https://digitalizatenerife.es/tpv-restaurantes` |
| `/about` | Entidad/marca (E-E-A-T). Sin keyword comercial | `Sobre Digitaliza Tenerife — Quiénes somos` (41, actual `AboutPage.tsx:19`) | Mantener la actual | Mantener | `https://digitalizatenerife.es/about` |
| `/legal/aviso`, `/legal/privacidad`, `/legal/cookies` | Ninguna | Específico por página + ` \| Digitaliza Tenerife` | 110–155, descriptiva | 1 H1 (`LegalPage.tsx`) | Auto-referenciada. **`noindex` NO** (están en sitemap; mantener indexables, prioridad 0.3) |

Notas de redacción:
- `/carta-digital`: el mensaje es solo "Glovo ~30 % de comisión; con nuestra carta digital 0 % de comisión". **Sin cifras de beneficio, calculadoras ni explicaciones adicionales.** Redacción prudente (plan §2): "en torno al 30 %", con nota "Glovo es marca de terceros; tarifas según condiciones del partner, revisadas en [fecha]". No repetir "Glovo" en el H1 (marca de terceros); sí en title/description o H2.
- `/ia-chatbots-tenerife`: "robots de atención al público" se cubre como sinónimo dentro de la página, no como página aparte. **No** crear página para "Canarias Digitaliza" (probable confusión con programa público); como máximo una pregunta de FAQ aclarando que somos agencia privada.
- Si Keyword Planner invalida `carta digital restaurante` como término principal, sustituir por el de mayor volumen real (`carta qr`, `menú qr`…) **sin cambiar la URL**.

**OG image (todas):** hoy solo existe `public/icon.png` (512×512, cuadrada) y se declara con `twitter:card=summary_large_image` (`TapReviewPage.tsx:66-70`, `App.tsx` Helmet). Crear 1 imagen **1200×630** (WebP/PNG < 300 KB) por página nueva (`/og/carta-digital.png`, `/og/ia-chatbots.png`, `/og/tpv.png`) más una genérica para `/`, `/about` y legales; añadir `og:image:width/height/alt`. Hasta que existan, usar `icon.png` y `twitter:card=summary` (no `summary_large_image`).

### 1.2 Esquema de encabezados (H2) y JSON-LD por página

| Ruta | H2 outline (un H1; H3 solo bajo su H2) | JSON-LD (tipos) |
|---|---|---|
| `/` | 1. Dos productos estrella (Carta digital · Tarjetas NFC) 2. Más servicios (IA y chatbots · Automatización · TPV) 3. Resultados / prueba social (solo cifras verificables) 4. Preguntas frecuentes (5–6) 5. Contacto | `@graph`: `LocalBusiness` (`#organization`), `WebSite` (`#website`, con `publisher` → `#organization`), `WebPage` (`#webpage`, `isPartOf` → `#website`), `ItemList` con los productos/servicios (URLs `/carta-digital`, `/tarjetas-nfc`, `/ia-chatbots-tenerife`, `/tpv-restaurantes`, sin fragmentos `#`), `FAQPage`. **No** `BreadcrumbList` en home |
| `/carta-digital` | 1. 0 % comisión frente al ~30 % de Glovo (comparativa visual de dos columnas, sin cuentas) 2. Problema y solución 3. Cómo funciona (3 pasos) 4. Clientes y promociones propios (cupones, fidelización) 5. Demo y modos (mesa · recogida · domicilio) 6. Funcionalidades (Telegram, base de datos de clientes, antidesperdicio) 7. Preguntas frecuentes 8. CTA final | `Service` (+`provider` por `@id`), `BreadcrumbList` (Inicio › Carta digital), `FAQPage`, `HowTo` (cómo funciona, solo si los pasos están visibles), `SoftwareApplication` opcional (sin `offers`/`aggregateRating` inventados) |
| `/tarjetas-nfc` | **No tocar** estructura. Mantener H2 actuales de `TapReviewSection` + FAQ NFC | Mantener `Service`, `BreadcrumbList`, `FAQPage` (`TapReviewPage.tsx:73-94`) |
| `/ia-chatbots-tenerife` | 1. Chatbots con IA para tu negocio (y robots de atención al público) 2. Chatbot en web y WhatsApp 3. Automatización de procesos con n8n 4. Casos para hostelería y comercio local (demo del chatbot RAG propio) 5. Cómo trabajamos (3 pasos) 6. Preguntas frecuentes (incluye aclaración "Canarias Digitaliza") 7. CTA | `Service` (areaServed Tenerife/Canarias; `serviceType` "Chatbots con IA y automatización"), `BreadcrumbList`, `FAQPage`, `HowTo` opcional |
| `/tpv-restaurantes` | 1. Qué incluye el TPV (resumen) 2–14. Un H2 por módulo (los 13 de `tpvModules.ts`) agrupados en 3–4 bloques (sala · cocina · gestión · venta online) mediante H2 de grupo + H3 de módulo si son demasiados 15. Preguntas frecuentes 16. CTA | `Service`/`SoftwareApplication` (`applicationCategory: BusinessApplication`), `ItemList` de módulos, `BreadcrumbList`, `FAQPage` |
| `/about` | Misión · Valores · Contacto | `Organization`/`AboutPage` (existente), `BreadcrumbList` |
| `/legal/*` | Secciones del texto legal | `BreadcrumbList` opcional; sin FAQ |

Regla JSON-LD: referenciar siempre la entidad por `@id` (`https://digitalizatenerife.es/#organization`) en `provider`/`publisher`/`author` en lugar de duplicar objetos `Organization` (ver problemas P-08, P-09).

### 1.3 Enlaces internos y OG por página (resumen; mapa completo en §3)

| Ruta | Enlaces entrantes (mín.) | Enlaces salientes (mín.) | OG image |
|---|---|---|---|
| `/` | Logo/navbar de todas, footer | 4 páginas de servicio, `/about`, `#contacto` | Genérica 1200×630 |
| `/carta-digital` | Home (tarjeta producto estrella), navbar, `/tarjetas-nfc`, `/tpv-restaurantes`, footer | `/tarjetas-nfc`, `/tpv-restaurantes`, `/ia-chatbots-tenerife` (chatbot para el restaurante), contacto | Específica |
| `/tarjetas-nfc` | Home, navbar, `/carta-digital`, footer | `/carta-digital`, `/ia-chatbots-tenerife` | La actual hasta crear 1200×630 |
| `/ia-chatbots-tenerife` | Home (más servicios), navbar, `/carta-digital`, `/tpv-restaurantes`, footer | `/carta-digital`, `/tarjetas-nfc`, `/tpv-restaurantes`, contacto | Específica |
| `/tpv-restaurantes` | Home (más servicios), navbar/footer, `/carta-digital` | `/carta-digital`, `/ia-chatbots-tenerife`, contacto | Específica |

---

## 2. Checklist obligatoria pre-merge (toda página nueva)

Ninguna casilla puede quedar sin marcar. Un PR de página nueva incluye el resultado en su descripción.

**Routing y build (los 4+ puntos se tocan siempre juntos)**
- [ ] Ruta añadida en `src/entry-client.tsx` (lazy) **y** `src/entry-server.tsx` (import estático); sin eso Google recibe JS vacío o el footer muestra 404.
- [ ] Entrada en `scripts/site-routes.json` (`path`, `priority`, `changefreq`, `lastmod` real = fecha del cambio de contenido). Esto alimenta sitemap **y** prerender; el test `tests/unit/scripts/routeParity.test.ts` debe pasar.
- [ ] Prerender OK: tras `npm run build` existe `dist/<ruta>/index.html` con `<title>`, `<meta name="description">`, canonical, H1 y JSON-LD **dentro del HTML estático** (comprobar con `curl`/ver código fuente, no con DevTools).
- [ ] `dist/sitemap.xml` incluye la URL (sin `#`, sin barra doble, `<loc>` = canonical).
- [ ] `vercel.json`: (a) **rewrite** `/<ruta>` → `/<ruta>/index.html` **antes** del catch-all `/:path*`; (b) ruta añadida a la regex de `Cache-Control` de HTML (`/(|about|tarjetas-nfc|…)`); (c) si la ruta existía como redirect (caso `/carta-digital`, línea 12), **eliminar ese redirect** y verificar que no queda ninguno apuntando a ella.
- [ ] Redirects antiguos reasignados al destino temáticamente correcto (ver P-03), en **un solo salto** y con `permanent: true`.
- [ ] `public/llms.txt` **y** `public/.well-known/llms.txt` actualizados (URL, descripción de una línea, sin anclas `#`), y `sha256` de `public/.well-known/agent-skills/index.json` recalculado (el test `geoSurfaces.test.ts:40` lo exige sobre `public/llms.txt`).
- [ ] `src/WebMCP.ts` (URLs de `list_products`/`get_product_info`) apunta a la nueva URL, no a anclas.
- [ ] `src/shared/config/solutions.ts`: `href` de la solución apunta a la ruta real (hoy `"#tienda-carta-digital"`, línea 34).

**On-page**
- [ ] `<title>` ≤ 60 y único en el sitio; `meta description` 110–155 y única; ambos con la keyword principal y sin truncarse en SERP.
- [ ] Exactamente **1 `<h1>`** por página (comprobar en `dist/<ruta>/index.html`: `grep -c "<h1"` = 1), con la keyword principal, visible (no `sr-only` en páginas nuevas) y distinto del `<title>` literal.
- [ ] Jerarquía de encabezados sin saltos (H1 › H2 › H3), sin H2 vacíos ni decorativos; ningún `<h1>` dentro de componentes compartidos reutilizados en otra ruta.
- [ ] Breadcrumbs: `BreadcrumbListSchema` (Inicio › Página) coherente con una miga visible o, al menos, con la jerarquía real de URLs.
- [ ] Canonical absoluta, auto-referenciada, con `https://digitalizatenerife.es`, sin parámetros ni fragmento; **una sola** `<link rel="canonical">` en el HTML final (comprobar que Helmet no duplica la del `index.html`/otro componente).
- [ ] `hreflang` `es` + `x-default` (solo URLs que existan; no `/en/`).
- [ ] Open Graph + Twitter completos (`og:title/description/type/url/image/locale/site_name`, `twitter:card/title/description/image`); la imagen existe en `public/` (`Glob public/*`) y su tamaño coincide con el `twitter:card` declarado.
- [ ] JSON-LD válido (Rich Results Test + validator.schema.org), sin `aggregateRating`/`offers`/reseñas inventados, con `provider` por `@id`.
- [ ] i18n: ningún string de SEO ni de contenido hardcodeado; claves en **ambos** objetos `es` y `en` de `LanguageContext.tsx`. Español de España (sin voseo).
- [ ] Enlaces internos entrantes y salientes del §3 implementados con `<a href>`/`<Link>` rastreables (nunca `onClick`), anchor text descriptivo, sin `#` ni `javascript:`.
- [ ] Imágenes: `alt` descriptivo (o `alt=""` si decorativa), `width`/`height` explícitos, `loading="lazy"` salvo la imagen LCP (`fetchpriority="high"`), WebP/AVIF con `srcset` (patrón `*-320w/640w/1280w.webp`), peso < 150 KB por imagen de contenido.
- [ ] Core Web Vitals (Lighthouse móvil sobre `dist` servido): LCP < 2,5 s, CLS < 0,1, INP < 200 ms; el CSS crítico se inyecta en el prerender de la nueva ruta (`critical-css`, sin romper `assertBodyUnchanged`).

**Rastreo e indexación**
- [ ] Sin cadenas de redirección: toda URL antigua → destino final en 1 salto; `http://` → `https://` → sin `www` en 1 salto (probar con `curl -sIL`). Ninguna URL del sitemap, nav o footer devuelve 3xx.
- [ ] Sin canonicals duplicadas ni cruzadas: ninguna otra página declara la misma canonical; ningún redirect y canonical contradictorios.
- [ ] La URL no está bloqueada en `robots.txt` y no lleva `noindex` (ni meta ni `X-Robots-Tag`).
- [ ] Hidratación sin warnings en consola (SSR y cliente renderizan lo mismo).
- [ ] Contenido no duplicado: < 30 % de texto compartido con otra página (no repetir los 13 módulos TPV fuera de `/tpv-restaurantes`).
- [ ] Tras el deploy: Inspección de URL en GSC → "Solicitar indexación"; revisar Coverage a 1, 4 y 8 semanas.
- [ ] `npm run lint`, `npm run type-check`, `npm test`, `npm run build`; `CHANGELOG.md` [Unreleased] y audit log en `docs/audit/` (protocolos del proyecto).

---

## 3. Mapa de enlazado interno

Anchor text descriptivo, con keyword natural; un enlace contextual por destino y sección (no repetir 5 veces el mismo).

```
                       ┌────────────────────────────┐
   navbar/footer ────▶ │ /  (hub)                   │
                       └──┬──────┬───────┬──────┬───┘
         estrella #1      │      │       │      │  servicios secundarios
              ┌───────────┘      │       │      └──────────────┐
              ▼                  ▼       ▼                     ▼
      /carta-digital ◀──▶ /tarjetas-nfc   /ia-chatbots-tenerife ◀──▶ /tpv-restaurantes
              ▲                                                         │
              └─────────────────────────────────────────────────────────┘
```

| Desde → Hacia | Ubicación y anchor sugerido |
|---|---|
| `/` → `/carta-digital` | Tarjeta producto estrella #1: "Carta digital sin comisiones" |
| `/` → `/tarjetas-nfc` | Tarjeta producto estrella #2: "Tarjetas NFC para reseñas de Google" |
| `/` → `/ia-chatbots-tenerife` | Fila de servicios: "Chatbots con IA y automatización" |
| `/` → `/tpv-restaurantes` | Fila de servicios: "TPV para restaurantes" |
| `/` → `/about` | Franja "Quiénes somos" / footer |
| `/carta-digital` → `/tarjetas-nfc` | Bloque "Más reseñas en Google": "tarjetas NFC para reseñas" |
| `/carta-digital` → `/tpv-restaurantes` | Bloque pedidos/gestión: "TPV para restaurantes" |
| `/carta-digital` → `/ia-chatbots-tenerife` | Opcional: "chatbot para atender pedidos" |
| `/tarjetas-nfc` → `/carta-digital` | CTA secundario cercano al final: "carta digital sin comisiones" (**solo añadir un enlace; no tocar URL, H1 ni estructura**) |
| `/ia-chatbots-tenerife` → `/carta-digital` y `/tarjetas-nfc` | "Casos para hostelería": carta con pedidos, reseñas |
| `/ia-chatbots-tenerife` → `/tpv-restaurantes` | Automatización conectada al TPV |
| `/tpv-restaurantes` → `/carta-digital` | Módulo "Tienda / Carta digital": enlace a la página completa (en lugar de repetir contenido) |
| `/tpv-restaurantes` → `/ia-chatbots-tenerife` | Módulos de automatización |
| Todas → `/`, `/about`, `/legal/*` | Navbar + footer (ya existen; añadir las 3 nuevas rutas al navbar y footer) |
| `/about` → servicios | Lista de servicios con enlaces a las 4 páginas |

Reglas: máximo 3 clics desde `/` a cualquier página; ninguna página huérfana; sin enlaces a `/tap-review`, `/servicios`, `/contacto` ni a las URLs antiguas redirigidas (enlazar directamente al destino final, ver P-03); enlace a contacto como `/#contacto` solo si la home sigue teniendo esa ancla (el sitemap y llms.txt nunca llevan anclas).

---

## 4. Problemas concretos detectados en el repo

Prioridad: **A** = bloquea/daña indexación, **M** = medio, **B** = bajo/higiene.

| ID | Pri. | Problema | Evidencia | Acción |
|---|---|---|---|---|
| P-01 | A | `/carta-digital` está redirigida con 301 a `/`. Hay que eliminarla **antes** de publicar la página o la nueva ruta nunca se servirá | `vercel.json:12` | Borrar la línea 12 y añadir rewrite + cache header |
| P-02 | A | Faltan rewrites y `Cache-Control` para las 3 rutas nuevas y para las páginas legales (la regex solo cubre `/`, `about`, `tarjetas-nfc`). Sin rewrite las nuevas caen en el catch-all `_spa.html` (HTML sin contenido prerenderizado ni canonical) | `vercel.json:42`, `vercel.json:46-57` | Añadir rewrites (antes de la línea 56) y ampliar la regex de caché |
| P-03 | A | Redirects heredados envían a `/` todo el tráfico de URLs temáticas (automatización, WhatsApp, software, digitalización). Google trata redirects 301 a una página irrelevante como soft 404 y se pierde la señal del cluster IA/automatización (84+20 impr.) | `vercel.json:4-11` | Tras crear la página: `/automation-n8n`, `/whatsapp-automation`, `/automatizacion-restaurantes-n8n`, `/automatizacion-whatsapp-restaurante` → `/ia-chatbots-tenerife`; `/software-canarias`, `/software-restaurantes-canarias` → `/tpv-restaurantes`; `/digitalization-tenerife`, `/digitalizacion-hosteleria-tenerife` → `/`. Un solo salto cada una |
| P-04 | A | Catch-all `/:path*` → `_spa.html` devuelve **HTTP 200** para cualquier URL inexistente; el `noindex` del 404 solo existe vía JS, que Googlebot lee tarde. Riesgo de soft 404 y de que se indexen URLs basura. Coincide con los 4 "rastreada: sin indexar" de GSC | `vercel.json:56`, `NotFound.tsx:13` | Generar `dist/404.html` prerenderizado con `noindex` y servirlo con 404 (en Vercel: `404.html` en raíz y quitar el catch-all para rutas no-SPA, manteniendo solo `/admin`, `/panel`, `/login`) |
| P-05 | A | Llamadas de Coverage: 2 páginas indexadas, 5–7 sin indexar (2 por redirección con validación en Error, 4 rastreadas sin indexar, 1 descubierta). `http://` aparece con 8 impr. | Plan §1.3 punto 3; `vercel.json:29` (HSTS sin `preload`) | PR 0 del plan: identificar las 7 URLs, verificar `curl -sIL http://digitalizatenerife.es` (1 salto a https, sin cadena), revalidar en GSC |
| P-06 | A | `public/llms.txt` afirma "una única página principal… No existen otras URLs públicas" y "las 6 rutas públicas"; enlaza a anclas `#soluciones`, `#tienda-carta-digital`, `#contacto`. Quedará **falso** al publicar 3 rutas y contradice el sitemap | `public/llms.txt:5`, `:18-19`, `:22`, `:57` | Reescribir tras el lanzamiento (ver §2) |
| P-07 | M | Dos `llms.txt` distintos (`public/llms.txt` y `public/.well-known/llms.txt` difieren) y el `sha256` del índice de agent-skills depende del primero | `diff public/llms.txt public/.well-known/llms.txt`; `public/.well-known/agent-skills/index.json:10-11`; `tests/unit/scripts/geoSurfaces.test.ts:24-25,40` | Mantener una sola fuente (copiar en build) y recalcular hash al editar |
| P-08 | M | `WebPage` de la home usa `@id` = `https://digitalizatenerife.es` (sin `#webpage`) y duplica `author`/`publisher` como `Organization` anónimos en vez de referenciar `#organization` (que es `LocalBusiness`): entidad fragmentada en el grafo | `SeoSchema.tsx:60-86`, `:23-24` | `@id: ${ORG_URL}/#webpage`; `author`/`publisher: {"@id": ".../#organization"}`; añadir `WebSite` |
| P-09 | M | `ServiceSchema` incrusta un `provider` `Organization` anónimo; no enlaza con `#organization` | `SeoSchema.tsx:537-541` | Aceptar `providerId` y emitir `{"@id": ...}` |
| P-10 | M | `ItemList` de la home describe "menús digitales y tarjetas NFC", pero `App.tsx` le pasa `TPV_MODULES` (13 módulos TPV); además usa URL con fragmento (`/#soluciones`) y `serviceUrl()` genera `/#tienda-carta-digital` | `SeoSchema.tsx:109-121`, `:89-90`; `App.tsx:173`; `solutions.ts:34` | Al simplificar la home, pasar los 4 productos/servicios con URLs de ruta reales |
| P-11 | M | Metadatos de la home desfasados: title/description genéricos ("Automatización e IA para Empresas") mientras el contenido es TPV; no incluye carta digital ni los productos estrella; **no tiene `hreflang`** (el doc afirma ✅ es + x-default) y solo `twitter:card` (sin title/description/image) | `App.tsx:124-127`, `App.tsx:177-198`; `docs/SEO_IMPLEMENTATION.md:823` | Aplicar §1.1 y completar Helmet como `TapReviewPage.tsx:56-71` |
| P-12 | M | `og:image` = `icon.png` 512×512 con `twitter:card=summary_large_image` (requiere ~1,91:1). Previews recortadas/degradadas en redes | `TapReviewPage.tsx:66-70`; `App.tsx:187-190`; `public/` solo contiene `icon.png` | Crear imágenes 1200×630 (ver §1.1) |
| P-13 | M | `<h1>` de `/tarjetas-nfc` es `sr-only` (texto oculto) y el contenido visible lo pone `TapReviewSection`. No cambiar (única página que posiciona), pero **no replicar el patrón** en páginas nuevas y vigilar que el cambio de enlazado no altere el DOM | `TapReviewPage.tsx:106` | Solo documentar; no tocar |
| P-14 | M | `WebMCP.ts` anuncia URLs con anclas obsoletas (`/#tarjetas-nfc`, `/#carta-digital`) y la clave `tap-review`; el NFC ya vive en `/tarjetas-nfc` y la carta pasará a `/carta-digital` | `src/WebMCP.ts:49`, `:62-66`, `:84-85` | Actualizar a rutas reales |
| P-15 | M | `X-Robots-Tag: index, follow` se aplica a **todas** las rutas, incluidas `/admin`, `/panel`, `/login` (su `noindex` solo está en meta) | `vercel.json:27`; `src/features/admin/presentation/index.tsx:28` | Sobrescribir con `X-Robots-Tag: noindex, nofollow` para `/admin/:path*`, `/panel/:path*`, `/login/:path*` |
| P-16 | M | Rutas lazy en cliente pero importadas de forma estática en SSR (`entry-client` vs `entry-server`): riesgo de desajuste de hidratación en las páginas prerenderizadas | `src/entry-client.tsx:24-42,84-90`; `src/entry-server.tsx:13` | Verificar en consola de producción que no hay warnings de hidratación; precargar el chunk de la ruta actual |
| P-17 | B | Dos fuentes de verdad en la documentación: `SEO_IMPLEMENTATION.md` cita `src/main.tsx` como router y `sitemap.xml` estático en `public/`; ya no existen (el router es `entry-client.tsx` y el sitemap se genera en `scripts/sitemap.mjs`). Lista de rutas del doc (L596-607, 508-523) obsoleta | `docs/SEO_IMPLEMENTATION.md:579-585`, `:620-628` | Enlazar este protocolo como fuente canónica y marcar esas secciones como históricas |
| P-18 | B | Doc y robots.txt se contradicen sobre `Content-Signal`: el doc dice "no poner en robots.txt"; `robots.txt` lo incluye en `User-agent: *`. Además `docs` dice `ai-input=no`, el header real dice `ai-input=yes` | `docs/SEO_IMPLEMENTATION.md:561`, `:225`; `public/robots.txt` (bloque `*`); `vercel.json:34` | Unificar criterio (decisión de negocio) y corregir el doc |
| P-19 | B | `ReviewSchema` usa `datePublished = new Date()` por defecto: la fecha cambia en cada build y simula contenido fresco | `SeoSchema.tsx:612` | Exigir `datePublished` explícito |
| P-20 | B | `lastmod` del sitemap se mantiene a mano y `/tarjetas-nfc` tiene prioridad 0.9 mientras el doc indica 1.0 para producto (Google ignora `priority`/`changefreq`, importa solo `lastmod` fiable) | `scripts/site-routes.json:4-9`; `docs/SEO_IMPLEMENTATION.md:625` | Actualizar `lastmod` solo cuando cambie contenido real; no perseguir `priority` |
| P-21 | B | Sin `"trailingSlash": false` explícito: `/about` y `/about/` pueden coexistir como URLs duplicadas (la canonical lo mitiga, pero conviene fijarlo) | `vercel.json` (ausente) | Añadir `"trailingSlash": false` y probar con `curl -sI` |
| P-22 | B | Cabecera `Link` con `rel="ai-readable"` (no estándar) y `rel="api-catalog"` apuntando a `server-card.json` en lugar de `/.well-known/api-catalog` | `vercel.json:30-33` | Revisar; sin impacto en SEO clásico |
| P-24 | B | La home usa voseo ("te ponés", "te adelantás") en una web de Tenerife; incoherente con el público y con la regla de español de España | Plan §4 (nota de coherencia) | Corregir en la simplificación de la home |

### Orden de ejecución recomendado

1. P-05 y P-04 (diagnóstico de indexación y soft 404) antes de crear páginas nuevas.
2. P-01 + P-02 + P-03 junto con la ruta `/carta-digital` (PR 1 del plan).
3. P-06, P-07, P-14 en el PR de enlazado y llms.txt (PR 5).
4. P-08 a P-12 al simplificar la home (PR 3).
5. Resto como higiene.

### Medición (GSC, 4/8/12 semanas)

Páginas indexadas 2 → ≥ 6; posición del cluster IA/chatbots 61–94 → < 20 (**objetivo no validado**: depende del volumen real); apariciones en consultas de carta digital/Glovo (hoy 0); mantener `/tarjetas-nfc` ≥ 14 clics y pos. ≤ 8 (línea base a no perder); eventos GA4 de clic a WhatsApp/formulario por página.
