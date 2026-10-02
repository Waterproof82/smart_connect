# GEO / AEO / Google AI Overviews & AI Mode

## Definición operativa
Lograr que la información de una entidad sea **descubrible, comprensible, desambiguada, verificable, contextualizada y reutilizable** por sistemas de recuperación y generación. No es un truco: es SEO sólido + claridad factual + entidades coherentes. No se limita a ningún asistente concreto.

```
Descubrimiento → recuperación → desambiguación de entidad → comprensión → verificación → síntesis → citación
```
Audita en qué eslabón falla cada página (¿rastreable? ¿recuperable por su texto? ¿entidad inequívoca? ¿afirmaciones verificables? ¿extraíble sin perder sentido?).

**Respaldo documental:** el SEO de Google Search tiene documentación oficial (E3); GEO/AEO en general **no**. Etiqueta la mayoría de recomendaciones GEO como `BUENA PRÁCTICA`, `OPTIMIZACIÓN` o `HIPÓTESIS`, nunca `REQUISITO`.

## Qué dice Google (verificar vigente en developers.google.com/search/docs/appearance/ai-features)
- AI Overviews / AI Mode usan los mismos fundamentos de Search: contenido **rastreable, indexable y elegible para snippet** (sin `nosnippet`/`max-snippet` restrictivo si se quiere ser citable).
- No existe marcado ni archivo especial para aparecer en AI Overviews / AI Mode.
- Controles: `nosnippet`, `max-snippet`, `data-nosnippet`, `Google-Extended` (entrenamiento/grounding de Gemini, no afecta a la indexación en Search).

## Checklist de citabilidad (por página importante)
¿Una IA puede identificar con claridad **quién · qué · dónde · cuándo · cuánto · para quién · cómo · por qué**?
- Respuesta directa en las primeras líneas de cada sección (40–60 palabras, factual).
- Cada sección se entiende sola (contexto incluido: nombre de la entidad, lugar, fecha).
- Hechos concretos y verificables: precios o rangos, funciones, límites, ubicación, horarios, fechas de actualización, fuente cuando aplique.
- Definiciones ("QRIBAR es…"), comparativas (tablas), procedimientos (listas numeradas), FAQs **reales** de clientes.
- Entidades desambiguadas: nombre completo, `sameAs`, enlaces a perfiles oficiales.
- Evidencia: casos con contexto, datos propios, citas a fuentes primarias.
- Sin ambigüedad ("somos líderes", "los mejores") ni claims sin respaldo.
- Contenido en HTML textual (no solo en imágenes/JS/PDF) y en el HTML inicial.

## AEO
Detecta preguntas reales (GSC queries con "qué/cómo/cuánto/mejor", "People also ask", soporte comercial, chatbot RAG logs). Crea FAQ/Q&A/guías/comparativas solo si la respuesta es útil y única. Marcado `FAQPage`: los **rich results de FAQ están limitados por Google** a sitios gubernamentales/sanitarios; en el resto es válido como marcado semántico pero no esperes rich result. No uses `HowTo` (retirado).

## Otros sistemas generativos
Permitir en `robots.txt` los bots de búsqueda/citación que interese (p. ej. OAI-SearchBot, ChatGPT-User, PerplexityBot, Applebot-Extended, ClaudeBot/Claude-SearchBot) y decidir aparte los de entrenamiento (GPTBot, CCBot, Google-Extended, anthropic-ai). Política actual del repo: `Content-Signal: search=yes, ai-input=yes, ai-train=no` (coherente en `robots.txt`, `vercel.json`, `vite.config.ts`). Confirma nombres/UA vigentes en la documentación de cada proveedor.

## `llms.txt` y `.well-known/` (recursos experimentales)
`llms.txt` es una señal/recurso **experimental o no estandarizado** en este contexto. Google Search no lo usa y no hay evidencia oficial de que mejore la visibilidad. Nunca tratarlo como:
- requisito de Google;
- equivalente a `robots.txt`, `sitemap.xml` o `canonical`;
- mecanismo de indexación;
- garantía de visibilidad o citación en IA;
- sustituto de `sitemap.xml`;
- sustituto de contenido HTML accesible.

Reglas:
- **No recomendarlo automáticamente** en cada proyecto. Si se propone, etiquetar `EXPERIMENTO` u `OPTIMIZACIÓN` según la evidencia, con coste/beneficio (bajo coste, beneficio no demostrado).
- Este repo **ya lo publica** (`public/llms.txt`, `public/.well-known/`): mantenerlo coherente con el sitio (dominio `digitalizatenerife.es`, servicios, claims sin cifras sin fuente) y recalcular el `sha256` de `agent-skills/index.json` tras editarlo. Auditarlo como `PASS`/`FAIL` de coherencia, no como factor SEO.
- Evitar stubs engañosos: endpoints OAuth/MCP que no existen o no funcionan = hallazgo.

## Citation Readiness
Para cada página estratégica, responde (estado + evidencia):
- ¿Hay una afirmación clara?
- ¿Hay contexto suficiente (quién, dónde, cuándo)?
- ¿Se identifica inequívocamente la entidad?
- ¿Existe evidencia (datos, caso, fuente)?
- ¿Tiene fecha cuando es relevante?
- ¿Puede extraerse sin perder significado?
- ¿La fuente es identificable (autor/organización)?
- ¿La afirmación es específica y no genérica?
- ¿Hay contenido original?

No garantizar aparición ni citación por ningún sistema generativo.

## Multimodal
Texto + imagen + vídeo + tabla + Schema deben apoyar el mismo mensaje; imágenes propias con alt y contexto; transcripción/capítulos para vídeo.

## Lo que NO hacer
Repetir keywords, inyectar preguntas artificiales, texto oculto para bots, "prompt injection" en contenido, Schema masivo sin respaldo visible, contenido generado en masa. Todo ello es spam o ruido.
