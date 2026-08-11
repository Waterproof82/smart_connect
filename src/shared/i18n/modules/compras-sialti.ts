export interface ComprasSialtiCopy {
  comprasSialtiTitle: string;
  comprasSialtiDesc: string;
}

export const comprasSialtiCopy: {
  es: ComprasSialtiCopy;
  en: ComprasSialtiCopy;
} = {
  es: {
    comprasSialtiTitle: "Compras y SIALTI",
    comprasSialtiDesc:
      "Gestiona pedidos a proveedores y mantén la trazabilidad de tus compras alineada con el sistema SIALTI de Canarias.",
  },
  en: {
    comprasSialtiTitle: "Procurement & SIALTI",
    comprasSialtiDesc:
      "Manage supplier orders and keep your purchase traceability aligned with the Canary Islands' SIALTI system.",
  },
};
