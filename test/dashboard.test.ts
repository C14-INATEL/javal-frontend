import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboard } from "../src/services/dashboard";
import { api } from "../src/lib/api";

describe("getDashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/dashboard e normaliza topMaquinas (mock)", async () => {
    const payload = {
      totalMaquinas: 3,
      maquinasAtivas: 2,
      maquinasInativas: 0,
      maquinasEmManutencao: 1,
      totalProdutos: 10,
      totalOrdens: 4,
      ordensPendentes: 1,
      ordensEmProducao: 1,
      ordensFinalizada: 2,
      totalUnidadesProduzidas: 500,
      totalUnidadesEmAberto: 120,
      topMaquinas: [
        {
          maquinaId: 1,
          maquinaNome: "Torno A",
          ordensFinalizadas: 5,
          unidadesProduzidas: 200,
        },
      ],
    };
    const getSpy = vi
      .spyOn(api, "get")
      .mockResolvedValueOnce({ data: payload });
    const result = await getDashboard();
    expect(getSpy).toHaveBeenCalledWith("/api/dashboard");
    expect(result).toEqual(payload);
  });

  it("garante topMaquinas array quando a API omite (mock)", async () => {
    const payload = {
      totalMaquinas: 0,
      maquinasAtivas: 0,
      maquinasInativas: 0,
      maquinasEmManutencao: 0,
      totalProdutos: 0,
      totalOrdens: 0,
      ordensPendentes: 0,
      ordensEmProducao: 0,
      ordensFinalizada: 0,
      totalUnidadesProduzidas: 0,
      totalUnidadesEmAberto: 0,
    };
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: payload });
    const result = await getDashboard();
    expect(result.topMaquinas).toEqual([]);
  });
});
