
import React from 'react';
import { Navbar } from '@features/landing/presentation/components/Navbar';
import { Hero } from '@features/landing/presentation/components/Hero';
import { Features } from '@features/landing/presentation/components/Features';
import { SuccessStats } from '@features/landing/presentation/components/SuccessStats';
// import { Contact } from '@features/landing/presentation/components/Contact';

const App: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white">
      <Navbar scrolled={scrolled} />
      <Hero />
      <Features />
      <SuccessStats />
      {/* <Contact /> */}
      
      {/* Footer */}
      <footer className="bg-black/50 py-8 text-center text-gray-400">
        <p>© 2026 SmartConnect AI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
