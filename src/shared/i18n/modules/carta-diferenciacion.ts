/**
 * Copy for the Carta Digital differentiation sections (2026-10-23):
 * security and a real contact person behind the product, the full
 * ecosystem (discovery → orders → kitchen/bar → TPV + Veri*factu),
 * table payment with tips and split bills, SEO + GEO feedback loop and the
 * 30-day free trial. Also the extra Carta FAQ entries, the extra
 * comparison-table rows and the home flagship-card highlights.
 *
 * Registered through the i18n modules barrel so LanguageContext.tsx is not
 * reopened. Wording rules (keywordCopy.cartaDiferenciacion.test.ts): no
 * guarantee wording, no unsourced figures, "Veri*factu" spelling.
 */
export interface CartaDiferenciacionCopy {
  // Confianza — who is behind the menu
  cartaConfianzaKicker: string;
  cartaConfianzaTitle: string;
  cartaConfianzaIntro: string;
  cartaConfianzaStakesLabel: string;
  cartaConfianzaStake1: string;
  cartaConfianzaStake2: string;
  cartaConfianzaStake3: string;
  cartaConfianzaStake4: string;
  cartaConfianzaStake5: string;
  cartaConfianzaStake6: string;
  cartaConfianzaAnonTitle: string;
  cartaConfianzaAnon1: string;
  cartaConfianzaAnon2: string;
  cartaConfianzaAnon3: string;
  cartaConfianzaAnon4: string;
  cartaConfianzaAnon5: string;
  cartaConfianzaOwnTitle: string;
  cartaConfianzaOwn1: string;
  cartaConfianzaOwn2: string;
  cartaConfianzaOwn3: string;
  cartaConfianzaOwn4: string;
  cartaConfianzaOwn5: string;
  cartaConfianzaNote: string;
  // Ecosistema — full flow
  cartaEcoKicker: string;
  cartaEcoTitle: string;
  cartaEcoIntro: string;
  cartaEcoStage1Title: string;
  cartaEcoStage1Item1: string;
  cartaEcoStage1Item2: string;
  cartaEcoStage1Item3: string;
  cartaEcoStage1Item4: string;
  cartaEcoStage2Title: string;
  cartaEcoStage2Item1: string;
  cartaEcoStage2Item2: string;
  cartaEcoStage2Item3: string;
  cartaEcoStage2Item4: string;
  cartaEcoStage3Title: string;
  cartaEcoStage3Item1: string;
  cartaEcoStage3Item2: string;
  cartaEcoStage3Item3: string;
  cartaEcoStage4Title: string;
  cartaEcoStage4Item1: string;
  cartaEcoStage4Item2: string;
  cartaEcoStage4Item3: string;
  cartaEcoStage4Item4: string;
  cartaEcoNote: string;
  // Pago en mesa
  cartaPagoKicker: string;
  cartaPagoTitle: string;
  cartaPagoIntro: string;
  cartaPagoFeat1Title: string;
  cartaPagoFeat1Desc: string;
  cartaPagoFeat2Title: string;
  cartaPagoFeat2Desc: string;
  cartaPagoFeat3Title: string;
  cartaPagoFeat3Desc: string;
  cartaPagoFeat4Title: string;
  cartaPagoFeat4Desc: string;
  cartaPagoNote: string;
  // Visibilidad — SEO + GEO + loop
  cartaVisKicker: string;
  cartaVisTitle: string;
  cartaVisIntro: string;
  cartaVisSeoTitle: string;
  cartaVisSeoSub: string;
  cartaVisSeo1: string;
  cartaVisSeo2: string;
  cartaVisSeo3: string;
  cartaVisSeo4: string;
  cartaVisGeoTitle: string;
  cartaVisGeoSub: string;
  cartaVisGeo1: string;
  cartaVisGeo2: string;
  cartaVisGeo3: string;
  cartaVisGeo4: string;
  cartaVisLoopTitle: string;
  cartaVisLoop1: string;
  cartaVisLoop2: string;
  cartaVisLoop3: string;
  cartaVisLoop4: string;
  cartaVisLoop5: string;
  cartaVisLoop6: string;
  // Prueba gratis
  cartaPruebaKicker: string;
  cartaPruebaTitle: string;
  cartaPruebaIntro: string;
  cartaPruebaStep1Label: string;
  cartaPruebaStep1Title: string;
  cartaPruebaStep1Desc: string;
  cartaPruebaStep2Label: string;
  cartaPruebaStep2Title: string;
  cartaPruebaStep2Desc: string;
  cartaPruebaStep3Label: string;
  cartaPruebaStep3Title: string;
  cartaPruebaStep3Desc: string;
  cartaPruebaYesTitle: string;
  cartaPruebaYesDesc: string;
  cartaPruebaNoTitle: string;
  cartaPruebaNoDesc: string;
  // Comparison table — extra rows
  cartaComparRow6Label: string;
  cartaComparRow6Plataforma: string;
  cartaComparRow6Papel: string;
  cartaComparRow6Otras: string;
  cartaComparRow7Label: string;
  cartaComparRow7Plataforma: string;
  cartaComparRow7Papel: string;
  cartaComparRow7Otras: string;
  cartaComparRow8Label: string;
  cartaComparRow8Plataforma: string;
  cartaComparRow8Papel: string;
  cartaComparRow8Otras: string;
  // Carta FAQ — extra entries
  cartaFaqQ6: string;
  cartaFaqA6: string;
  cartaFaqQ7: string;
  cartaFaqA7: string;
  cartaFaqQ8: string;
  cartaFaqA8: string;
  // Home — featured Carta Digital card
  homeCartaBadge: string;
  homeCartaHighlightsLabel: string;
  homeCartaHighlight1: string;
  homeCartaHighlight2: string;
  homeCartaHighlight3: string;
  homeCartaHighlight4: string;
  homeCartaHighlight5: string;
}

