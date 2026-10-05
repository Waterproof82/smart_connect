# Registro de hallazgos del sitio (leer en Fase 0)

Hallazgos verificados en producción (`https://digitalizatenerife.es/`). Antes de auditar, revisá qué sigue abierto. Al cerrar un hallazgo, movelo a "Resueltos" con la fecha y el PR. No los borres.

## Abiertos

| ID | Fecha | Área | Estado | Hallazgo | Evidencia | Acción |
|---|---|---|---|---|---|---|
| F-02 | 2026-10-05 | Rendimiento | FAIL (en progreso) | /carta-digital: Perf 75, TBT 390 ms, FCP 3.2 s. El hilo principal está ocupado 2.3 s (Script Eval 684 ms, Style & Layout 681 ms) y hay un forced reflow de 94 ms sin atribuir. **Avance**: S2a (defer de `gtag.js`, PR #125) ya mergeado a develop. S2b (fix de la doble mutación de clase `<html>` en `ThemeContext`/`LanguageContext` + `DeferredExpertAssistant`) implementado en esta rama — trace local muestra TBT -13% relativo, pero el evento de `Layout` dominante (~340 ms, ~1141 objetos) sigue presente casi sin cambios: probablemente es el costo intrínseco del primer layout completo de la página, no algo atribuible al bug de `ThemeContext` (ver `docs/audit/2026-10-05_landing-main-thread-tbt.md` §S2b). Sigue abierto hasta el re-medido PSI post-deploy (T2.18). | PSI móvil 2026-10-05 12:44; trace local Lighthouse 2026-10-05 (relativo) | SDD `landing-main-thread-tbt` |
| F-03 | 2026-10-05 | Accesibilidad | FAIL | Contraste: los números decorativos "01–04" de /carta-digital usan `--color-accent-subtle`. En modo oscuro, el CTA de `CartaDigitalTeaser` en /tpv-restaurantes queda en 3.06:1, por el par `--color-accent` (oklch 65%) + `--color-on-accent`, que también usan `.btn-primary` y unos 12 componentes. | PSI /carta-digital; Lighthouse /tpv-restaurantes a11y 96 | SDD `landing-main-thread-tbt` (slice de tokens) |
| F-05 | 2026-10-05 | Rendimiento | INFO | CLS de la home: 0.049 (PSI). Lo provoca el `<span>` de acento del H1 de Hero. Pasa el umbral (≤ 0.1). | PSI home | Baja prioridad |
| F-06 | 2026-10-05 | Seguridad | INFO | La CSP mantiene `'unsafe-eval'`. Los 18 chunks de `dist/` no usan `eval` ni `new Function`. | `rg` sobre `dist/assets/*.js` | Quitarla tras un smoke test en un preview (gtag/GTM incluido) |
| F-07 | 2026-10-05 | Contenido | NOT VERIFIED | Derechos de uso de las fotos NFC del proveedor. | — | Manual, propietario |

## Resueltos (2026-10-05)

| ID | Fecha cierre | Área | Hallazgo | Acción tomada | PR |
|---|---|---|---|---|---|
| F-01 | 2026-10-05 | Analytics / Seguridad | gtag.js disparaba un ping de conversión de Google Ads (`pagead2.googlesyndication.com/measurement/conversion`) que la CSP bloqueaba, con error en consola. El propietario no tiene campañas de Ads. | Código: `index.html` ahora pasa `allow_google_signals: false` y `allow_ad_personalization_signals: false` en el `gtag("config", ...)`. La CSP ya excluía `googlesyndication.com`/`doubleclick.net` — se agregó un test de regresión que lo fija (no se abrió la CSP). **Resuelto por el propietario (2026-10-05)**: eliminó el vínculo de cuenta GA4 ↔ Google Ads (449-380-0013) a nivel de propiedad; Google Signals ya estaba desactivado. Esa vinculación era la causa raíz del ping de Ads, no solo las flags del `gtag("config", ...)`. | #124 |
| F-04 | 2026-10-05 | Rastreo | `www.digitalizatenerife.es` redirigía con **307** (temporal) en vez de 308. | Cerrado por el propietario: `www.digitalizatenerife.es` ahora devuelve **308** al apex preservando path+query (verificado con `curl`). `http://www` → 301 (Cloudflare "Always Use HTTPS") → 308: dos saltos permanentes, aceptable. | manual (Vercel/Cloudflare) |

## Verificados OK (2026-10-05)

- Rich Results Test: home tiene 3 elementos válidos (Carruseles, Empresa local, Organización) y /carta-digital tiene Rutas de exploración.
- `smart-connect-olive.vercel.app` → 308 a `https://digitalizatenerife.es/<ruta>`.
- La negociación `Accept: text/markdown` devuelve `Link rel=canonical` + `X-Robots-Tag: noindex`.
- La cabecera `Permissions-Policy` está activa. Lighthouse Best Practices da 100 en home, nfc, tpv, ia y about.
- El SEO 92 de Lighthouse se debe solo al `Content-Signal` de robots.txt ("Unknown directive"). Es intencional, no corregir. PSI da SEO 100.
