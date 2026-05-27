import { api } from "../lib/api";
import { getAuthCompany } from "../lib/auth";

export type MachineStatus = "ATIVA" | "INATIVA" | "MANUTENCAO";

export type Machine = {
  id: number;
  nome: string;
  tipo: string;
  capacidadePorHora: number;
  status: MachineStatus;
};

export type CreateMachinePayload = {
  companyId: number;
  nome: string;
  tipo: string;
  capacidadePorHora: number;
  status: MachineStatus;
};

export type CreateMachineFormPayload = Omit<CreateMachinePayload, "companyId">;

export const MACHINE_STATUS_OPTIONS: {
  value: MachineStatus;
  label: string;
}[] = [
  { value: "ATIVA", label: "Ativa" },
  { value: "INATIVA", label: "Inativa" },
  { value: "MANUTENCAO", label: "Manutenção" },
];

const STATUS_LABELS: Record<MachineStatus, string> = {
  ATIVA: "Ativa",
  INATIVA: "Inativa",
  MANUTENCAO: "Manutenção",
};

export function getMachineStatusLabel(status: MachineStatus): string {
  return STATUS_LABELS[status];
}

/** Normaliza resposta da API (array direto ou página com `content`). */
export function parseMachinesList(data: unknown): Machine[] {
  if (Array.isArray(data)) return data as Machine[];
  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: Machine[] }).content;
  }
  return [];
}

/** Mapeia o formulário para o JSON esperado pelo endpoint (função pura; testável sem HTTP). */
export function buildMachineCreateRequest(payload: CreateMachinePayload) {
  return {
    companyId: payload.companyId,
    nome: payload.nome.trim(),
    tipo: payload.tipo.trim(),
    capacidadePorHora: payload.capacidadePorHora,
    status: payload.status,
  };
}

/** Path relativo ao `baseURL` (dev: /api-backend → GET …/api-backend/api/maquinas). */
const MAQUINAS_PATH = "/api/maquinas";

export async function listMachines(): Promise<Machine[]> {
  const { data } = await api.get<unknown>(MAQUINAS_PATH);
  return parseMachinesList(data);
}

export async function createMachine(
  payload: CreateMachineFormPayload
): Promise<unknown> {
  const company = getAuthCompany();
  if (!company) {
    throw new Error("Sessão inválida. Faça login novamente.");
  }

  const { data } = await api.post<unknown>(
    MAQUINAS_PATH,
    buildMachineCreateRequest({
      ...payload,
      companyId: company.companyId,
    })
  );
  return data;
}

export async function deleteMachine(id: number): Promise<void> {
  await api.delete(`${MAQUINAS_PATH}/${id}`);
}
