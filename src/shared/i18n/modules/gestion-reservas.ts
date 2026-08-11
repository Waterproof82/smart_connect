export interface GestionReservasCopy {
  gestionReservasTitle: string;
  gestionReservasDesc: string;
}

export const gestionReservasCopy: {
  es: GestionReservasCopy;
  en: GestionReservasCopy;
} = {
  es: {
    gestionReservasTitle: "Gestión de Reservas",
    gestionReservasDesc:
      "Controla mesas y reservas en tiempo real, evita el overbooking y reduce las llamadas de confirmación.",
  },
  en: {
    gestionReservasTitle: "Reservation Management",
    gestionReservasDesc:
      "Manage tables and bookings in real time, avoid overbooking, and cut down on confirmation calls.",
  },
};
