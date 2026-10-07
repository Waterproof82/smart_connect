# Rendimiento y Core Web Vitals

## Umbrales (percentil 75 de datos de campo; verificar vigencia en web.dev/vitals)
**LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1.** Complementarias: TTFB, FCP, TBT (laboratorio).

## Evidencia
- **Campo** (CrUX, informe CWV de GSC, PageSpeed "datos reales"): único dato válido para afirmar estado de usuarios reales. Sin él → `NOT VERIFIED`, nunca extrapolar desde laboratorio.
- **Laboratorio** (Lighthouse, Playwright traces): útil para diagnosticar y comparar before/after; indica condiciones de prueba (móvil/escritorio, throttling).
- Compara siempre **antes/después** con la misma configuración.
- **El laboratorio no depende de la indexación.** PSI ejecuta Lighthouse en vivo sobre lo que está desplegado. "Esperar a que Google reindexe" no cambia la nota de laboratorio. Los datos de campo (CrUX) dependen del tráfico real: se acumulan en 28 días y solo aparecen con volumen suficiente. Si alguien propone esperar a la reindexación para mejorar PSI, corrígelo.
- **Los diagnósticos "Sin puntuar"** (JS sin usar, tareas largas, animaciones no compuestas, árbol de dependencias) no restan puntos por sí mismos. La nota sale solo de FCP 10 % · SI 10 % · LCP 25 % · TBT 30 % · CLS 25 %. Prioriza por la métrica que más pesa y peor puntúa.

## Cómo medir sin engañarte (lecciones de 2026-10-05)
- **Medí en Linux (PageSpeed Insights, pagespeed.web.dev), no en la máquina local con Windows.** En Windows, Lighthouse dio TBT 1.5 s en la home, y PSI dio 110 ms con el mismo HTML. El primer layout en local era desproporcionado (363 ms para 158 objetos), probablemente por la búsqueda de las fuentes `local(Arial)` de los fallbacks métricos. Diagnosticar con números locales llevó a una causa raíz equivocada.
- **No te fíes del LCP simulado (Lantern).** Con el throttling simulado por defecto, el LCP de texto salió en 7 s, y el observado era de 1.3–1.7 s. Para diagnosticar, usá `--throttling-method=devtools` o PSI.
- La API de PSI sin clave suele quedarse sin cuota (`Quota exceeded`). En ese caso, usá la web de pagespeed.web.dev o una clave propia.
- Verificá las cifras de un sub-agente con la traza (`--save-assets` → sumá los eventos `Layout`/`UpdateLayoutTree`) antes de aceptar una causa raíz.
- El registro de hallazgos abiertos del sitio está en `references/findings-log.md`.

## Cómo medir sin engañarte (lecciones de 2026-10-07)
- **Varias pasadas, misma región.** Una sola pasada de PSI no es evidencia. Haz al menos 3 y usa la mediana. PSI ejecuta desde la región más cercana a quien lo lanza: las pasadas lanzadas desde EE. UU. (por ejemplo, con Firecrawl) dieron un FCP alrededor de 1 s peor que las lanzadas desde España sobre el mismo deploy. No mezcles orígenes en una comparación.
- **Lighthouse local: revisa `environment.benchmarkIndex` en el JSON.** Si baja mucho respecto a las pasadas de referencia (por ejemplo, de ~2700 a 1400–2400), la máquina está cargada y el TBT y la nota no son comparables. Descarta esas pasadas.
- **Notas bimodales = LCP que cambia de elemento.** Si la nota de móvil salta entre ~75 y ~99, revisa en cada pasada qué elemento es el LCP y su "Retraso de renderizado de elementos". Aquí era el H1 (1,4 s) en unas pasadas y `p.ds-lede` (2,9–4,8 s) en otras.
- **Lantern y las fuentes.** Lighthouse simula la 4G a partir de una pasada sin throttling. Si en esa pasada una fuente precargada llega dentro del periodo de bloqueo de `font-display: optional` (~100 ms), el texto se pinta con ella, y la simulación mete la descarga de la fuente en la cadena del LCP. **Precarga solo la fuente del elemento que debe ser LCP** (aquí la del H1), no la del cuerpo.
- **Fallos de "Navegación agéntica" (Lighthouse 13).** Esa categoría incluye el CLS como comprobación, así que un CLS > 0,1 la deja en 2/3 aunque `llms.txt` y el árbol de accesibilidad estén bien. Las auditorías de WebMCP no puntúan: con un polyfill pueden salir como "No aplicable" aunque las herramientas estén registradas. Compruébalo en el navegador con `navigator.modelContext`.
- **Mide los bytes antes de atribuir mejoras de JS.** Cambiar `manualChunks` puede solo redistribuir bytes. Suma el gzip del script de entrada y de cada `modulepreload` de `dist/index.html` antes y después. Aquí, corregir el bug de chunks dejó la home en 186 KB → 186 KB. El recorte real vino de sacar del chunk de entrada un polyfill que solo usan los agentes (WebMCP → `import()` diferido).

