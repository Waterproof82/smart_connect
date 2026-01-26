
import React, { useState, useEffect, useRef } from 'react';
import { Mail, MapPin, Send, MessageSquare, Globe, Sparkles } from 'lucide-react';

export const Contact: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedService, setSelectedService] = useState('Selecciona una opción');
  const sectionRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Función para hacer scroll y focus
    const scrollAndFocus = () => {
      sectionRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 800);
    };

    // Función para leer parámetro de servicio de la URL
    const updateServiceFromURL = () => {
      const hash = globalThis.location.hash;
      if (!hash.includes('?')) return;
      
      const params = new URLSearchParams(hash.split('?')[1]);
      const servicio = params.get('servicio');
      if (!servicio) return;
      
      setSelectedService(decodeURIComponent(servicio));
      setTimeout(scrollAndFocus, 100);
    };

    // Ejecutar al montar
    updateServiceFromURL();

    // Escuchar cambios en el hash
    globalThis.addEventListener('hashchange', updateServiceFromURL);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    
    return () => {
      globalThis.removeEventListener('hashchange', updateServiceFromURL);
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <div className="relative py-24 overflow-hidden" ref={sectionRef}>
      {/* Background Decorators */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 -ml-32"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            ¿Hablamos?
          </div>
          <h2 className="text-5xl font-black mb-6">Impulsa tu <span className="gradient-text">Negocio Hoy</span></h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Estamos listos para auditar tu proceso actual y mostrarte cómo la IA y la automatización pueden ahorrarte cientos de horas mensuales.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Contact Info */}
          <div className={`lg:col-span-5 space-y-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            {[
              { 
                id: 'contact-email',
                icon: <Mail className="w-6 h-6" />, 
                title: "Email Directo", 
                value: "hola@smartconnect.ai", 
                desc: "Respondemos en menos de 2 horas",
                color: "text-blue-500"
              },
              { 
                id: 'contact-whatsapp',
                icon: <MessageSquare className="w-6 h-6" />, 
                title: "WhatsApp Business", 
                value: "+34 600 000 000", 
                desc: "Soporte técnico inmediato",
                color: "text-emerald-500"
              },
              { 
                id: 'contact-location',
                icon: <MapPin className="w-6 h-6" />, 
                title: "Oficinas Centrales", 
                value: "Madrid, España", 
                desc: "Hub Tecnológico de Innovación",
                color: "text-purple-500"
              }
            ].map((item) => (
              <div key={item.id} className="glass-card p-8 rounded-3xl border border-white/5 flex gap-6 group hover:border-white/10 transition-all">
                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.title}</p>
                  <h4 className="text-xl font-bold mb-1">{item.value}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-7 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Globe className="w-24 h-24 text-white/[0.02] -rotate-12" />
              </div>
              
              <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input 
                      id="contact-name"
                      ref={nameInputRef}
                      type="text" 
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-company" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Empresa</label>
                    <input 
                      id="contact-company"
                      type="text" 
                      placeholder="Ej. Restaurante L'Escale"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    placeholder="juan@empresa.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-service" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Servicio de Interés</label>
                  <select 
                    id="contact-service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-sm appearance-none"
                  >
                    <option className="bg-[#0d0d1e]">Selecciona una opción</option>
                    <option className="bg-[#0d0d1e]">QRIBAR - Menú Digital</option>
                    <option className="bg-[#0d0d1e]">Automatización n8n</option>
                    <option className="bg-[#0d0d1e]">Tarjetas NFC Reseñas</option>
                    <option className="bg-[#0d0d1e]">Consultoría IA</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Mensaje</label>
                  <textarea 
                    id="contact-message"
                    rows={4}
                    placeholder="Cuéntanos brevemente sobre tu proyecto..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
                  ></textarea>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] group">
                  Enviar Propuesta
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
