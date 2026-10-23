# Mejoras pendientes (siguiente fase SEO y contenido)

Origen: revisión externa de digitalizatenerife.es (2026-10-23) y la implementación de ronda 2 (`docs/audit/2026-10-23_gsc-keyword-alignment-round2.md`). Lo ya hecho está en `CHANGELOG.md`. Aquí solo lo que falta y qué se necesita para hacerlo.

## Necesitan datos o material del propietario

| # | Mejora | Qué falta | Dónde se aplica | Hallazgo |
|---|---|---|---|---|
| 1 | Reseñas recientes en la home | Reseñas reales y atribuibles de clientes actuales (nombre abreviado, año, texto literal, permiso). Sin `Review`/`AggregateRating` en JSON-LD (política de spam). | Recuperar el bloque `CartaDigitalReviews` en `src/App.tsx` con datos nuevos en `src/features/landing/data/cartaDigitalReviews.ts`. Hoy se quitó de la home porque eran de 2022 y de QR iBar. | F-18 |
| 2 | `/about` con historia y equipo | Texto real de la historia, equipo y fotos. | `AboutPage.tsx`; considerar `Person` en `buildAboutSchema()` solo con datos reales. | F-19 |
| 3 | Fotos propias | Foto real del TPV en un local, tarjeta NFC en una mesa, carta en un móvil. | `HomeSolutionsSection.tsx` (hoy: captura de carta y foto de Unsplash). Mantener `alt` descriptivo, `width`/`height` y `srcset`. | F-20, F-07 |
| 4 | Precios en el artículo del TPV | Cifras publicables (o rangos) y qué incluyen. | `src/features/landing/data/blogPosts.ts`, artículo `cuanto-cuesta-un-tpv-restaurante`. Hoy solo explica de qué depende el precio. | F-19 |
| 5 | Confirmar "TPV táctil" | Que el TPV está pensado para tablets y pantallas táctiles. | Copy en `src/shared/i18n/modules/seo-landing.ts` (`tpvTactilDesc`). | — |

## Se pueden hacer sin más datos

| # | Mejora | Detalle | Prioridad |
|---|---|---|---|
| 6 | Más artículos de blog | Ideas con intención local: "carta digital para bares y cafeterías", "chatbot de WhatsApp para reservas", "qué es el IGIC en el TPV", "comandero móvil frente a libreta". Mismas reglas que los actuales (sin cifras ni clientes inventados). Añadir la entrada en `blogPosts.ts`, la ruta en `entry-server.tsx`, `clientRoutes.tsx`, `site-routes.json`, `middleware.ts`, `vercel.json` y `llms.txt` (recalcular el sha256 de `agent-skills/index.json`) y subir los contadores de los tests de paridad. | Media |
| 7 | Enlaces internos desde el cuerpo de las páginas a los artículos | Hoy el blog solo se enlaza desde el pie de página. Añadir "Lee también" en las páginas de producto. | Media |
| 8 | Imagen OG propia para el blog | Los artículos usan `/og/home.png`. Generar una por artículo con `scripts/generate-og-images.mjs`. | Baja |
| 9 | Medir el efecto en Search Console | Comparar a 4 y 8 semanas: impresiones y posición de "tpv táctil", "tpv restaurante", "chatbot con IA Tenerife / Lanzarote / Fuerteventura", "canarias digitaliza". Ver `docs/audit/2026-10-01_gsc-search-performance-analysis.md`. | Alta |
| 10 | Revisar si mantener `/tarjetas-nfc` como servicio principal en la home | La home da peso a TPV, carta y chatbot; NFC pasó a secundaria. Decidir con datos de GSC. | Baja |

## Descartado

- Cobertura de supermercados y página `/tpv-tenerife`: el propietario indicó que no tiene peso (2026-10-23).
- Forzar la frase literal "tpv tenerife": no es natural; el H2 usa "TPV táctil en Tenerife".

## Pendientes de producto ya registrados (no SEO)

- F-09: el chatbot no responde si se agota el saldo prepago de Gemini. Propuesta: mostrar un CTA de WhatsApp cuando falle.
- F-13: peso del JS inicial de la home. Solo actuar si PSI móvil baja de 90.
