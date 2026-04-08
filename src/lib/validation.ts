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
