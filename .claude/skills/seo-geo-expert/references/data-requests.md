# Solicitud de datos externos (cierre de toda auditoría)

Al terminar, el skill **decide si le faltan datos** para mejorar el análisis o la aplicación de cambios, y si es así los pide de forma concreta. No pidas datos "por si acaso": cada petición debe cerrar un `NOT VERIFIED`, desbloquear una decisión o permitir medir un cambio (AFTER).

## Cuándo pedir
- Hay hallazgos `NOT VERIFIED` que dependen de un servicio externo.
- Una prioridad (P0–P2) no se puede confirmar o dimensionar sin datos reales.
- Un cambio implementado necesita una línea base (BEFORE) o una medición posterior (AFTER) que el código no da.
- No pidas nada si la auditoría quedó cerrada con evidencia E3+ o si el dato no cambiaría ninguna decisión. Dilo explícitamente: *"No se necesitan datos externos adicionales"*.

## Formato obligatorio (sección "Datos necesarios" del informe)

| # | Fuente | Informe / dato exacto | Rango y segmentación | Desbloquea (hallazgo) | Prioridad | Formato de entrega |
|---|---|---|---|---|---|---|

- **Prioridad del dato:** `Imprescindible` (bloquea un P0/P1) · `Recomendado` · `Opcional`.
- **Ruta exacta** en la herramienta (menú → informe → filtros), para que el usuario lo exporte sin dudar.
- **Formato:** CSV/XLSX exportado, captura, o enlace a Google Sheet con permisos de lectura. Indicar dónde dejarlo (`docs/seo-data/`, **sin subirlo a git**).
- **Privacidad:** pedir agregados, nunca datos personales (emails, teléfonos, nombres de leads). Si un Sheet tiene datos personales, pedir solo las columnas necesarias o una versión anonimizada.

## Catálogo por fuente

### Google Search Console
| Dato | Ruta / filtro | Para qué |
|---|---|---|
| Rendimiento por consultas | Rendimiento → Resultados de búsqueda → Consultas, 28 días y 3 meses, comparar con periodo anterior | CTR bajo con muchas impresiones, oportunidades, canibalización |
| Consulta × página | Rendimiento → Páginas (filtrar página) → Consultas | Intención asociada a cada URL, query → URL |
| Rendimiento por país y dispositivo | Pestañas País / Dispositivos | Mercado real (Canarias/España/otros), móvil vs escritorio, hreflang |
| Indexación de páginas | Indexación → Páginas, exportar "No indexadas" con motivo | Duplicadas, rastreadas sin indexar, noindex, soft 404 |
| Inspección de URL | Home y cada landing clave: canonical declarada vs seleccionada, última exploración, rich results | Canonical Reconciliation (E4) |
| Sitemaps | Sitemaps → estado, URLs descubiertas | Sitemap vs indexación |
| Core Web Vitals | Experiencia → Core Web Vitals (móvil y escritorio) | CWV de campo (hoy `NOT VERIFIED`) |
| Mejoras / resultados enriquecidos | Mejoras → cada informe | Errores y avisos de Schema |
| Acciones manuales y seguridad | Seguridad y acciones manuales | Descartar penalizaciones |
| Enlaces | Enlaces → principales sitios y páginas enlazadas | Autoridad, enlaces internos |

### Google Analytics 4
| Dato | Ruta / filtro | Para qué |
|---|---|---|
| Landing pages orgánicas | Informes → Adquisición → Adquisición de tráfico, canal "Organic Search"; dimensión "Página de destino" | Qué landings reciben tráfico y su comportamiento |
| Engagement por landing | Sesiones, tasa de interacción, tiempo de interacción | Calidad del tráfico orgánico |
| Eventos clave / conversiones | Administrar → Eventos: `generate_lead`, clics de WhatsApp, teléfono y email, `chatbot_demo_open` (verificar nombres en `src/shared/utils/analyticsEvents.ts`) | Conversión orgánica real, CTAs que funcionan |
| Conversiones por canal y landing | Exploración con canal × página × evento clave | Cadena GSC → landing → comportamiento → conversión |
| Dispositivo, país, ciudad | Datos demográficos / tecnología | Mercado local y experiencia móvil |
| Consentimiento / Consent Mode | Estado de la etiqueta y % de tráfico modelado | Fiabilidad de los datos (RGPD) |

### Google Business Profile
| Dato | Ruta | Para qué |
|---|---|---|
| NAP, categorías, servicios, área de servicio, horarios | Perfil → Editar | Coherencia con la web y el Schema (`LocalBusiness`) |
| Rendimiento | Llamadas, solicitudes de ruta, clics al sitio, búsquedas que muestran el perfil | SEO local, atribución |
| Reseñas | Volumen, puntuación media, % respondidas (sin datos personales) | Confianza (E-E-A-T) y señales locales |

### Google Sheets (leads y seguimiento)
Aplica a este proyecto: el pipeline n8n guarda los leads en Google Sheets con su temperatura y estado.
| Dato | Columnas | Para qué |
|---|---|---|
| Leads por origen | Fecha, origen/canal, `servicio`, página de entrada, temperatura, estado | Relacionar SEO con leads reales y su calidad |
| Embudo | Nº de leads por estado (nuevo → contactado → demo → cierre) | Valor de cada landing/servicio |
| Mapa servicio ↔ landing | Servicio solicitado vs URL | Priorizar contenido por negocio, no solo por tráfico |
Pedir **solo agregados o columnas no personales**.

### Otros servicios
| Fuente | Dato | Para qué |
|---|---|---|
| PageSpeed Insights / CrUX | URL de las landings clave, móvil y escritorio, campo vs laboratorio | CWV de campo y diagnóstico |
| Rich Results Test / Schema Validator | Resultado por URL | Validación de Schema (E4) |
| Herramienta de backlinks (Semrush, Ahrefs, Ubersuggest) | Dominios referentes, anchors, enlaces perdidos | Autoridad (hoy sin datos) |
| Rankings (herramienta de seguimiento o GSC) | Posición de 10–20 consultas objetivo | Línea base antes/después |
| Hosting / Vercel | Logs o analíticas de bots (Googlebot, bots de IA), errores 4xx/5xx | Rastreo real y bots de IA |
| Redes sociales / directorios | URLs oficiales y datos NAP publicados | `sameAs` y coherencia de entidad |
| Datos de negocio (el propio usuario) | Casos reales con fecha, testimonios verificables, cifras con fuente, fotos propias, equipo | E-E-A-T y GEO sin inventar |

## Cómo entregarlos
- Dejar los exports en `docs/seo-data/` (añadido a `.gitignore`; no subir datos de tráfico ni de clientes al repo).
- Para automatizar la lectura (API de Search Console/GA4, conector o script), el skill lo propone como `OPTIMIZACIÓN` con coste y riesgo, y nunca guarda credenciales en el repo.
- Tras recibir los datos, **re-auditar** solo las áreas afectadas y actualizar estados `NOT VERIFIED` → `PASS`/`FAIL` con evidencia E4/E5.
