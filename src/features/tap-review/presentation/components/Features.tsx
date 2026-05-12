import React from "react";

interface FeaturesProps {
  features?: string[];
}

const Features: React.FC<FeaturesProps> = ({
  features = [
    "NFC Instantáneo - Tocar y redactar en menos de 5 segundos",
    "Sin app - Funciona con cualquier móvil moderno",
    "Google Reviews - Captura clientes en Google",
    "Sin suscripciones - Paga una vez y usa para siempre",
  ],
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Key Features</h2>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Features;
