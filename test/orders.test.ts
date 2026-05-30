import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildOrderCreateRequest,
  cancelOrder,
  createOrder,
  finishOrder,
  listOrders,
  parseOrdersList,
  startOrder,
} from "../src/services/orders";
import { api } from "../src/lib/api";

describe("buildOrderCreateRequest", () => {
  it("mapeia o payload para o corpo da API", () => {
    const body = buildOrderCreateRequest({
      produtoId: 1,
      maquinaId: 2,
      quantidade: 100,
    });
    expect(body).toEqual({
      produtoId: 1,
      maquinaId: 2,
      quantidade: 100,
    });
  });
});

describe("parseOrdersList", () => {
  it("aceita array direto ou objeto paginado com content", () => {
    const rows = [
      {
        id: 1,
        produtoId: 1,
        produtoNome: "Parafuso M8",
        maquinaId: 2,
        maquinaNome: "Torno CNC",
        quantidade: 100,
        status: "PENDENTE" as const,
        dataInicio: null,
        dataFim: null,
        companyId: 1,
      },
    ];
    expect(parseOrdersList(rows)).toEqual(rows);
    expect(parseOrdersList({ content: rows })).toEqual(rows);
    expect(parseOrdersList({})).toEqual([]);
  });
});

describe("listOrders", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("busca ordens na API e normaliza a resposta (mock)", async () => {
    const rows = [
      {
        id: 1,
        produtoId: 1,
        produtoNome: "P",
        maquinaId: 2,
        maquinaNome: "M",
        quantidade: 10,
        status: "PENDENTE" as const,
        dataInicio: null,
        dataFim: null,
        companyId: 1,
      },
    ];
    const getSpy = vi.spyOn(api, "get").mockResolvedValueOnce({ data: rows });
    const result = await listOrders();
    expect(getSpy).toHaveBeenCalledWith("/api/ordens");
    expect(result).toEqual(rows);
  });
});

describe("createOrder", () => {
  const payload = { produtoId: 1, maquinaId: 2, quantidade: 100 };
  const created = {
    id: 1,
    ...payload,
    produtoNome: "P",
    maquinaNome: "M",
    status: "PENDENTE" as const,
    dataInicio: null,
    dataFim: null,
    companyId: 1,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia o corpo esperado pela API (mock)", async () => {
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: created });
    const result = await createOrder(payload);
    expect(postSpy).toHaveBeenCalledWith("/api/ordens", {
      produtoId: 1,
      maquinaId: 2,
      quantidade: 100,
    });
    expect(result).toEqual(created);
  });
});

describe("startOrder / finishOrder / cancelOrder", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("POST iniciar sem corpo explícito (mock)", async () => {
    const updated = {
      id: 5,
      produtoId: 1,
      produtoNome: "P",
      maquinaId: 2,
      maquinaNome: "M",
      quantidade: 10,
      status: "EM_PRODUCAO" as const,
      dataInicio: "2026-01-01T10:00:00Z",
      dataFim: null,
      companyId: 1,
    };
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: updated });
    await startOrder(5);
    expect(postSpy).toHaveBeenCalledWith("/api/ordens/5/iniciar");
  });

  it("POST finalizar sem corpo explícito (mock)", async () => {
    const updated = {
      id: 5,
      produtoId: 1,
      produtoNome: "P",
      maquinaId: 2,
      maquinaNome: "M",
      quantidade: 10,
      status: "FINALIZADA" as const,
      dataInicio: "2026-01-01T10:00:00Z",
      dataFim: "2026-01-01T12:00:00Z",
      companyId: 1,
    };
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: updated });
    await finishOrder(5);
    expect(postSpy).toHaveBeenCalledWith("/api/ordens/5/finalizar");
  });

  it("POST cancelar sem corpo explícito (mock)", async () => {
    const updated = {
      id: 5,
      produtoId: 1,
      produtoNome: "P",
      maquinaId: 2,
      maquinaNome: "M",
      quantidade: 10,
      status: "CANCELADA" as const,
      dataInicio: null,
      dataFim: null,
      companyId: 1,
    };
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: updated });
    await cancelOrder(5);
    expect(postSpy).toHaveBeenCalledWith("/api/ordens/5/cancelar");
  });
});
