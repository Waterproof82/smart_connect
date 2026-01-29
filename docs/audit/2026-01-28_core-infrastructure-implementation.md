# Core Infrastructure Implementation - Audit Log

**Date:** 2026-01-28  
**Operation:** Core Shared Infrastructure Creation  
**Branch:** `clean_architecture`

---

## Summary
Created shared business logic infrastructure in `src/core/` to eliminate code duplication across features and provide reusable abstractions for HTTP communication, error handling, and logging.

---

## Changes Made

### 1. Domain Layer - Error Entities

**Created Custom Error Classes:**
- `DomainError` → Base error for domain-specific errors
- `ValidationError` → Field validation failures (with optional field name)
- `NotFoundError` → Resource not found errors
- `NetworkError` → Network/connectivity errors (with status code)
- `ApiError` → API-specific errors (with status code + details)
- `UnauthorizedError` → Authentication/authorization failures

**Benefits:**
- Type-safe error handling across all features
- Consistent error messages and structure
- Better error categorization for logging and monitoring

**Files:**
- `src/core/domain/entities/Errors.ts`
- `src/core/domain/entities/index.ts`

### 2. Data Layer - HTTP Client

**Created HTTP Abstraction:**
- `IHttpClient` interface → Contract for HTTP communication
- `FetchHttpClient` implementation → Native fetch with:
  - Automatic timeout (default 30s)
  - Request/response transformation
  - Error handling (NetworkError, ApiError)
  - Query parameter building
  - Support for absolute/relative URLs
  - JSON/text response parsing

**Benefits:**
- Can swap implementations (fetch → axios) without changing features
- Centralized error handling
- Consistent timeout configuration
- Type-safe responses

**Files:**
- `src/core/data/datasources/IHttpClient.ts`
- `src/core/data/datasources/FetchHttpClient.ts`
- `src/core/data/datasources/index.ts`

### 3. Domain Layer - Logger

**Created Logging Abstraction:**
- `ILogger` interface → Contract for logging
- `ConsoleLogger` implementation → Console-based logger with:
  - Log levels (DEBUG, INFO, WARN, ERROR)
  - Prefix support for module identification
  - Automatic stack trace in development
  - Production-safe (no debug logs)
  - Error object handling

**Benefits:**
- Centralized logging strategy
- Easy to swap console → file/cloud logging
- Consistent log formatting
- Better debugging in development

**Files:**
- `src/core/domain/usecases/Logger.ts`
- `src/core/domain/usecases/index.ts`

### 4. Testing

**Created 28 comprehensive unit tests:**

#### Error Tests (14 tests):
- `Errors.test.ts` → All error classes validation
- Constructor parameters
- Error inheritance
- Try-catch compatibility

#### HTTP Client Tests (11 tests):
- `FetchHttpClient.test.ts` → HTTP operations
- GET/POST requests
- Query parameters
- Error handling (HTTP errors, network failures)
- Absolute/relative URLs
- JSON/text responses

#### Logger Tests (3 tests):
- `ConsoleLogger.test.ts` → Logging operations
- All log levels
- Prefix support
- Error formatting

**Results:** ✅ 28/28 passing (100%)

**Files:**
- `tests/unit/core/Errors.test.ts`
- `tests/unit/core/FetchHttpClient.test.ts`
- `tests/unit/core/ConsoleLogger.test.ts`

---

## Architecture Impact

### Before (Code Duplication):
```
chatbot/data/datasources/GeminiDataSource.ts
  ├─ fetch() → Custom error handling
  └─ console.error() → Manual logging

landing/data/datasources/N8NWebhookDataSource.ts
  ├─ fetch() → Different error handling
  └─ console.log() → Different logging

qribar/data/datasources/MockMenuDataSource.ts
  ├─ setTimeout() → Manual delay simulation
  └─ console.error() → Another logging approach
```

### After (Shared Infrastructure):
```
core/
  ├─ domain/entities/Errors.ts → Unified error types
  ├─ data/datasources/FetchHttpClient.ts → Reusable HTTP client
  └─ domain/usecases/Logger.ts → Centralized logging

All features can now:
  ├─ Import from @core/*
  ├─ Use consistent error handling
  └─ Use standardized logging
```

---

## Usage Examples

### Using Custom Errors:
```typescript
import { ValidationError, ApiError } from '@core/domain/entities';

if (!email.includes('@')) {
  throw new ValidationError('Invalid email format', 'email');
}

if (response.status === 404) {
  throw new NotFoundError('User', userId);
}
```

### Using HTTP Client:
```typescript
import { FetchHttpClient } from '@core/data/datasources';

const client = new FetchHttpClient({
  baseURL: 'https://api.example.com',
  headers: { 'Authorization': 'Bearer token' },
  timeout: 5000
});

const response = await client.get('/users');
const result = await client.post('/users', { name: 'John' });
```

### Using Logger:
```typescript
import { ConsoleLogger } from '@core/domain/usecases';

const logger = new ConsoleLogger('[QRIBAR]');
logger.info('Menu loaded', { items: 3 });
logger.warn('Price missing for item', itemId);
logger.error('Failed to fetch menu', error);
```

---

## Next Steps

### Immediate
- [ ] Refactor existing features to use core infrastructure
- [ ] Replace manual `fetch()` calls with `FetchHttpClient`
- [ ] Replace `console.error()` with `ConsoleLogger`

### Future Enhancements
- [ ] Add `AxiosHttpClient` implementation as alternative
- [ ] Add `FileLogger` for production logging
- [ ] Add `SentryLogger` for error tracking
- [ ] Add retry logic to `FetchHttpClient`
- [ ] Add request/response interceptors

---

## Versioning
- **Version:** Included in 0.3.0 (QRIBAR refactor)
- **CHANGELOG:** Updated with core infrastructure details

---

**Status:** ✅ Complete  
**Test Results:** 28/28 passing (100%)  
**Coverage:** Core infrastructure fully tested
