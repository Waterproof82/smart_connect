# Plan SEO: Carta Digital en página propia + Landing simplificada

**Fecha:** 2026-10-01 · **Estado:** Propuesta (pendiente de aprobación) · **Fuentes:** GSC Performance + Coverage (export 2026-10-01), `Carta_Digital_vs_Glovo-Presentación.pdf`, código actual del repo.

---

## 1. Qué dicen los datos de Search Console

> ⚠️ **Muestra muy pequeña**: 25 clics y ~420 impresiones en total. Sirve para detectar *dirección*, no para decidir a ciegas. Además, 24 de los 25 clics vienen de consultas anonimizadas por Google (la tabla de consultas solo atribuye 1 clic, "tapstar"), así que la lista de consultas es una fracción de la demanda real.

### 1.1 Páginas

| Página | Clics | Impr. | CTR | Pos. |
|---|---|---|---|---|
| `/tarjetas-nfc` | 14 | 92 | 15,2 % | 7,3 |
| `/tap-review` (301 → `/tarjetas-nfc`) | 7 | 109 | 6,4 % | 9,4 |
| `/` | 3 | 277 | 1,1 % | 44,3 |
| `http://` (sin https) | 1 | 8 | 12,5 % | 19,6 |

**Lectura:** el único servicio que ya posiciona (top 10) y convierte clics es **NFC / Tap Review**. La home acumula el 66 % de impresiones pero en posición ~44 (página 5): nadie llega a verla. Móvil: CTR 10 % y pos. 7,8; escritorio: CTR 4 % y pos. 39.

### 1.2 Consultas, agrupadas por intención

| Clúster | Consultas (impresiones) | Total impr. | Posición | Lectura |
|---|---|---|---|---|
| **IA / chatbots / robots para empresas (local)** | ia para empresas tenerife (35), chatbots ia tenerife (20), aplicaciones ia tenerife (10), robots de atención al público tenerife (9), inteligencia artificial empresas tenerife (8), chatbot web tenerife (1), chatbots whatsapp tenerife (1) | **84** | 61–94 | **Mayor demanda detectada y no la estamos cubriendo** |
| **Automatización de procesos (local)** | automatización procesos tenerife (12), automatización empresas tenerife (5), automatización n8n tenerife (2), n8n tenerife (1) | **20** | 55–82 | Demanda real, sin página dedicada |
| **NFC / reseñas** | tap to review (5), tap nfc (4), nfc tap review (2), tap and review (1), **tapstar (3, el único clic)** | 15 | 3–38 | Ya posiciona; la búsqueda por "tapstar" valida la estrategia de comparativa |
| **Marca** | digitalizatenerife.es (20), digitaliza (4), digitaliza canarias (4) | 28 | 1–30 | Marca funcionando |
| **"Canarias Digitaliza"** | canarias digitaliza (21) | 21 | 31,7 | Probable confusión con el programa público homónimo; no merece contenido propio (ver §6) |
| **Carta digital / QR / Glovo / pedidos** | — | **0** | — | **Cero señal** |

### 1.3 Conclusiones clave

1. **No hay evidencia de demanda de "carta digital" en GSC.** No significa que no exista; significa que hoy no aparecemos para esas búsquedas (la home compite con 13 módulos TPV mezclados y `/carta-digital` está redirigida a `/`). Hay que validar con Keyword Planner / Trends antes de apostar el SEO solo a ese término (ver §7).
2. **El objetivo 1 del encargo tiene respuesta clara**: el servicio con más demanda es **IA/chatbots para empresas en Tenerife**, seguido de **automatización de procesos**. Irónicamente, el refactor `landing-two-solutions` (2026-08-11) eliminó las páginas `/automation-n8n`, `/whatsapp-automation`, etc. y las redirigió a `/`; hoy Google nos muestra en pos. 55–85 para esas consultas sin una página que las responda.
3. **Problema de indexación (Coverage):** solo 2 páginas indexadas; 5–7 sin indexar → 2 "página con redirección" (`/tap-review`, `http://`, con validación en *Error*), 4 "rastreada: sin indexar" (señal de contenido débil/duplicado) y 1 "descubierta: sin indexar". Hay que revisar cuáles son y arreglar antes de crear páginas nuevas, o las nuevas acabarán igual.

---

## 2. Qué dice la comparativa Carta Digital vs Glovo (PDF)

Escenario: 200 pedidos/mes · ticket 40 € · 8.000 €/mes. Las cuentas cuadran (8.000 − 2.400 = 5.600; 8.000 − 1.760 = 6.240; +640/mes; +7.680/año; +11,4 %).

Mensajes aprovechables en web: **~30 % comisión**, **clientes propios vs. de la plataforma**, **recogida en local = margen máximo**, **promociones propias**, **cobro directo vía Redsys**, **chat de un clic con tiempo de preparación**.

**Riesgos a resolver antes de publicar (no son menores):**

