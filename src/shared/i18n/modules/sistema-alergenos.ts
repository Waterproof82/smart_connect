export interface SistemaAlergenosCopy {
  sistemaAlergenosTitle: string;
  sistemaAlergenosDesc: string;
}

export const sistemaAlergenosCopy: {
  es: SistemaAlergenosCopy;
  en: SistemaAlergenosCopy;
} = {
  es: {
    sistemaAlergenosTitle: "Sistema de Alérgenos",
    sistemaAlergenosDesc:
      "Informa a tus clientes sobre alérgenos por plato de forma clara y cumple con la normativa alimentaria sin esfuerzo extra.",
  },
  en: {
    sistemaAlergenosTitle: "Allergen Management",
    sistemaAlergenosDesc:
      "Inform your customers about allergens per dish clearly, and meet food-safety regulations without extra effort.",
  },
};
