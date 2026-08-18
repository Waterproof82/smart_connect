export interface MultiIvaIgicCopy {
  multiIvaIgicEyebrow: string;
  multiIvaIgicTitle: string;
  multiIvaIgicDesc: string;
  multiIvaIgicBullet1Title: string;
  multiIvaIgicBullet1Desc: string;
  multiIvaIgicBullet2Title: string;
  multiIvaIgicBullet2Desc: string;
  multiIvaIgicBullet3Title: string;
  multiIvaIgicBullet3Desc: string;
  multiIvaIgicBullet4Title: string;
  multiIvaIgicBullet4Desc: string;
  multiIvaIgicCtaLabel: string;
  multiIvaIgicFigureAlt: string;
}

export const multiIvaIgicCopy: {
  es: MultiIvaIgicCopy;
  en: MultiIvaIgicCopy;
} = {
  es: {
    multiIvaIgicEyebrow: "MULTI-IVA / IGIC",
    multiIvaIgicTitle:
      "Factura correctamente sin memorizar cada tipo impositivo",
    multiIvaIgicDesc:
      "El sistema aplica el IVA, el IGIC u otros tipos según cada producto y ubicación, para que cada ticket y factura salga siempre conforme a la normativa.",
    multiIvaIgicBullet1Title: "Tipos impositivos automáticos",
    multiIvaIgicBullet1Desc:
      "Cada producto lleva su IVA o IGIC correcto sin configurarlo a mano en cada venta.",
    multiIvaIgicBullet2Title: "Multi-ubicación",
    multiIvaIgicBullet2Desc:
      "Aplica el tipo que corresponda según la comunidad o el local desde el que vendes.",
    multiIvaIgicBullet3Title: "Facturación conforme a normativa",
    multiIvaIgicBullet3Desc:
      "Tickets y facturas cumplen con los requisitos legales vigentes.",
    multiIvaIgicBullet4Title: "Menos errores, menos riesgo",
    multiIvaIgicBullet4Desc:
      "Reduce los fallos manuales que pueden derivar en sanciones.",
    multiIvaIgicCtaLabel: "Pide una demo fiscal",
    multiIvaIgicFigureAlt:
      "Calculadora sobre una mesa junto a tickets y facturas de un negocio de hostelería",
  },
  en: {
    multiIvaIgicEyebrow: "MULTI-TAX (VAT/IGIC)",
    multiIvaIgicTitle: "Invoice correctly without memorizing every tax rate",
    multiIvaIgicDesc:
      "The system applies VAT, IGIC, or other tax rates based on each product and location, so every receipt and invoice stays compliant automatically.",
    multiIvaIgicBullet1Title: "Automatic tax rates",
    multiIvaIgicBullet1Desc:
      "Every product carries the right VAT or IGIC rate with no manual setup per sale.",
    multiIvaIgicBullet2Title: "Multi-location support",
    multiIvaIgicBullet2Desc:
      "Apply the correct rate depending on the region or venue you're selling from.",
    multiIvaIgicBullet3Title: "Compliant invoicing",
    multiIvaIgicBullet3Desc:
      "Receipts and invoices meet current legal requirements.",
    multiIvaIgicBullet4Title: "Fewer errors, less risk",
    multiIvaIgicBullet4Desc:
      "Cut down on manual mistakes that can lead to penalties.",
    multiIvaIgicCtaLabel: "Request a tax-compliance demo",
    multiIvaIgicFigureAlt:
      "Calculator on a desk next to receipts and invoices from a hospitality business",
  },
};
