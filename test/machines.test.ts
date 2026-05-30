import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildMachineCreateRequest,
  createMachine,
  listMachines,
  parseMachinesList,
  updateMachineStatus,
} from "../src/services/machines";
import { api } from "../src/lib/api";
import * as auth from "../src/lib/auth";

describe("buildMachineCreateRequest", () => {
  it("mapeia o payload do formulário para o corpo da API sem chamar rede", () => {
    const body = buildMachineCreateRequest({
      companyId: 7,
      nome: "  Torno CNC 01  ",
      tipo: "  CNC  ",
      capacidadePorHora: 120,
      status: "ATIVA",
    });

    expect(body).toEqual({
      companyId: 7,
      nome: "Torno CNC 01",
      tipo: "CNC",
      capacidadePorHora: 120,
      status: "ATIVA",
    });
  });
});

describe("parseMachinesList", () => {
  it("aceita array direto ou objeto paginado com content", () => {
    const machines = [
      {
        id: 1,
        nome: "Torno CNC 01",
        tipo: "CNC",
        capacidadePorHora: 120,
        status: "ATIVA" as const,
      },
    ];
    expect(parseMachinesList(machines)).toEqual(machines);
    expect(parseMachinesList({ content: machines })).toEqual(machines);
    expect(parseMachinesList({})).toEqual([]);
  });
});

describe("listMachines", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("busca máquinas na API e normaliza a resposta (mock)", async () => {
    const machines = [
      {
        id: 1,
        nome: "Torno CNC 01",
        tipo: "CNC",
        capacidadePorHora: 120,
        status: "ATIVA",
      },
    ];
    const getSpy = vi
      .spyOn(api, "get")
      .mockResolvedValueOnce({ data: machines });

    const result = await listMachines();

    expect(getSpy).toHaveBeenCalledWith("/api/maquinas");
    expect(result).toEqual(machines);
  });
});

describe("updateMachineStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia PATCH com status na query e retorna a máquina atualizada (mock)", async () => {
    const updated = {
      id: 1,
      nome: "Torno CNC",
      tipo: "Usinagem",
      capacidadePorHora: 50,
      status: "MANUTENCAO" as const,
    };
    const patchSpy = vi
      .spyOn(api, "patch")
      .mockResolvedValueOnce({ data: updated });

    const result = await updateMachineStatus(1, "MANUTENCAO");

    expect(patchSpy).toHaveBeenCalledWith(
      "/api/maquinas/1/status",
      null,
      { params: { status: "MANUTENCAO" } }
    );
    expect(result).toEqual(updated);
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
    vi.spyOn(auth, "getAuthCompany").mockReturnValue({
      companyId: 7,
      companyName: "ACME Ltda",
      email: "contato@acme.com",
    });
  });

  it("envia o payload mapeado para a API e retorna data da resposta (mock)", async () => {
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { id: 1, created: true } });

    const result = await createMachine(payload);

    expect(postSpy).toHaveBeenCalledWith("/api/maquinas", {
      companyId: 7,
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
