/**
 * Mock for @google/genai package
 * Used in tests to avoid real API calls
 */

export class GoogleGenAI {
  constructor(config: { apiKey: string }) {
    if (!config.apiKey || config.apiKey === 'invalid-key') {
      // Simulate API key validation (throws in real usage)
    }
  }

  models = {
    embedContent: async (params: { model: string; contents: string }) => {
      if (!params.contents || params.contents.trim() === '') {
        throw new Error('Empty text provided');
      }
      
      // Simulate gemini-embedding-001 output (768 dimensions)
      const mockEmbedding = Array.from(
        { length: 768 },
        () => Math.random() * 2 - 1 // Random values between -1 and 1
      );
      
      return {
        embeddings: [
          {
            values: mockEmbedding,
          },
        ],
      };
    },
  };
}
