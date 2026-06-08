import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getAuthCompany } from "../lib/auth";
import { getRegisterErrorMessage } from "../lib/registerErrors";
import { AlertIcon } from "../components/icons";
import {
  getDashboard,
  type Dashboard,
} from "../services/dashboard";

const EMPTY_DASHBOARD: Dashboard = {
  totalMaquinas: 0,
  maquinasAtivas: 0,
  maquinasInativas: 0,
  maquinasEmManutencao: 0,
  totalProdutos: 0,
  totalOrdens: 0,
  ordensPendentes: 0,
  ordensEmProducao: 0,
  ordensFinalizada: 0,
  totalUnidadesProduzidas: 0,
  totalUnidadesEmAberto: 0,
  topMaquinas: [],
};

const ORDER_SEGMENTS = [
  { key: "PENDENTE", label: "Pendente", bar: "bg-amber-400", dot: "bg-amber-400" },
  {
    key: "EM_PRODUCAO",
    label: "Em produção",
    bar: "bg-cyan-400",
    dot: "bg-cyan-400",
  },
  {
    key: "FINALIZADA",
    label: "Finalizada",
    bar: "bg-emerald-400",
    dot: "bg-emerald-400",
  },
  {
    key: "DEMAIS",
    label: "Demais",
    bar: "bg-slate-500",
    dot: "bg-slate-500",
  },
] as const;

const MACHINE_SEGMENTS = [
  { key: "ATIVA", label: "Ativas", bar: "bg-emerald-400", valueKey: "maquinasAtivas" as const },
  {
    key: "MANUTENCAO",
    label: "Manutenção",
    bar: "bg-amber-400",
    valueKey: "maquinasEmManutencao" as const,
  },
  {
    key: "INATIVA",
    label: "Inativas",
    bar: "bg-slate-500",
    valueKey: "maquinasInativas" as const,
  },
] as const;


function greetingForHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatTodayLong(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function KpiTile({
  accent,
  icon,
  value,
  label,
  footnote,
  valueLoading,
}: {
  accent: "cyan" | "amber" | "emerald" | "violet";
  icon: ReactNode;
  value: string;
  label: string;
  footnote?: string;
  valueLoading: boolean;
}) {
  const ring =
    accent === "cyan"
      ? "from-cyan-500/25 via-cyan-500/5 to-transparent"
      : accent === "amber"
        ? "from-amber-500/25 via-amber-500/5 to-transparent"
        : accent === "violet"
          ? "from-violet-500/25 via-violet-500/5 to-transparent"
          : "from-emerald-500/25 via-emerald-500/5 to-transparent";
  const iconRing =
    accent === "cyan"
      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
      : accent === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : accent === "violet"
          ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-5 sm:p-6 shadow-lg shadow-black/20">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-gradient-to-br ${ring} blur-2xl`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconRing}`}
        >
          {icon}
        </div>
        {valueLoading ? (
          <div className="h-10 w-16 rounded-lg bg-white/10 animate-pulse" />
        ) : (
          <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-white">
            {value}
          </span>
        )}
      </div>
      <p className="relative mt-4 text-sm font-semibold text-slate-200">
        {label}
      </p>
      {footnote && (
        <p className="relative mt-1 text-xs text-slate-500 leading-snug">
          {footnote}
        </p>
      )}
    </div>
  );
}

