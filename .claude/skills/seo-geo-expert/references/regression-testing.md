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

**Excepciones conocidas** (`KNOWN_HEADING_JUMPS`): se marcan con `it.failing`, de modo que el test **se pone en rojo cuando el problema se corrige**, obligando a retirar la excepción. Hoy: `/ia-chatbots-tenerife` (H1 → H3 antes del primer H2).

Al añadir una ruta o un check nuevo: ampliar estos archivos (TDD) en lugar de comprobaciones manuales. Los tests no llevan comentarios (convención de `docs/context/readme_testing.md`).
