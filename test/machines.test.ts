import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildMachineCreateRequest,
  createMachine,
} from "../src/services/machines";
import { api } from "../src/lib/api";

describe("buildMachineCreateRequest", () => {
  it("mapeia o payload do formulário para o corpo da API sem chamar rede", () => {
    const body = buildMachineCreateRequest({
      nome: "  Torno CNC 01  ",
      tipo: "  CNC  ",
      capacidadePorHora: 120,
      status: "ATIVA",
    });

    expect(body).toEqual({
      nome: "Torno CNC 01",
      tipo: "CNC",
      capacidadePorHora: 120,
      status: "ATIVA",
    });
  });
});

describe("createMachine", () => {
  const payload = {
    nome: "Torno CNC 01",
    tipo: "CNC",
    capacidadePorHora: 120,
    status: "ATIVA" as const,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia o payload mapeado para a API e retorna data da resposta (mock)", async () => {
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { id: 1, created: true } });

    const result = await createMachine(payload);

    expect(postSpy).toHaveBeenCalledWith("/api/machines", {
      nome: "Torno CNC 01",
      tipo: "CNC",
      capacidadePorHora: 120,
      status: "ATIVA",
    });
    expect(result).toEqual({ id: 1, created: true });
  });

  it("propaga erro quando a chamada HTTP falha (mock)", async () => {
    const httpError = new Error("Falha de rede");
    vi.spyOn(api, "post").mockRejectedValueOnce(httpError);

    await expect(createMachine(payload)).rejects.toThrow("Falha de rede");
  });
});
