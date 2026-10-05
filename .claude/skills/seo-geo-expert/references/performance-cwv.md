# Rendimiento y Core Web Vitals

## Umbrales (percentil 75 de datos de campo; verificar vigencia en web.dev/vitals)
**LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1.** Complementarias: TTFB, FCP, TBT (laboratorio).

## Evidencia
- **Campo** (CrUX, informe CWV de GSC, PageSpeed "datos reales"): único dato válido para afirmar estado de usuarios reales. Sin él → `NOT VERIFIED`, nunca extrapolar desde laboratorio.
- **Laboratorio** (Lighthouse, Playwright traces): útil para diagnosticar y comparar before/after; indica condiciones de prueba (móvil/escritorio, throttling).
- Compara siempre **antes/después** con la misma configuración.

## Cómo medir sin engañarte (lecciones de 2026-10-05)
- **Medí en Linux (PageSpeed Insights, pagespeed.web.dev), no en la máquina local con Windows.** En Windows, Lighthouse dio TBT 1.5 s en la home, y PSI dio 110 ms con el mismo HTML. El primer layout en local era desproporcionado (363 ms para 158 objetos), probablemente por la búsqueda de las fuentes `local(Arial)` de los fallbacks métricos. Diagnosticar con números locales llevó a una causa raíz equivocada.
- **No te fíes del LCP simulado (Lantern).** Con el throttling simulado por defecto, el LCP de texto salió en 7 s, y el observado era de 1.3–1.7 s. Para diagnosticar, usá `--throttling-method=devtools` o PSI.
- La API de PSI sin clave suele quedarse sin cuota (`Quota exceeded`). En ese caso, usá la web de pagespeed.web.dev o una clave propia.
- Verificá las cifras de un sub-agente con la traza (`--save-assets` → sumá los eventos `Layout`/`UpdateLayoutTree`) antes de aceptar una causa raíz.
- El registro de hallazgos abiertos del sitio está en `references/findings-log.md`.

## Palancas típicas (React + Vite)
- LCP: imagen/título hero en HTML inicial, `fetchpriority="high"` y preload de la imagen LCP, tamaño servido ≈ mostrado, sin lazy en above-the-fold, sin fuentes que bloqueen.
- INP: dividir JS por ruta (`React.lazy`), evitar tareas largas, diferir terceros (Supabase, chat, analytics) hasta la interacción.
- CLS: `width/height` en imágenes y embeds, fuentes con `font-display` y fallback de métricas equivalentes, reservar espacio para banners.
- Caché: assets con hash `immutable`, HTML con revalidación, CDN.
- Peso: presupuestos de JS/CSS/imágenes; revisar el bundle (`npm run build`) antes y después.

No optimices por optimizar: si las métricas de campo están en "bueno", `PASS` y sin cambios.
