// envMode.ts
// Universal environment mode resolver for Vite browser environments.
// Use import.meta.env.MODE - the standard Vite way.

export function getEnvMode(): string {
  try {
    const mode = import.meta.env.MODE;
    if (mode) return mode;
  } catch {
    // import.meta.env not available (shouldn't happen in Vite)
  }
  return "development";
}
