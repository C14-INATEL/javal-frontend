import axios from "axios";
import { clearAuthSession, getAuthToken } from "./auth";

/** Cliente HTTP compartilhado (infra). Chamadas por domínio ficam em `src/services/`. */
export const api = axios.create({
  // Dev: /api-backend + proxy Vite. Produção: VITE_API_BASE_URL no .env
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api-backend",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isPublicAuthRequest(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("/api/companies/login") ||
    url.includes("/api/companies/register")
  );
}

function isAuthPage(): boolean {
  const path = window.location.pathname;
  return path === "/login" || path === "/register";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url;
      if (!isPublicAuthRequest(requestUrl)) {
        clearAuthSession();
        if (!isAuthPage()) {
          window.location.assign("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);