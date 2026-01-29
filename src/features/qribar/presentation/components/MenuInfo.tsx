/**
 * MenuInfo Component
 * @module features/qribar/presentation/components
 * 
 * Pure presentational component - displays menu information and benefits
 * Follows SRP: Single responsibility - render info section
 */

import React from 'react';
import { Utensils, CheckCircle2 } from 'lucide-react';

interface MenuInfoProps {
  isVisible: boolean;
}

export const MenuInfo: React.FC<MenuInfoProps> = ({ isVisible }) => {
  const benefits = [
    'Actualización de precios en tiempo real',
    'Diseño adaptable a tu identidad visual',
    'Aumenta la rotación de mesas',
    'Integración con sistemas de pedidos y pagos'
  ];

  return (
    <div className={`transition-all duration-1000 ease-out ${
      isVisible ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-20 blur-md'
    }`}>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold mb-6">
        <Utensils className="w-3.5 h-3.5" />
        SECTOR HOSTELERÍA
      </div>
      
      <h2 className="text-5xl font-extrabold mb-8 leading-tight">
        Digitaliza la experiencia con <span className="text-amber-500">QRIBAR</span>
      </h2>

      <p className="text-lg text-gray-400 mb-10 leading-relaxed">
        Soluciones específicas para restaurantes de alta gama. Menús digitales elegantes, rápidos y sin contacto que elevan la percepción de tu marca mientras optimizan el servicio.
      </p>

      <div className="space-y-6 mb-12">
        {benefits.map((text, i) => (
          <div 
            key={text} 
            className="flex items-center gap-3 transition-all duration-700"
            style={{ 
              transitionDelay: `${isVisible ? (400 + (i * 150)) : 0}ms`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(20px)'
            }}
          >
            <div className="w-6 h-6 bg-amber-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-gray-300 font-medium">{text}</span>
          </div>
        ))}
      </div>

      <a 
        href="https://www.qribar.es" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-block bg-amber-500 hover:bg-amber-600 text-black px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-amber-500/20 active:scale-95 delay-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        Más información
      </a>
    </div>
  );
};
