export interface StockInventarioCopy {
  stockInventarioTitle: string;
  stockInventarioDesc: string;
}

export const stockInventarioCopy: {
  es: StockInventarioCopy;
  en: StockInventarioCopy;
} = {
  es: {
    stockInventarioTitle: "Stock e Inventario",
    stockInventarioDesc:
      "Controla existencias en tiempo real y recibe avisos antes de quedarte sin producto clave.",
  },
  en: {
    stockInventarioTitle: "Stock & Inventory",
    stockInventarioDesc:
      "Track stock levels in real time and get alerted before you run out of key products.",
  },
};
