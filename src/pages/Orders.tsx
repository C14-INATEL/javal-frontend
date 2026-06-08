import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { getOrdemErrorMessage } from "../lib/registerErrors";
import { listMachines, type Machine } from "../services/machines";
import { AlertIcon, ClipboardIcon, SearchIcon } from "../components/icons";
import { formatDateTime } from "../lib/formatters";
import {
  cancelOrder,
  finishOrder,
  listOrders,
  startOrder,
  type Order,
  type StatusOrdem,
} from "../services/orders";

type StatusFilter = "TODOS" | StatusOrdem;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_PRODUCAO", label: "Em produção" },
  { value: "FINALIZADA", label: "Finalizada" },
  { value: "CANCELADA", label: "Cancelada" },
];

const filterChipBase =
  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition focus:outline-none focus:ring-2 focus:ring-cyan-500/50";
const filterChipInactive =
  "border-white/15 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10";
const filterChipActive =
  "border-cyan-500/40 bg-cyan-500/15 text-cyan-200";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listsError, setListsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [actionId, setActionId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<
    "iniciar" | "finalizar" | "cancelar" | null
  >(null);
  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);

  const machineById = useMemo(() => {
    const map = new Map<number, Machine>();
    for (const m of machines) map.set(m.id, m);
    return map;
  }, [machines]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setListsError(null);
    setError(null);
    try {
      const [o, m] = await Promise.all([listOrders(), listMachines()]);
      setOrders(o);
      setMachines(m);
    } catch (err) {
      setListsError(getOrdemErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    let list =
      statusFilter === "TODOS"
        ? orders
        : orders.filter((o) => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.produtoNome.toLowerCase().includes(q) ||
          o.maquinaNome.toLowerCase().includes(q) ||
          String(o.id).includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  async function handleStartProduction(order: Order) {
    if (order.status !== "PENDENTE") return;
    setActionId(order.id);
    setActionType("iniciar");
    setError(null);
    try {
      const updated = await startOrder(order.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    } catch (err) {
      setError(getOrdemErrorMessage(err));
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function handleFinish(order: Order) {
    if (order.status !== "EM_PRODUCAO") return;
    setActionId(order.id);
    setActionType("finalizar");
    setError(null);
    try {
      const updated = await finishOrder(order.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    } catch (err) {
      setError(getOrdemErrorMessage(err));
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function confirmCancelOrder() {
    if (!pendingCancel) return;
    const id = pendingCancel.id;
    setActionId(id);
    setActionType("cancelar");
    setError(null);
    try {
      const updated = await cancelOrder(id);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
      setPendingCancel(null);
    } catch (err) {
      setError(getOrdemErrorMessage(err));
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  function canStartProduction(order: Order): boolean {
    if (order.status !== "PENDENTE") return false;
    const m = machineById.get(order.maquinaId);
    return m?.status !== "MANUTENCAO";
  }

  function canCancel(order: Order): boolean {
    return order.status === "PENDENTE" || order.status === "EM_PRODUCAO";
  }

  const anyBusy = actionId !== null;
  const hasNoOrders = !isLoading && orders.length === 0;

  const outlineButtonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 transition no-underline";

  return (
    <AppLayout
      category="PRODUÇÃO"
      title="Ordens de produção"
      subtitle="Acompanhe o fluxo pendente → em produção → finalizada; cadastre novas ordens pelo botão ao lado."
      action={
        <Link to="/orders/new" className={outlineButtonClass}>
          + Nova ordem
        </Link>
      }
    >
      <ConfirmDialog
        open={pendingCancel !== null}
        title="Cancelar ordem?"
        description="A ordem passará ao status cancelada e permanecerá na listagem."
        highlight={
          pendingCancel
            ? `${pendingCancel.produtoNome} · ${pendingCancel.quantidade} un.`
            : undefined
        }
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        isLoading={
          pendingCancel !== null &&
          actionId === pendingCancel.id &&
          actionType === "cancelar"
        }
        onConfirm={confirmCancelOrder}
        onCancel={() => setPendingCancel(null)}
      />

      {listsError && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <AlertIcon />
          <span>{listsError}</span>
        </div>
      )}

      {error && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-white/10 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Listagem</h2>
            <div className="relative w-full lg:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                type="search"
                placeholder="Buscar produto, máquina ou ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/40"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Filtrar por status</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro por status">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`${filterChipBase} ${
                    statusFilter === value ? filterChipActive : filterChipInactive
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="px-6 py-16 text-center text-slate-400 text-sm">
            Carregando ordens…
          </p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <ClipboardIcon />
            </div>
            <p className="text-lg font-semibold text-white">
              {hasNoOrders
                ? "Nenhuma ordem cadastrada"
                : search.trim() || statusFilter !== "TODOS"
                  ? "Nenhuma ordem neste filtro"
                  : "Nenhuma ordem cadastrada"}
            </p>
            <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
              {hasNoOrders
                ? "Cadastre a primeira ordem com produto, máquina e quantidade."
                : "Ajuste o filtro de status ou a busca para ver mais itens."}
            </p>
            {hasNoOrders && (
              <Link
                to="/orders/new"
                className="inline-flex items-center justify-center mt-8 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-105 transition no-underline"
              >
                + Nova ordem
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Máquina</th>
                  <th className="px-6 py-3 font-medium tabular-nums">Qtd.</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Início</th>
                  <th className="px-6 py-3 font-medium">Fim</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((order) => {
                  const busyStart =
                    actionId === order.id && actionType === "iniciar";
                  const busyFinish =
                    actionId === order.id && actionType === "finalizar";
                  const maq = machineById.get(order.maquinaId);
                  const startOk = canStartProduction(order);
                  const titleStart =
                    order.status !== "PENDENTE"
                      ? "Disponível apenas para ordens pendentes."
                      : maq?.status === "MANUTENCAO"
                        ? "Máquina em manutenção: não é possível iniciar produção."
                        : "Iniciar produção";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-400 tabular-nums">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {order.produtoNome}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {order.maquinaNome}
                      </td>
                      <td className="px-6 py-4 text-slate-400 tabular-nums">
                        {order.quantidade}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formatDateTime(order.dataInicio)}
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formatDateTime(order.dataFim)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {order.status === "PENDENTE" && (
                            <button
                              type="button"
                              title={titleStart}
                              disabled={anyBusy || !startOk}
                              onClick={() => handleStartProduction(order)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {busyStart ? "Iniciando…" : "Iniciar produção"}
                            </button>
                          )}
                          {order.status === "EM_PRODUCAO" && (
                            <button
                              type="button"
                              title="Finalizar ordem"
                              disabled={anyBusy}
                              onClick={() => handleFinish(order)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {busyFinish ? "Finalizando…" : "Finalizar"}
                            </button>
                          )}
                          {canCancel(order) && (
                            <button
                              type="button"
                              title="Cancelar ordem"
                              disabled={anyBusy}
                              onClick={() => setPendingCancel(order)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
