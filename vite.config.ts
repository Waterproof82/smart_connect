import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

const compressionPlugin = compression({
  algorithm: 'gzip',
  ext: '.gz',
  threshold: 10240
});

export default defineConfig({
  plugins: [
    react(),
    compressionPlugin
  ],
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
  build: {
    minify: 'terser',
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('zod')) {
              return 'vendor-zod';
            }
          }
          if (id.includes('features/chatbot')) {
            return 'chatbot';
          }
          if (id.includes('features/landing')) {
            return 'landing';
          }
          if (id.includes('features/qribar')) {
            return 'qribar';
          }
        }
      }
    },
    emptyOutDir: true,
    chunkSizeWarningLimit: 500
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
});
