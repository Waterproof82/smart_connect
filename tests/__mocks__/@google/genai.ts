/**
 * Mock for @google/genai package
 * Used in tests to avoid real API calls
 */

export class GoogleGenerativeAI {
  constructor(apiKey: string) {
    if (!apiKey || apiKey === 'invalid-key') {
      // Simulate API key validation (throws in real usage)
    }
  }

  getGenerativeModel(config: { model: string }) {
    return {
      embedContent: async (text: string) => {
        if (!text || text.trim() === '') {
          throw new Error('Empty text provided');
        }
        
        // Simulate text-embedding-004 output (768 dimensions)
        const mockEmbedding = Array.from(
          { length: 768 },
          () => Math.random() * 2 - 1 // Random values between -1 and 1
        );
        
        return {
          embedding: {
            values: mockEmbedding,
          },
        };
      },
    };
  }
}
