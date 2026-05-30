import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildProdutoCreateRequest,
  createProduto,
  listProdutos,
  parseProdutosList,
  deleteProduto,
} from "../src/services/produtos";
import { api } from "../src/lib/api";

describe("buildProdutoCreateRequest", () => {
  it("mapeia o payload para o corpo da API sem chamar rede", () => {
    const body = buildProdutoCreateRequest({
      nome: "  Parafuso M8  ",
      tempoProducaoUnitario: 15,
    });

    expect(body).toEqual({
      nome: "Parafuso M8",
      tempoProducaoUnitario: 15,
    });
  });
});

describe("parseProdutosList", () => {
  it("aceita array direto ou objeto paginado com content", () => {
    const produtos = [
      {
        id: 1,
        nome: "Parafuso M8",
        tempoProducaoUnitario: 15,
        companyId: 1,
      },
    ];
    expect(parseProdutosList(produtos)).toEqual(produtos);
    expect(parseProdutosList({ content: produtos })).toEqual(produtos);
    expect(parseProdutosList({})).toEqual([]);
  });
});

describe("listProdutos", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("busca produtos na API e normaliza a resposta (mock)", async () => {
    const produtos = [
      {
        id: 1,
        nome: "Parafuso M8",
        tempoProducaoUnitario: 15,
        companyId: 1,
      },
    ];
    const getSpy = vi
      .spyOn(api, "get")
      .mockResolvedValueOnce({ data: produtos });

    const result = await listProdutos();

    expect(getSpy).toHaveBeenCalledWith("/api/produtos");
    expect(result).toEqual(produtos);
  });
});

describe("createProduto", () => {
  const payload = {
    nome: "Parafuso M8",
    tempoProducaoUnitario: 15,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia o corpo esperado pela API (mock)", async () => {
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({
        data: { id: 1, ...payload, companyId: 7 },
      });

    const result = await createProduto(payload);

    expect(postSpy).toHaveBeenCalledWith("/api/produtos", {
      nome: "Parafuso M8",
      tempoProducaoUnitario: 15,
    });
    expect(result).toEqual({ id: 1, ...payload, companyId: 7 });
  });

  it("propaga erro quando a chamada HTTP falha (mock)", async () => {
    const httpError = new Error("Falha de rede");
    vi.spyOn(api, "post").mockRejectedValueOnce(httpError);

    await expect(createProduto(payload)).rejects.toThrow("Falha de rede");
  });
});

describe("deleteProduto", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("chama DELETE no id informado (mock)", async () => {
    const deleteSpy = vi.spyOn(api, "delete").mockResolvedValueOnce({});

    await deleteProduto(42);

    expect(deleteSpy).toHaveBeenCalledWith("/api/produtos/42");
  });
});
