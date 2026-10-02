# Protocolo de validación

## Automática (ejecutar siempre que aplique)
1. `npm run lint` · `npm run type-check` · tests relevantes · `npm run build`.
2. Artefacto servido/prerenderizado: `title`, description, canonical, H1, `html lang`, robots meta, hreflang, JSON-LD (`JSON.parse` válido) por ruta clave.
3. `robots.txt` y `sitemap.xml`: accesibles (200), bien formados, URLs 200/indexables/canónicas.
4. Códigos HTTP y cadenas de redirección: `curl -sIL`.
5. Enlaces internos rotos, imágenes sin `alt`/dimensiones.
6. Rendering Triad (ver `rendering-javascript-seo.md`).
7. Pruebas de regresión (ver `regression-testing.md`).

## Con acceso a herramientas externas
Rich Results Test · Schema.org Validator · URL Inspection (canonical declarada vs seleccionada, última exploración, indexabilidad) · PageSpeed Insights/CrUX · Lighthouse · informes de GSC.

## Manual / sin acceso
Marca `NOT VERIFIED` con: motivo, URL o dato a comprobar, herramienta exacta y resultado esperado. Ejemplo: *"Rich Results Test sobre https://digitalizatenerife.es/ → debe detectar Organization sin errores"*.

## Cierre
Cada resultado: estado (`PASS/FAIL/WARNING/NOT VERIFIED/NOT APPLICABLE`) + evidencia (E0–E5). Nada se declara "arreglado" sin una comprobación posterior (AFTER).
