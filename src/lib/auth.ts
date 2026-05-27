const TOKEN_KEY = "authToken";
const COMPANY_ID_KEY = "companyId";
const COMPANY_NAME_KEY = "companyName";
const COMPANY_EMAIL_KEY = "companyEmail";

export type AuthSession = {
  token: string;
  companyId: number;
  companyName: string;
  email: string;
};

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(COMPANY_ID_KEY, String(session.companyId));
  localStorage.setItem(COMPANY_NAME_KEY, session.companyName);
  localStorage.setItem(COMPANY_EMAIL_KEY, session.email);
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(COMPANY_ID_KEY);
  localStorage.removeItem(COMPANY_NAME_KEY);
  localStorage.removeItem(COMPANY_EMAIL_KEY);
}

export function getAuthToken(): string | null {
  const stored = localStorage.getItem(TOKEN_KEY)?.trim();
  if (stored) return stored;
  const fromEnv = String(import.meta.env.VITE_AUTH_TOKEN ?? "").trim();
  return fromEnv || null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function getAuthCompany(): Pick<
  AuthSession,
  "companyId" | "companyName" | "email"
> | null {
  const companyId = localStorage.getItem(COMPANY_ID_KEY);
  const companyName = localStorage.getItem(COMPANY_NAME_KEY);
  const email = localStorage.getItem(COMPANY_EMAIL_KEY);
  if (!companyId || !companyName || !email) return null;
  const id = Number(companyId);
  if (!Number.isFinite(id)) return null;
  return { companyId: id, companyName, email };
}
