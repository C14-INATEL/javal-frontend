import { api } from "../lib/api";

export type FalhaSeveridade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type FalhaStatus = "ABERTA" | "RESOLVIDA";

export type FalhaMaquinaResponse = {
  id: number;
  descricao: string;
  severidade: FalhaSeveridade;
  status: FalhaStatus;
  dataAbertura: string;
  dataResolucao: string | null;
  maquinaId: number;
  maquinaNome: string;
  companyId?: number;
};

export type CreateFalhaPayload = {
  maquinaId: number;
  descricao: string;
  severidade: FalhaSeveridade;
};

export const FALHA_SEVERIDADE_OPTIONS: {
  value: FalhaSeveridade;
  label: string;
}[] = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Média" },
  { value: "ALTA", label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
];

const SEVERIDADE_LABELS: Record<FalhaSeveridade, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export function getFalhaSeveridadeLabel(s: FalhaSeveridade): string {
  return SEVERIDADE_LABELS[s];
}

const STATUS_LABELS: Record<FalhaStatus, string> = {
  ABERTA: "Aberta",
  RESOLVIDA: "Resolvida",
};

export function getFalhaStatusLabel(status: FalhaStatus): string {
  return STATUS_LABELS[status];
}

/** Normaliza resposta da API (array direto ou página com `content`). */
export function parseFalhasList(data: unknown): FalhaMaquinaResponse[] {
  if (Array.isArray(data)) return data as FalhaMaquinaResponse[];
  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: FalhaMaquinaResponse[] }).content;
  }
  return [];
}

/** Corpo JSON do POST /api/falhas (função pura; testável sem HTTP). */
export function buildFalhaCreateRequest(payload: CreateFalhaPayload) {
  return {
    maquinaId: payload.maquinaId,
    descricao: payload.descricao.trim(),
    severidade: payload.severidade,
  };
}

const FALHAS_PATH = "/api/falhas";

export async function listFalhas(): Promise<FalhaMaquinaResponse[]> {
  const { data } = await api.get<unknown>(FALHAS_PATH);
  return parseFalhasList(data);
}

export async function listFalhasByMaquina(
  maquinaId: number
): Promise<FalhaMaquinaResponse[]> {
  const { data } = await api.get<unknown>(
    `${FALHAS_PATH}/maquina/${maquinaId}`
  );
  return parseFalhasList(data);
}

export async function createFalha(
  payload: CreateFalhaPayload
): Promise<FalhaMaquinaResponse> {
  const { data } = await api.post<FalhaMaquinaResponse>(
    FALHAS_PATH,
    buildFalhaCreateRequest(payload)
  );
  return data;
}

export async function resolveFalha(id: number): Promise<void> {
  await api.patch(`${FALHAS_PATH}/${id}/resolver`, null);
}
