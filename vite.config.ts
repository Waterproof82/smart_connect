/// <reference types="vitest" />
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { markdownNegotiationPlugin } from "./vite-plugin-md-negotiation";

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests.ts",
    include: [
      "src/shared/presentation/components/**/*.test.tsx",
      "src/features/**/*.test.tsx",
    ],
  },
  plugins: [react(), markdownNegotiationPlugin()],

  server: {
    port: 5173,
    host: "0.0.0.0",
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      Link: '</.well-known/api-catalog>; rel="api-catalog", </llms.txt>; rel="ai-readable"',
      "Content-Signal": "ai-train=no, search=yes, ai-input=no",
    },
  },

  // ── SSR build (mode=ssr) ──────────────────────────────
  // Produces dist/server/entry-server.js for the prerender script
  ...(mode === "ssr"
    ? {
        build: {
          ssr: true,
          ssrEmitAssets: false,
          rollupOptions: {
            input: "src/entry-server.tsx",
            output: { format: "esm" },
          },
          outDir: "dist/server",
        },
      }
    : {
        // ── Client build ────────────────────────────────
        // Entry is resolved from index.html → /src/entry-client.tsx
        build: {
          target: "esnext",
          outDir: "dist",
          rollupOptions: {
            output: {
              manualChunks: (id: string) => {
                if (id.includes("node_modules")) {
                  if (id.includes("@supabase")) return "vendor-supabase";
                  if (id.includes("react") || id.includes("scheduler"))
                    return "vendor-react";
                  if (id.includes("lucide-react")) return "vendor-lucide";
                  if (id.includes("recharts")) return "vendor-recharts";
                }
              },
            },
          },
        },
      }),

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@core": fileURLToPath(new URL("./src/core", import.meta.url)),
      "@features": fileURLToPath(new URL("./src/features", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "react-helmet-async"],
  },

  ssr: {
    noExternal: ["@supabase/supabase-js"],
  },
}));