| Riesgo | Acción |
|---|---|
| El 30 % de Glovo y los 1.760 € de reparto son supuestos | Presentarlo como **simulador con entradas editables** (pedidos, ticket, % comisión, coste de reparto), con "Ejemplo orientativo" visible, no como promesa de +640 € |
| Se ignoran costes propios: comisión de Redsys/tarjeta y el coste de la carta | Incluirlos en el simulador para no ser acusados de publicidad engañosa |
| "Mismo precio para el cliente" y volumen de pedidos igual | Glovo aporta demanda; la carta propia no la genera sola. Mensaje honesto: "**complementa** Glovo: mueve a tus clientes habituales a tu canal" (más creíble y más vendible) |
| Publicidad comparativa con marca registrada | Permitida si es veraz, verificable y no denigratoria (Ley de Competencia Desleal). Nombrar "Glovo" solo en comparativa objetiva; añadir fuente/fecha de la tarifa y aviso de que es marca de terceros |
| Redsys y "chat de un clic" aparecen en el PDF | **Confirmar que existen en el producto hoy** (ya hay módulo `delivery-takeaway` con "cero comisiones"); si no, no prometerlo en la web |

---

## 3. Arquitectura de URLs propuesta

| URL | Estado | Rol SEO |
|---|---|---|
| `/` | Simplificada | Marca + hub. Objetivo: servir de entrada a los 2 productos estrella y a servicios |
| `/carta-digital` | **Nueva (hoy 301→`/`)** | Producto estrella #1: carta QR + pedidos + ahorro vs Glovo |
| `/tarjetas-nfc` | Existe | Producto estrella #2. **No tocar la URL ni el H1**: es lo único que posiciona |
| `/ia-chatbots-tenerife` | **Nueva** | Clúster IA/chatbots/robots (84 impr.) |
| `/automatizacion-procesos-tenerife` | **Nueva (o fusionada con la anterior; ver decisión D2)** | Clúster automatización/n8n (20 impr.) |
| `/tpv-restaurantes` | **Nueva** (mueve los 13 módulos TPV fuera de la home) | Descarga la home y evita que 13 H2 diluyan el tema |
| `/alternativa-glovo` | **Opcional, fase posterior** | Solo si Keyword Planner valida "alternativa a glovo / pedidos sin comisiones" |

Cambios técnicos asociados (los 4 puntos se tocan siempre juntos, como ya documentó `landing-two-solutions`):
`src/entry-client.tsx` + `src/entry-server.tsx` (rutas) · `scripts/site-routes.json` (sitemap + prerender) · `vercel.json` (quitar el 301 `/carta-digital → /` y añadir `rewrites`/`Cache-Control`) · `public/llms.txt` y JSON-LD (`buildHomeSchema`).

---

## 4. Landing simplificada (`/`)

Principio del proyecto: *una acción primaria por pantalla*. Estructura propuesta:

1. **Hero** — propuesta de valor en una frase + CTA único (WhatsApp/contacto).
2. **Dos productos estrella** (tarjetas grandes, lado a lado):
   - **Carta digital** → titular de ahorro ("Ahorra hasta ~640 €/mes frente a un marketplace*") + enlace a `/carta-digital`.
   - **Tarjetas NFC** → más reseñas en Google + enlace a `/tarjetas-nfc`.
3. **Más servicios** (fila secundaria, 3 tarjetas pequeñas): IA/chatbots · Automatización · TPV → cada una enlaza a su página.
4. **Prueba social** (`SuccessStats`, ya existe) — revisar que las cifras sean veraces.
5. **FAQ** (reducir a las 5–6 preguntas más útiles) y **Contacto**.

Se **retira de la home**: los 13 módulos TPV (pasan a `/tpv-restaurantes`) y la sección larga "¿Por qué Digitaliza Tenerife?" (se condensa en 1 franja con el stat strip). Menos páginas de scroll → menos nodos DOM y contenido menos duplicado.

> Nota de coherencia con el tono del código: la sección "¿Por qué…?" usa voseo ("te ponés", "te adelantás") en una web de Tenerife; aprovechar el refactor para pasarla a español de España.

---

## 5. Página `/carta-digital` (reutiliza el 90 % de lo que ya existe)

Hoy hay 14 componentes `CartaDigital*Section` montados dentro del módulo `tienda-carta-digital` de la home. Orden propuesto para la página propia:

1. Hero (`CartaDigitalHeroSection`) — H1 único: "Carta digital para restaurantes con pedidos en mesa y recogida sin comisiones"
2. **NUEVO: Ahorro vs Glovo** (sustituye/absorbe `CartaDigitalDineroSection` y `CartaDigitalComparacionSection`) — simulador + comparativa visual en dos columnas (Glovo vs carta propia) + bloque "los clientes son tuyos"
3. Problema → Solución → Cómo funciona
4. Recogida en local: incentivos (10 % descuento, bebida/entrante, puntos), promociones propias
5. Demo (`CartaDigitalDemoSection`) + Beneficios + Modos (mesa / recoger / domicilio)
6. Telegram, BBDD, Antidesperdicio (funcionalidades)
7. FAQ específica (Schema `FAQPage`) + CTA final

