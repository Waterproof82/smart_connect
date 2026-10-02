# Auditoría técnica

Para cada ítem: ¿se cumple? evidencia → hallazgo (severidad/prioridad). Si no se puede comprobar → `NO VERIFICADO`.

## 1. Rastreo (crawlability)
- `robots.txt`: sintaxis, `Sitemap:` declarado con URL absoluta canónica, sin bloquear CSS/JS/imágenes necesarios para renderizar, sin bloqueos accidentales (`Disallow: /`). Googlebot, Google-InspectionTool, Googlebot-Image, Google-Extended (control de uso en IA de Google, no afecta a Search).
- Recuerda: `robots.txt` controla **rastreo**, no indexación. Una URL bloqueada puede indexarse sin contenido; para excluirla, `noindex` (que requiere poder rastrearla).
- Crawl traps: parámetros, filtros, calendarios, paginación infinita, URLs duplicadas por mayúsculas/slash.

## 2. Indexabilidad
- `meta robots` / `X-Robots-Tag` (cabeceras en `vercel.json`).
- Canonical: absoluta, autorreferenciada en páginas indexables, sin conflictos con sitemap, hreflang ni redirects. Una sola canonical en el HTML servido.
- `/admin`, rutas de login, páginas de agradecimiento y resultados internos → `noindex` o fuera de sitemap.
- Páginas útiles accidentalmente excluidas.

## 3. HTTP
200/301/308 correctos; sin cadenas ni loops; 404 reales (no soft 404, p. ej. SPA que devuelve 200 con "no encontrado"); 410 si procede; sin 5xx. Un solo salto http→https y www↔apex.
Comprobación: `curl -sIL -A "Googlebot" <url>`.

## 4. URLs
Descriptivas, estables, minúsculas, sin parámetros innecesarios, trailing slash consistente, jerarquía lógica, sin huérfanas.

## 5. Sitemaps
- XML válido, UTF-8, ≤50 000 URLs / ≤50 MB sin comprimir; índice si procede.
- Solo URLs **200, indexables, canónicas**. Nunca noindex, 404, redirects, duplicadas ni canonicalizadas a otra.
- `lastmod` veraz (solo cuando cambie el contenido real). Google ignora `priority`/`changefreq`.
- Alternates hreflang coherentes si se declaran ahí. Sitemaps de imagen/vídeo solo si aportan.

## 6. JavaScript SEO (React/Vite SSR)
Compara siempre: **HTML servido → HTML renderizado → DOM final → contenido indexable.**
- El contenido principal, `<title>`, meta description, canonical, H1 y JSON-LD están en el HTML inicial (prerender/SSR), no solo tras hidratar.
- Enlaces reales `<a href>`; nada de `onClick` + `navigate` sin href para navegación importante.
- Sin errores de hidratación (diferencias SSR/cliente); sin contenido que dependa de APIs para existir.
- Rutas desconocidas devuelven 404 real, no 200 genérico.
- Verificación: `curl -s <url> | grep -i '<title>\|canonical\|application/ld+json'` vs. render con Playwright (Chromium está preinstalado en `/opt/pw-browsers`).
- *(Si el proyecto fuese Next.js: Metadata API, `generateMetadata`, `app/robots.ts`, `app/sitemap.ts`, `alternates`, `generateStaticParams`, ISR, redirects/middleware.)*

## 7. HTML semántico
`<html lang>` correcto y dinámico por idioma; `<title>` y description únicos; un `<main>`; landmarks (`header/nav/footer`); un H1 descriptivo y jerarquía sin saltos; headings no usados solo por estilo; listas/tablas reales; botones vs. enlaces correctos; sin texto oculto con fines SEO.

## 8. Title y meta description
Único por URL, descriptivo, alineado con la intención, marca al final, sin keyword stuffing. Longitudes orientativas (~50–60 / ~120–160 caracteres) **no son requisito de Google** (se truncan por píxeles). Google puede reescribirlos. `meta keywords` no se usa.

## 9. Imágenes
`alt` descriptivo (vacío si decorativa; nunca lista de keywords), nombres de archivo descriptivos, WebP/AVIF, dimensiones `width/height` (evita CLS), `srcset/sizes`, `loading="lazy"` salvo above-the-fold, `fetchpriority="high"` en la imagen LCP, tamaño servido ≈ tamaño mostrado (ver `scripts/optimize-images.mjs`), og:image 1200×630 absoluta.

## 10. Vídeo
Solo si existe vídeo relevante: `VideoObject` (name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl), página dedicada o contexto visible, sitemap de vídeo opcional.

## 11. Core Web Vitals
Métricas: **LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1** (percentil 75 de datos de campo). Complementarias: TTFB, FCP, TBT (lab).
- Distingue **laboratorio** (Lighthouse) de **campo** (CrUX / GSC / PageSpeed). Sin datos de campo → `NO VERIFICADO`, no extrapolar.
- Palancas típicas: imagen LCP preload + tamaño correcto, JS dividido por ruta (`React.lazy`), carga diferida de terceros (Supabase, chat, analytics), fuentes con `font-display` + preload, caché inmutable de assets con hash, CDN.

## 12. Móvil
Viewport correcto, mismo contenido relevante que escritorio (mobile-first indexing), tamaños táctiles ≥ 24×24 px (WCAG 2.2 AA; ideal 44), sin interstitials intrusivos, sin scroll horizontal.

## 13. Accesibilidad (WCAG 2.2 AA)
Teclado completo y foco visible (2.4.7, 2.4.11), contraste ≥ 4.5:1 (3:1 UI/texto grande), labels y errores de formulario asociados, landmarks, ARIA solo cuando HTML nativo no basta, `prefers-reduced-motion`, modo claro/oscuro con contraste en ambos, objetivos táctiles (2.5.8). Herramientas: axe, Lighthouse a11y, navegación manual con teclado.

## 14. Seguridad relacionada con SEO
HTTPS + HSTS, sin mixed content, CSP (probar en modo report-only antes), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, cookies `Secure/HttpOnly/SameSite`, formularios con validación (Zod) y anti-spam, sin contenido inyectado/hackeado (buscar `site:` anómalos). No endurecer cabeceras sin comprobar que no rompen Supabase/analytics/embeds.

## 15. Enlaces internos y externos
Sin huérfanas; anchors descriptivos y variados con naturalidad; páginas clave a ≤3 clics; breadcrumbs visibles ↔ `BreadcrumbList`; clusters temáticos (producto ↔ guía ↔ caso). Externos: relevantes, sin rotos, `rel="sponsored"` (pago), `rel="ugc"` (contenido de usuarios), `nofollow` cuando no se respalde el destino.

## 16. Backlinks y autoridad
Solo con herramienta (GSC *Links*, Ahrefs, Semrush…): dominios referentes, relevancia, anchors, enlaces perdidos, menciones de marca. Enlaces dudosos = señal a investigar; Google ya ignora la mayoría de spam. No recomendar compra de enlaces ni esquemas.
