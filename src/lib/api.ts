import axios from "axios";

/** Cliente HTTP compartilhado (infra). Chamadas por domínio ficam em `src/services/`. */
export const api = axios.create({
  // Dev: vazio + proxy Vite. Produção: VITE_API_BASE_URL no .env
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});