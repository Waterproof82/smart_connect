export interface TiendaCartaDigitalCopy {
  tiendaCartaDigitalTitle: string;
  tiendaCartaDigitalDesc: string;
}

export const tiendaCartaDigitalCopy: {
  es: TiendaCartaDigitalCopy;
  en: TiendaCartaDigitalCopy;
} = {
  es: {
    tiendaCartaDigitalTitle: "Tienda / Carta Digital",
    tiendaCartaDigitalDesc:
      "Carta digital con pedidos en tiempo real a barra y cocina, sin comisiones por pedido.",
  },
  en: {
    tiendaCartaDigitalTitle: "Digital Menu & Shop",
    tiendaCartaDigitalDesc:
      "A digital menu with real-time orders to the bar and kitchen, with no per-order commissions.",
  },
};
