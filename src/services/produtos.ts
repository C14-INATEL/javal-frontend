import { api } from "../lib/api";

export type Produto = {
  id: number;
  nome: string;
  tempoProducaoUnitario: number;
  companyId: number;
};

export type CreateProdutoPayload = {
  nome: string;
  tempoProducaoUnitario: number;
};

/** Normaliza resposta da API (array direto ou página com `content`). */
export function parseProdutosList(data: unknown): Produto[] {
  if (Array.isArray(data)) return data as Produto[];
  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: Produto[] }).content;
  }
  return [];
}

/** Corpo JSON do POST (função pura; testável sem HTTP). */
export function buildProdutoCreateRequest(payload: CreateProdutoPayload) {
  return {
    nome: payload.nome.trim(),
    tempoProducaoUnitario: payload.tempoProducaoUnitario,
  };
}

const PRODUTOS_PATH = "/api/produtos";

export async function listProdutos(): Promise<Produto[]> {
  const { data } = await api.get<unknown>(PRODUTOS_PATH);
  return parseProdutosList(data);
}

export async function createProduto(
  payload: CreateProdutoPayload
): Promise<unknown> {
  const { data } = await api.post<unknown>(
    PRODUTOS_PATH,
    buildProdutoCreateRequest(payload)
  );
  return data;
}

export async function deleteProduto(id: number): Promise<void> {
  await api.delete(`${PRODUTOS_PATH}/${id}`);
}
