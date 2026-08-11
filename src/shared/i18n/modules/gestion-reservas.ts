export interface GestionReservasCopy {
  gestionReservasEyebrow: string;
  gestionReservasTitle: string;
  gestionReservasDesc: string;
  gestionReservasBullet1Title: string;
  gestionReservasBullet1Desc: string;
  gestionReservasBullet2Title: string;
  gestionReservasBullet2Desc: string;
  gestionReservasBullet3Title: string;
  gestionReservasBullet3Desc: string;
  gestionReservasBullet4Title: string;
  gestionReservasBullet4Desc: string;
  gestionReservasCtaLabel: string;
}

export const gestionReservasCopy: {
  es: GestionReservasCopy;
  en: GestionReservasCopy;
} = {
  es: {
    gestionReservasEyebrow: "GESTIÓN DE RESERVAS",
    gestionReservasTitle:
      "Llena las mesas sin overbooking ni llamadas perdidas",
    gestionReservasDesc:
      "Controla la disponibilidad de tu sala en tiempo real, confirma reservas en segundos y ofrece a cada cliente una experiencia profesional desde el primer contacto.",
    gestionReservasBullet1Title: "Disponibilidad en tiempo real",
    gestionReservasBullet1Desc:
      "Ve qué mesas están libres, reservadas u ocupadas sin salir del sistema.",
    gestionReservasBullet2Title: "Cero overbooking",
    gestionReservasBullet2Desc:
      "Evita duplicar mesas y los malentendidos que dañan la reputación del local.",
    gestionReservasBullet3Title: "Recordatorios automáticos",
    gestionReservasBullet3Desc:
      "Reduce las cancelaciones de última hora sin tener que llamar a cada cliente.",
    gestionReservasBullet4Title: "Experiencia profesional",
    gestionReservasBullet4Desc:
      "Cada reserva se gestiona con la misma seriedad que un restaurante de referencia.",
    gestionReservasCtaLabel: "Pide una demo de reservas",
  },
  en: {
    gestionReservasEyebrow: "RESERVATION MANAGEMENT",
    gestionReservasTitle: "Fill every table without overbooking or missed calls",
    gestionReservasDesc:
      "Track your floor's availability in real time, confirm bookings in seconds, and give every guest a professional experience from their very first contact.",
    gestionReservasBullet1Title: "Real-time table availability",
    gestionReservasBullet1Desc:
      "See which tables are free, booked, or occupied without leaving the system.",
    gestionReservasBullet2Title: "Zero overbooking",
    gestionReservasBullet2Desc:
      "Avoid double-booked tables and the misunderstandings that hurt your reputation.",
    gestionReservasBullet3Title: "Automatic reminders",
    gestionReservasBullet3Desc:
      "Cut down on last-minute cancellations without calling every guest yourself.",
    gestionReservasBullet4Title: "A professional experience",
    gestionReservasBullet4Desc:
      "Every booking is handled with the same care as a top-tier restaurant.",
    gestionReservasCtaLabel: "Request a reservations demo",
  },
};
