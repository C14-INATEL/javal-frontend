import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import type { InlineConfig } from "vitest";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  server: {
    proxy: {
      // Repassa o path completo (ex.: /api-backend/maquinas → mesmo path no Tomcat)
      "/api-backend": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
} as UserConfig & { test: InlineConfig });