export const cartaDiferenciacionCopy: {
  es: CartaDiferenciacionCopy;
  en: CartaDiferenciacionCopy;
} = {
  es: {
    cartaConfianzaKicker: "Una persona real detrás",
    cartaConfianzaTitle: "¿Quién hay detrás de tu carta digital?",
    cartaConfianzaIntro:
      "Una carta con pedidos y pagos guarda datos de tus clientes y de tu negocio. Antes de contratar, pregunta dónde van esos datos y quién responde por ellos.",
    cartaConfianzaStakesLabel: "Lo que pones en juego",
    cartaConfianzaStake1: "Nombres",
    cartaConfianzaStake2: "Teléfonos",
    cartaConfianzaStake3: "Emails",
    cartaConfianzaStake4: "Direcciones de entrega",
    cartaConfianzaStake5: "Historial de pedidos",
    cartaConfianzaStake6: "Ventas y cobros",
    cartaConfianzaAnonTitle: "App anónima",
    cartaConfianzaAnon1: "Nadie con nombre al que llamar",
    cartaConfianzaAnon2: "Soporte por ticket, chatbot o en otro idioma",
    cartaConfianzaAnon3: "Servidores y seguridad que no puedes comprobar",
    cartaConfianzaAnon4: "Tus clientes se quedan en su plataforma",
    cartaConfianzaAnon5: "Si cierra o cambia sus precios, lo pierdes todo",
    cartaConfianzaOwnTitle: "Digitaliza Tenerife",
    cartaConfianzaOwn1: "Una persona real de Tenerife como contacto directo",
    cartaConfianzaOwn2: "Puesta en marcha adaptada a tu modelo de negocio",
    cartaConfianzaOwn3: "Sabes quién trata los datos y cómo (RGPD)",
    cartaConfianzaOwn4: "La base de datos de clientes es tuya",
    cartaConfianzaOwn5: "Integrada con tu TPV y con Veri*factu",
    cartaConfianzaNote:
      "Si algo falla, no abres un ticket: escribes por WhatsApp a la persona que te lo puso en marcha.",

    cartaEcoKicker: "Ecosistema completo",
    cartaEcoTitle: "De la búsqueda en Google al cierre de caja",
    cartaEcoIntro:
      "Un solo sistema conecta cómo te encuentran, cómo piden, cómo se prepara y cómo se cobra. Sin comisiones y sin saltar de una app a otra.",
    cartaEcoStage1Title: "Te descubren",
    cartaEcoStage1Item1: "Perfil de empresa de Google",
    cartaEcoStage1Item2: "Instagram y Facebook",
    cartaEcoStage1Item3: "Tu landing propia con la descripción del local",
    cartaEcoStage1Item4: "Reseñas en Google desde la carta",
    cartaEcoStage2Title: "Piden",
    cartaEcoStage2Item1: "Online para recoger",
    cartaEcoStage2Item2: "A domicilio",
    cartaEcoStage2Item3: "Desde la mesa con su móvil",
    cartaEcoStage2Item4: "Con el camarero y su PDA",
    cartaEcoStage3Title: "Se prepara",
    cartaEcoStage3Item1: "El equipo recibe cada pedido con todo el detalle",
    cartaEcoStage3Item2: "Responde con un toque: listo en 30 min o en 1 h",
    cartaEcoStage3Item3: "La comida va a cocina y la bebida a barra",
    cartaEcoStage4Title: "Se cobra y se gestiona",
    cartaEcoStage4Item1: "Pago desde la mesa con propina",
    cartaEcoStage4Item2: "TPV con contabilidad",
    cartaEcoStage4Item3: "Fichajes, stock y proveedores",
    cartaEcoStage4Item4: "Veri*factu",
    cartaEcoNote:
      "En cada paso, una persona real adapta el sistema a tu modelo de negocio para que le saques el máximo partido.",

    cartaPagoKicker: "Pago en mesa",
    cartaPagoTitle: "Pagan sin esperar la cuenta. Y recuperas las propinas.",
    cartaPagoIntro:
      "Con el pago con tarjeta, la propina se pierde. Desde la carta digital, el ticket la sugiere en el momento justo y cada comensal paga a su manera.",
    cartaPagoFeat1Title: "Propina sugerida en el ticket",
    cartaPagoFeat1Desc:
      "Al ver la cuenta, el cliente elige si deja propina y cuánto. Recuperas la que se pierde al pagar con tarjeta.",
    cartaPagoFeat2Title: "Cuenta a partes iguales",
    cartaPagoFeat2Desc:
      "La mesa divide el total entre las personas que quiera, sin calculadora ni esperas.",
    cartaPagoFeat3Title: "Cada uno paga lo suyo",
    cartaPagoFeat3Desc:
      "Cada comensal marca lo que ha pedido y paga solo su parte.",
    cartaPagoFeat4Title: "Reseña después del pago",
    cartaPagoFeat4Desc:
      "Con un toque, el cliente deja su reseña en Google justo al terminar.",
    cartaPagoNote:
      "Con nuestro TPV, pedido, pago y propina quedan registrados en el mismo sistema, adaptado a Veri*factu.",

    cartaVisKicker: "SEO + GEO",
    cartaVisTitle: "Que te encuentren en Google y en la IA",
    cartaVisIntro:
      "Tus clientes buscan en Google y también preguntan a asistentes de IA. Tu carta y tu landing están preparadas para responder en los dos sitios.",
    cartaVisSeoTitle: "SEO local",
    cartaVisSeoSub: "Google Search y Google Maps",
    cartaVisSeo1: "Carta indexable con URL propia, no un PDF",
    cartaVisSeo2: "Landing con la descripción de tu local",
    cartaVisSeo3: "Enlazada desde tu perfil de empresa de Google y tus redes",
    cartaVisSeo4: "En 5 idiomas, para el turista que busca en el suyo",
    cartaVisGeoTitle: "GEO",
    cartaVisGeoSub: "ChatGPT, Gemini, Perplexity y resúmenes con IA de Google",
    cartaVisGeo1: "Contenido claro que la IA puede leer y citar",
    cartaVisGeo2: "Platos, precios y horarios coherentes en todas partes",
    cartaVisGeo3: "Reseñas recientes que refuerzan la recomendación",
    cartaVisGeo4: "Respuestas a preguntas reales: alérgenos, terraza, recogida",
    cartaVisLoopTitle: "Cada pedido trae al siguiente cliente",
    cartaVisLoop1: "Te buscan en Google, Maps o la IA",
    cartaVisLoop2: "Ven tu perfil y entran en tu carta",
    cartaVisLoop3: "Piden sin comisión",
    cartaVisLoop4: "Su contacto queda en tu base de datos",
    cartaVisLoop5: "Dejan su reseña en Google desde la carta",
    cartaVisLoop6: "Más reseñas, más visibilidad",

    cartaPruebaKicker: "Compromiso de mejora",
    cartaPruebaTitle: "30 días gratis para comprobarlo en tu negocio",
    cartaPruebaIntro:
      "Confiamos en que va a mejorar tus resultados. Por eso no te pedimos que nos creas: te pedimos que lo pruebes.",
    cartaPruebaStep1Label: "Semana 1",
    cartaPruebaStep1Title: "Lo ponemos en marcha",
    cartaPruebaStep1Desc: "Carta, QR, perfil de Google y formación al equipo.",
    cartaPruebaStep2Label: "Semanas 2 a 4",
    cartaPruebaStep2Title: "Medimos",
    cartaPruebaStep2Desc:
      "Visitas a la carta, pedidos, clientes nuevos y reseñas.",
    cartaPruebaStep3Label: "Día 30",
    cartaPruebaStep3Title: "Revisamos juntos",
    cartaPruebaStep3Desc: "Con los números delante.",
    cartaPruebaYesTitle: "¿Ves mejora?",
    cartaPruebaYesDesc: "Sigues, y seguimos optimizando mes a mes.",
    cartaPruebaNoTitle: "¿No la ves?",
    cartaPruebaNoDesc: "Lo dejas sin coste y sin permanencia.",

    cartaComparRow6Label: "Persona de contacto",
    cartaComparRow6Plataforma: "En Tenerife",
    cartaComparRow6Papel: "No aplica",
    cartaComparRow6Otras: "Ticket o chatbot",
    cartaComparRow7Label: "Pago en mesa con propina",
    cartaComparRow7Plataforma: "Sí, con cuenta dividida",
    cartaComparRow7Papel: "No",
    cartaComparRow7Otras: "Depende de la app",
    cartaComparRow8Label: "SEO local y GEO",
    cartaComparRow8Plataforma: "Incluido",
    cartaComparRow8Papel: "No",
    cartaComparRow8Otras: "Depende de la app",

    cartaFaqQ6: "¿Se puede pagar desde la mesa?",
    cartaFaqA6:
      "Sí. El cliente paga desde su móvil con la carta digital, puede añadir la propina que le sugiere el ticket y la mesa puede dividir la cuenta a partes iguales o que cada persona pague lo que ha pedido.",
    cartaFaqQ7: "¿Quién gestiona mi carta y los datos de mis clientes?",
    cartaFaqA7:
      "Digitaliza Tenerife, con una persona de contacto en Tenerife que pone en marcha la carta, la adapta a tu modelo de negocio y te responde por WhatsApp. La base de datos de clientes es tuya.",
    cartaFaqQ8: "¿Puedo probarla antes de pagar?",
    cartaFaqA8:
      "Sí. Puedes probar la carta digital gratis durante 30 días. Si no ves mejora en tu negocio, lo dejas sin coste y sin permanencia.",

    homeCartaBadge: "30 días de prueba gratis",
    homeCartaHighlightsLabel: "Qué incluye la carta digital",
    homeCartaHighlight1: "Una persona real de Tenerife a tu lado",
    homeCartaHighlight2: "Pedidos online, en mesa y con PDA, sin comisión",
    homeCartaHighlight3: "Pago en mesa con propinas y cuenta dividida",
    homeCartaHighlight4: "Visible en Google y en la IA, con reseñas desde la carta",
    homeCartaHighlight5: "Conexión con TPV y Veri*factu",
  },
  en: {
    cartaConfianzaKicker: "A real person behind it",
    cartaConfianzaTitle: "Who is behind your digital menu?",
    cartaConfianzaIntro:
      "A menu that takes orders and payments stores your customers' and your business's data. Before signing up, ask where that data goes and who answers for it.",
    cartaConfianzaStakesLabel: "What is at stake",
    cartaConfianzaStake1: "Names",
    cartaConfianzaStake2: "Phone numbers",
    cartaConfianzaStake3: "Emails",
    cartaConfianzaStake4: "Delivery addresses",
    cartaConfianzaStake5: "Order history",
    cartaConfianzaStake6: "Sales and payments",
    cartaConfianzaAnonTitle: "Anonymous app",
    cartaConfianzaAnon1: "Nobody with a name to call",
    cartaConfianzaAnon2: "Support by ticket, chatbot or in another language",
    cartaConfianzaAnon3: "Servers and security you cannot check",
    cartaConfianzaAnon4: "Your customers stay on their platform",
    cartaConfianzaAnon5: "If it shuts down or changes prices, you lose everything",
    cartaConfianzaOwnTitle: "Digitaliza Tenerife",
    cartaConfianzaOwn1: "A real person from Tenerife as your direct contact",
    cartaConfianzaOwn2: "Set up around your business model",
    cartaConfianzaOwn3: "You know who processes the data and how (GDPR)",
    cartaConfianzaOwn4: "The customer database is yours",
    cartaConfianzaOwn5: "Integrated with your POS and Veri*factu",
    cartaConfianzaNote:
      "If something goes wrong, you don't open a ticket: you message the person who set it up on WhatsApp.",

    cartaEcoKicker: "The full ecosystem",
    cartaEcoTitle: "From the Google search to closing the till",
    cartaEcoIntro:
      "One system connects how customers find you, how they order, how it gets prepared and how it gets paid. No commissions and no jumping between apps.",
    cartaEcoStage1Title: "They find you",
    cartaEcoStage1Item1: "Google Business Profile",
    cartaEcoStage1Item2: "Instagram and Facebook",
    cartaEcoStage1Item3: "Your own landing page describing your venue",
    cartaEcoStage1Item4: "Google reviews from the menu",
    cartaEcoStage2Title: "They order",
    cartaEcoStage2Item1: "Online for pickup",
    cartaEcoStage2Item2: "Home delivery",
    cartaEcoStage2Item3: "From the table on their phone",
    cartaEcoStage2Item4: "With the waiter and their PDA",
    cartaEcoStage3Title: "It gets prepared",
    cartaEcoStage3Item1: "The team receives every order in full detail",
    cartaEcoStage3Item2: "Reply with one tap: ready in 30 min or 1 h",
    cartaEcoStage3Item3: "Food goes to the kitchen, drinks to the bar",
    cartaEcoStage4Title: "It gets paid and managed",
    cartaEcoStage4Item1: "Table payment with tips",
    cartaEcoStage4Item2: "POS with accounting",
    cartaEcoStage4Item3: "Clock-in, stock and suppliers",
    cartaEcoStage4Item4: "Veri*factu",
    cartaEcoNote:
      "At every step, a real person adapts the system to your business model so you get the most out of it.",

    cartaPagoKicker: "Table payment",
    cartaPagoTitle: "They pay without waiting for the bill. And you get the tips back.",
    cartaPagoIntro:
      "With card payments, tips get lost. From the digital menu, the receipt suggests one at the right moment and each diner pays their own way.",
    cartaPagoFeat1Title: "Tip suggested on the receipt",
    cartaPagoFeat1Desc:
      "When they see the bill, customers choose whether to tip and how much. You recover the tips lost to card payments.",
    cartaPagoFeat2Title: "Split the bill evenly",
    cartaPagoFeat2Desc:
      "The table divides the total between as many people as they like, with no calculator and no waiting.",
    cartaPagoFeat3Title: "Everyone pays their own",
    cartaPagoFeat3Desc:
      "Each diner ticks what they ordered and pays only their share.",
    cartaPagoFeat4Title: "Review after paying",
    cartaPagoFeat4Desc:
      "With one tap, the customer leaves a Google review right when they finish.",
    cartaPagoNote:
      "With our POS, order, payment and tip are recorded in the same system, adapted to Veri*factu.",

    cartaVisKicker: "SEO + GEO",
    cartaVisTitle: "Get found on Google and by AI",
    cartaVisIntro:
      "Your customers search on Google and also ask AI assistants. Your menu and landing page are ready to answer in both places.",
    cartaVisSeoTitle: "Local SEO",
    cartaVisSeoSub: "Google Search and Google Maps",
    cartaVisSeo1: "Indexable menu with its own URL, not a PDF",
    cartaVisSeo2: "Landing page describing your venue",
    cartaVisSeo3: "Linked from your Google Business Profile and social media",
    cartaVisSeo4: "In 5 languages, for tourists searching in their own",
    cartaVisGeoTitle: "GEO",
    cartaVisGeoSub: "ChatGPT, Gemini, Perplexity and Google AI Overviews",
    cartaVisGeo1: "Clear content that AI can read and cite",
    cartaVisGeo2: "Dishes, prices and opening hours consistent everywhere",
    cartaVisGeo3: "Recent reviews that strengthen the recommendation",
    cartaVisGeo4: "Answers to real questions: allergens, terrace, pickup",
    cartaVisLoopTitle: "Every order brings the next customer",
    cartaVisLoop1: "They search on Google, Maps or AI",
    cartaVisLoop2: "They see your profile and open your menu",
    cartaVisLoop3: "They order with no commission",
    cartaVisLoop4: "Their contact goes into your database",
    cartaVisLoop5: "They leave a Google review from the menu",
    cartaVisLoop6: "More reviews, more visibility",

    cartaPruebaKicker: "Our commitment",
    cartaPruebaTitle: "30 days free to see it work in your business",
    cartaPruebaIntro:
      "We trust it will improve your results. So we don't ask you to believe us: we ask you to try it.",
    cartaPruebaStep1Label: "Week 1",
    cartaPruebaStep1Title: "We set it up",
    cartaPruebaStep1Desc: "Menu, QR codes, Google profile and staff training.",
    cartaPruebaStep2Label: "Weeks 2 to 4",
    cartaPruebaStep2Title: "We measure",
    cartaPruebaStep2Desc: "Menu visits, orders, new customers and reviews.",
    cartaPruebaStep3Label: "Day 30",
    cartaPruebaStep3Title: "We review it together",
    cartaPruebaStep3Desc: "With the numbers in front of us.",
    cartaPruebaYesTitle: "Seeing an improvement?",
    cartaPruebaYesDesc: "You stay, and we keep optimising month by month.",
    cartaPruebaNoTitle: "Not seeing it?",
    cartaPruebaNoDesc: "You leave at no cost and with no commitment.",

    cartaComparRow6Label: "Contact person",
    cartaComparRow6Plataforma: "In Tenerife",
    cartaComparRow6Papel: "Not applicable",
    cartaComparRow6Otras: "Ticket or chatbot",
    cartaComparRow7Label: "Table payment with tips",
    cartaComparRow7Plataforma: "Yes, with split bills",
    cartaComparRow7Papel: "No",
    cartaComparRow7Otras: "Depends on the app",
    cartaComparRow8Label: "Local SEO and GEO",
    cartaComparRow8Plataforma: "Included",
    cartaComparRow8Papel: "No",
    cartaComparRow8Otras: "Depends on the app",

    cartaFaqQ6: "Can customers pay from the table?",
    cartaFaqA6:
      "Yes. Customers pay from their phone through the digital menu, can add the tip suggested on the receipt, and the table can split the bill evenly or have each person pay for what they ordered.",
    cartaFaqQ7: "Who manages my menu and my customers' data?",
    cartaFaqA7:
      "Digitaliza Tenerife, with a contact person in Tenerife who sets up the menu, adapts it to your business model and answers you on WhatsApp. The customer database is yours.",
    cartaFaqQ8: "Can I try it before paying?",
    cartaFaqA8:
      "Yes. You can try the digital menu free for 30 days. If you don't see an improvement in your business, you leave at no cost and with no commitment.",

    homeCartaBadge: "30-day free trial",
    homeCartaHighlightsLabel: "What the digital menu includes",
    homeCartaHighlight1: "A real person from Tenerife by your side",
    homeCartaHighlight2: "Online, table and PDA orders with no commission",
    homeCartaHighlight3: "Table payment with tips and split bills",
    homeCartaHighlight4: "Visible on Google and AI, with reviews from the menu",
    homeCartaHighlight5: "Connects to POS and Veri*factu",
  },
};
