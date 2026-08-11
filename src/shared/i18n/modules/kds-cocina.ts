export interface KdsCocinaCopy {
  kdsCocinaTitle: string;
  kdsCocinaDesc: string;
}

export const kdsCocinaCopy: { es: KdsCocinaCopy; en: KdsCocinaCopy } = {
  es: {
    kdsCocinaTitle: "KDS Cocina",
    kdsCocinaDesc:
      "Pantalla de cocina que organiza los pedidos por prioridad y tiempo, para servir más rápido y sin tickets de papel perdidos.",
  },
  en: {
    kdsCocinaTitle: "Kitchen Display System",
    kdsCocinaDesc:
      "A kitchen screen that organizes orders by priority and time, so you serve faster with no lost paper tickets.",
  },
};
