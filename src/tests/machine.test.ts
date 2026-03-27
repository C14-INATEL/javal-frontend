import { describe, it, expect } from "vitest";

// Simulação
type RegisterMachinePayload = {
  name: string;
  model: string;
  sector: string;
  serialNumber: string;
};

// Função existente
function toMachineRequest(payload: RegisterMachinePayload) {
  return {
    name: payload.name,
    model: payload.model,
    sector: payload.sector,
    serialNumber: payload.serialNumber,
  };
}

// Função de validação
function isMachineValid(payload: RegisterMachinePayload) {
  return payload.name.trim().length > 0 && payload.model.trim().length > 0;
}

describe("Máquinas - Testes unitários", () => {

  // Teste do mapper
  it("Deve mapear corretamente todos os campos", () => {
    const input: RegisterMachinePayload = {
      name: "Máquina Inatel",
      model: "XXxxaasa",
      sector: "Produção",
      serialNumber: "12345ABC",
    };

    const result = toMachineRequest(input);

    expect(result).toEqual({
      name: "Máquina Inatel",
      model: "XXxxaasa",
      sector: "Produção",
      serialNumber: "12345ABC",
    });
  });

  // Testes de validação
  // Sendo cada um feito para name e model

  it("Deve falhar se o nome da máquina estiver vazio", () => {
    const input: RegisterMachinePayload = {
      name: "",
      model: "Modelo X",
      sector: "Chernobyl",
      serialNumber: "123",
    };

    const result = isMachineValid(input);

    expect(result).toBe(false);
  });

  it("Deve falhar se o modelo estiver vazio", () => {
    const input: RegisterMachinePayload = {
      name: "Máquina A",
      model: "",
      sector: "Produção",
      serialNumber: "123",
    };

    const result = isMachineValid(input);

    expect(result).toBe(false);
  });

  // Teste de sucesso com dados válidos
  it("Deve permitir cadastro com dados válidos", () => {
    const input: RegisterMachinePayload = {
      name: "Máquina B",
      model: "Modelo Y",
      sector: "Logística",
      serialNumber: "999XYZ",
    };

    const result = isMachineValid(input);

    expect(result).toBe(true);
  });

});