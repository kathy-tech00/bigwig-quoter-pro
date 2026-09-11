// Vite configuration for TanStack Start with React and Tailwind CSS
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackBuildExtensions } from "@tanstack/react-start/config";

export default defineConfig(
  tanstackBuildExtensions({
    react: {},
    tsconfigPaths: {},
  })
);
