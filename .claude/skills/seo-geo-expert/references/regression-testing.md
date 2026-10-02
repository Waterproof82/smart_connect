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
