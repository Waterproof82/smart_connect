# Rendimiento y Core Web Vitals

## Umbrales (percentil 75 de datos de campo; verificar vigencia en web.dev/vitals)
**LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1.** Complementarias: TTFB, FCP, TBT (laboratorio).

## Evidencia
- **Campo** (CrUX, informe CWV de GSC, PageSpeed "datos reales"): único dato válido para afirmar estado de usuarios reales. Sin él → `NOT VERIFIED`, nunca extrapolar desde laboratorio.
- **Laboratorio** (Lighthouse, Playwright traces): útil para diagnosticar y comparar before/after; indica condiciones de prueba (móvil/escritorio, throttling).
- Compara siempre **antes/después** con la misma configuración.

## Palancas típicas (React + Vite)
- LCP: imagen/título hero en HTML inicial, `fetchpriority="high"` y preload de la imagen LCP, tamaño servido ≈ mostrado, sin lazy en above-the-fold, sin fuentes que bloqueen.
- INP: dividir JS por ruta (`React.lazy`), evitar tareas largas, diferir terceros (Supabase, chat, analytics) hasta la interacción.
- CLS: `width/height` en imágenes y embeds, fuentes con `font-display` y fallback de métricas equivalentes, reservar espacio para banners.
- Caché: assets con hash `immutable`, HTML con revalidación, CDN.
- Peso: presupuestos de JS/CSS/imágenes; revisar el bundle (`npm run build`) antes y después.

No optimices por optimizar: si las métricas de campo están en "bueno", `PASS` y sin cambios.
