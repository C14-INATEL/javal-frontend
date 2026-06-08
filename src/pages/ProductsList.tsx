import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import { getRegisterErrorMessage } from "../lib/registerErrors";
import { AlertIcon, SearchIcon, PackageIcon } from "../components/icons";
import {
  deleteProduto,
  listProdutos,
  type Produto,
} from "../services/produtos";

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-5 flex items-center gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function ProductsList() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Produto | null>(null);

  const loadProdutos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listProdutos();
      setProdutos(data);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  const total = produtos.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return produtos;
    return produtos.filter((p) => p.nome.toLowerCase().includes(q));
  }, [produtos, search]);

  async function confirmDeleteProduto() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeletingId(id);
    setError(null);
    try {
      await deleteProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      setPendingDelete(null);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const outlineButtonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 transition no-underline";

  return (
    <AppLayout
      category="CATÁLOGO"
      title="Produtos cadastrados"
      subtitle="Itens da linha com tempo de produção por unidade (minutos)"
      action={
        <Link to="/products/new" className={outlineButtonClass}>
          + Novo produto
        </Link>
      }
    >
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir produto?"
        highlight={pendingDelete?.nome}
        confirmLabel="Excluir"
        isLoading={
          pendingDelete !== null && deletingId === pendingDelete.id
        }
        onConfirm={confirmDeleteProduto}
        onCancel={() => setPendingDelete(null)}
      />

      {error && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
        <StatCard
          iconBg="bg-cyan-500/20 text-cyan-400"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 7L2 14l10 5 10-5-10-5z" />
            </svg>
          }
          value={total}
          label="Produtos no catálogo"
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 sm:px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Lista de produtos</h2>
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Buscar por nome…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/40"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="px-6 py-16 text-center text-slate-400 text-sm">
            Carregando produtos…
          </p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <PackageIcon />
            </div>
            <p className="text-lg font-semibold text-white">
              {search.trim()
                ? "Nenhum produto encontrado"
                : "Nenhum produto cadastrado"}
            </p>
            <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto">
              {search.trim()
                ? "Tente outro termo de busca."
                : "Cadastre o primeiro item do catálogo com nome e tempo de produção por unidade."}
            </p>
            {!search.trim() && (
              <Link
                to="/products/new"
                className="inline-flex items-center justify-center mt-8 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-105 transition no-underline"
              >
                + Cadastrar produto
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">
                    Tempo / unidade (min)
                  </th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((produto) => (
                  <tr
                    key={produto.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 text-slate-400 tabular-nums">
                      {produto.tempoProducaoUnitario}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPendingDelete(produto)}
                          disabled={deletingId !== null}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
