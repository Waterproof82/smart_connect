
import React from 'react';
import { ArrowRight, Play, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[130px] rounded-full -mr-64 -mt-32 animate-drift"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full -ml-32 -mb-32 animate-drift-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full opacity-50"></div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="max-w-2xl">
          <div className="reveal-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 tracking-wider uppercase">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            Tecnología de Próxima Generación
          </div>
          
          <h1 className="reveal-2 text-6xl md:text-8xl font-black leading-[1.05] mb-8 tracking-tight">
            No solo creamos software. <br />
            <span className="gradient-text">Escalamos con IA</span>
          </h1>

          <p className="reveal-3 text-xl text-gray-400 mb-12 leading-relaxed max-w-xl">
            Fusionamos hardware NFC inteligente con flujos de trabajo autónomos. Convierte la complejidad operativa en un motor de crecimiento automatizado.
          </p>

          <div className="reveal-3 flex flex-wrap gap-5">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-2xl shadow-blue-600/30 active:scale-95 group">
              Empezar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 group">
              Ver Demo
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play className="w-3 h-3 fill-white ml-0.5" />
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end reveal-1">
          {/* Card Mockup with Shimmer and Float */}
          <div className="relative w-full max-w-md aspect-[3/4] glass-card rounded-[3rem] p-10 border border-white/10 shadow-2xl glow-blue shimmer animate-float-fancy">
            <div className="flex justify-between items-start mb-16">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Volume2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full text-[10px] text-green-400 font-black tracking-widest uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                NFC Active
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  <Sparkles className="text-white w-10 h-10" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black mb-1">SmartConnect</h3>
                <p className="text-blue-400/60 text-xs font-bold tracking-[0.2em] uppercase">Enterprise AI Node</p>
              </div>
            </div>

            <div className="mt-20 space-y-5">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full animate-[shimmer-bar_3s_infinite]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono tracking-widest uppercase font-bold">
                <span className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
                  ID: 8493-XJ
                </span>
                <span className="text-blue-500">Protocol v2.5</span>
              </div>
            </div>

            {/* Float Floating Element - Enhanced */}
            <div className="absolute -left-16 top-1/3 bg-blue-600 border border-blue-400/50 backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_20px_50px_rgba(37,99,235,0.4)] animate-float-fancy" style={{ animationDelay: '-2s' }}>
               <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                 <Sparkles className="w-4 h-4 text-white" />
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">AI Core</span>
                 <span className="text-xs font-bold text-white">Procesando...</span>
               </div>
            </div>

            {/* Secondary Decorator */}
            <div className="absolute -right-12 bottom-1/4 bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1 shadow-2xl animate-float-fancy" style={{ animationDelay: '-4s' }}>
               <div className="flex gap-1">
                 {[1, 2, 3].map(i => <div key={i} className="w-6 h-1 bg-blue-500/40 rounded-full"></div>)}
               </div>
               <span className="text-[9px] font-mono text-gray-500">Uplink Stable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
