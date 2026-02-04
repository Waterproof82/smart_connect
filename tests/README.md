/**
 * README - Tests Structure
 * @description Guide for TDD methodology in SmartConnect AI
 */

# 🧪 Tests Structure - TDD Methodology

## 📁 Directory Structure

```
tests/
├── unit/           # Unit tests (isolated functions/components)
├── integration/    # Integration tests (multiple units working together)
├── e2e/           # End-to-end tests (full user flows)
└── setup.ts       # Global test configuration
```

## 🔴 Red → 🟢 Green → 🔵 Refactor

### 1. RED Phase (Write Failing Test)
Write the test FIRST. It should fail because the functionality doesn't exist yet.

```typescript
// tests/unit/chatbot/GenerateResponseUseCase.test.ts
describe('GenerateResponseUseCase', () => {
  it('should generate a response using RAG context', async () => {
    const response = await useCase.execute('What is QRIBAR?');
    expect(response.content).toContain('digital menu');
  });
});
```

### 2. GREEN Phase (Minimal Implementation)
Write just enough code to make the test pass.

```typescript
// src/features/lead-scoring/domain/usecases/calculateLeadScore.ts
export const calculateLeadScore = (data: any) => {
  return { temperature: 'HOT' };
};
```

### 3. REFACTOR Phase (Improve Quality)
Improve the code without changing behavior. Tests should still pass.

```typescript
export interface LeadData {
  engagement: number;
  responseTime?: number;
}

export const calculateLeadScore = (data: LeadData): LeadScore => {
  const score = data.engagement * 0.8 + (data.responseTime || 0) * 0.2;
  return {
    temperature: score > 80 ? 'HOT' : score > 50 ? 'WARM' : 'COLD',
    score
  };
};
```

## 🎯 Coverage Goals

- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

## 🚀 Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- chatbot/GenerateResponseUseCase.test.ts
```

## 📋 Test Naming Convention

```typescript
describe('[Feature/Component Name]', () => {
  describe('[Method/Function Name]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```
