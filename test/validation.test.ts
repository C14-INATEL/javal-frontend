import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  validateRequiredFields,
} from "../src/lib/validation";

describe("isValidEmail", () => {
  it("retorna true para entrada válida", () => {
    expect(isValidEmail("contato@empresa.com.br")).toBe(true);
    expect(isValidEmail("  user@dominio.co  ")).toBe(true);
  });

  it("retorna false para entrada inválida", () => {
    expect(isValidEmail("sem-arroba")).toBe(false);
    expect(isValidEmail("@nodominio.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("retorna true quando a senha atinge o número mínimo de caracteres", () => {
    expect(isValidPassword("abcdefgh", 8)).toBe(true);
    expect(isValidPassword("12345678", 8)).toBe(true);
  });

  it("retorna false quando a senha é mais curta que o mínimo", () => {
    expect(isValidPassword("curta", 8)).toBe(false);
    expect(isValidPassword("1234567", 8)).toBe(false);
  });
});

describe("validateRequiredFields", () => {
  it("retorna valid true quando todos os campos obrigatórios estão preenchidos", () => {
    expect(
      validateRequiredFields(
        { nome: "ACME", email: "a@b.co" },
        ["nome", "email"]
      )
    ).toEqual({ valid: true });
  });

  it("retorna valid false e lista de campos faltando quando algum está vazio", () => {
    expect(
      validateRequiredFields(
        { nome: "", email: "a@b.co" },
        ["nome", "email"]
      )
    ).toEqual({ valid: false, missing: ["nome"] });

    expect(
      validateRequiredFields(
        { nome: "   ", email: "" },
        ["nome", "email"]
      )
    ).toEqual({ valid: false, missing: ["nome", "email"] });
  });
});