SEO on-page: `<title>`/`description` propios, canonical `https://digitalizatenerife.es/carta-digital`, JSON-LD `Service`/`Product` + `FAQPage` + `BreadcrumbList`, enlazado interno desde home, navbar y `/tarjetas-nfc`. Textos 100 % vía i18n (es/en), sin strings hardcodeados.

---

## 6. Nuevos servicios detectados

| Servicio | Evidencia | Propuesta |
|---|---|---|
| **IA y chatbots para empresas** (incl. WhatsApp) | 84 impresiones, el clúster más grande | Página `/ia-chatbots-tenerife`: casos para hostelería y comercio local, demo del chatbot RAG que ya tenemos (es nuestra mejor prueba), precios orientativos |
| **Automatización de procesos / n8n** | 20 impresiones | Fusionar en la misma página o crear `/automatizacion-procesos-tenerife` (decisión D2). Ejemplos del pipeline de leads que ya usamos |
| **"Robots de atención al público"** | 9 impresiones | Cubrir como sinónimo dentro de la página IA (no página aparte) |
| **"Canarias Digitaliza"** | 21 impresiones | Hipótesis: gente buscando el programa público. **No crear página**; como máximo una pregunta de FAQ aclarando que somos una agencia privada, para evitar rebote y confusión de marca |

---

## 7. Validar demanda antes de invertir (barato, hacer ya)

GSC solo muestra lo que ya aparece. Antes de decidir H1/URLs, comprobar volumen mensual (Google Keyword Planner / Trends, geo España y Canarias) de:
`carta digital restaurante`, `carta qr restaurante`, `menú qr`, `pedidos online sin comisiones`, `alternativa a glovo`, `como evitar comisiones glovo`, `tarjetas nfc google reseñas`, `chatbot para restaurantes`, `automatización restaurantes`.
Resultado esperado: un único H1 por página con el término de mayor volumen real.

---

## 8. Plan de entrega (SDD obligatorio: 4+ archivos ⇒ `/sdd-new`; TDD; PRs pequeños)

| PR | Contenido | Riesgo |
|---|---|---|
| **0** | Diagnóstico de Coverage: identificar las 7 URLs sin indexar; arreglar `http→https`, quitar `/tap-review` de cualquier enlace interno/sitemap, revisar thin content | Bajo |
| **1** | Routing `/carta-digital` (rutas cliente+SSR, `site-routes.json`, `vercel.json`, sitemap) con las secciones existentes movidas tal cual | Medio: no romper el prerender/critical CSS |
| **2** | Sección **Ahorro vs Glovo** + simulador (con tests de la fórmula, TDD) + i18n es/en | Medio: contenido legal |
| **3** | Home simplificada + `/tpv-restaurantes` | Medio: es el cambio más visible; medir antes/después |
| **4** | `/ia-chatbots-tenerife` (+ automatización) | Bajo |
| **5** | `llms.txt`, JSON-LD, FAQs, enlazado interno, `CHANGELOG`, audit log, versión | Bajo |

Protocolos del proyecto en cada PR: `npm run lint`, `npm run type-check`, `npm test`, `npm run build`; entrada en `CHANGELOG.md` ([Unreleased], inglés, Keep a Changelog) y log en `docs/audit/` (inglés, con timestamp).

> Aviso heredado: `docs/audit/2026-08-11_landing-two-solutions.md` documenta que los `*.test.tsx` **no se ejecutan** bajo `npm test` (`testMatch` solo `.ts`, sin `jest-environment-jsdom`). Los tests nuevos de componentes deben ser `.test.ts` (inspección de código/lógica pura, p. ej. la fórmula del simulador) o resolverse ese gap primero.

## 9. KPIs (revisar en GSC a 4, 8 y 12 semanas)

- Páginas indexadas: de 2 → ≥ 6 (todas las del sitemap).
- Impresiones y posición media de `/` (hoy 277 / pos. 44) y de las nuevas páginas.
- Aparición en consultas de carta digital/Glovo (hoy 0).
- Posición del clúster IA/chatbots (hoy 61–94 → objetivo < 20).
- **Conversión:** clics a WhatsApp/formulario por página (GSC no lo mide: añadir eventos en GA4).
- Mantener `/tarjetas-nfc` ≥ 14 clics y pos. ≤ 8 (línea base a no perder).

## 10. Decisiones que necesito de ti

- **D1.** ¿Glovo en `/carta-digital` solo como sección, o también una página propia `/alternativa-glovo`? *(Recomendación: sección ahora, página propia solo si el volumen de búsqueda lo justifica.)*
- **D2.** ¿IA/chatbots y automatización en **una** página o en dos? *(Recomendación: una al inicio — con ~100 impresiones totales no justifica dos.)*
- **D3.** ¿Redsys y el chat de un clic con tiempo de preparación están ya disponibles en el producto?
- **D4.** ¿Posicionamiento "complementa Glovo" (recomendado, más creíble) o "sustituye a Glovo"?
