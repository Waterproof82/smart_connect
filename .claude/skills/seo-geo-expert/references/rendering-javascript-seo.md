# Rendering y JavaScript SEO

## Rendering Triad
Compara siempre los tres estados:

```
1. Raw HTTP response   (lo que recibe Googlebot antes de ejecutar JS)
        ↓
2. Rendered DOM        (tras ejecutar JavaScript)
        ↓
3. User-visible content (lo que el usuario realmente ve)
```

Detecta diferencias relevantes en: `title`, meta description, headings, contenido principal, enlaces, imágenes, canonical, robots, hreflang y JSON-LD.

Cómo obtenerlos:
- Raw: `curl -s -A "Googlebot" <url>` (o el HTML prerenderizado del build).
- Rendered DOM: Playwright con Chromium preinstalado (`/opt/pw-browsers`), `page.content()` tras `networkidle`.
- Visible: `page.innerText('body')` + captura; contrastar con el DOM (texto oculto con CSS, contenido tras interacción).
- Con acceso, confirmar con URL Inspection → "HTML renderizado" (E4).

Reglas: el contenido principal, title, description, canonical, H1 y JSON-LD deben estar en el **raw HTML**. Lo que solo existe tras hidratar es riesgo (render diferido, errores, recursos bloqueados).

## Checklist
- Enlaces reales `<a href>` para navegación importante (no `onClick` sin href).
- Sin errores de hidratación (paridad SSR/cliente; revisar consola).
- Contenido no dependiente de llamadas a API para existir; si lo es, comprobar que Googlebot lo obtiene.
- Rutas inexistentes → **404 real** (no 200 genérico de SPA / soft 404).
- Recursos JS/CSS/imágenes no bloqueados en robots.txt.
- Cambios de idioma con URL propia (no solo estado cliente).
- Redirecciones HTTP, no solo `window.location`.
- Lazy loading que no oculta contenido indexable (sin depender de scroll o clic).

## Canonical Reconciliation
Compara las señales de canonicalidad:

1. Canonical en HTML (raw y renderizado).
2. Canonical en cabecera HTTP (`Link: <…>; rel="canonical"`).
3. URL en el sitemap.
4. Enlaces internos que apuntan a la URL.
5. Redirecciones.
6. **Canonical seleccionada por Google** (URL Inspection / informe de Páginas) — ver `search-console-ga4-local-intl.md`.

Si hay discrepancias: documéntalas, determina cuál es la señal dominante y **no asumas que Google seguirá la declarada**. Sin acceso a GSC, el punto 6 es `NOT VERIFIED`.

## Si el proyecto fuera Next.js
Metadata API (`metadata`, `generateMetadata`, `alternates`), `app/robots.ts`, `app/sitemap.ts`, `generateStaticParams`, ISR/caché, `redirects()`/middleware, `next/image` con URLs absolutas, metadata heredada accidentalmente o duplicada. Verifica con la documentación vigente de Next.js.
