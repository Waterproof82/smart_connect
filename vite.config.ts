import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true
          }
        }
      },
      plugins: [react()],

      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                if (id.includes('@supabase')) {
                  return 'vendor-supabase';
                }
                if (id.includes('@google/generativeai')) {
                  return 'vendor-ai';
                }
                if (id.includes('react') || id.includes('scheduler')) {
                  return 'vendor-react';
                }
              }
              if (id.includes('features/chatbot')) {
                return 'chatbot';
              }
              if (id.includes('features/landing')) {
                return 'landing';
              }
            }
          }
        }
      },

      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
          '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
          '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
          '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
        }
      }
    };
});
