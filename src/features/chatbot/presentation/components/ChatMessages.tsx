import React from "react";
import { User, Bot, Loader2 } from "lucide-react";
import { Message } from "../../domain/entities";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
}) => {
  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface)] border border-[var(--color-border)]"}`}
            >
              {m.role === "user" ? (
                <User className="w-4 h-4 text-[var(--color-on-accent)]" />
              ) : (
                <Bot className="w-4 h-4 text-[var(--color-primary)]" />
              )}
            </div>
            <div
              className={`p-3 rounded-2xl text-sm ${m.role === "user" ? "bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-tr-none" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-default rounded-tl-none"}`}
            >
              {m.content}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl rounded-tl-none">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
