/**
 * Copy for the standalone /carta-digital and /ia-chatbots-tenerife pages and
 * the home-page Carta Digital teaser (SEO restructure, 2026-10).
 * Registered through the same barrel as the TPV module copy so
 * LanguageContext.tsx is not reopened.
 */
export interface PageCopy {
  glovoEyebrow: string;
  glovoTitle: string;
  glovoDesc: string;
  glovoOtherLabel: string;
  glovoOtherValue: string;
  glovoOwnLabel: string;
  glovoOwnValue: string;
  glovoCta: string;
  cartaTeaserEyebrow: string;
  cartaTeaserTitle: string;
  cartaTeaserDesc: string;
  cartaTeaserCta: string;
  cartaPageH1: string;
  iaTeaserTitle: string;
  iaTeaserDesc: string;
  iaTeaserCta: string;
  iaH1: string;
  iaIntro: string;
  iaCard1Title: string;
  iaCard1Desc: string;
  iaCard2Title: string;
  iaCard2Desc: string;
  iaCard3Title: string;
  iaCard3Desc: string;
  iaCard4Title: string;
  iaCard4Desc: string;
  iaAutoTitle: string;
  iaAutoDesc: string;
  iaFaqTitle: string;
  iaFaqQ1: string;
  iaFaqA1: string;
  iaFaqQ2: string;
  iaFaqA2: string;
  iaFaqQ3: string;
  iaFaqA3: string;
  iaCtaTitle: string;
  iaCtaButton: string;
}

export const pageCopy: { es: PageCopy; en: PageCopy } = {
  es: {
    glovoEyebrow: "Sin comisiones",
    glovoTitle: "Ahorra el 30 % del margen que se lleva Glovo de cada pedido",
    glovoDesc:
      "Glovo se lleva un 30 % de comisión de cada pedido. Con nuestra carta digital no pagas comisión.",
    glovoOtherLabel: "Comisión de Glovo",
    glovoOtherValue: "30 %",
    glovoOwnLabel: "Con tu carta digital",
    glovoOwnValue: "0 %",
    glovoCta: "Quiero mi carta digital",
    cartaTeaserEyebrow: "Carta digital",
    cartaTeaserTitle: "Ahorra el 30 % del margen que se lleva Glovo de cada pedido",
    cartaTeaserDesc:
      "Carta digital con pedidos en mesa y para recoger. Sin comisiones por pedido.",
    cartaTeaserCta: "Ver la carta digital",
    cartaPageH1:
      "Carta digital para restaurantes: pedidos sin pagar comisión a Glovo",
    iaTeaserTitle: "Chatbots de IA y automatización",
    iaTeaserDesc:
      "Atiende a tus clientes 24/7 y automatiza tareas repetitivas en tu negocio.",
    iaTeaserCta: "Ver chatbots de IA",
    iaH1: "Chatbots de IA y automatización para empresas en Tenerife",
    iaIntro:
      "Un asistente de IA que responde a tus clientes a cualquier hora y flujos automáticos que se encargan de las tareas repetitivas, para que tú te centres en tu negocio.",
    iaCard1Title: "Chatbot para tu web",
    iaCard1Desc:
      "Responde dudas sobre tus servicios, precios y horarios con información de tu propio negocio.",
    iaCard2Title: "Chatbot en WhatsApp",
    iaCard2Desc:
      "Atiende consultas y reservas por el canal que tus clientes ya usan.",
    iaCard3Title: "Atención 24/7",
    iaCard3Desc:
      "Tus clientes obtienen respuesta al instante, también fuera de horario.",
    iaCard4Title: "Captación de clientes",
    iaCard4Desc:
      "Cada conversación puede convertirse en un contacto o una reserva para tu equipo.",
    iaAutoTitle: "Automatización de procesos",
    iaAutoDesc:
      "Conectamos tus herramientas (formularios, email, WhatsApp, hojas de cálculo) para que avisos, registros y seguimientos se hagan solos.",
    iaFaqTitle: "Preguntas frecuentes sobre chatbots de IA",
    iaFaqQ1: "¿Qué es un chatbot de IA para empresas?",
    iaFaqA1:
      "Es un asistente que responde automáticamente a las preguntas de tus clientes usando la información de tu negocio.",
    iaFaqQ2: "¿En qué negocios de Tenerife puede ayudar?",
    iaFaqA2:
      "Especialmente en hostelería y comercio local, donde se repiten las mismas consultas sobre horarios, carta, reservas o precios.",
    iaFaqQ3: "¿Qué es la automatización de procesos?",
    iaFaqA3:
      "Es conectar tus herramientas para que las tareas repetitivas, como avisos o registros de clientes, se ejecuten sin intervención manual.",
    iaCtaTitle: "Cuéntanos qué quieres automatizar",
    iaCtaButton: "Hablar con nosotros",
  },
  en: {
    glovoEyebrow: "No commissions",
    glovoTitle: "Save the 30% margin Glovo takes from every order",
    glovoDesc:
      "Glovo takes a 30% commission on every order. With our digital menu you pay no commission.",
    glovoOtherLabel: "Glovo commission",
    glovoOtherValue: "30%",
    glovoOwnLabel: "With your digital menu",
    glovoOwnValue: "0%",
    glovoCta: "I want my digital menu",
    cartaTeaserEyebrow: "Digital menu",
    cartaTeaserTitle: "Save the 30% margin Glovo takes from every order",
    cartaTeaserDesc:
      "A digital menu with table and pick-up orders. No per-order commissions.",
    cartaTeaserCta: "See the digital menu",
    cartaPageH1:
      "Digital menu for restaurants: orders without paying commission to Glovo",
    iaTeaserTitle: "AI chatbots and automation",
    iaTeaserDesc:
      "Serve your customers 24/7 and automate repetitive tasks in your business.",
    iaTeaserCta: "See AI chatbots",
    iaH1: "AI chatbots and automation for businesses in Tenerife",
    iaIntro:
      "An AI assistant that answers your customers at any hour, and automated workflows that handle repetitive tasks so you can focus on your business.",
    iaCard1Title: "Website chatbot",
    iaCard1Desc:
      "Answers questions about your services, prices and opening hours using your own business information.",
    iaCard2Title: "WhatsApp chatbot",
    iaCard2Desc:
      "Handles enquiries and bookings on the channel your customers already use.",
    iaCard3Title: "24/7 support",
    iaCard3Desc: "Your customers get an instant answer, even outside opening hours.",
    iaCard4Title: "Lead capture",
    iaCard4Desc:
      "Every conversation can become a contact or a booking for your team.",
    iaAutoTitle: "Process automation",
    iaAutoDesc:
      "We connect your tools (forms, email, WhatsApp, spreadsheets) so notifications, records and follow-ups happen on their own.",
    iaFaqTitle: "AI chatbot FAQ",
    iaFaqQ1: "What is an AI chatbot for businesses?",
    iaFaqA1:
      "An assistant that automatically answers your customers' questions using your business information.",
    iaFaqQ2: "Which businesses in Tenerife can it help?",
    iaFaqA2:
      "Especially hospitality and local retail, where the same questions about hours, menu, bookings or prices come up again and again.",
    iaFaqQ3: "What is process automation?",
    iaFaqA3:
      "Connecting your tools so repetitive tasks, such as notifications or customer records, run without manual work.",
    iaCtaTitle: "Tell us what you want to automate",
    iaCtaButton: "Talk to us",
  },
};
