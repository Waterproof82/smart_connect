export interface StockInventarioCopy {
  stockInventarioEyebrow: string;
  stockInventarioTitle: string;
  stockInventarioDesc: string;
  stockInventarioBullet1Title: string;
  stockInventarioBullet1Desc: string;
  stockInventarioBullet2Title: string;
  stockInventarioBullet2Desc: string;
  stockInventarioBullet3Title: string;
  stockInventarioBullet3Desc: string;
  stockInventarioBullet4Title: string;
  stockInventarioBullet4Desc: string;
  stockInventarioCtaLabel: string;
}

export const stockInventarioCopy: {
  es: StockInventarioCopy;
  en: StockInventarioCopy;
} = {
  es: {
    stockInventarioEyebrow: "STOCK E INVENTARIO",
    stockInventarioTitle: "Sabe qué tienes en cocina antes de que se agote",
    stockInventarioDesc:
      "El stock se descuenta solo con cada venta, a nivel de ingrediente, para que nunca te quedes sin producto clave ni pierdas de vista las mermas.",
    stockInventarioBullet1Title: "Descuento automático por ingrediente",
    stockInventarioBullet1Desc:
      "Cada venta resta del stock real, sin recuentos manuales al final del día.",
    stockInventarioBullet2Title: "Alertas de stock bajo",
    stockInventarioBullet2Desc:
      "Recibe un aviso antes de quedarte sin un producto clave para tu carta.",
    stockInventarioBullet3Title: "Control de mermas",
    stockInventarioBullet3Desc:
      "Registra roturas, caducidades y desperdicios para detectar fugas de margen.",
    stockInventarioBullet4Title: "Visión completa del almacén",
    stockInventarioBullet4Desc:
      "Consulta existencias de toda la cocina desde un único panel.",
    stockInventarioCtaLabel: "Pide una demo de stock",
  },
  en: {
    stockInventarioEyebrow: "STOCK & INVENTORY",
    stockInventarioTitle: "Know what's in your kitchen before it runs out",
    stockInventarioDesc:
      "Stock is deducted automatically with every sale, down to the ingredient level, so you never run out of a key product or lose sight of waste.",
    stockInventarioBullet1Title: "Automatic ingredient-level deduction",
    stockInventarioBullet1Desc:
      "Every sale subtracts from real stock, no manual counts at the end of the day.",
    stockInventarioBullet2Title: "Low-stock alerts",
    stockInventarioBullet2Desc:
      "Get notified before you run out of a product your menu depends on.",
    stockInventarioBullet3Title: "Waste tracking",
    stockInventarioBullet3Desc:
      "Log breakage, expired items, and waste to catch margin leaks early.",
    stockInventarioBullet4Title: "Full kitchen visibility",
    stockInventarioBullet4Desc:
      "Check stock across your whole kitchen from a single screen.",
    stockInventarioCtaLabel: "Request a stock demo",
  },
};
