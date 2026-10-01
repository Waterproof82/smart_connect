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

export { ExpertAssistant, OPEN_ASSISTANT_EVENT } from './ExpertAssistantWithRAG';
export { getChatbotContainer } from './ChatbotContainer';

