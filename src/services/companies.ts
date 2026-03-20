import { api } from "../lib/api";

export type RegisterCompanyPayload = {
  companyName: string;
  email: string;
  phone: string;
  responsible: string;
  password: string;
};

function toCompanyRegisterRequest(payload: RegisterCompanyPayload) {
  return {
    name: payload.companyName,
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
    toCompanyRegisterRequest(payload)
  );
  return data;
}
