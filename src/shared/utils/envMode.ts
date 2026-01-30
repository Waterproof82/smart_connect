// envMode.ts
// Universal environment mode resolver for Node, Jest, Vite, etc.

export function getEnvMode(): string {
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  // Fallback for browser/Vite
  if (globalThis.window !== undefined && (globalThis as any).VITE_MODE) {
    return (globalThis as any).VITE_MODE;
  }
  return 'production'; // Default to production if unknown
}
