export interface ComanderoMovilCopy {
  comanderoMovilEyebrow: string;
  comanderoMovilTitle: string;
  comanderoMovilDesc: string;
  comanderoMovilBullet1Title: string;
  comanderoMovilBullet1Desc: string;
  comanderoMovilBullet2Title: string;
  comanderoMovilBullet2Desc: string;
  comanderoMovilBullet3Title: string;
  comanderoMovilBullet3Desc: string;
  comanderoMovilBullet4Title: string;
  comanderoMovilBullet4Desc: string;
  comanderoMovilCtaLabel: string;
  comanderoMovilFigureAlt: string;
}

export const comanderoMovilCopy: {
  es: ComanderoMovilCopy;
  en: ComanderoMovilCopy;
} = {
  es: {
    comanderoMovilEyebrow: "COMANDERO MÓVIL",
    comanderoMovilTitle: "Toma comandas en la mesa, sin ir y venir a barra",
    comanderoMovilDesc:
      "Cada camarero lleva la comanda en la mano: la toma desde tablet o móvil y la envía directa a cocina o barra, sin idas y vueltas ni papeles que se pierden.",
    comanderoMovilBullet1Title: "Comandas desde tablet o móvil",
    comanderoMovilBullet1Desc:
      "El equipo de sala toma el pedido en la propia mesa, sin volver al mostrador.",
    comanderoMovilBullet2Title: "Envío directo a cocina o barra",
    comanderoMovilBullet2Desc:
      "El pedido llega al instante a quien tiene que prepararlo, sin intermediarios.",
    comanderoMovilBullet3Title: "Cambios y anulaciones sincronizados",
    comanderoMovilBullet3Desc:
      "Cualquier modificación se actualiza al momento en todas las pantallas.",
    comanderoMovilBullet4Title: "Menos errores de traspaso",
    comanderoMovilBullet4Desc:
      "Se acabó descifrar letra en un papel: el pedido llega igual que se tomó.",
    comanderoMovilCtaLabel: "Pide una demo del comandero",
    comanderoMovilFigureAlt:
      "Camarero mostrando el pedido en un dispositivo móvil a dos clientes sentados a la mesa",
  },
  en: {
    comanderoMovilEyebrow: "MOBILE ORDER TAKING",
    comanderoMovilTitle:
      "Take orders at the table, no more back-and-forth to the bar",
    comanderoMovilDesc:
      "Every waiter carries the order in hand: taken from a tablet or phone and sent straight to the kitchen or bar, with no back-and-forth and no lost paper slips.",
    comanderoMovilBullet1Title: "Orders from tablet or phone",
    comanderoMovilBullet1Desc:
      "Floor staff take the order right at the table, no trips back to the counter.",
    comanderoMovilBullet2Title: "Sent straight to kitchen or bar",
    comanderoMovilBullet2Desc:
      "The order reaches whoever prepares it instantly, with no middleman.",
    comanderoMovilBullet3Title: "Changes and cancellations stay in sync",
    comanderoMovilBullet3Desc:
      "Any modification updates instantly across every screen.",
    comanderoMovilBullet4Title: "Fewer transcription errors",
    comanderoMovilBullet4Desc:
      "No more deciphering handwriting — the order arrives exactly as it was taken.",
    comanderoMovilCtaLabel: "Request a mobile ordering demo",
    comanderoMovilFigureAlt:
      "Waiter showing the order on a mobile device to two customers seated at the table",
  },
};
