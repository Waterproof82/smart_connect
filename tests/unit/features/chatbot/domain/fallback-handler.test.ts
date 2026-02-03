/**
 * Fallback Handler Test Suite (TDD - Test First)
 * 
 * Fase 3: Respuestas de Fallback Inteligentes
 * - Respuestas predefinidas por categoría (QRIBAR, Reviews, General)
 * - Context-aware fallbacks basados en consulta del usuario
 * - Human escalation cuando confianza < 50%
 * - Tracking de uso de fallbacks
 * - Graceful degradation
 * 
 * ADR: docs/adr/006-rag-architecture-decision.md
 * Clean Architecture: Domain Layer Test
 */

import { 
  FallbackHandler, 
  FallbackContext
} from '@/features/chatbot/domain/fallback-handler';

describe('FallbackHandler - Core Functionality', () => {
  let handler: FallbackHandler;

  beforeEach(() => {
    handler = new FallbackHandler();
  });

  test('MUST return fallback when no RAG results available', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Qué es QRIBAR?',
      category: 'qribar',
      ragResults: [],
      confidence: 0.6,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response).toBeDefined();
    expect(response.message).toBeTruthy();
    expect(response.type).toBe('predefined');
    expect(response.category).toBe('qribar');
  });

  test('MUST include relevant information in QRIBAR fallback', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Cómo funciona QRIBAR?',
      category: 'qribar',
      ragResults: [],
      confidence: 0.7,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.message.toLowerCase()).toContain('qribar');
    expect(response.message.toLowerCase()).toContain('carta digital');
    expect(response.shouldEscalate).toBe(false);
  });

  test('MUST include relevant information in Reviews fallback', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Cómo mejoro mi reputación online?',
      category: 'reviews',
      ragResults: [],
      confidence: 0.7,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.message.toLowerCase()).toContain('reviews');
    expect(response.message.toLowerCase()).toContain('reputación');
    expect(response.category).toBe('reviews');
  });

  test('MUST provide general fallback for unknown category', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Qué servicios ofrecen?',
      category: 'general',
      ragResults: [],
      confidence: 0.6,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.message).toBeTruthy();
    expect(response.category).toBe('general');
    expect(response.type).toBe('predefined');
  });
});

describe('FallbackHandler - Context-Aware Responses', () => {
  let handler: FallbackHandler;

  beforeEach(() => {
    handler = new FallbackHandler();
  });

  test('MUST detect pricing queries and provide pricing fallback', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Cuánto cuesta QRIBAR?',
      category: 'qribar',
      ragResults: [],
      confidence: 0.6,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.message.toLowerCase()).toMatch(/precio|costo|tarifa|inversión/);
    expect(response.actionSuggestions).toContain('contact');
  });

  test('MUST detect feature queries and provide feature overview', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Qué características tiene QRIBAR?',
      category: 'reviews',
      ragResults: [],
      confidence: 0.6,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    // Features query should include relevant information about the service
    expect(response.message.toLowerCase()).toMatch(/incluye|sistema|gestión|monitoreo/);
  });

  test('MUST detect implementation queries and suggest consultation', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Cómo implemento esto en mi negocio?',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.shouldEscalate).toBe(true);
    expect(response.actionSuggestions).toContain('contact');
  });

  test('MUST provide contextual suggestions based on query intent', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Tienen casos de éxito?',
      category: 'general',
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.actionSuggestions).toBeDefined();
    expect(response.actionSuggestions.length).toBeGreaterThan(0);
  });
});

describe('FallbackHandler - Human Escalation', () => {
  let handler: FallbackHandler;

  beforeEach(() => {
    handler = new FallbackHandler();
  });

  test('MUST escalate when confidence is very low', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Query muy específica y compleja',
      category: 'general',
      ragResults: [],
      confidence: 0.1, // 10% confidence
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.shouldEscalate).toBe(true);
    expect(response.escalationReason).toBe('low_confidence');
  });

  test('MUST NOT escalate when confidence is acceptable', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Qué es QRIBAR?',
      category: 'qribar',
      ragResults: [],
      confidence: 0.6, // 60% confidence
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.shouldEscalate).toBe(false);
  });

  test('MUST provide escalation message with contact options', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Necesito ayuda urgente',
      category: 'general',
      ragResults: [],
      confidence: 0.2,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.shouldEscalate).toBe(true);
    expect(response.message).toContain('humano');
    expect(response.actionSuggestions).toContain('contact');
  });

  test('MUST escalate for sensitive or urgent queries', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Tengo un problema urgente con mi cuenta',
      category: 'general',
      ragResults: [],
      confidence: 0.5,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.shouldEscalate).toBe(true);
    expect(response.escalationReason).toMatch(/urgent|sensitive/);
  });
});

