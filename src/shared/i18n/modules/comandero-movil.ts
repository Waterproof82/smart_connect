export interface ComanderoMovilCopy {
  comanderoMovilTitle: string;
  comanderoMovilDesc: string;
}

export const comanderoMovilCopy: {
  es: ComanderoMovilCopy;
  en: ComanderoMovilCopy;
} = {
  es: {
    comanderoMovilTitle: "Comandero Móvil",
    comanderoMovilDesc:
      "Toma comandas desde la mesa y envíalas directas a cocina o barra, sin idas y vueltas ni errores de traspaso.",
  },
  en: {
    comanderoMovilTitle: "Mobile Order Taking",
    comanderoMovilDesc:
      "Take orders at the table and send them straight to the kitchen or bar — no back-and-forth, no transcription errors.",
  },
};
