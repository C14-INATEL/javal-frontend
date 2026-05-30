import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAuthSession,
  getAuthCompany,
  getAuthToken,
  isAuthenticated,
  saveAuthSession,
} from "../src/lib/auth";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
  };
}

describe("auth session", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_AUTH_TOKEN", "");
    vi.stubGlobal("localStorage", createStorage());
  });

  it("persiste e recupera token e dados da empresa", () => {
    saveAuthSession({
      token: "jwt-xyz",
      companyId: 42,
      companyName: "Indústria Beta",
      email: "beta@empresa.com",
    });

    expect(getAuthToken()).toBe("jwt-xyz");
    expect(isAuthenticated()).toBe(true);
    expect(getAuthCompany()).toEqual({
      companyId: 42,
      companyName: "Indústria Beta",
      email: "beta@empresa.com",
    });
  });

  it("limpa a sessão ao fazer logout", () => {
    saveAuthSession({
      token: "jwt-xyz",
      companyId: 1,
      companyName: "ACME",
      email: "a@b.com",
    });

    clearAuthSession();

    expect(getAuthToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
    expect(getAuthCompany()).toBeNull();
  });
});
