import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import MachineStatusBadge from "../components/MachineStatusBadge";
import conveyorImg from "../assets/conveyor.png";
import { getRegisterErrorMessage } from "../lib/registerErrors";
import {
  deleteMachine,
  listMachines,
  MACHINE_STATUS_OPTIONS,
  updateMachineStatus,
  type Machine,
  type MachineStatus,
} from "../services/machines";

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

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4 text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

export default function MachinesList() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editStatus, setEditStatus] = useState<MachineStatus>("ATIVA");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadMachines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listMachines();
      setMachines(data);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  const stats = useMemo(() => {
    const total = machines.length;
    const active = machines.filter((m) => m.status === "ATIVA").length;
    const alerts = machines.filter(
      (m) => m.status === "MANUTENCAO" || m.status === "INATIVA"
    ).length;
    return { total, active, alerts };
  }, [machines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return machines;
    return machines.filter(
      (m) =>
        m.nome.toLowerCase().includes(q) ||
        m.tipo.toLowerCase().includes(q)
    );
  }, [machines, search]);

  function openEdit(machine: Machine) {
    setEditingMachine(machine);
    setEditStatus(machine.status);
  }

  function closeEdit() {
    setEditingMachine(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMachine) return;

    if (editStatus === editingMachine.status) {
      closeEdit();
      return;
    }

    setIsSavingEdit(true);
    setError(null);
    try {
      const updated = await updateMachineStatus(editingMachine.id, editStatus);
      setMachines((prev) =>
        prev.map((m) => (m.id === editingMachine.id ? updated : m))
      );
      closeEdit();
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsSavingEdit(false);
    }
  }

  function openDelete(machine: Machine) {
    setMachineToDelete(machine);
  }

  function closeDelete() {
    if (isDeleting) return;
    setMachineToDelete(null);
  }

  async function confirmDelete() {
    if (!machineToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteMachine(machineToDelete.id);
      setMachines((prev) => prev.filter((m) => m.id !== machineToDelete.id));
      setMachineToDelete(null);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  const outlineButtonClass =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 transition no-underline";

  const fieldClass =
    "w-full rounded-xl bg-slate-950/60 border border-white/10 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <AppLayout
      category="EQUIPAMENTOS"
      title="Máquinas cadastradas"
      subtitle="Visualize, gerencie e cadastre equipamentos da linha de produção"
      action={
        <Link to="/machines/new" className={outlineButtonClass}>
          + Nova máquina
        </Link>
      }
    >
      {error && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          iconBg="bg-cyan-500/20 text-cyan-400"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 7L2 14l10 5 10-5-10-5z" />
            </svg>
          }
          value={stats.total}
          label="Máquinas cadastradas"
        />
        <StatCard
          iconBg="bg-emerald-500/20 text-emerald-400"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
          value={stats.active}
          label="Ativas"
        />
        <StatCard
          iconBg="bg-amber-500/20 text-amber-400"
          icon={<AlertIcon />}
          value={stats.alerts}
          label="Com alertas"
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 sm:px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Lista de equipamentos
          </h2>
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Buscar máquina…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/40"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="px-6 py-16 text-center text-slate-400 text-sm">
            Carregando máquinas…
          </p>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-3">
              <img
                src={conveyorImg}
                alt=""
                className="h-full w-full object-contain opacity-90"
                aria-hidden
              />
            </div>
            <p className="text-lg font-semibold text-white">
              {search.trim()
                ? "Nenhuma máquina encontrada"
                : "Nenhuma máquina cadastrada"}
            </p>
            <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto">
              {search.trim()
                ? "Tente outro termo de busca."
                : "Comece cadastrando o primeiro equipamento da linha de produção."}
            </p>
            {!search.trim() && (
              <Link
                to="/machines/new"
                className="inline-flex items-center justify-center mt-8 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-105 transition no-underline"
              >
                + Cadastrar máquina
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Capacidade/h</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((machine) => (
                  <tr
                    key={machine.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {machine.nome}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{machine.tipo}</td>
                    <td className="px-6 py-4 text-slate-400 tabular-nums">
                      {machine.capacidadePorHora}
                    </td>
                    <td className="px-6 py-4">
                      <MachineStatusBadge status={machine.status} variant="dark" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(machine)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(machine)}
                          disabled={
                            isDeleting && machineToDelete?.id === machine.id
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition disabled:opacity-50"
                        >
                          {isDeleting && machineToDelete?.id === machine.id
                            ? "Excluindo…"
                            : "Excluir"}
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

      <ConfirmDialog
        open={machineToDelete !== null}
        title="Excluir máquina?"
        highlight={machineToDelete?.nome}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />

      {editingMachine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          role="presentation"
          onClick={closeEdit}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-machine-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <h2
                  id="edit-machine-title"
                  className="text-lg font-semibold text-white"
                >
                  Editar máquina
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Por enquanto só o status pode ser alterado.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-nome" className="text-sm font-medium text-slate-300">
                  Nome
                </label>
                <input
                  id="edit-nome"
                  type="text"
                  value={editingMachine.nome}
                  disabled
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-tipo" className="text-sm font-medium text-slate-300">
                  Tipo
                </label>
                <input
                  id="edit-tipo"
                  type="text"
                  value={editingMachine.tipo}
                  disabled
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-capacidade"
                  className="text-sm font-medium text-slate-300"
                >
                  Capacidade por hora
                </label>
                <input
                  id="edit-capacidade"
                  type="number"
                  value={editingMachine.capacidadePorHora}
                  disabled
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-status" className="text-sm font-medium text-slate-300">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as MachineStatus)
                  }
                  disabled={isSavingEdit}
                  className={fieldClass}
                >
                  {MACHINE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-105 transition disabled:opacity-50"
                >
                  {isSavingEdit ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
