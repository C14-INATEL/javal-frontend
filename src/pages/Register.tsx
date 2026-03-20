import { useState } from "react";
import axios from "axios";
import { registerCompany } from "../services/companies";

/** Traduz textos genéricos que o Spring/HTTP costumam devolver em inglês. */
function mensagemApiParaPortugues(texto: string): string {
  const t = texto.trim();
  const chave = t.toLowerCase();
  const mapa: Record<string, string> = {
    "bad request": "Dados inválidos. Verifique os campos e tente novamente.",
    unauthorized: "Não autorizado. Faça login novamente.",
    forbidden: "Acesso negado. Você não tem permissão para esta ação.",
    "not found": "Recurso não encontrado.",
    "method not allowed": "Operação não permitida.",
    "internal server error":
      "Erro interno no servidor. Tente novamente em alguns instantes.",
    "service unavailable":
      "Serviço temporariamente indisponível. Tente novamente mais tarde.",
    "gateway timeout": "O servidor demorou para responder. Tente novamente.",
    conflict: "Conflito: os dados enviados já existem ou não são aceitos.",
  };
  return mapa[chave] ?? t;
}

function mensagemPorStatusHttp(status: number): string | null {
  switch (status) {
    case 400:
      return "Dados inválidos. Verifique os campos e tente novamente.";
    case 401:
      return "Sessão expirada ou não autorizado. Faça login novamente.";
    case 403:
      return "Acesso negado. Verifique permissões ou configuração de segurança.";
    case 404:
      return "Serviço de cadastro não encontrado. Contate o suporte.";
    case 408:
      return "A requisição expirou. Verifique sua conexão e tente de novo.";
    case 409:
      return "Este e-mail ou empresa já está cadastrado.";
    case 413:
      return "Os dados enviados são grandes demais.";
    case 422:
      return "Não foi possível processar os dados enviados. Confira o formulário.";
    case 429:
      return "Muitas tentativas. Aguarde um momento e tente novamente.";
    case 500:
    case 502:
    case 503:
      return "Erro no servidor. Tente novamente em alguns instantes.";
    case 504:
      return "O servidor demorou para responder. Tente novamente.";
    default:
      return null;
  }
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as
      | {
          message?: string;
          error?: string;
          errors?: Array<{ defaultMessage?: string }>;
        }
      | string
      | undefined;

    if (typeof data === "string" && data.trim()) {
      return mensagemApiParaPortugues(data);
    }
    if (data && typeof data === "object") {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const msgs = data.errors
          .map((e) => e.defaultMessage)
          .filter((m): m is string => typeof m === "string" && m.length > 0);
        if (msgs.length > 0) return msgs.join(" ");
      }
      if (typeof data.message === "string" && data.message.trim()) {
        return mensagemApiParaPortugues(data.message);
      }
      if (typeof data.error === "string" && data.error.trim()) {
        return mensagemApiParaPortugues(data.error);
      }
    }

    if (typeof status === "number") {
      const porStatus = mensagemPorStatusHttp(status);
      if (porStatus) return porStatus;
    }

    if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
      return "Não foi possível conectar ao servidor. Verifique sua internet e se o backend está no ar.";
    }
    if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
      return "Tempo esgotado. Verifique sua conexão e tente novamente.";
    }

    if (typeof status === "number") {
      return `Não foi possível concluir o cadastro (erro ${status}). Tente novamente.`;
    }

    return "Não foi possível concluir o cadastro. Tente novamente.";
  }
  if (err instanceof Error && err.message.trim()) {
    const m = err.message.toLowerCase();
    if (m.includes("network") || m === "network error") {
      return "Não foi possível conectar ao servidor. Verifique sua internet.";
    }
    return err.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export default function Register() {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    responsible: "",
    password: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.acceptTerms) {
      setError("É necessário aceitar os termos de uso para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCompany({
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        responsible: form.responsible.trim(),
        password: form.password,
      });
      setSuccess("Cadastro realizado com sucesso!");
      setForm({
        companyName: "",
        email: "",
        phone: "",
        responsible: "",
        password: "",
        acceptTerms: false,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 space-y-4"
      >
        {/* Nome do sistema */}
        <h1 className="text-center text-5xl font-extrabold tracking-widest text-slate-900">
          JAVAL
        </h1>

        <h2 className="text-center text-lg text-slate-600">
          Cadastro Inicial da Empresa
        </h2>

        {error && (
          <p
            className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className="rounded-lg bg-green-50 text-green-800 text-sm px-3 py-2 border border-green-200"
            role="status"
          >
            {success}
          </p>
        )}

        <input
          name="companyName"
          placeholder="Nome da Empresa"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <div className="flex gap-3">
          <input
            name="email"
            placeholder="E-mail"
            onChange={handleChange}
            className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            name="phone"
            placeholder="Telefone"
            onChange={handleChange}
            className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input
          name="responsible"
          placeholder="Nome do Responsável"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="acceptTerms"
            onChange={handleChange}
          />
          Eu concordo com os{" "}
          <span className="text-blue-600 cursor-pointer">
            Termos de Uso
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Enviando…" : "Concluir Cadastro"}
        </button>
      </form>
    </div>
  );
}