// envMode.ts
// Universal environment mode resolver for Node, Jest, Vite, etc.

export function getEnvMode(): string {
  // Vite environment (browser) - check import.meta.env first
  const viteMode = import.meta?.env?.MODE;
  if (viteMode) {
    return viteMode;
  }
  
  // Node.js environment (scripts, tests)
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  
  // Fallback to development for local dev (safer default than production)
  return 'development';
}