## Palancas típicas (React + Vite)
- LCP: imagen/título hero en HTML inicial, `fetchpriority="high"` y preload de la imagen LCP, tamaño servido ≈ mostrado, sin lazy en above-the-fold, sin fuentes que bloqueen.
- INP: dividir JS por ruta (`React.lazy`), evitar tareas largas, diferir terceros (Supabase, chat, analytics) hasta la interacción.
- CLS: `width/height` en imágenes y embeds, fuentes con `font-display` y fallback de métricas equivalentes, reservar espacio para banners.

## Fuentes y CLS: reglas aprendidas (2026-10-07)
- **Aloja las fuentes en el propio dominio** (woff2, subconjuntos latin + latin-ext, solo los pesos que se usan). Así desaparecen las conexiones a googleapis/gstatic de la ruta crítica, y la CSP queda en `font-src 'self'`.
- **Un `@font-face` de fallback con solo `local()` no se registra en una máquina sin esas fuentes**, como Linux en PSI o Android. El texto cae entonces a `system-ui`, cuyas métricas son distintas, y salta al cargar la fuente real. Calibra el fallback contra lo que se ve en pantalla, no solo con la fórmula.
- **Calibra el `size-adjust` midiendo.** Mide en Chrome cuántas líneas ocupa el H1 a 360/375/390/412 px y a escritorio, con la fuente real y con la de respaldo (bloqueando `/fonts/*`). La fórmula de Capsize dio 109,69 %, que cambiaba el número de líneas a 375 px. El valor medido, 106 %, lo dejó idéntico al píxel en todos los anchos.
- **`text-wrap: balance` en el H1 amplifica las diferencias de métricas.** Usa `text-wrap: wrap` en el titular LCP; `balance` puede quedarse en h2/h3.
- **Revisa los ejes de las fuentes variables.** Un eje que no se usa también se descarga. Quitar `opsz` de DM Sans bajó de 94 KB a 55 KB.
- **Los elementos `fixed` que se montan después de hidratar** (banner de cookies, botones flotantes) pueden pintarse antes de que llegue el CSS diferido. Si el CSS crítico incluye `.fixed` pero no `.bottom-0` ni `.inset-x-0`, el elemento aparece arriba y salta abajo. Aquí, el banner de cookies sumó un CLS de 0,566. Solución: no montarlos hasta que el CSS diferido se haya aplicado (hook `useAppStylesheetApplied`). Para detectarlo, comprueba qué utilidades del componente faltan en el `<style>` inline del HTML servido.
- Caché: assets con hash `immutable`, HTML con revalidación, CDN.
- Peso: presupuestos de JS/CSS/imágenes; revisar el bundle (`npm run build`) antes y después.

No optimices por optimizar: si las métricas de campo están en "bueno", `PASS` y sin cambios.
