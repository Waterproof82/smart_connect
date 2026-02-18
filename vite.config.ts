import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          // Proxy /api/* al servidor de funciones en desarrollo
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true
          }
        }
      },
      plugins: [react()],

      // Code splitting configuration
      build: {
        rollupOptions: {
          output: {
            // Manual chunks para dividir vendors y reducir bundle principal
            manualChunks: {
              // React core - se carga una sola vez
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
              // Supabase client
              'vendor-supabase': ['@supabase/supabase-js'],
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
