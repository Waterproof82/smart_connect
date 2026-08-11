export interface FichajesCopy {
  fichajesTitle: string;
  fichajesDesc: string;
}

export const fichajesCopy: { es: FichajesCopy; en: FichajesCopy } = {
  es: {
    fichajesTitle: "Fichajes y Control Horario",
    fichajesDesc:
      "Registra la entrada y salida de tu equipo de forma legal y automática, sin hojas de cálculo ni papeleo manual.",
  },
  en: {
    fichajesTitle: "Time & Attendance",
    fichajesDesc:
      "Track your team's clock-ins and clock-outs automatically and compliantly — no spreadsheets, no manual paperwork.",
  },
};
