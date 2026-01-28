/**
 * Chatbot Feature - Barrel Export
 * @module features/chatbot/presentation
 */

/**
 * Presentation Layer Exports for Chatbot Feature
 * 
 * This layer is responsible for:
 * - UI components (ExpertAssistant React component)
 * - Dependency injection container
 */

export { ExpertAssistant } from './ExpertAssistantWithRAG';
export { getChatbotContainer, resetChatbotContainer } from './ChatbotContainer';
export type { ChatbotContainer } from './ChatbotContainer';

