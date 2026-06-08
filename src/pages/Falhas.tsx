import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import { getRegisterErrorMessage } from "../lib/registerErrors";
import { AlertIcon } from "../components/icons";
import { formatDateTime } from "../lib/formatters";

import {
  createFalha,
  FALHA_SEVERIDADE_OPTIONS,
  getFalhaSeveridadeLabel,
  getFalhaStatusLabel,
  listFalhas,
  resolveFalha,
  type FalhaMaquinaResponse,
  type FalhaSeveridade,
} from "../services/falhas";
import {
  getMachineStatusLabel,
  listMachines,
  type Machine,
} from "../services/machines";


function severidadeBadgeClass(s: FalhaSeveridade): string {
  const map: Record<FalhaSeveridade, string> = {
    BAIXA: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    MEDIA: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    ALTA: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    CRITICA: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return map[s];
}

function statusFalhaBadgeClass(status: FalhaMaquinaResponse["status"]): string {
  return status === "ABERTA"
    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
}

export default function Falhas() {
  const [searchParams] = useSearchParams();
  const maquinaIdParam = searchParams.get("maquinaId");

  const [machines, setMachines] = useState<Machine[]>([]);
  const [falhas, setFalhas] = useState<FalhaMaquinaResponse[]>([]);
  const [filterMaquinaId, setFilterMaquinaId] = useState<string>("");

  const [formMaquinaId, setFormMaquinaId] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formSeveridade, setFormSeveridade] =
    useState<FalhaSeveridade>("MEDIA");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pendingResolve, setPendingResolve] =
    useState<FalhaMaquinaResponse | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [m, f] = await Promise.all([listMachines(), listFalhas()]);
      setMachines(m);
      setFalhas(f);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!maquinaIdParam || machines.length === 0) return;
    const id = Number(maquinaIdParam);
    if (!Number.isFinite(id) || !machines.some((x) => x.id === id)) return;
    setFormMaquinaId(String(id));
    setFilterMaquinaId(String(id));
  }, [maquinaIdParam, machines]);

  const machineById = useMemo(() => {
    const map = new Map<number, Machine>();
    for (const m of machines) map.set(m.id, m);
    return map;
  }, [machines]);

  const falhasOrdenadas = useMemo(() => {
    const copy = [...falhas];
    copy.sort((a, b) => {
      const ta = new Date(a.dataAbertura).getTime();
      const tb = new Date(b.dataAbertura).getTime();
      return tb - ta;
    });
    return copy;
  }, [falhas]);

  const falhasFiltradas = useMemo(() => {
    if (!filterMaquinaId.trim()) return falhasOrdenadas;
    const id = Number(filterMaquinaId);
    if (!Number.isFinite(id)) return falhasOrdenadas;
    return falhasOrdenadas.filter((f) => f.maquinaId === id);
  }, [falhasOrdenadas, filterMaquinaId]);

  const stats = useMemo(() => {
    const abertas = falhas.filter((f) => f.status === "ABERTA").length;
    const resolvidas = falhas.filter((f) => f.status === "RESOLVIDA").length;
    return { abertas, resolvidas };
  }, [falhas]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const mid = Number(formMaquinaId);
    if (!Number.isFinite(mid) || mid <= 0) {
      setError("Selecione uma máquina.");
      return;
    }
    const desc = formDescricao.trim();
    if (!desc) {
      setError("Informe uma descrição da falha.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createFalha({
        maquinaId: mid,
        descricao: desc,
        severidade: formSeveridade,
      });
      setSuccess(
        "Falha registrada. A máquina foi colocada em manutenção até a falha ser resolvida (e não houver outras abertas)."
      );
      setFormDescricao("");
      const [m, f] = await Promise.all([listMachines(), listFalhas()]);
      setMachines(m);
      setFalhas(f);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmResolve() {
    if (!pendingResolve) return;
    const id = pendingResolve.id;
    setResolvingId(id);
    setError(null);
    try {
      await resolveFalha(id);
      setPendingResolve(null);
      const [m, f] = await Promise.all([listMachines(), listFalhas()]);
      setMachines(m);
      setFalhas(f);
      setSuccess(
        "Falha marcada como resolvida. Se não houver mais falhas abertas nessa máquina, o status volta para ativa."
      );
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setResolvingId(null);
    }
  }

  const fieldClass =
    "w-full rounded-xl bg-slate-950/60 border border-white/10 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-60 disabled:cursor-not-allowed";

  const outlineButtonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 transition no-underline";

  return (
    <AppLayout
      category="EQUIPAMENTOS"
      title="Falhas de máquinas"
      subtitle="Registre falhas com severidade; ao resolver, a máquina pode voltar para ativa se não houver outras falhas abertas."
      action={
        <Link to="/machines" className={outlineButtonClass}>
          ← Lista de máquinas
        </Link>
      }
      wide
    >
      <ConfirmDialog
        open={pendingResolve !== null}
        title="Resolver falha?"
        variant="neutral"
        highlight={pendingResolve?.maquinaNome}
        description={
          pendingResolve
            ? `A falha será marcada como resolvida: “${pendingResolve.descricao.slice(0, 120)}${pendingResolve.descricao.length > 120 ? "…" : ""}”.`
            : undefined
        }
        confirmLabel="Resolver"
        cancelLabel="Cancelar"
        loadingConfirmLabel="Resolvendo…"
        isLoading={
          pendingResolve !== null && resolvingId === pendingResolve.id
        }
        onConfirm={confirmResolve}
        onCancel={() => setPendingResolve(null)}
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

      {success && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          role="status"
        >
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-5">
            <p className="text-3xl font-bold text-white tabular-nums">
              {stats.abertas}
            </p>
            <p className="text-sm text-slate-400 mt-1">Falhas abertas</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-5">
            <p className="text-3xl font-bold text-slate-300 tabular-nums">
              {stats.resolvidas}
            </p>
            <p className="text-sm text-slate-400 mt-1">Falhas resolvidas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            Registrar nova falha
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            O backend define status <strong className="text-slate-300">ABERTA</strong> e a data de abertura. A máquina passa para{" "}
            <strong className="text-slate-300">manutenção</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="falha-maquina"
                className="text-sm font-medium text-slate-300"
              >
                Máquina
              </label>
              <select
                id="falha-maquina"
                value={formMaquinaId}
                onChange={(e) => setFormMaquinaId(e.target.value)}
                disabled={isLoading || isSubmitting || machines.length === 0}
                required
                className={fieldClass}
              >
                <option value="">Selecione…</option>
                {machines.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nome} — {getMachineStatusLabel(m.status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="falha-severidade"
                className="text-sm font-medium text-slate-300"
              >
                Severidade
              </label>
              <select
                id="falha-severidade"
                value={formSeveridade}
                onChange={(e) =>
                  setFormSeveridade(e.target.value as FalhaSeveridade)
                }
                disabled={isSubmitting}
                className={fieldClass}
              >
                {FALHA_SEVERIDADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="falha-descricao"
                className="text-sm font-medium text-slate-300"
              >
                Descrição
              </label>
              <textarea
                id="falha-descricao"
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                placeholder="Descreva o problema observado…"
                className={fieldClass}
                required
              />
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting || isLoading || machines.length === 0
              }
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-105 transition disabled:opacity-50"
            >
              {isSubmitting ? "Registrando…" : "Registrar falha"}
            </button>
          </form>
        </section>

        <section className="xl:col-span-3 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 sm:px-6 py-5 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">
              Histórico da empresa
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <label htmlFor="filtro-maquina" className="sr-only">
                Filtrar por máquina
              </label>
              <select
                id="filtro-maquina"
                value={filterMaquinaId}
                onChange={(e) => setFilterMaquinaId(e.target.value)}
                disabled={isLoading}
                className={`${fieldClass} sm:max-w-xs`}
              >
                <option value="">Todas as máquinas</option>
                {machines.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="px-6 py-16 text-center text-slate-400 text-sm">
              Carregando…
            </p>
          ) : falhasFiltradas.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-400 text-sm">
              {filterMaquinaId
                ? "Nenhuma falha para esta máquina."
                : "Nenhuma falha registrada ainda."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="px-4 py-3 font-medium">Máquina</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Severidade</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">
                      Abertura
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {falhasFiltradas.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                        {f.maquinaNome}
                        {machineById.get(f.maquinaId) && (
                          <span className="block text-xs font-normal text-slate-500">
                            {getMachineStatusLabel(
                              machineById.get(f.maquinaId)!.status
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300 max-w-[220px]">
                        <span className="line-clamp-2" title={f.descricao}>
                          {f.descricao}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${severidadeBadgeClass(f.severidade)}`}
                        >
                          {getFalhaSeveridadeLabel(f.severidade)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${statusFalhaBadgeClass(f.status)}`}
                        >
                          {getFalhaStatusLabel(f.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap tabular-nums text-xs">
                        {formatDateTime(f.dataAbertura)}
                        {f.dataResolucao && (
                          <span className="block text-slate-500">
                            Resolv.: {formatDateTime(f.dataResolucao)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {f.status === "ABERTA" ? (
                          <button
                            type="button"
                            onClick={() => setPendingResolve(f)}
                            disabled={resolvingId !== null}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition disabled:opacity-50"
                          >
                            Resolver
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
