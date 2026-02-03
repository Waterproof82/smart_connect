
import React from 'react';
import { Navbar } from '@features/landing/presentation/components/Navbar';
import { Hero } from '@features/landing/presentation/components/Hero';
import { Features } from '@features/landing/presentation/components/Features';
import { SuccessStats } from '@features/landing/presentation/components/SuccessStats';
import { Contact } from '@features/landing/presentation/components/Contact';
import { ExpertAssistant } from '@features/chatbot/presentation';
import { getChatbotContainer } from '@features/chatbot/presentation/ChatbotContainer';

const App: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [isKnowledgeBaseReady, setIsKnowledgeBaseReady] = React.useState(false);

  // Initialize knowledge base from Supabase on app startup
  React.useEffect(() => {
    const initKnowledgeBase = async () => {
      try {
        const container = getChatbotContainer();
        await container.initializeKnowledgeBase();
        setIsKnowledgeBaseReady(true);
        console.warn('✅ Knowledge base loaded and ready');
      } catch (error) {
        console.error('⚠️ Knowledge base initialization failed, using fallback mode:', error);
        // Allow app to continue - fallback mode will use query-time Supabase RPC
        setIsKnowledgeBaseReady(true);
      }
    };

    initKnowledgeBase();
  }, []);

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
      <Contact />
      
      {/* AI Chatbot Assistant - Only render when knowledge base is ready */}
      {isKnowledgeBaseReady && <ExpertAssistant />}
      
      {/* Footer */}
      <footer className="bg-black/50 py-8 text-center text-gray-400">
        <p>© 2026 SmartConnect AI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
