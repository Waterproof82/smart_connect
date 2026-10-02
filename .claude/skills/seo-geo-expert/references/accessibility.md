# Accesibilidad (WCAG 2.2 AA)

La accesibilidad es requisito de calidad y también mejora semántica, comprensión e interoperabilidad (incluidos agentes y lectores). No es "factor SEO" demostrado: no lo presentes como tal.

## Checklist
- Teclado completo, orden de foco lógico, foco visible y no oculto (2.4.7, 2.4.11), sin trampas.
- Objetivos táctiles ≥ 24×24 px (2.5.8; ideal 44).
- Contraste ≥ 4.5:1 (texto) / 3:1 (texto grande y componentes UI), **en modo claro y oscuro**.
- Landmarks (`header`, `nav`, `main`, `footer`), un H1, jerarquía de headings.
- `alt` en imágenes informativas, vacío en decorativas.
- Formularios: `label` asociado, errores identificados y descritos, `autocomplete`, ayuda consistente (3.3.x, 3.2.6).
- ARIA solo si el HTML nativo no basta; sin roles redundantes.
- `prefers-reduced-motion`, sin parpadeos, contenido no dependiente solo del color.
- Idioma de página y de fragmentos (`lang`).
- Reflow a 320 px sin scroll horizontal; zoom 200 %.

## Herramientas
axe (extensión o `@axe-core/playwright`), Lighthouse a11y, navegación manual solo con teclado, lector de pantalla. Lo automático detecta ~30–40 % de los problemas: indica qué quedó sin verificar manualmente (`NOT VERIFIED`).