function StackedBar({
  segments,
  loading,
}: {
  segments: { key: string; value: number; className: string }[];
  loading: boolean;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (loading) {
    return (
      <div className="h-3 w-full rounded-full bg-white/10 animate-pulse" />
    );
  }
  if (total === 0) {
    return (
      <div className="h-3 w-full rounded-full bg-white/5 ring-1 ring-inset ring-white/10" />
    );
  }
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-inset ring-white/10">
      {segments.map((s) =>
        s.value > 0 ? (
          <div
            key={s.key}
            className={`${s.className} transition-all duration-500`}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.key}: ${s.value}`}
          />
        ) : null
      )}
    </div>
  );
}

const outlineButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 transition disabled:opacity-50 disabled:pointer-events-none";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition no-underline";

export default function Dashboard() {
  const company = getAuthCompany();
  const [data, setData] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: "full" | "silent") => {
    if (mode === "full") setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const d = await getDashboard();
      setData(d);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load("full");
  }, [load]);

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "visible") {
        load("silent");
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, [load]);

  const d = data ?? EMPTY_DASHBOARD;
  const valueLoading = isLoading && data === null;
  const chartsLoading = valueLoading;

  const ordensDemais = Math.max(
    0,
    d.totalOrdens -
      d.ordensPendentes -
      d.ordensEmProducao -
      d.ordensFinalizada
  );

  const orderSegmentValues = {
    PENDENTE: d.ordensPendentes,
    EM_PRODUCAO: d.ordensEmProducao,
    FINALIZADA: d.ordensFinalizada,
    DEMAIS: ordensDemais,
  };

  const ordensAbertas = d.ordensPendentes + d.ordensEmProducao;
  const volumeTotal = d.totalUnidadesProduzidas + d.totalUnidadesEmAberto;

  return (
    <AppLayout
      wide
      category="Painel"
      title="Dashboard"
      subtitle="Métricas consolidadas da API — atualiza ao voltar para esta aba ou ao clicar em Atualizar."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => load("silent")}
            disabled={isRefreshing || (isLoading && data === null)}
            className={outlineButtonClass}
          >
            {isRefreshing ? "Atualizando…" : "Atualizar"}
          </button>
        </div>
      }
    >
      {error && (
        <div
          className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <section className="mb-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-5 sm:p-6 overflow-hidden relative">
        <div
          className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400/90">
              {formatTodayLong()}
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white tracking-tight">
              {greetingForHour()}
              {company?.companyName ? (
                <span className="text-slate-300 font-semibold">
                  , {company.companyName}
                </span>
              ) : null}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/machines"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              Parque de máquinas
            </Link>
            <Link
              to="/orders"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              Todas as ordens
            </Link>
            <Link
              to="/products"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              Catálogo de produtos
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <KpiTile
          accent="cyan"
          valueLoading={valueLoading}
          value={String(d.totalMaquinas)}
          label="Máquinas"
          footnote={`${d.maquinasAtivas} ativas · ${d.maquinasEmManutencao} manut. · ${d.maquinasInativas} inativas`}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 7L2 14l10 5 10-5-10-5z" />
            </svg>
          }
        />
        <KpiTile
          accent="violet"
          valueLoading={valueLoading}
          value={String(d.totalProdutos)}
          label="Produtos"
          footnote="Itens no catálogo."
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
        />
        <KpiTile
          accent="emerald"
          valueLoading={valueLoading}
          value={String(d.totalOrdens)}
          label="Ordens"
          footnote={`${d.ordensFinalizada} finalizadas`}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
        <KpiTile
          accent="amber"
          valueLoading={valueLoading}
          value={String(ordensAbertas)}
          label="Ordens em curso"
          footnote="Pendentes + em produção."
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6 flex flex-col min-h-[260px]">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ordens por status
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {chartsLoading ? "…" : `${d.totalOrdens} ordens no total`}
            </p>
          </div>
          <StackedBar
            loading={chartsLoading}
            segments={ORDER_SEGMENTS.map((s) => ({
              key: s.key,
              value: orderSegmentValues[s.key],
              className: s.bar,
            }))}
          />
          <p className="text-[11px] text-slate-500 mt-3 mb-1">
            “Demais” inclui diferença para o total (ex.: canceladas), conforme
            regras do backend.
          </p>
          <div className="mt-2 space-y-3 flex-1">
            {ORDER_SEGMENTS.map((s) => {
              const n = chartsLoading ? 0 : orderSegmentValues[s.key];
              const denom = d.totalOrdens > 0 ? d.totalOrdens : 1;
              const pct = Math.round((n / denom) * 100);
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`}
                    aria-hidden
                  />
                  <span className="text-xs text-slate-400 w-28 shrink-0">
                    {s.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden ring-1 ring-inset ring-white/5">
                    <div
                      className={`h-full rounded-full ${s.bar} transition-all duration-500`}
                      style={{
                        width: chartsLoading ? "0%" : `${pct}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-slate-300 w-8 text-right font-semibold">
                    {chartsLoading ? "…" : n}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6 flex flex-col">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Unidades: produzidas vs em aberto
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Finalizadas (soma de quantidades) frente à fila pendente + em
            produção.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-emerald-400/90 font-semibold">
                Produzidas
              </p>
              {chartsLoading ? (
                <div className="mt-2 h-9 w-20 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="mt-1 text-2xl font-black tabular-nums text-white">
                  {d.totalUnidadesProduzidas.toLocaleString("pt-BR")}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-amber-400/90 font-semibold">
                Em aberto
              </p>
              {chartsLoading ? (
                <div className="mt-2 h-9 w-20 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="mt-1 text-2xl font-black tabular-nums text-white">
                  {d.totalUnidadesEmAberto.toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          </div>
          <StackedBar
            loading={chartsLoading}
            segments={[
              {
                key: "prod",
                value: d.totalUnidadesProduzidas,
                className: "bg-emerald-400",
              },
              {
                key: "aberto",
                value: d.totalUnidadesEmAberto,
                className: "bg-amber-400",
              },
            ]}
          />
          {!chartsLoading && volumeTotal > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Produzidas representam{" "}
              <span className="text-slate-300 font-semibold tabular-nums">
                {Math.round((d.totalUnidadesProduzidas / volumeTotal) * 100)}%
              </span>{" "}
              do volume combinado.
            </p>
          )}
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 flex-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Parque de máquinas
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Por estado operacional
            </p>
            <StackedBar
              loading={chartsLoading}
              segments={MACHINE_SEGMENTS.map((s) => ({
                key: s.key,
                value: chartsLoading ? 0 : d[s.valueKey],
                className: s.bar,
              }))}
            />
            <ul className="mt-4 space-y-2">
              {MACHINE_SEGMENTS.map((s) => (
                <li
                  key={s.key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-slate-400">
                    <span
                      className={`h-2 w-2 rounded-full ${s.bar}`}
                    />
                    {s.label}
                  </span>
                  <span className="tabular-nums font-semibold text-slate-200">
                    {chartsLoading ? "…" : d[s.valueKey]}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/machines"
              className="mt-4 inline-flex text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Gerenciar máquinas →
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/30 p-5 flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ações rápidas
            </h3>
            <nav className="mt-3 flex flex-col gap-2">
              <Link
                to="/orders/new"
                className="rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/25 px-4 py-3 text-sm font-semibold text-cyan-100 hover:from-cyan-500/30 hover:to-blue-600/30 transition"
              >
                Nova ordem
              </Link>
              <Link
                to="/products/new"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 transition"
              >
                Cadastrar produto
              </Link>
              <Link
                to="/machines/new"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 transition"
              >
                Nova máquina
              </Link>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-12 rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/10 bg-slate-950/40">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top máquinas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Até 5 equipamentos com mais ordens finalizadas (só ordens
                FINALIZADA).
              </p>
            </div>
            <Link
              to="/machines"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
            >
              Ver máquinas →
            </Link>
          </div>

          {chartsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : d.topMaquinas.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-300 font-medium text-sm">
                Nenhuma máquina no ranking ainda
              </p>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                O ranking considera apenas ordens finalizadas. Finalize ordens
                para ver as máquinas mais produtivas aqui.
              </p>
              <Link
                to="/orders"
                className={`inline-flex mt-5 ${primaryButtonClass}`}
              >
                Ir para ordens
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Máquina</th>
                    <th className="px-6 py-3 font-medium tabular-nums text-right">
                      Ordens finalizadas
                    </th>
                    <th className="px-6 py-3 font-medium tabular-nums text-right">
                      Unidades produzidas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {d.topMaquinas.map((row, idx) => (
                    <tr
                      key={row.maquinaId}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <td className="px-6 py-3 text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3 font-medium text-white">
                        {row.maquinaNome}
                      </td>
                      <td className="px-6 py-3 text-slate-300 tabular-nums text-right">
                        {row.ordensFinalizadas}
                      </td>
                      <td className="px-6 py-3 text-slate-300 tabular-nums text-right">
                        {row.unidadesProduzidas.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
