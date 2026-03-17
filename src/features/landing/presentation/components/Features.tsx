
import React, { useRef } from 'react';
import { Code2, Settings2, Smartphone, Utensils, ArrowUpRight } from 'lucide-react';
import { useIntersectionObserver } from '@shared/hooks';

const solutions = [
  {
    id: 'software-ia',
    icon: <Code2 className="w-6 h-6 text-[var(--color-icon-blue)]" />,
    title: 'Software & IA',
    description: 'Desarrollo de herramientas personalizadas que se integran perfectamente con tus sistemas actuales. Soluciones a medida impulsadas por algoritmos inteligentes.',
    serviceValue: 'Consultoría IA'
  },
  {
    id: 'automatizacion-n8n',
    icon: <Settings2 className="w-6 h-6 text-[var(--color-icon-purple)]" />,
    title: 'Automatización (n8n)',
    description: 'Orquesta flujos de trabajo complejos sin esfuerzo. Conectamos tus apps favoritas y automatizamos tareas repetitivas para que tu equipo se enfoque en innovar.',
    serviceValue: 'Automatización n8n'
  },
  {
    id: 'tarjetas-nfc',
    icon: <Smartphone className="w-6 h-6 text-[var(--color-icon-emerald)]" />,
    title: 'Tarjetas Tap-to-Review',
    description: 'Hardware físico con alma digital. Tarjetas NFC elegantes que permiten a tus clientes dejar reseñas positivas al instante con un solo toque.',
    serviceValue: 'Tarjetas NFC Reseñas'
  },
  {
    id: 'qribar',
    icon: <Utensils className="w-6 h-6 text-[var(--color-icon-amber)]" />,
    title: 'QRIBAR',
    description: 'Menú digital interactivo para restaurantes y hostelería. Tus clientes escanean un QR y acceden a tu carta desde el móvil, sin descargar nada.',
    serviceValue: 'QRIBAR',
    external: true,
    href: 'https://qribar.es'
  }
];

export const Features: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { rootMargin: "0px 0px -50px 0px" });

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Nuestras Soluciones</h2>
        <p className="text-muted leading-relaxed">
          Herramientas avanzadas diseñadas para la era digital, desde el hardware hasta el código.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {solutions.map((item, idx) => (
          <article
            key={item.id}
            className={`relative p-8 lg:p-10 rounded-3xl transition-all duration-700 cursor-pointer group ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            } ${
              idx === 0 
                ? 'bg-[var(--color-surface)] lg:col-span-2 lg:row-span-2' 
                : 'bg-[var(--color-bg-alt)]'
            }`}
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <div className={`mb-6 w-14 h-14 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center motion-safe:group-hover:scale-110 transition-transform ${idx === 0 ? 'lg:w-16 lg:h-16' : ''}`}>
              {item.icon}
            </div>
            <h3 className={`font-bold mb-4 text-default ${idx === 0 ? 'text-3xl lg:text-4xl' : 'text-xl lg:text-2xl'}`}>{item.title}</h3>
            <p className={`text-muted leading-relaxed mb-6 ${idx === 0 ? 'text-lg' : ''}`}>
              {item.description}
            </p>
            
            <a 
              href={item.external && item.href 
                ? item.href 
                : `#contacto?servicio=${encodeURIComponent(item.serviceValue)}`
              }
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-colors"
            >
              <span>{item.external ? 'Visitar' : 'Contactar'}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
};