describe('FallbackHandler - Statistics Tracking', () => {
  let handler: FallbackHandler;

  beforeEach(() => {
    handler = new FallbackHandler();
  });

  test('MUST track total fallback usage', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Test query',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
    };

    // Act
    await handler.getFallback(context);
    await handler.getFallback(context);
    await handler.getFallback(context);
    const stats = handler.getStats();

    // Assert
    expect(stats.totalFallbacks).toBe(3);
  });

  test('MUST track fallbacks by category', async () => {
    // Arrange
    const contextQribar: FallbackContext = {
      query: 'QRIBAR query',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
    };
    const contextReviews: FallbackContext = {
      query: 'Reviews query',
      category: 'reviews',
      ragResults: [],
      confidence: 0,
    };

    // Act
    await handler.getFallback(contextQribar);
    await handler.getFallback(contextQribar);
    await handler.getFallback(contextReviews);
    const stats = handler.getStats();

    // Assert
    expect(stats.byCategory.qribar).toBe(2);
    expect(stats.byCategory.reviews).toBe(1);
  });

  test('MUST track escalation rate', async () => {
    // Arrange
    const lowConfidence: FallbackContext = {
      query: 'Complex query',
      category: 'general',
      ragResults: [],
      confidence: 0.1,
    };
    const highConfidence: FallbackContext = {
      query: 'Simple query',
      category: 'qribar',
      ragResults: [],
      confidence: 0.8,
    };

    // Act
    await handler.getFallback(lowConfidence); // Should escalate
    await handler.getFallback(highConfidence); // Should NOT escalate
    const stats = handler.getStats();

    // Assert
    expect(stats.totalEscalations).toBe(1);
    expect(stats.escalationRate).toBeCloseTo(0.5, 2); // 1/2 = 50%
  });

  test('MUST track average confidence score', async () => {
    // Arrange
    const contexts: FallbackContext[] = [
      { query: 'Q1', category: 'qribar', ragResults: [], confidence: 0.2 },
      { query: 'Q2', category: 'qribar', ragResults: [], confidence: 0.4 },
      { query: 'Q3', category: 'qribar', ragResults: [], confidence: 0.6 },
    ];

    // Act
    for (const ctx of contexts) {
      await handler.getFallback(ctx);
    }
    const stats = handler.getStats();

    // Assert
    expect(stats.averageConfidence).toBeCloseTo(0.4, 2); // (0.2 + 0.4 + 0.6) / 3 = 0.4
  });

  test('MUST reset statistics', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Test query',
      category: 'qribar',
      ragResults: [],
      confidence: 0.5,
    };
    await handler.getFallback(context);
    await handler.getFallback(context);

    // Act
    handler.resetStats();
    const stats = handler.getStats();

    // Assert
    expect(stats.totalFallbacks).toBe(0);
    expect(stats.totalEscalations).toBe(0);
    expect(stats.byCategory).toEqual({});
  });
});

describe('FallbackHandler - Action Suggestions', () => {
  let handler: FallbackHandler;

  beforeEach(() => {
    handler = new FallbackHandler();
  });

  test('MUST suggest contact for pricing queries', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Cuánto cuesta?',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.actionSuggestions).toContain('contact');
  });

  test('MUST suggest documentation for feature queries', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Cómo funciona?',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.actionSuggestions).toContain('documentation');
  });

  test('MUST suggest demo for implementation queries', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Quiero ver cómo funciona',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.actionSuggestions).toContain('demo');
  });

  test('MUST prioritize suggestions by relevance', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Cuánto cuesta y cómo funciona?',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.actionSuggestions.length).toBeGreaterThan(0);
    expect(response.actionSuggestions[0]).toBeTruthy();
  });
});

describe('FallbackHandler - Personalization', () => {
  let handler: FallbackHandler;

  beforeEach(() => {
    handler = new FallbackHandler();
  });

  test('MUST use user name in fallback if provided', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Qué es QRIBAR?',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
      userName: 'Juan',
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.message).toContain('Juan');
  });

  test('MUST adapt tone based on previous interactions', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Qué es QRIBAR?',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
      previousInteractions: 5,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.tone).toBe('familiar');
  });

  test('MUST use formal tone for first-time users', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '¿Qué es QRIBAR?',
      category: 'qribar',
      ragResults: [],
      confidence: 0,
      previousInteractions: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response.tone).toBe('formal');
  });
});

describe('FallbackHandler - Error Handling', () => {
  let handler: FallbackHandler;

  beforeEach(() => {
    handler = new FallbackHandler();
  });

  test('MUST handle empty query gracefully', async () => {
    // Arrange
    const context: FallbackContext = {
      query: '',
      category: 'general',
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response).toBeDefined();
    expect(response.message).toBeTruthy();
  });

  test('MUST handle null or undefined category', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Test query',
      category: undefined as unknown,
      ragResults: [],
      confidence: 0,
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response).toBeDefined();
    expect(response.category).toBe('general');
  });

  test('MUST handle invalid confidence values', async () => {
    // Arrange
    const context: FallbackContext = {
      query: 'Test query',
      category: 'qribar',
      ragResults: [],
      confidence: -1, // Invalid
    };

    // Act
    const response = await handler.getFallback(context);

    // Assert
    expect(response).toBeDefined();
    // Should treat as 0 confidence
    expect(response.shouldEscalate).toBe(true);
  });
});
