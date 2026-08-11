export interface FoodCostAvanzadoCopy {
  foodCostAvanzadoTitle: string;
  foodCostAvanzadoDesc: string;
}

export const foodCostAvanzadoCopy: {
  es: FoodCostAvanzadoCopy;
  en: FoodCostAvanzadoCopy;
} = {
  es: {
    foodCostAvanzadoTitle: "Food Cost Avanzado",
    foodCostAvanzadoDesc:
      "Calcula el coste real de cada plato y detecta dónde se te está yendo el margen antes de que sea tarde.",
  },
  en: {
    foodCostAvanzadoTitle: "Advanced Food Cost",
    foodCostAvanzadoDesc:
      "Calculate the real cost of every dish and spot where your margin is slipping away before it's too late.",
  },
};
