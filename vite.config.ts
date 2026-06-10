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
      // Spring: `/api/...` (ex. `/api/companies/login`). Repassa para o Tomcat em 8080.
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
} as UserConfig & { test: InlineConfig });
