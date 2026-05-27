import { api } from "../lib/api";
import type { AuthSession } from "../lib/auth";
import { formatCnpj } from "../lib/validation";

export type LoginCompanyPayload = {
  email: string;
  password: string;
};

export type RegisterCompanyPayload = {
  companyName: string;
  cnpj: string;
  email: string;
  phone: string;
  responsible: string;
  password: string;
};

/** Mapeia o formulário para o JSON esperado pelo endpoint (função pura; testável sem HTTP). */
export function buildCompanyRegisterRequest(
  payload: RegisterCompanyPayload
) {
  return {
    name: payload.companyName,
    cnpj: formatCnpj(payload.cnpj),
    email: payload.email,
    phone: payload.phone.trim(),
    responsibleName: payload.responsible,
    password: payload.password,
  };
}

export async function registerCompany(
  payload: RegisterCompanyPayload
): Promise<unknown> {
  const { data } = await api.post<unknown>(
    "/api/companies/register",
    buildCompanyRegisterRequest(payload)
  );
  return data;
}

export async function loginCompany(
  payload: LoginCompanyPayload
): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>("/api/companies/login", {
    email: payload.email.trim(),
    password: payload.password,
  });
  return data;
}
