import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildCompanyRegisterRequest } from "../src/services/companies";
import { registerCompany } from "../src/services/companies";
import { api } from "../src/lib/api";

describe("buildCompanyRegisterRequest", () => {
  it("mapeia o payload do formulário para o corpo da API sem chamar rede", () => {
    const body = buildCompanyRegisterRequest({
      companyName: "ACME Ltda",
      email: "contato@acme.com",
      phone: "  11 98888-7777  ",
      responsible: "Maria Silva",
      password: "senha-segura",
    });

    expect(body).toEqual({
      name: "ACME Ltda",
      email: "contato@acme.com",
      phone: "11 98888-7777",
      responsibleName: "Maria Silva",
      password: "senha-segura",
    });
  });
});

describe("registerCompany", () => {
  const payload = {
    companyName: "ACME Ltda",
    email: "contato@acme.com",
    phone: " 11 98888-7777 ",
    responsible: "Maria Silva",
    password: "senha-segura",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia o payload mapeado para a API e retorna data da resposta (mock)", async () => {
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce({ data: { id: 1, created: true } });

    const result = await registerCompany(payload);

    expect(postSpy).toHaveBeenCalledWith("/api/companies/register", {
      name: "ACME Ltda",
      email: "contato@acme.com",
      phone: "11 98888-7777",
      responsibleName: "Maria Silva",
      password: "senha-segura",
    });
    expect(result).toEqual({ id: 1, created: true });
  });

  it("propaga erro quando a chamada HTTP falha (mock)", async () => {
    const httpError = new Error("Falha de rede");
    vi.spyOn(api, "post").mockRejectedValueOnce(httpError);

    await expect(registerCompany(payload)).rejects.toThrow("Falha de rede");
  });
});
