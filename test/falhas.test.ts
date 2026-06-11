import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildFalhaCreateRequest,
  createFalha,
  listFalhas,
  listFalhasByMaquina,
  parseFalhasList,
  resolveFalha,
} from "../src/services/falhas";
import { api } from "../src/lib/api";

describe("buildFalhaCreateRequest", () => {
  it("monta o JSON esperado pelo POST /api/falhas (sem HTTP)", () => {
    const body = buildFalhaCreateRequest({
      maquinaId: 3,
      descricao: "  Vazamento no sistema hidráulico  ",
      severidade: "ALTA",
    });
    expect(body).toEqual({
      maquinaId: 3,
      descricao: "Vazamento no sistema hidráulico",
      severidade: "ALTA",
    });
  });
});

describe("parseFalhasList", () => {
  it("aceita array direto ou objeto paginado com content", () => {
    const falhas = [
      {
        id: 1,
        descricao: "Teste",
        severidade: "MEDIA" as const,
        status: "ABERTA" as const,
        dataAbertura: "2026-01-01T10:00:00Z",
        dataResolucao: null,
        maquinaId: 2,
        maquinaNome: "Torno A",
      },
    ];
    expect(parseFalhasList(falhas)).toEqual(falhas);
    expect(parseFalhasList({ content: falhas })).toEqual(falhas);
    expect(parseFalhasList({})).toEqual([]);
  });
});

describe("listFalhas", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/falhas e normaliza (mock)", async () => {
    const falhas = [
      {
        id: 1,
        descricao: "x",
        severidade: "BAIXA" as const,
        status: "ABERTA" as const,
        dataAbertura: "2026-01-01T10:00:00Z",
        dataResolucao: null,
        maquinaId: 1,
        maquinaNome: "M1",
      },
    ];
    const getSpy = vi
      .spyOn(api, "get")
      .mockResolvedValueOnce({ data: falhas });

    const result = await listFalhas();

    expect(getSpy).toHaveBeenCalledWith("/api/falhas");
    expect(result).toEqual(falhas);
  });
});

describe("listFalhasByMaquina", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/falhas/maquina/:id (mock)", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValueOnce({ data: [] });

    await listFalhasByMaquina(5);

    expect(getSpy).toHaveBeenCalledWith("/api/falhas/maquina/5");
  });
});

describe("createFalha", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("POST /api/falhas com corpo mapeado (mock)", async () => {
    const created = {
      id: 9,
      descricao: "Falha",
      severidade: "CRITICA" as const,
      status: "ABERTA" as const,
      dataAbertura: "2026-01-02T12:00:00Z",
      dataResolucao: null,
      maquinaId: 1,
      maquinaNome: "M1",
    };
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: created });

    const result = await createFalha({
      maquinaId: 1,
      descricao: "Falha",
      severidade: "CRITICA",
    });

    expect(postSpy).toHaveBeenCalledWith("/api/falhas", {
      maquinaId: 1,
      descricao: "Falha",
      severidade: "CRITICA",
    });
    expect(result).toEqual(created);
  });
});

describe("resolveFalha", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("PATCH /api/falhas/:id/resolver sem body nem Content-Type JSON (mock)", async () => {
    const resolved = {
      id: 7,
      descricao: "x",
      severidade: "MEDIA" as const,
      status: "RESOLVIDA" as const,
      dataAbertura: "2026-01-01T10:00:00Z",
      dataResolucao: "2026-01-02T15:00:00Z",
      maquinaId: 1,
      maquinaNome: "M1",
    };
    const patchSpy = vi
      .spyOn(api, "patch")
      .mockResolvedValueOnce({ data: resolved });

    const result = await resolveFalha(7);

    expect(patchSpy).toHaveBeenCalledWith(
      "/api/falhas/7/resolver",
      undefined,
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": false }),
      })
    );
    expect(result).toEqual(resolved);
  });
});
