
import React, { Suspense, lazy } from 'react';
import { Navbar } from '@features/landing/presentation/components/Navbar';
import { Hero } from '@features/landing/presentation/components/Hero';
import { Features } from '@features/landing/presentation/components/Features';
import { SuccessStats } from '@features/landing/presentation/components/SuccessStats';
import { Contact } from '@features/landing/presentation/components/Contact';

// Lazy loading para el Chatbot - solo se carga cuando el usuario interactúa
// Esto reduce significativamente el initial bundle size
const ExpertAssistant = lazy(() => 
  import('@features/chatbot/presentation').then(module => ({ 
    default: module.ExpertAssistant 
  }))
);

const ChatbotLoading = () => (
  <div className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
  </div>
);

const App: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [isKnowledgeBaseReady, setIsKnowledgeBaseReady] = React.useState(false);
  const [showChatbot, setShowChatbot] = React.useState(false);

  // Initialize knowledge base from Supabase on app startup
  React.useEffect(() => {
    // Knowledge base initialization removed (no longer needed)
    setIsKnowledgeBaseReady(true);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load chatbot only when user scrolls to bottom or clicks CTA
  React.useEffect(() => {
    const handleScrollToBottom = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        setShowChatbot(true);
      }
    };
    window.addEventListener('scroll', handleScrollToBottom);
    return () => window.removeEventListener('scroll', handleScrollToBottom);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white">
      <Navbar scrolled={scrolled} />
      <section id="inicio"><Hero /></section>
      <section id="soluciones"><Features /></section>
      <section id="exito"><SuccessStats /></section>
      <section id="contacto"><Contact />
        {/* CTA to load chatbot */}
        <div className="text-center mt-8">
          <button 
            onClick={() => setShowChatbot(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Chatea con nuestro Asistente IA
          </button>
        </div>
      </section>
      
      {/* AI Chatbot Assistant - Lazy loaded on interaction */}
      {isKnowledgeBaseReady && showChatbot && (
        <Suspense fallback={<ChatbotLoading />}>
          <ExpertAssistant />
        </Suspense>
      )}
      
      {/* Footer */}
      <footer className="bg-black/50 py-8 text-center text-gray-400">
        <p>© 2026 SmartConnect AI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
