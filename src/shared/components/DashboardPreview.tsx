
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { LayoutDashboard, Bell, TrendingUp, Star, Webhook } from 'lucide-react';

const data = [
  { name: 'Lun', value: 300 },
  { name: 'Mar', value: 520 },
  { name: 'Mie', value: 450 },
  { name: 'Jue', value: 780 },
  { name: 'Vie', value: 610 },
  { name: 'Sab', value: 710 },
  { name: 'Dom', value: 890 },
];

export const DashboardPreview: React.FC = () => {
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
      <div className={`text-center mb-16 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h2 className="text-4xl font-bold mb-4">Control Total en Tiempo Real</h2>
        <p className="text-gray-400">Monitorea tus KPIs y la reputación de tu negocio desde un solo lugar.</p>
      </div>

      <div className={`max-w-6xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-[0.98]'
      }`}>
        {/* Dashboard Header */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Panel de Control</h3>
              <p className="text-[10px] text-gray-500">Última actualización: hace 2 min</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-[10px] text-green-400 font-bold">
              Sistema Operativo
            </div>
            <button className="text-gray-500 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></div>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-10 grid lg:grid-cols-12 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-3 space-y-6">
            {[
              { label: 'Total Scans', value: '12,450', sub: '↗ +12% vs mes pasado', icon: <TrendingUp className="w-2.5 h-2.5" />, color: 'text-blue-500', delay: 500 },
              { label: 'Reseñas Google', value: '4.9', sub: 'rating', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />, type: 'rating', delay: 650 }
            ].map((card) => (
              <div 
                key={card.label} 
                className={`glass-card p-6 rounded-2xl border border-white/5 transition-all duration-700`}
                style={{ 
                  transitionDelay: `${isVisible ? card.delay : 0}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)'
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{card.label}</span>
                  <div className={`w-4 h-4 bg-white/5 rounded-md flex items-center justify-center ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">{card.value}</div>
                {card.type === 'rating' ? (
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  </div>
                ) : (
                  <div className="text-[10px] text-green-400 font-medium">{card.sub}</div>
                )}
              </div>
            ))}

            <div className={`bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-700 delay-[800ms] ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              <h4 className="font-bold mb-2">Plan Pro</h4>
              <p className="text-[10px] text-blue-100/70 mb-6">Tu suscripción está activa hasta Dic 2024.</p>
              <button className="w-full bg-white text-blue-600 py-2.5 rounded-lg text-[10px] font-bold shadow-xl active:scale-95 transition-all">
                Gestionar
              </button>
            </div>
          </div>

          {/* Center Column - Chart */}
          <div className={`lg:col-span-6 glass-card p-8 rounded-3xl border border-white/5 transition-all duration-1000 delay-[600ms] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-sm">Lead Temperature</h4>
              <select className="bg-transparent text-[10px] font-bold text-gray-500 border border-white/10 rounded-md px-2 py-1 outline-none">
                <option>Últimos 7 días</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 10 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: '#111', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#1e293b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className={`lg:col-span-3 glass-card p-8 rounded-3xl border border-white/5 transition-all duration-700 delay-[900ms] ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
          }`}>
            <h4 className="font-bold text-sm mb-8">Actividad Reciente</h4>
            <div className="space-y-6">
              {[
                { icon: <Bell className="w-3 h-3" />, label: 'Usuario Escaneo NFC', sub: 'Hace 2 min', color: 'bg-blue-500', delay: 1200 },
                { icon: <Star className="w-3 h-3" />, label: 'Nueva Reseña 5★', sub: 'Cliente Anónimo', color: 'bg-amber-500', delay: 1300 },
                { icon: <Webhook className="w-3 h-3" />, label: 'Webhook Ejecutado', sub: 'n8n Workflow #22', color: 'bg-purple-500', delay: 1400 }
              ].map((activity) => (
                <div 
                  key={activity.label} 
                  className="flex gap-4 transition-all duration-500"
                  style={{ transitionDelay: `${isVisible ? activity.delay : 0}ms` }}
                >
                  <div className={`w-8 h-8 ${activity.color}/10 rounded-full flex items-center justify-center shrink-0`}>
                    <div className={`${activity.color} w-1.5 h-1.5 rounded-full`}></div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold leading-tight">{activity.label}</h5>
                    <p className="text-[9px] text-gray-500">{activity.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
