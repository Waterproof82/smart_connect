
import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  Hero, 
  Features, 
  SuccessStats, 
  Contact 
} from '@features/landing/presentation/components';
import { QRIBARSection } from '@features/qribar/presentation';
import { ExpertAssistant } from '@features/chatbot/presentation';

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] selection:bg-blue-500 selection:text-white">
      <Navbar scrolled={scrolled} />
      
      <main>
        <section id="inicio">
          <Hero />
        </section>

        <section id="soluciones" className="py-24">
          <Features />
        </section>

        <section id="exito" className="py-12 bg-[#050505]">
          <SuccessStats />
        </section>

        <section id="qribar" className="py-24 bg-gradient-to-b from-[#020408] to-[#0a0a0a]">
          <QRIBARSection />
        </section>

        <section id="contacto" className="bg-gradient-to-b from-[#050505] to-[#020408]">
          <Contact />
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© 2024 SmartConnect AI. Todos los derechos reservados.</p>
        </div>
      </footer>

      <ExpertAssistant />
    </div>
  );
};

export default App;
