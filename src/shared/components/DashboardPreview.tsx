
import React, { useRef, lazy, Suspense } from 'react';
import { LayoutDashboard, Bell, TrendingUp, Star, Webhook } from 'lucide-react';
import { useIntersectionObserver } from '@shared/hooks';

const LazyBarChart = lazy(() => import('./LazyBarChart').then(m => ({ default: m.LazyBarChart })));

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);

  return (
    <div className="container mx-auto px-6" ref={sectionRef}>
      <div className={`text-center mb-16 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h2 className="text-4xl font-bold mb-4">Control Total en Tiempo Real</h2>
        <p className="text-muted">Monitorea tus KPIs y la reputación de tu negocio desde un solo lugar.</p>
      </div>

      <div aria-hidden="true" className={`max-w-6xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-[0.98]'
      }`}>
        {/* Dashboard Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 sm:py-6 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center text-[var(--color-primary)]">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-default">Panel de Control</h3>
              <p className="text-[10px] text-muted">Última actualización: hace 2 min</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] px-3 py-1 rounded-full text-[10px] text-[var(--color-success-text)] font-bold">
              Sistema Operativo
            </div>
            <div className="text-muted relative p-1">
              <Bell className="w-5 h-5" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-error-text)] rounded-full border-2 border-[var(--color-bg)]"></div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-10 grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-3 space-y-6">
            {[
              { label: 'Total Scans', value: '12,450', sub: '↗ +12% vs mes pasado', icon: <TrendingUp className="w-2.5 h-2.5" />, color: 'text-[var(--color-primary)]', delay: 500, style: 'solid' },
              { label: 'Reseñas Google', value: '4.9', sub: 'Excelente', icon: <Star className="w-3.5 h-3.5 text-[var(--color-icon-amber)] fill-[var(--color-icon-amber)]" />, type: 'rating', delay: 650, style: 'bordered' }
            ].map((card) => (
              <div 
                key={card.label} 
                className={`p-6 rounded-2xl transition-all duration-700 ${
                  card.style === 'solid' 
                    ? 'bg-[var(--color-bg-alt)] border border-[var(--color-border)]' 
                    : 'bg-[var(--color-surface)] border-2 border-[var(--color-primary)]/20'
                }`}
                style={{ 
                  transitionDelay: `${isVisible ? card.delay : 0}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)'
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{card.label}</span>
                  <div className={`w-4 h-4 bg-[var(--color-surface)] rounded-md flex items-center justify-center ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-default mb-2">{card.value}</div>
                <div className="text-[10px] text-[var(--color-success-text)] font-medium">{card.sub}</div>
              </div>
            ))}

            <div className={`bg-[var(--color-accent)] p-6 rounded-2xl shadow-lg transition-all duration-700 delay-[800ms] ${
              isVisible ? 'opacity-100 motion-safe:scale-100' : 'opacity-0 motion-safe:scale-90'
            }`}>
              <h4 className="font-bold text-default mb-2">Plan Pro</h4>
              <p className="text-[10px] text-[var(--color-on-accent-muted)] mb-6">Tu suscripción está activa hasta Dic 2024.</p>
              <div className="w-full bg-[var(--color-text)] text-[var(--color-accent)] py-2.5 rounded-lg text-[10px] font-bold shadow-xl text-center text-default">
                Gestionar
              </div>
            </div>
          </div>

          {/* Center Column - Chart */}
          <div className={`lg:col-span-6 bg-[var(--color-surface)] p-8 rounded-3xl border border-[var(--color-border)] transition-all duration-1000 delay-[600ms] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-sm text-default">Lead Temperature</h4>
              <div className="bg-transparent text-[10px] font-bold text-muted border border-[var(--color-border)] rounded-md px-2 py-1">
                Últimos 7 días
              </div>
            </div>
            <div className="h-[250px] w-full" role="img" aria-label="Gráfico de temperatura de leads durante los últimos 7 días">
              <Suspense fallback={<div className="h-full flex items-center justify-center text-muted">Cargando gráfico...</div>}>
                <LazyBarChart data={data} />
              </Suspense>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className={`lg:col-span-3 bg-[var(--color-bg-alt)] p-8 rounded-3xl border border-[var(--color-border)] transition-all duration-700 delay-[900ms] ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
          }`}>
            <h4 className="font-bold text-sm text-default mb-8">Actividad Reciente</h4>
            <div className="space-y-6">
              {[
                { icon: <Bell className="w-3 h-3" />, label: 'Usuario Escaneo NFC', sub: 'Hace 2 min', color: 'bg-[var(--color-icon-blue)]', delay: 1200 },
                { icon: <Star className="w-3 h-3" />, label: 'Nueva Reseña 5★', sub: 'Cliente Anónimo', color: 'bg-[var(--color-icon-amber)]', delay: 1300 },
                { icon: <Webhook className="w-3 h-3" />, label: 'Webhook Ejecutado', sub: 'n8n Workflow #22', color: 'bg-[var(--color-icon-purple)]', delay: 1400 }
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
                    <p className="text-[10px] font-bold leading-tight text-default">{activity.label}</p>
                    <p className="text-[9px] text-muted">{activity.sub}</p>
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
