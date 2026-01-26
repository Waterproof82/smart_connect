import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
          '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
          '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
          '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
          '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
        }
      }
    };
});
