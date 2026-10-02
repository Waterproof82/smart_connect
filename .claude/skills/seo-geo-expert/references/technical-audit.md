# Auditoría técnica

Para cada ítem: estado (`PASS/FAIL/WARNING/NOT VERIFIED/NOT APPLICABLE`) + evidencia (E0–E5) → hallazgo. Si cumple el estándar → `PASS`, sin cambios (NO CHANGE REQUIRED).

Ver también: `rendering-javascript-seo.md`, `performance-cwv.md`, `accessibility.md`, `security.md`, `spam-policies.md`.

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

## 6. HTML semántico
`<html lang>` correcto y dinámico por idioma; `<title>` y description únicos; un `<main>`; landmarks (`header/nav/footer`); un H1 descriptivo y jerarquía sin saltos; headings no usados solo por estilo; listas/tablas reales; botones vs. enlaces correctos; sin texto oculto con fines SEO.

## 7. Title y meta description
Único por URL, descriptivo, alineado con la intención, marca al final, sin keyword stuffing. Longitudes orientativas (~50–60 / ~120–160 caracteres) **no son requisito de Google** (se truncan por píxeles). Google puede reescribirlos. `meta keywords` no se usa.

## 8. Imágenes
`alt` descriptivo (vacío si decorativa; nunca lista de keywords), nombres de archivo descriptivos, WebP/AVIF, dimensiones `width/height` (evita CLS), `srcset/sizes`, `loading="lazy"` salvo above-the-fold, `fetchpriority="high"` en la imagen LCP, tamaño servido ≈ tamaño mostrado (ver `scripts/optimize-images.mjs`), og:image 1200×630 absoluta.

## 9. Vídeo
Solo si existe vídeo relevante: `VideoObject` (name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl), página dedicada o contexto visible, sitemap de vídeo opcional.

## 10. Enlaces internos y externos
Sin huérfanas; anchors descriptivos y variados con naturalidad; páginas clave a ≤3 clics; breadcrumbs visibles ↔ `BreadcrumbList`; clusters temáticos (producto ↔ guía ↔ caso). Externos: relevantes, sin rotos, `rel="sponsored"` (pago), `rel="ugc"` (contenido de usuarios), `nofollow` cuando no se respalde el destino.

## 11. Backlinks y autoridad
Solo con herramienta (GSC *Links*, Ahrefs, Semrush…): dominios referentes, relevancia, anchors, enlaces perdidos, menciones de marca. Enlaces dudosos = señal a investigar; Google ya ignora la mayoría de spam. No recomendar compra de enlaces ni esquemas.
