# Carta Digital — Diferenciación (briefing de marketing)

Fecha: 2026-10-23. Este documento es la fuente de los mensajes y textos usados en:

- las secciones nuevas de `/carta-digital`: `#confianza`, `#ecosistema`, `#pago-en-mesa`, `#visibilidad` y `#prueba-gratis`;
- la tarjeta destacada de la Home;
- los gráficos para redes sociales y para las demos.

El copy de la web vive en `src/shared/i18n/modules/carta-diferenciacion.ts` (ES/EN).

## Reglas de copy

Las vigila `tests/unit/seo/keywordCopy.cartaDiferenciacion.test.ts`:

- **Sin "garantía" ni "garantizamos".** Se usa "compromiso de mejora" y "si no ves mejora, lo dejas sin coste".
- **Sin cifras inventadas.** Solo están permitidas las confirmadas por el propietario:
  - 0 % de comisión;
  - 5 idiomas;
  - 30 días;
  - 30 min / 1 h.
- **Grafía "Veri*factu".**
- **Persona de contacto.** "Una persona real de Tenerife", nunca "te atendemos en persona en tu local" de forma incondicional (ver `keywordCopy.claims.test.ts`).

## Mensajes clave

1. **Seguridad con nombre y apellidos.** Una carta con pedidos y pagos guarda datos de clientes y del negocio. Frente a apps anónimas de solidez desconocida, aquí hay una persona real en Tenerife que la pone en marcha, la adapta al negocio y responde por WhatsApp. La base de datos de clientes es del negocio.
2. **SEO + GEO que se retroalimenta.** La carta es indexable y va con landing propia. Está conectada al perfil de empresa de Google y a las redes, y aparece en Google, en Maps y en las respuestas de la IA (ChatGPT, Gemini, Perplexity). El ciclo es: búsqueda → perfil → pedido sin comisión → cliente en la base de datos → reseña en Google desde la carta → más visibilidad.
3. **Ecosistema completo.** Del primer clic al cierre de caja:
   - carta autogestionable y landing;
   - pedidos online, para recoger, a domicilio, desde la mesa o con PDA;
   - respuesta al cliente con un toque ("listo en 30 min / 1 h");
   - comandas a cocina y barra;
   - TPV con contabilidad, fichajes, stock, proveedores y Veri*factu.
4. **Pago en mesa (ya disponible).**
   - Propina sugerida en el ticket, para recuperar la que se pierde con el pago con tarjeta.
   - Cuenta a partes iguales.
   - Cada uno paga lo suyo.
   - Reseña en Google justo después de pagar.
5. **30 días de prueba gratis.**
   - Semana 1: puesta en marcha.
   - Semanas 2 a 4: medición.
   - Día 30: revisión conjunta.
   - Si no hay mejora, se deja sin coste y sin permanencia.

## Gráficos (formato 1080×1350, vertical)

Están diseñados en el lienzo de Claude "Carta Digital – Diferenciación". Paleta: azul atlántico `#1447E6` para lo propio, naranja `#B53A0B` para los riesgos y fondo claro `#FAFAFA`. Tipografías: Space Grotesk e Inter.

| # | Gráfico | Contenido |
| --- | --- | --- |
| 1 | Resumen de un vistazo | Los 2 pilares + tabla comparativa frente a apps genéricas + franja "30 días gratis" |
| 2 | ¿Quién hay detrás de tu carta? | Datos en juego; app anónima frente a persona real en Tenerife |
| 3 | Sistema modular (5 niveles) | Carta + landing → pedidos online y para recoger → pedidos y pago en mesa → PDA → TPV + Veri*factu |
| 4 | SEO + GEO | Google Search/Maps frente a asistentes de IA; 5 idiomas |
| 5 | Ciclo de retroalimentación | 6 pasos en bucle con el perfil de empresa de Google |
| 6 | 30 días gratis | Calendario de la prueba y las dos salidas |
| 7 | Ecosistema completo | 4 etapas: te descubren → piden → se prepara → se cobra |
| 8 | Pedidos, PDA, cocina y barra | Pedido de ejemplo con los botones "Listo en 30 min / 1 h"; reparto de comandas |
| 9 | Pago en mesa y propinas | Ticket con propina sugerida, dividir la cuenta y "pago lo mío" |

## Prompts para imágenes de apoyo

Sirven para Midjourney, DALL·E, Gemini o similares. Las imágenes van sin texto y el texto se superpone con los gráficos.

1. **Persona real en Tenerife:** Fotografía cálida y realista de un consultor tecnológico enseñando una carta digital en una tablet al dueño de un pequeño restaurante canario, sentados en una terraza con el Teide de fondo desenfocado, luz de mañana, ambiente cercano y de confianza, paleta con toques azul atlántico, estilo editorial, 4:5
2. **App anónima frente a persona real:** Imagen dividida en dos mitades: a la izquierda un móvil con un chatbot genérico en una oficina vacía, fría y gris, con un candado roto difuminado; a la derecha un apretón de manos en la barra de un bar de Tenerife con luz natural cálida. Estilo fotográfico limpio, alto contraste emocional, sin texto, 4:5
3. **Datos protegidos:** Ilustración isométrica minimalista de un escudo azul que protege un pequeño restaurante, con iconos flotantes de clientes, pedidos y facturas conectados por líneas finas, fondo blanco roto, estilo vectorial plano y elegante, colores azul #1447E6 y negro, sin texto
4. **SEO + GEO:** Ilustración vectorial limpia de un móvil que muestra un mapa con un pin destacado sobre Tenerife, rodeado de burbujas de búsqueda y de respuestas de un asistente de IA que apuntan al mismo restaurante, fondo claro, acentos azul eléctrico, estética tecnológica moderna, sin texto
5. **Ciclo de retroalimentación:** Diagrama ilustrado circular con seis iconos conectados por flechas en bucle (lupa, pin de mapa, bolsa de pedido, base de datos, estrella de reseña, gráfica ascendente), estilo línea fina azul sobre fondo blanco, composición equilibrada, look de infografía premium, sin texto
6. **Mes de prueba gratis:** Calendario minimalista con 30 días y el último día marcado con un check azul, junto a una carta digital en un móvil sobre la mesa de un restaurante, fotografía de producto con luz suave, fondo oscuro elegante, acentos azul, sensación de confianza y cero riesgo, sin texto
7. **Ecosistema completo:** Ilustración isométrica limpia de un restaurante canario visto en corte, con un flujo de líneas azules que conecta un móvil con Google Maps, una mesa con QR, un camarero con PDA, la cocina, la barra y un TPV con gráficas, fondo blanco roto, estilo vectorial premium, acentos azul #1447E6, sin texto, 4:5
8. **Pedido con un toque:** Primer plano realista de una mano pulsando un botón azul en una tablet en la barra de un bar de Tenerife, con un pedido en pantalla (sin texto legible) y la cocina desenfocada al fondo, luz cálida, sensación de rapidez y orden, fotografía editorial, 4:5
9. **Pago en mesa y propinas:** Primer plano de un móvil sobre la mesa de un restaurante en Tenerife con una pantalla de pago y opciones de propina (sin texto legible), varias manos de un grupo de amigos alrededor eligiendo su parte de la cuenta, luz cálida de atardecer, fotografía editorial, 4:5
