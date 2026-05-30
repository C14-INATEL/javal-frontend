import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, {
  formButtonClass,
  formInputClass,
} from "../components/AuthLayout";
import {
  getOrdemErrorMessage,
  getRegisterErrorMessage,
} from "../lib/registerErrors";
import { listMachines, type Machine } from "../services/machines";
import { createOrder } from "../services/orders";
import { listProdutos, type Produto } from "../services/produtos";

export default function OrderNew() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [maquinas, setMaquinas] = useState<Machine[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingLists, setIsLoadingLists] = useState(true);

  const [produtoId, setProdutoId] = useState("");
  const [maquinaId, setMaquinaId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const maquinasCriacao = useMemo(
    () => maquinas.filter((m) => m.status !== "INATIVA"),
    [maquinas]
  );

  const loadLists = useCallback(async () => {
    setIsLoadingLists(true);
    setLoadError(null);
    try {
      const [p, m] = await Promise.all([listProdutos(), listMachines()]);
      setProdutos(p);
      setMaquinas(m);
    } catch (err) {
      setLoadError(getRegisterErrorMessage(err));
    } finally {
      setIsLoadingLists(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const pid = Number(produtoId);
    const mid = Number(maquinaId);
    const q = Number(quantidade);

    if (!Number.isInteger(pid) || pid < 1) {
      setError("Selecione um produto.");
      return;
    }
    if (!Number.isInteger(mid) || mid < 1) {
      setError("Selecione uma máquina.");
      return;
    }
    if (!Number.isInteger(q) || q < 1) {
      setError("Informe a quantidade (número inteiro ≥ 1).");
      return;
    }

    const maquina = maquinas.find((m) => m.id === mid);
    if (maquina?.status === "INATIVA") {
      setError("Não é possível criar ordem com máquina inativa.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({ produtoId: pid, maquinaId: mid, quantidade: q });
      setSuccess("Ordem criada com sucesso!");
      setTimeout(() => navigate("/orders"), 1200);
      setProdutoId("");
      setMaquinaId("");
      setQuantidade("");
    } catch (err) {
      setError(getOrdemErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectClass = `${formInputClass} appearance-none bg-white`;

  return (
    <AuthLayout
      wide
      title="Nova ordem de produção"
      subtitle="Escolha produto, máquina e quantidade. Máquinas inativas não aparecem na lista."
      footer={
        <p className="text-center text-sm text-slate-600">
          <Link
            to="/orders"
            className="text-cyan-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
          >
            ← Voltar para a lista
          </Link>
        </p>
      }
    >
      {loadError && (
        <p
          className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200 mb-4"
          role="alert"
        >
          {loadError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p
            className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className="rounded-xl bg-green-50 text-green-800 text-sm px-4 py-3 border border-green-200"
            role="status"
          >
            {success}
          </p>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="produtoId"
            className="text-sm font-medium text-slate-700"
          >
            Produto
          </label>
          <select
            id="produtoId"
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className={selectClass}
            disabled={isLoadingLists || produtos.length === 0}
            required
          >
            <option value="">
              {isLoadingLists
                ? "Carregando…"
                : produtos.length === 0
                  ? "Nenhum produto cadastrado"
                  : "Selecione o produto"}
            </option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="maquinaId"
            className="text-sm font-medium text-slate-700"
          >
            Máquina
          </label>
          <select
            id="maquinaId"
            value={maquinaId}
            onChange={(e) => setMaquinaId(e.target.value)}
            className={selectClass}
            disabled={isLoadingLists || maquinasCriacao.length === 0}
            required
          >
            <option value="">
              {isLoadingLists
                ? "Carregando…"
                : maquinasCriacao.length === 0
                  ? "Nenhuma máquina ativa ou em manutenção"
                  : "Selecione a máquina"}
            </option>
            {maquinasCriacao.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
                {m.status === "MANUTENCAO"
                  ? " (manutenção — ordem pode ser criada, não iniciada)"
                  : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Máquinas inativas não podem receber novas ordens.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="quantidade"
            className="text-sm font-medium text-slate-700"
          >
            Quantidade
          </label>
          <input
            id="quantidade"
            name="quantidade"
            type="number"
            min={1}
            step={1}
            placeholder="Ex.: 100"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className={formInputClass}
            required
          />
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            isLoadingLists ||
            produtos.length === 0 ||
            maquinasCriacao.length === 0
          }
          className={formButtonClass}
        >
          {isSubmitting ? "Criando…" : "Criar ordem"}
        </button>
      </form>
    </AuthLayout>
  );
}
