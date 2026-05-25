import { api } from "../lib/api";

export type MachineStatus = "ATIVA" | "INATIVA" | "MANUTENCAO";

export type Machine = {
  id: number;
  nome: string;
  tipo: string;
  capacidadePorHora: number;
  status: MachineStatus;
};

export type CreateMachinePayload = {
  nome: string;
  tipo: string;
  capacidadePorHora: number;
  status: MachineStatus;
};

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
    nome: payload.nome.trim(),
    tipo: payload.tipo.trim(),
    capacidadePorHora: payload.capacidadePorHora,
    status: payload.status,
  };
}

export async function listMachines(): Promise<Machine[]> {
  const { data } = await api.get<unknown>("/api/machines");
  return parseMachinesList(data);
}

export async function createMachine(
  payload: CreateMachinePayload
): Promise<unknown> {
  const { data } = await api.post<unknown>(
    "/api/machines",
    buildMachineCreateRequest(payload)
  );
  return data;
}

export async function deleteMachine(id: number): Promise<void> {
  await api.delete(`/api/machines/${id}`);
}
