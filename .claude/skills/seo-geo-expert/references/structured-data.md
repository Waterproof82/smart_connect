# Datos estructurados (JSON-LD)

## Principios
- Solo marcar lo que está **visible** en la página y es veraz. Schema no sustituye al contenido.
- JSON-LD en el HTML inicial (SSR). Un único `@graph` por página con `@id` estables.
- Distingue **Schema.org (vocabulario)** de **elegibilidad a rich result de Google** (requisitos propios en developers.google.com/search/docs/appearance/structured-data). Verifica qué tipos siguen soportados antes de recomendarlos.
- No añadir tipos "para sumar". Cada tipo debe resolver un propósito (desambiguación, elegibilidad, relaciones).

## Entity graph recomendado
```
Organization (@id https://digitalizatenerife.es/#organization)
 ├─ WebSite (#website) publisher→Organization, inLanguage
 ├─ WebPage / CollectionPage / AboutPage (url#webpage) isPartOf→WebSite, about→Service/Product, primaryImageOfPage
 │    └─ BreadcrumbList
 ├─ Service / Product / SoftwareApplication (QRIBAR, TPV…) provider→Organization, areaServed, offers (solo si hay precio real)
 ├─ LocalBusiness (si hay presencia física/atención local; NAP idéntico a GBP)
 ├─ Person (fundador/autor real) worksFor→Organization
 └─ sameAs: perfiles oficiales reales (Google Business Profile, Instagram, LinkedIn…)
```
Un solo `@id` por entidad en todo el sitio; referenciar por `{"@id": "..."}` en vez de duplicar.

## Tipos: cuándo sí / cuándo no
| Tipo | Usar si | Cuidado |
|---|---|---|
| Organization | siempre | `logo` ≥112×112, `contactPoint`, `sameAs` reales |
| LocalBusiness | negocio local con dirección/área | NAP = GBP; `areaServed` honesto |
| WebSite | siempre | sitelinks searchbox ya no es feature de Google |
| WebPage + BreadcrumbList | siempre / con breadcrumb visible | URLs absolutas canónicas |
| Service / Product / Offer | servicio/producto con página propia | `price` solo real y visible; sin `aggregateRating` inventado |
| SoftwareApplication | apps (carta digital, TPV) | rich result exige rating/offer reales |
| Article/BlogPosting | blog | autor real, `datePublished`/`dateModified` veraces |
| FAQPage | FAQ visible | rich result restringido (gov/salud); válido como semántica |
| Review/AggregateRating | reseñas de terceros verificables y visibles | **No** reseñas autoprovistas sobre tu propia organización/servicio (política de Google) |
| VideoObject / ImageObject | contenido real | thumbnail accesible |
| HowTo | — | retirado de Google; evitar |

## Checklist de validación
1. JSON válido (`node -e "JSON.parse(...)"`), `@context` correcto, sin comas/tipos erróneos.
2. Propiedades obligatorias y recomendadas por tipo.
3. URLs absolutas con `https://digitalizatenerife.es/`; `@id` consistente; sin dominios no oficiales.
4. Coherencia con contenido visible, metadata, canonical y breadcrumbs.
5. Idioma: `inLanguage` y textos acordes a ES/EN según la ruta.
6. Herramientas: Schema.org Validator (validator.schema.org) y Rich Results Test; si no hay acceso → marcar *pendiente de validación manual* con la URL a probar.
