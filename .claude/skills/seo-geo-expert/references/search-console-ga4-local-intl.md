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

### Comparación temporal
Comparar: últimos 7 días vs. periodo anterior · últimos 28 días vs. periodo anterior · últimos 3 meses · mismo periodo del año anterior si hay histórico suficiente. **No interpretar estacionalidad como problema SEO** (hostelería: temporada, festivos). Contrastar con despliegues (CHANGELOG) y actualizaciones de Google.

### Análisis consulta → página
Tabla de trabajo: `Query → URL → clics → impresiones → CTR → posición → intención`. Permite detectar canibalización, páginas que Google asocia con la intención equivocada, consultas sin landing adecuada y oportunidades de contenido.

### URL Inspection como evidencia
Con acceso, registrar por URL clave: canonical declarada · **canonical seleccionada por Google** · indexabilidad · rastreo permitido · última exploración · estado de indexación · rich results detectados · HTML renderizado. Permite distinguir "mi HTML dice X" de "Google ha interpretado X" (evidencia E4). Sin acceso → `NOT VERIFIED` con pasos manuales.

### Canonical Reconciliation (resultado)
Cruza canonical HTML, cabecera HTTP, sitemap, enlaces internos y canonical seleccionada por Google. Si discrepan: documenta, identifica la señal dominante y no asumas que Google seguirá la declarada ("Duplicada: Google eligió otra canonical" → investigar).

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

### Lecciones de GA4 (verificadas 2026-10-05, interfaz actual)

**Eventos clave**
- **No existe un botón "Nuevo evento clave".** Un evento solo se marca como clave con la estrella en Administrar → Eventos, después de que haya llegado. La lista tarda hasta 24 h en mostrar eventos nuevos, aunque ya se vean en Tiempo real. Para hacer que llegue, disparalo una vez desde la web con una prueba real; si es un formulario, que el mensaje diga "PRUEBA".
- **`purchase` es un evento clave predefinido y no se puede desmarcar.** Si el sitio nunca lo envía, queda en 0 y no molesta.
- **Si la web ya envía un evento con `gtag('event', ...)`, nunca crees una regla "Crear evento" o "Crear eventos personalizados" con el mismo nombre: duplica cada conversión.** Esas reglas son solo para eventos que el código no envía.
- Los clics automáticos de GA4 (medición mejorada) solo registran enlaces a otros dominios. `tel:` y `mailto:` necesitan código. En este repo los cubre `src/shared/utils/analyticsEvents.ts` (un listener delegado + `trackEvent`).

**Conversiones falsas y pings de Ads**
- Antes de analizar conversiones, buscá eventos clave sospechosos: nombres `ads_conversion_*` o reglas que conviertan `page_view` en conversión. Revisá:
  - Administrar → Flujos de datos → Crear eventos personalizados;
  - el `gtag.js` servido: `curl -s "https://www.googletagmanager.com/gtag/js?id=<G-ID>" | rg "__ogt_event_create|conversionRules|AW-"`.
- **Un ping a `pagead2.googlesyndication.com` sin campañas de Ads indica una vinculación con Google Ads a nivel de propiedad** (Administrar → Vinculaciones con otros productos). Los flags `allow_google_signals: false` y `allow_ad_personalization_signals: false` ayudan, pero no la cortan. Hay que eliminar la vinculación. **Nunca abras la CSP a dominios de Ads para "arreglar" el error de consola.**

**Verificar un evento de punta a punta**
Hacé un clic real con la navegación bloqueada (`preventDefault` en el propio enlace; el listener delegado escucha en fase de captura) y comprobá tres cosas:
1. que el evento entra en `dataLayer`;
2. que sale una petición `/g/collect` con respuesta 204 (si es un POST por lotes, el nombre del evento va en el cuerpo, no en la URL);
3. que aparece en Informes → Tiempo real.

Avisá al propietario de cuántos eventos de prueba vas a generar antes de hacerlo.

**Tráfico interno**
- El filtro por IP falla con IP dinámica, que es lo habitual en conexiones domésticas en España. Si la IP cambia, deja de excluir y puede llegar a excluir a otra persona.
- Para una sola persona, recomendá la extensión oficial "Inhabilitación para navegadores de Google Analytics".
- Si igual se usa el filtro, se crea en modo Prueba y hay que pasarlo a Activo.

**Configuración base que hay que comprobar**
- Conservación de datos: 14 meses (por defecto son 2).
- Vinculación con Search Console.
- Señales de Google desactivadas si no hay publicidad.
- Al analizar, excluí el periodo con datos contaminados. En este sitio, las conversiones son fiables desde el 2026-10-05.

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
