# Spam policies (gate de Search Essentials)

Contrasta con las políticas vigentes de Google (developers.google.com/search/docs/essentials/spam-policies) antes de aprobar una implementación. Cualquier hallazgo `FAIL` aquí es **CRÍTICO / P0–P1** y bloquea el cierre de la auditoría.

| Práctica | Qué buscar |
|---|---|
| Cloaking | Contenido distinto para Googlebot y usuarios; detección por UA/IP |
| Doorway pages | Páginas casi idénticas por ciudad/keyword sin valor propio |
| Keyword stuffing | Repetición antinatural en texto, title, alt, anchors, footers |
| Texto/enlaces ocultos | `display:none`, color = fondo, fuera de pantalla con fines SEO |
| Enlaces manipulativos | Compra/intercambio masivo, anchors forzados, comentarios spam |
| Contenido autogenerado/escalado sin valor | Texto en masa sin revisión ni aportación |
| Redirecciones engañosas | Destino distinto al esperado por usuario o bot |
| Scraping/copias | Contenido duplicado de terceros |
| Site reputation abuse / expired domain abuse | Contenido de terceros sin relación; dominios caducados reutilizados |
| Markup engañoso | Schema que no refleja contenido visible; reseñas autoprovistas |
| Manipulación de sistemas generativos | Texto oculto o instrucciones dirigidas a LLM, claims falsos |

Si algo dudoso es heredado (existía antes), documéntalo como hallazgo; no lo "arregles" sin entender por qué existe.
