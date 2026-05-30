import { api } from "../lib/api";

export type DashboardMaquinaRanking = {
  maquinaId: number;
  maquinaNome: string;
  ordensFinalizadas: number;
  unidadesProduzidas: number;
};

/** Resposta de `GET /api/dashboard` (métricas agregadas). */
export type Dashboard = {
  totalMaquinas: number;
  maquinasAtivas: number;
  maquinasInativas: number;
  maquinasEmManutencao: number;
  totalProdutos: number;
  totalOrdens: number;
  ordensPendentes: number;
  ordensEmProducao: number;
  ordensFinalizada: number;
  totalUnidadesProduzidas: number;
  totalUnidadesEmAberto: number;
  topMaquinas: DashboardMaquinaRanking[];
};

const DASHBOARD_PATH = "/api/dashboard";

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await api.get<Dashboard>(DASHBOARD_PATH);
  return {
    ...data,
    topMaquinas: Array.isArray(data.topMaquinas) ? data.topMaquinas : [],
  };
}
