# Registro de hallazgos del sitio (leer en Fase 0)

Hallazgos verificados en producción (`https://digitalizatenerife.es/`). Antes de auditar, revisá qué sigue abierto. Al cerrar un hallazgo, movelo a "Resueltos" con la fecha y el PR. No los borres.

## Abiertos

| ID | Fecha | Área | Estado | Hallazgo | Evidencia | Acción |
|---|---|---|---|---|---|---|
| F-05 | 2026-10-05 | Rendimiento | INFO | CLS de la home: 0.053 (PSI 2026-10-05 14:20; antes 0.049, dentro del ruido). Lo provoca el `<span>` de acento del H1 de Hero. Pasa el umbral (≤ 0.1). | PSI home | Baja prioridad |
| F-06 | 2026-10-05 | Seguridad | INFO | La CSP mantiene `'unsafe-eval'`. Los 18 chunks de `dist/` no usan `eval` ni `new Function`. | `rg` sobre `dist/assets/*.js` | Quitarla tras un smoke test en un preview (gtag/GTM incluido) |
| F-07 | 2026-10-05 | Contenido | NOT VERIFIED | Derechos de uso de las fotos NFC del proveedor. | — | Manual, propietario |

## Resueltos (2026-10-05)

| ID | Fecha cierre | Área | Hallazgo | Acción tomada | PR |
|---|---|---|---|---|---|
| F-01 | 2026-10-05 | Analytics / Seguridad | gtag.js disparaba un ping de conversión de Google Ads (`pagead2.googlesyndication.com/measurement/conversion`) que la CSP bloqueaba, con error en consola. El propietario no tiene campañas de Ads. | Código: `index.html` ahora pasa `allow_google_signals: false` y `allow_ad_personalization_signals: false` en el `gtag("config", ...)`. La CSP ya excluía `googlesyndication.com`/`doubleclick.net` — se agregó un test de regresión que lo fija (no se abrió la CSP). **Resuelto por el propietario (2026-10-05)**: eliminó el vínculo de cuenta GA4 ↔ Google Ads (449-380-0013) a nivel de propiedad; Google Signals ya estaba desactivado. Esa vinculación era la causa raíz del ping de Ads, no solo las flags del `gtag("config", ...)`. | #124 |
| F-04 | 2026-10-05 | Rastreo | `www.digitalizatenerife.es` redirigía con **307** (temporal) en vez de 308. | Cerrado por el propietario: `www.digitalizatenerife.es` ahora devuelve **308** al apex preservando path+query (verificado con `curl`). `http://www` → 301 (Cloudflare "Always Use HTTPS") → 308: dos saltos permanentes, aceptable. | manual (Vercel/Cloudflare) |
| F-03 | 2026-10-05 | Accesibilidad | Contraste: los números decorativos "01–04" de /carta-digital usaban `--color-accent-subtle`; el par `--color-accent` (oklch 65% dark / 55% light) + `--color-on-accent` quedaba en 3.06:1 (dark, FAIL) y 4.52:1 (light, marginal), afectando `.btn-primary` y ~12 componentes más. | Código: `--color-accent` retuneado a `oklch(52% 0.18 250)` en ambos temas (hue 250 y chroma 0.18 sin cambios); `--color-accent-hover` dark a `oklch(45% 0.18 250)` (light ya estaba en 45%). Nuevo ratio accent/on-accent: 5.11:1 ambos temas; accent-hover/on-accent: 6.85:1 ambos temas. Números decorativos → `text-muted` + `aria-hidden="true"` (ya repetidos en el chip). Hallazgo adicional del orchestrator: `--color-on-accent-muted` (footer del chat, subtítulo "Plan Pro" de `DashboardPreview`) quedó en 2.43:1/2.09:1 contra el nuevo accent — retuneado a `oklch(95% ...)` en ambos temas (4.68:1). Segundo hallazgo: el par `--color-text`/`--color-accent` del título y CTA invertido de `DashboardPreview` es matemáticamente imposible de llevar a ≥4.5:1 en modo claro sin romper accent/on-accent — se cambió el componente (no el token) para usar `--color-on-accent` en su lugar (mismo par que `.btn-primary-inverse`, 5.11:1). Detalle completo: `docs/audit/2026-10-05_landing-main-thread-tbt.md` §S3. | #127 (verificado: PSI a11y 100 en /carta-digital) |
| F-08 | 2026-10-05 | Analytics | GA4: la regla "Crear eventos personalizados" convertía todo `page_view` de rutas `/carta-digital*` en `ads_conversion_Carrito_de_la_compra_1`, marcado como evento clave (`__ogt_event_create` + `__ccd_conversion_marking` en `gtag.js`). Resto de la vinculación con Ads. | Resuelto por el propietario el 2026-10-05: regla eliminada y evento clave desmarcado; verificado que el `gtag.js` servido ya no contiene la regla. Datos históricos de 28 días quedan inflados: analizar conversiones desde 2026-10-05. `purchase` es un evento clave predefinido de GA4 y no se puede desmarcar; como el sitio nunca lo envía, queda en 0 y no afecta. Pendiente del propietario: marcar como eventos clave generate_lead, contact_whatsapp, contact_phone, contact_email (si no aparecen aún, crearlos en Eventos clave → Nuevo evento clave con el nombre exacto). | manual (GA4) |
| F-02 | 2026-10-05 | Rendimiento | /carta-digital: Perf 75, TBT 390 ms, FCP 3.2 s, LCP 3.5 s; hilo principal ocupado 2.3 s y forced reflow de 94 ms. | S2a: `gtag.js` diferido a load + idle/interacción (#125). S2b: sin mutaciones de clase/`lang` en `<html>` al hidratar + chatbot diferido (#126). S5: ajustes públicos leídos con `fetch` a PostgREST, sin el SDK de Supabase en páginas públicas. **PSI móvil 2026-10-05 14:20 (después)**: /carta-digital Perf **99** (antes 75), TBT **50 ms** (antes 390), FCP 1.7 s (antes 3.2), LCP 1.7 s (antes 3.5), Best Practices 100 (antes 92). Home Perf 97 (antes 94), TBT 100 ms, LCP 1.8 s (antes 2.7). Lección: medí siempre en PSI (Linux); el TBT local en Windows exageraba 10x. | #124 #125 #126 #127 + S5 |

## Verificados OK (2026-10-05)

- Rich Results Test: home tiene 3 elementos válidos (Carruseles, Empresa local, Organización) y /carta-digital tiene Rutas de exploración.
- `smart-connect-olive.vercel.app` → 308 a `https://digitalizatenerife.es/<ruta>`.
- La negociación `Accept: text/markdown` devuelve `Link rel=canonical` + `X-Robots-Tag: noindex`.
- La cabecera `Permissions-Policy` está activa. Lighthouse Best Practices da 100 en home, nfc, tpv, ia y about.
- El SEO 92 de Lighthouse se debe solo al `Content-Signal` de robots.txt ("Unknown directive"). Es intencional, no corregir. PSI da SEO 100.
