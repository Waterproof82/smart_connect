// Solo debe ser importado en código frontend (Vite/React), nunca en Node/Jest
export function getViteEnvVar(key: string): string {
  if (typeof import.meta === 'object' && import.meta.env && key in import.meta.env) {
    return import.meta.env[key];
  }
  throw new Error(`Vite env variable ${key} not found`);
}
