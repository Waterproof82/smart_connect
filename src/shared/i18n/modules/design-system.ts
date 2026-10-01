/**
 * Copy for the shared design-system layer (design.md): the unified
 * WhatsApp CTA, the mobile sticky bar and the statement footer.
 */
export interface DesignSystemCopy {
  waCtaLabel: string;
  waCtaShort: string;
  waNewTab: string;
  waBarLine: string;
  waMsgDefault: string;
  waMsgCarta: string;
  waMsgNfc: string;
  waMsgIa: string;
  waMsgTpv: string;
  heroAudience: string;
  footerStatement: string;
}

export const designSystemCopy: {
  es: DesignSystemCopy;
  en: DesignSystemCopy;
} = {
  es: {
    waCtaLabel: "Escríbenos por WhatsApp",
    waCtaShort: "WhatsApp",
    waNewTab: "(se abre WhatsApp)",
    waBarLine: "¿Dudas? Te respondemos por WhatsApp.",
    waMsgDefault: "Hola, me gustaría información sobre vuestros servicios.",
    waMsgCarta: "Hola, me interesa la carta digital para mi negocio.",
    waMsgNfc: "Hola, me interesan las tarjetas NFC para reseñas.",
    waMsgIa: "Hola, me interesa un chatbot con IA para mi negocio.",
    waMsgTpv: "Hola, me interesa el TPV para restaurantes.",
    heroAudience:
      "Para restaurantes, bares, tiendas y empresas de Tenerife y Canarias.",
    footerStatement:
      "Tecnología práctica para hostelería, comercio y empresas de Tenerife.",
  },
  en: {
    waCtaLabel: "Message us on WhatsApp",
    waCtaShort: "WhatsApp",
    waNewTab: "(opens WhatsApp)",
    waBarLine: "Questions? We reply on WhatsApp.",
    waMsgDefault: "Hi, I'd like information about your services.",
    waMsgCarta: "Hi, I'm interested in the digital menu for my business.",
    waMsgNfc: "Hi, I'm interested in NFC review cards.",
    waMsgIa: "Hi, I'm interested in an AI chatbot for my business.",
    waMsgTpv: "Hi, I'm interested in the restaurant POS.",
    heroAudience:
      "For restaurants, bars, shops and businesses in Tenerife and the Canary Islands.",
    footerStatement:
      "Practical technology for hospitality, retail and businesses in Tenerife.",
  },
};
