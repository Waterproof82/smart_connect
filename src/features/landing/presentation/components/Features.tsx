
import React, { useEffect, useState, useRef } from 'react';
import { Code2, Settings2, Smartphone, ArrowUpRight } from 'lucide-react';

const solutions = [
  {
    id: 'software-ia',
    icon: <Code2 className="w-6 h-6 text-blue-500" />,
    title: 'Software & IA',
    description: 'Desarrollo de herramientas personalizadas que se integran perfectamente con tus sistemas actuales. Soluciones a medida impulsadas por algoritmos inteligentes.',
    serviceValue: 'Consultoría IA'
  },
  {
    id: 'automatizacion-n8n',
    icon: <Settings2 className="w-6 h-6 text-purple-500" />,
    title: 'Automatización (n8n)',
    description: 'Orquesta flujos de trabajo complejos sin esfuerzo. Conectamos tus apps favoritas y automatizamos tareas repetitivas para que tu equipo se enfoque en innovar.',
    serviceValue: 'Automatización n8n'
  },
  {
    id: 'tarjetas-nfc',
    icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
    title: 'Tarjetas Tap-to-Review',
    description: 'Hardware físico con alma digital. Tarjetas NFC elegantes que permiten a tus clientes dejar reseñas positivas al instante con un solo toque.',
    serviceValue: 'Tarjetas NFC Reseñas'
  }
];

export const Features: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Marcamos como visible si el elemento está en el viewport
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { 
        threshold: 0.1, // Se activa más rápido (al 10% de visibilidad)
        rootMargin: "0px 0px -50px 0px" // Margen inferior para disparar antes de que llegue al borde
      }
    );

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Nuestras Soluciones</h2>
        <p className="text-gray-400 leading-relaxed">
          Herramientas avanzadas diseñadas para la era digital, desde el hardware hasta el código.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {solutions.map((item, idx) => (
          <div 
            key={item.id} 
            className={`glass-card p-10 rounded-3xl group hover:border-blue-500/30 transition-all duration-1000 cursor-default relative overflow-hidden ${
              isVisible 
                ? 'opacity-100 translate-y-0 blur-0' 
                : 'opacity-0 translate-y-20 blur-sm'
            }`}
            style={{ transitionDelay: `${idx * 150}ms` }}
          >
            <div className="mb-8 w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
            <p className="text-gray-400 leading-relaxed mb-12 min-h-[100px]">
              {item.description}
            </p>
            
            {/* Botón con animación de "colocación" */}
            <div className={`transform transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-10 scale-90'
            }`}
            style={{ transitionDelay: `${(idx * 150) + 400}ms` }}
            >
              <a 
                href={`#contacto?servicio=${encodeURIComponent(item.serviceValue)}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors relative"
              >
                <span>Saber más</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                
                {/* Línea decorativa que se expande */}
                <div className={`absolute -bottom-1 left-0 h-[2px] bg-blue-500 transition-all duration-1000 ease-out ${
                  isVisible ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`} 
                style={{ transitionDelay: `${(idx * 150) + 800}ms` }}
                />
              </a>
            </div>

            {/* Decoración de fondo de la tarjeta */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};
