# SEO Regression Testing

Tras cualquier cambio estructural (rutas, layout, metadata, cabeceras, build, i18n, SSR) comprobar los checks aplicables. Una modificación **no está completa** hasta superarlos.

| Check | Qué verificar | Cómo |
|---|---|---|
| robots.txt | Sin `Disallow: /` accidental; `Sitemap:` correcto; `Content-Signal` coherente con `vercel.json` y `vite.config.ts` | leer + `curl` |
| sitemap.xml | XML válido; solo URLs 200/indexables/canónicas; dominio oficial | script/`curl` |
| Status codes | Rutas clave 200; inexistentes 404; sin cadenas ni loops | `curl -sIL` |
| Canonical | Única, absoluta, autorreferenciada, = sitemap | parse HTML |
| Metadata | `title`/description únicos por ruta e idioma; OG/Twitter | parse HTML |
| hreflang | Reciprocidad, `x-default`, URLs 200 | parse HTML/sitemap |
| JSON-LD | JSON válido, `@id` consistentes, dominio oficial, coherente con contenido | `JSON.parse` + revisión |
| H1 / headings | Un H1, jerarquía sin saltos | parse DOM |
| Enlaces | Sin rotos; `<a href>` reales; internos al dominio canónico | crawler/script |
| noindex | `/admin` y rutas privadas con noindex; páginas públicas sin noindex accidental | meta + `X-Robots-Tag` |
| Imágenes | alt, width/height, formato, peso | script |
| Redirects | Destinos correctos; sin romper rutas indexadas | `curl` |
| `llms.txt` / `.well-known` | JSON válido; `sha256` de `agent-skills/index.json` = hash real de los archivos; sin dominios no oficiales | `sha256sum` |

Siempre que sea posible, convertir los checks en tests automatizados del repo (TDD) en lugar de comprobaciones puntuales. Registrar resultado en la sección REGRESSION CHECK del cambio.

## Tests automáticos en este repo (`npm test`)

| Archivo | Cubre | Requiere build |
|---|---|---|
| `tests/unit/seo/seoSources.regression.test.ts` | robots.txt (sitemap, sin bloqueo global, Googlebot, áreas privadas), coherencia de `Content-Signal` (robots/vercel/vite), dominio oficial, JSON de `.well-known`, puntero `llms.txt`, `site-routes.json` (únicas, minúsculas, `lastmod`), redirects (permanentes, sin cadenas, destino prerenderizado), cabeceras de indexación/HSTS/nosniff | No |
| `tests/unit/seo/prerenderedSeo.regression.test.ts` | Por ruta de `dist/`: `lang`, title/description únicos, canonical autorreferenciada, OG, sin noindex, un H1, jerarquía de headings, JSON-LD válido y solo dominio oficial, `alt` y dimensiones en imágenes, `href` reales, enlaces internos que existen; `sitemap.xml` = rutas = canonicals; `404.html` noindex; `robots.txt` build = public | Sí: `npm run build` (se omite con `describe.skip` si no hay `dist/`) |

Ya existían y complementan: `geoSurfaces` (hash `sha256` de `llms.txt`, URLs muertas), `routeParity` (SSR ↔ `site-routes.json`), `vercelNotFound` (404 real, noindex en admin/panel/login), `criticalCssOutput`.

Guardas de Core Web Vitals (2026-10-07):

| Archivo | Cubre |
|---|---|
| `tests/unit/perf/fontSelfHosting.test.ts` | Fuentes en el propio dominio, sin Google Fonts, CSP `font-src 'self'`, `font-display: optional`, una sola precarga (la del H1), DM Sans sin `opsz` y ≤ 56.000 B |
| `tests/unit/perf/fontFallbackMetrics.test.ts` | `size-adjust` de fallback medido (106 %) y `.ds-h1 { text-wrap: wrap }` |
| `tests/unit/scripts/criticalCssOutput.test.ts` | Fuentes propias inlineadas en cada ruta y exactamente un `<link>` CSS diferido por ruta (si hay `dist/`) |
| `tests/unit/vite/manualChunks.test.ts` | Asignación de chunks por nombre exacto de paquete |
| `tests/unit/webmcpBoot.test.ts`, `entryWiring.structure.test.ts` | WebMCP fuera del chunk de entrada, registrado tras hidratar |
| `src/shared/utils/appStylesheet.test.ts`, `useAppStylesheetApplied.test.tsx`, `CookieConsent.structure.test.ts`, `DeferredExpertAssistant.test.tsx` | Los elementos `fixed` no se montan antes de que se aplique el CSS diferido |

Trampas al verificar en local:
- **Un `dist/` viejo hace que los tests que dependen del build validen un HTML antiguo** y fallen sin motivo (o pasen sin motivo). Bórralo o regenéralo antes de fiarte del resultado.
- **`vite preview` no aplica la redirección de Vercel `/admin → /_spa.html`.** En local, `/admin` hidrata el HTML de la home y da errores #418/#422 que en producción no existen. Para probarlo, sirve `_spa.html` a mano.
- **La carpeta `build/` está en `.gitignore` (sin `/`).** Cualquier carpeta llamada `build` en cualquier nivel, incluida `tests/unit/build/`, queda fuera de git sin aviso.

**Excepciones:** hoy no hay ninguna. Si hace falta tolerar un problema conocido, márcalo con `it.failing` y una lista explícita (así el test se pone en rojo al corregirlo y obliga a retirar la excepción).

**CI:** `.github/workflows/ci-cd.yml` ejecuta `npx jest tests/unit/seo` justo después de `npm run build`, para que los checks de `dist/` corran de verdad (en el paso `npm test` previo se omiten por no existir `dist/`).

Al añadir una ruta o un check nuevo: ampliar estos archivos (TDD) en lugar de comprobaciones manuales. Los tests no llevan comentarios (convención de `docs/context/readme_testing.md`).
