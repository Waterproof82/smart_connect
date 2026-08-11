export interface DeliveryTakeawayCopy {
  deliveryTakeawayTitle: string;
  deliveryTakeawayDesc: string;
}

export const deliveryTakeawayCopy: {
  es: DeliveryTakeawayCopy;
  en: DeliveryTakeawayCopy;
} = {
  es: {
    deliveryTakeawayTitle: "Delivery y Takeaway",
    deliveryTakeawayDesc:
      "Gestiona pedidos para llevar y a domicilio desde el mismo sistema, sin pagar comisiones por pedido a plataformas externas.",
  },
  en: {
    deliveryTakeawayTitle: "Delivery & Takeaway",
    deliveryTakeawayDesc:
      "Manage takeaway and delivery orders from the same system — without paying per-order commissions to third-party platforms.",
  },
};
