import { describe, expect, it } from "vitest";
import { buildCompanyRegisterRequest } from "../src/services/companies";

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
