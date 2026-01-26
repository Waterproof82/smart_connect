
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const ExpertAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `Eres el Asistente Experto de SmartConnect AI. Ayudas a dueños de negocios a entender cómo la IA, la automatización n8n y las tarjetas de reseña NFC pueden escalar su negocio. Sé profesional, conciso y entusiasta. Los servicios principales son: 
          1. QRIBAR: Menús digitales para hostelería. 
          2. Automatización n8n: Flujos de trabajo para empresas.
          3. Tarjetas Tap-to-Review: Aumento de reseñas en Google Maps.
          Responde siempre en español.`,
        }
      });

      const assistantContent = response.text || "Lo siento, tuve un problema al procesar tu solicitud.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Hubo un error al conectar con el asistente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-[400px] h-[550px] bg-[#0d0d1e] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 bg-blue-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-none">Asistente Experto</h4>
                <p className="text-[10px] text-blue-100 opacity-70">En línea ahora</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-[#050505]/50">
            {messages.length === 0 && (
              <div className="text-center py-10 px-6">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h5 className="font-bold mb-2">¿Cómo puedo ayudarte?</h5>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pregúntame sobre QRIBAR, automatización con n8n o cómo mejorar tus reseñas en Google.
                </p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600' : 'bg-white/5 border border-white/10'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-xs outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 bottom-2 w-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buttons Group */}
      <div className="flex items-center gap-3">
        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/1234567890" // Reemplazar con el número real
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-[#25D366] hover:bg-[#1ebc57] text-white px-6 py-3 rounded-full shadow-2xl transition-all active:scale-95 border border-white/10 group overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
               <MessageSquare className="text-white fill-white w-5 h-5" />
            </div>
          </div>
          <div className="text-left relative z-10 hidden sm:block">
            <p className="text-[11px] font-bold leading-none mb-0.5">WhatsApp</p>
            <p className="text-[9px] text-white/80 font-medium">Habla con nosotros</p>
          </div>
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </a>

        {/* AI Assistant Trigger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl transition-all active:scale-95 border border-white/10 group ${
            isOpen ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform ${
              isOpen ? 'bg-white/20' : 'bg-blue-600'
            }`}>
               <Bot className={`${isOpen ? 'text-white' : 'text-white'} w-5 h-5`} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-bold leading-none mb-0.5">Asistente Experto</p>
            <p className={`text-[9px] font-medium ${isOpen ? 'text-blue-100' : 'text-gray-500'}`}>QRIBAR & Reputación</p>
          </div>
        </button>
      </div>
    </div>
  );
};
