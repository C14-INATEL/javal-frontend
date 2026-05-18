import { api } from "../lib/api";

export type MachineStatus = "ATIVA" | "INATIVA" | "MANUTENCAO";

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

/** Mapeia o formulário para o JSON esperado pelo endpoint (função pura; testável sem HTTP). */
export function buildMachineCreateRequest(payload: CreateMachinePayload) {
  return {
    nome: payload.nome.trim(),
    tipo: payload.tipo.trim(),
    capacidadePorHora: payload.capacidadePorHora,
    status: payload.status,
  };
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
