import { api } from "../lib/api";

/** Status da ordem na API (enum backend). */
export type StatusOrdem =
  | "PENDENTE"
  | "EM_PRODUCAO"
  | "FINALIZADA"
  | "CANCELADA";

export type Order = {
  id: number;
  produtoId: number;
  produtoNome: string;
  maquinaId: number;
  maquinaNome: string;
  quantidade: number;
  status: StatusOrdem;
  dataInicio: string | null;
  dataFim: string | null;
  companyId: number;
};

export type CreateOrderPayload = {
  produtoId: number;
  maquinaId: number;
  quantidade: number;
};

/** Normaliza resposta da API (array direto ou página com `content`). */
export function parseOrdersList(data: unknown): Order[] {
  if (Array.isArray(data)) return data as Order[];
  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: Order[] }).content;
  }
  return [];
}

export function buildOrderCreateRequest(payload: CreateOrderPayload) {
  return {
    produtoId: payload.produtoId,
    maquinaId: payload.maquinaId,
    quantidade: payload.quantidade,
  };
}

const ORDERS_API_PATH = "/api/ordens";

export async function listOrders(): Promise<Order[]> {
  const { data } = await api.get<unknown>(ORDERS_API_PATH);
  return parseOrdersList(data);
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<Order>(
    ORDERS_API_PATH,
    buildOrderCreateRequest(payload)
  );
  return data;
}

export async function startOrder(id: number): Promise<Order> {
  const { data } = await api.post<Order>(`${ORDERS_API_PATH}/${id}/iniciar`);
  return data;
}

export async function finishOrder(id: number): Promise<Order> {
  const { data } = await api.post<Order>(`${ORDERS_API_PATH}/${id}/finalizar`);
  return data;
}

/** POST sem corpo — Bearer via interceptor. Ajuste o path se o backend usar outro sufixo. */
export async function cancelOrder(id: number): Promise<Order> {
  const { data } = await api.post<Order>(`${ORDERS_API_PATH}/${id}/cancelar`);
  return data;
}
