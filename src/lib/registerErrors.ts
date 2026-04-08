import axios from "axios";

export function mensagemApiParaPortugues(texto: string): string {
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

export function mensagemPorStatusCadastro(status: number): string | null {
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

export function getRegisterErrorMessage(err: unknown): string {
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
      const porStatus = mensagemPorStatusCadastro(status);
      if (porStatus) return porStatus;
    }

    if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
      return "Não foi possível conectar ao servidor. Verifique sua internet e se o backend está no ar.";
    }
    if (
      err.code === "ECONNABORTED" ||
      err.message?.toLowerCase().includes("timeout")
    ) {
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
