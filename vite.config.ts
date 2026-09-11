// Vite configuration for TanStack Start with React and Tailwind CSS
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    middlewareMode: false,
  },
  build: {
    rollupOptions: {
      input: {
        app: "/src/start.ts",
      },
    },
  },
});
