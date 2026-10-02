# Search Console, GA4, SEO local e internacional

## Acceso a datos
Sin acceso a GSC/GA4/GBP (API, export CSV o capturas aportadas por el usuario) → todo lo de campo es `NO VERIFICADO`. Pide exports (Rendimiento por consultas/páginas/países/dispositivos, Páginas, Sitemaps, CWV) o indica los pasos exactos para obtenerlos. Antes de analizar, lee los informes previos en `docs/audit/` (p. ej. `2026-10-01_gsc-search-performance-analysis.md`).

## Google Search Console
**Rendimiento:** clics, impresiones, CTR, posición media (es un promedio; cuidado con interpretarla sola), por consulta, página, país, dispositivo, fecha, tipo de búsqueda (web/imágenes/vídeo/Discover/News).
**Indexación (Páginas):** indexadas vs. excluidas y motivos: *Descubierta, actualmente sin indexar*, *Rastreada, actualmente sin indexar*, *Duplicada: Google eligió otra canonical*, *Excluida por noindex*, *Bloqueada por robots.txt*, *Soft 404*, *Redirección*, *404*. Cada motivo → causa probable distinta; no los trates igual.
**Experiencia:** CWV (móvil/escritorio, URLs "pobres/necesitan mejora"), HTTPS.
**Mejoras:** resultados enriquecidos con errores/avisos.
**Sitemaps:** estado, URLs descubiertas vs. enviadas, errores.
**Acciones manuales y problemas de seguridad:** comprobar siempre.
**Inspección de URL:** HTML renderizado, canonical declarada vs. elegida por Google, última visita, recursos bloqueados. "Solicitar indexación" es un empujón, no una garantía y tiene cuota.

### Análisis avanzado (obligatorio cuando haya datos)
- Consultas con muchas impresiones y CTR bajo → mejorar title/description/snippet y alinear intención.
- Páginas con caída: comparar **periodos equivalentes** (28/90 días y año anterior si hay estacionalidad), descartar cambios de implementación (¿qué se desplegó y cuándo? ver CHANGELOG).
- Consultas emergentes → contenido nuevo o refuerzo.
- Canibalización: varias URLs para la misma consulta.
- Páginas con impresiones sin clics; descubiertas sin indexar (calidad/enlazado interno).
- Diferencias móvil/escritorio y por país/idioma (¿se sirve el idioma correcto?).
- Anomalías y saltos temporales (updates de Google, caídas técnicas).
- Separa consultas de marca vs. no marca.
- Muestras pequeñas (< ~100 impresiones) = ruido; no concluyas con ellas.

## Google Analytics 4
Adquisición (orgánico), landing pages, engagement, eventos clave (envío de formulario, clic WhatsApp, clic llamada, demo), embudo. Cadena a relacionar: **GSC (consulta/página) → landing → comportamiento → conversión**. Verifica que los eventos existen y disparan (no inventes conversiones). Respeta consentimiento de cookies/RGPD (Consent Mode).

## SEO local (Tenerife / Canarias)
- **Google Business Profile** (si existe): categoría principal, servicios, horario, área de servicio, fotos propias, publicaciones, reseñas (responderlas; nunca comprarlas ni filtrarlas).
- **NAP idéntico** en web, Schema, GBP, directorios y redes. Marca discrepancias.
- Página/s locales solo con contenido útil y diferenciado (casos reales en la zona, mapa, cómo trabajamos allí). Prohibido clonar páginas cambiando el nombre del municipio.
- `LocalBusiness`/`areaServed` coherentes con GBP. Citas y menciones locales (cámaras de comercio, asociaciones, prensa local).
- Si no hay GBP/dirección pública → `NO VERIFICADO`; no inventar.

## SEO internacional (ES/EN)
- Elegir estructura (subcarpetas `/en/` recomendado frente a parámetros o cookies/JS para idioma).
- `hreflang` en HTML, cabecera o sitemap: códigos válidos (`es`, `en`, `es-ES`…), **reciprocidad**, autorreferencia, `x-default`, URLs canónicas absolutas; sin hreflang hacia URLs noindex/redirigidas.
- Cada versión con su propio canonical (no apuntar la EN a la ES).
- Contenido realmente traducido y localizado (moneda €, unidades, cultura), `html lang` correcto, metadata y JSON-LD (`inLanguage`) traducidos.
- Sin redirección automática por IP/idioma del navegador que impida a Googlebot ver todas las versiones.
- Si el idioma se cambia solo en cliente sin URL distinta, **no hay versión indexable en inglés** → hallazgo ALTO a evaluar.
