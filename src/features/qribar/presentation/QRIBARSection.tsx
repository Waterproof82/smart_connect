
import React, { useState, useEffect, useRef } from 'react';
import { Utensils, CheckCircle2, ShoppingCart } from 'lucide-react';

export const QRIBARSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center" ref={sectionRef}>
      <div className={`order-2 lg:order-1 flex justify-center transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isVisible ? 'opacity-100 translate-x-0 blur-0 rotate-0' : 'opacity-0 -translate-x-20 blur-md -rotate-6'
      }`}>
        {/* Phone Mockup */}
        <div className="relative w-full max-w-[320px] aspect-[9/19] bg-[#0c0c0c] rounded-[3rem] border-8 border-[#1a1a1a] shadow-2xl overflow-hidden group">
          <div className="absolute top-0 w-full h-40 overflow-hidden">
            <img 
              src="https://picsum.photos/seed/food/600/800" 
              alt="Food" 
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent"></div>
            <div className="absolute bottom-4 left-6">
              <h4 className="text-xl font-bold">Le Gourmet</h4>
              <p className="text-[10px] text-gray-400">Alta Cocina & Vinos</p>
            </div>
          </div>

          <div className="mt-44 px-6 space-y-4">
            {[
              { name: 'Risotto de Setas', desc: 'Trufa negra, parmesano', price: '24€' },
              { name: 'Salmón Glaseado', desc: 'Miel y mostaza antigua', price: '28€' },
              { name: 'Entrecot Angus', desc: 'A la parrilla, 300g', price: '32€' }
            ].map((dish, i) => (
              <div 
                key={dish.name} 
                className={`flex justify-between items-center py-3 border-b border-white/5 transition-all duration-700`}
                style={{ 
                  transitionDelay: `${isVisible ? (800 + (i * 100)) : 0}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(10px)'
                }}
              >
                <div>
                  <h5 className="text-sm font-semibold">{dish.name}</h5>
                  <p className="text-[10px] text-gray-500">{dish.desc}</p>
                </div>
                <span className="text-amber-500 font-bold text-sm">{dish.price}</span>
              </div>
            ))}
          </div>

          <div className={`absolute bottom-8 left-6 right-6 transition-all duration-700 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <button className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-gray-200 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Ver Carrito (3)
            </button>
          </div>
        </div>
      </div>

      <div className={`order-1 lg:order-2 transition-all duration-1000 ease-out ${
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
          {[
            'Actualización de precios en tiempo real',
            'Diseño adaptable a tu identidad visual',
            'Aumenta la rotación de mesas',
            'Integración con sistemas de pedidos y pagos'
          ].map((text, i) => (
            <div 
              key={text} 
              className={`flex items-center gap-3 transition-all duration-700`}
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
    </div>
  );
};
