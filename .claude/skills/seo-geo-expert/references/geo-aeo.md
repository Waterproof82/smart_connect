# GEO / AEO / Google AI Overviews & AI Mode

## Definición operativa
Lograr que la información de una entidad sea **descubrible, comprensible, desambiguada, verificable, contextualizada y reutilizable** por sistemas de recuperación y generación. No es un truco: es SEO sólido + claridad factual + entidades coherentes.

## Qué dice Google (verificar vigente en developers.google.com/search/docs/appearance/ai-features)
- AI Overviews / AI Mode usan los mismos fundamentos de Search: contenido **rastreable, indexable y elegible para snippet** (sin `nosnippet`/`max-snippet` restrictivo si se quiere ser citable).
- No existe marcado ni archivo especial para aparecer. `llms.txt` **no** es utilizado por Google Search; puede ser útil para otros agentes/LLM → clasifícalo `OPTIMIZACIÓN/EXPERIMENTO`, nunca `REQUISITO`.
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

## `llms.txt` y `.well-known/`
Mantener: resumen de la entidad, servicios, enlaces a páginas clave con descripción, datos de contacto, fecha. Debe coincidir con el sitio (precios, claims, dominio `digitalizatenerife.es`). Tras editar → recalcular `sha256` en `agent-skills/index.json`. No publicar endpoints OAuth/MCP que no existan o no funcionen (stubs engañosos = hallazgo).

## Multimodal
Texto + imagen + vídeo + tabla + Schema deben apoyar el mismo mensaje; imágenes propias con alt y contexto; transcripción/capítulos para vídeo.

## Lo que NO hacer
Repetir keywords, inyectar preguntas artificiales, texto oculto para bots, "prompt injection" en contenido, Schema masivo sin respaldo visible, contenido generado en masa. Todo ello es spam o ruido.
