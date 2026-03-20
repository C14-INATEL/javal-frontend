import { api } from "../lib/api";

export type RegisterMachinePayload = {
  name: string;
  model: string;
  sector: string;
  serialNumber: string;
};

// Pensar ainda nos dados para registro 
function toMachineRequest(payload: RegisterMachinePayload) {
  return {
    name: payload.name,
    model: payload.model,
    sector: payload.sector,
    serialNumber: payload.serialNumber,
  };
}

export async function registerMachine(
  payload: RegisterMachinePayload
): Promise<unknown> {
  const { data } = await api.post<unknown>(
    "/api/machines/register",
    toMachineRequest(payload)
  );

  return data;
}