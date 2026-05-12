import React from "react";
import { Sparkles } from "lucide-react";

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void;
}

const defaultPrompts = [
  "¿Qué es QRIBAR?",
  "¿Cómo funcionan las tarjetas NFC?",
  "Quiero automatizar mi negocio",
];

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({ onPromptClick }) => {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
        <Sparkles className="w-7 h-7" />
      </div>
      <h4 className="font-bold mb-2">¿Cómo puedo ayudarte?</h4>
      <p className="text-xs text-muted mb-4">
        Pregúntame sobre QRIBAR, automatización con n8n o cómo mejorar tus
        reseñas en Google.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {defaultPrompts.map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="text-xs bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-[var(--color-primary)] px-3 py-2 sm:py-2 rounded-full hover:bg-[var(--color-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] transition-colors min-h-[var(--touch-target-min)]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatWelcome;
