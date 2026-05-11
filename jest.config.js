export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    dompurify: "<rootDir>/tests/__mocks__/dompurify.ts",
    uuid: "<rootDir>/tests/__mocks__/uuid.ts",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(@exodus/bytes)/)"],
  testMatch: ["**/tests/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.test.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  verbose: true,
  testTimeout: 30000, // 30s for API calls
  globals: {
    "import.meta": {
      env: {
        VITE_SUPABASE_URL:
          process.env.VITE_SUPABASE_URL || "https://test.supabase.co",
        VITE_SUPABASE_ANON_KEY:
          process.env.VITE_SUPABASE_ANON_KEY || "test-anon-key",
        VITE_GEMINI_API_KEY:
          process.env.VITE_GEMINI_API_KEY || "test-gemini-key",
        MODE: "test",
        DEV: false,
        PROD: false,
      },
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
};
