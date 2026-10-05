# Registro de hallazgos del sitio (leer en Fase 0)

Hallazgos verificados en producción (`https://digitalizatenerife.es/`). Antes de auditar, revisá qué sigue abierto. Al cerrar un hallazgo, movelo a "Resueltos" con la fecha y el PR. No los borres.

## Abiertos

| ID | Fecha | Área | Estado | Hallazgo | Evidencia | Acción |
|---|---|---|---|---|---|---|
| F-01 | 2026-10-05 | Analytics / Seguridad | FAIL | gtag.js dispara un ping de conversión de Google Ads (`pagead2.googlesyndication.com/measurement/conversion`) que la CSP bloquea, y aparece un error en la consola. El propietario **no tiene campañas de Ads**. | PSI /carta-digital: Best Practices 92, panel Issues "Content security policy" | Desactivar las señales de Ads en el código (`allow_google_signals: false`, `allow_ad_personalization_signals: false`) y revisar en GA4 → Administrar → Google tag que no haya un destino `AW-` vinculado. **No abrir la CSP** a dominios de Ads. |
| F-02 | 2026-10-05 | Rendimiento | FAIL | /carta-digital: Perf 75, TBT 390 ms, FCP 3.2 s. El hilo principal está ocupado 2.3 s (Script Eval 684 ms, Style & Layout 681 ms) y hay un forced reflow de 94 ms sin atribuir. | PSI móvil 2026-10-05 12:44 | SDD `landing-main-thread-tbt` |
| F-03 | 2026-10-05 | Accesibilidad | FAIL | Contraste: los números decorativos "01–04" de /carta-digital usan `--color-accent-subtle`. En modo oscuro, el CTA de `CartaDigitalTeaser` en /tpv-restaurantes queda en 3.06:1, por el par `--color-accent` (oklch 65%) + `--color-on-accent`, que también usan `.btn-primary` y unos 12 componentes. | PSI /carta-digital; Lighthouse /tpv-restaurantes a11y 96 | SDD `landing-main-thread-tbt` (slice de tokens) |
| F-04 | 2026-10-05 | Rastreo | WARNING | `www.digitalizatenerife.es` redirige con **307** (temporal) en vez de 308. | `curl -I https://www.digitalizatenerife.es/` | Manual, propietario: Vercel → Domains → www → Redirect 308 |
| F-05 | 2026-10-05 | Rendimiento | INFO | CLS de la home: 0.049 (PSI). Lo provoca el `<span>` de acento del H1 de Hero. Pasa el umbral (≤ 0.1). | PSI home | Baja prioridad |
| F-06 | 2026-10-05 | Seguridad | INFO | La CSP mantiene `'unsafe-eval'`. Los 18 chunks de `dist/` no usan `eval` ni `new Function`. | `rg` sobre `dist/assets/*.js` | Quitarla tras un smoke test en un preview (gtag/GTM incluido) |
| F-07 | 2026-10-05 | Contenido | NOT VERIFIED | Derechos de uso de las fotos NFC del proveedor. | — | Manual, propietario |

## Verificados OK (2026-10-05)

- Rich Results Test: home tiene 3 elementos válidos (Carruseles, Empresa local, Organización) y /carta-digital tiene Rutas de exploración.
- `smart-connect-olive.vercel.app` → 308 a `https://digitalizatenerife.es/<ruta>`.
- La negociación `Accept: text/markdown` devuelve `Link rel=canonical` + `X-Robots-Tag: noindex`.
- La cabecera `Permissions-Policy` está activa. Lighthouse Best Practices da 100 en home, nfc, tpv, ia y about.
- El SEO 92 de Lighthouse se debe solo al `Content-Signal` de robots.txt ("Unknown directive"). Es intencional, no corregir. PSI da SEO 100.
