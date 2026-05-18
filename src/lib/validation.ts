/** Comprimento mínimo padrão para senha (quando `minLength` não é informado). */
export const DEFAULT_MIN_PASSWORD_LENGTH = 8;

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function isValidEmail(email: string): boolean {
  const t = email.trim();
  if (!t) return false;
  return EMAIL_RE.test(t);
}

export function isValidPassword(
  password: string,
  minLength: number = DEFAULT_MIN_PASSWORD_LENGTH
): boolean {
  return password.length >= minLength;
}

/** Remove caracteres não numéricos do CNPJ. */
export function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/** Formata CNPJ como 00.000.000/0000-00 (a partir de dígitos ou valor já mascarado). */
export function formatCnpj(cnpj: string): string {
  const digits = normalizeCnpj(cnpj);
  if (digits.length !== 14) return cnpj.trim();
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/** Valida CNPJ brasileiro (14 dígitos + dígitos verificadores). */
export function isValidCnpj(cnpj: string): boolean {
  const digits = normalizeCnpj(cnpj);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, d, i) => acc + Number(d) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(digits.slice(0, 12), w1);
  const d2 = calcDigit(digits.slice(0, 12) + d1, w2);

  return digits.endsWith(`${d1}${d2}`);
}

export type RequiredFieldsResult =
  | { valid: true }
  | { valid: false; missing: string[] };

export function validateRequiredFields(
  values: Record<string, string>,
  requiredKeys: readonly string[]
): RequiredFieldsResult {
  const missing: string[] = [];
  for (const key of requiredKeys) {
    const v = values[key];
    if (v === undefined || v.trim() === "") {
      missing.push(key);
    }
  }
  if (missing.length === 0) return { valid: true };
  return { valid: false, missing };
}
