import axios from "axios";

/** Cliente HTTP compartilhado (infra). Chamadas por domínio ficam em `src/services/`. */
export const api = axios.create({
  // Dev: /api-backend + proxy Vite. Produção: VITE_API_BASE_URL no .env
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api-backend",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("authToken")?.trim();
  const fromEnv = String(import.meta.env.VITE_AUTH_TOKEN ?? "").trim();
  const token = stored || fromEnv;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});