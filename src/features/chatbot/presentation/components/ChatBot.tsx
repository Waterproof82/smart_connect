import { useState, useRef } from 'react';

import { getChatbotContainer } from '../containers/chatbot-container';
import { RAGResult } from '../../data/repositories/rag-repository';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: RAGResult['metadata'];
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'assistant',
      content: '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ...existing code...
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const container = useRef(getChatbotContainer());

  // Removed unused scrollToBottom function

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.warn('💬 Sending message:', input);
      const result = await container.current.generateResponse(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        metadata: result.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('Chat error:', errorMsg);
      setError(errorMsg);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Error: ${errorMsg}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">🤖 Assistant</h1>
        <p className="text-sm text-blue-100">Powered by RAG Optimization</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg shadow-sm ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>

              {/* Show timing metadata */}
              {message.metadata && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p className="font-semibold">⏱️ Performance:</p>
                  <p>
                    Classification: {message.metadata.classification_time}ms
                  </p>
                  <p>Filtering: {message.metadata.filtering_time}ms</p>
                  <p>
                    Semantic Search:{' '}
                    {message.metadata.semantic_search_time}ms
                  </p>
                  <p>Reranking: {message.metadata.reranking_time}ms</p>
                  <p>Generation: {message.metadata.generation_time}ms</p>
                  <p className="font-bold border-t pt-1">
                    Total: {message.metadata.total_time}ms
                  </p>
                  <p className="text-gray-400">
                    📊 Docs filtered: {message.metadata.documents_filtered}
                  </p>
                  <p className="text-gray-400">
                    📄 Docs used: {message.metadata.documents_reranked}
                  </p>
                </div>
              )}

              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-2 rounded-lg rounded-bl-none border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Processing with RAG optimization...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-white p-4 shadow-inner">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSend();
              }
            }}
            placeholder="Type your message... (e.g., 'What's the price of wine glasses?')"
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}
