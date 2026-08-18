export interface FichajesCopy {
  fichajesEyebrow: string;
  fichajesTitle: string;
  fichajesDesc: string;
  fichajesBullet1Title: string;
  fichajesBullet1Desc: string;
  fichajesBullet2Title: string;
  fichajesBullet2Desc: string;
  fichajesBullet3Title: string;
  fichajesBullet3Desc: string;
  fichajesBullet4Title: string;
  fichajesBullet4Desc: string;
  fichajesCtaLabel: string;
  fichajesFigureAlt: string;
}

export const fichajesCopy: { es: FichajesCopy; en: FichajesCopy } = {
  es: {
    fichajesEyebrow: "FICHAJES Y CONTROL HORARIO",
    fichajesTitle: "Controla los horarios de tu equipo sin hojas de cálculo",
    fichajesDesc:
      "Registra entradas, salidas y turnos de forma automática y conforme a la normativa laboral, con visibilidad completa sobre el rendimiento de tu equipo.",
    fichajesBullet1Title: "Fichaje en segundos",
    fichajesBullet1Desc:
      "Cada empleado registra su entrada y salida desde el propio terminal, sin apps externas.",
    fichajesBullet2Title: "Cumplimiento legal",
    fichajesBullet2Desc:
      "El registro horario queda guardado y disponible ante cualquier inspección.",
    fichajesBullet3Title: "Turnos claros para todos",
    fichajesBullet3Desc:
      "Organiza los turnos del equipo y evita solapamientos o huecos sin cubrir.",
    fichajesBullet4Title: "Visibilidad del rendimiento",
    fichajesBullet4Desc:
      "Consulta horas trabajadas por empleado y detecta desviaciones a tiempo.",
    fichajesCtaLabel: "Pide una demo de fichajes",
    fichajesFigureAlt:
      "Empleado levantando las manos junto a un reloj de pared para fichar su entrada",
  },
  en: {
    fichajesEyebrow: "TIME & ATTENDANCE",
    fichajesTitle: "Track your team's hours without spreadsheets",
    fichajesDesc:
      "Log clock-ins, clock-outs, and shifts automatically and in line with labor regulations, with full visibility into how your team is performing.",
    fichajesBullet1Title: "Clock in within seconds",
    fichajesBullet1Desc:
      "Every employee clocks in and out from the same terminal, no extra apps.",
    fichajesBullet2Title: "Legal compliance",
    fichajesBullet2Desc:
      "Time records are stored and ready for any labor inspection.",
    fichajesBullet3Title: "Clear shifts for everyone",
    fichajesBullet3Desc:
      "Organize your team's shifts and avoid overlaps or uncovered gaps.",
    fichajesBullet4Title: "Performance visibility",
    fichajesBullet4Desc:
      "Check hours worked per employee and catch deviations early.",
    fichajesCtaLabel: "Request a time-tracking demo",
    fichajesFigureAlt:
      "Employee raising their hands beside a wall clock to clock in for their shift",
  },
};
