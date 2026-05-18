import { useState } from "react";
import AuthLayout, {
  formButtonClass,
  formInputClass,
} from "../components/AuthLayout";
import { getRegisterErrorMessage } from "../lib/registerErrors";
import {
  createMachine,
  MACHINE_STATUS_OPTIONS,
  type MachineStatus,
} from "../services/machines";

export default function Machines() {
  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    capacidadePorHora: "",
    status: "ATIVA" as MachineStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const capacidade = Number(form.capacidadePorHora);
    if (!Number.isFinite(capacidade) || capacidade <= 0) {
      setError("Informe uma capacidade por hora maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMachine({
        nome: form.nome.trim(),
        tipo: form.tipo.trim(),
        capacidadePorHora: capacidade,
        status: form.status,
      });
      setSuccess("Máquina cadastrada com sucesso!");
      setForm({
        nome: "",
        tipo: "",
        capacidadePorHora: "",
        status: "ATIVA",
      });
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      wide
      title="Cadastro de Máquina"
      subtitle="Registre equipamentos e acompanhe a capacidade de produção"
    >
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
          <label htmlFor="nome" className="text-sm font-medium text-slate-700">
            Nome da máquina
          </label>
          <input
            id="nome"
            name="nome"
            placeholder="Ex.: Torno CNC 01"
            value={form.nome}
            onChange={handleChange}
            className={formInputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tipo" className="text-sm font-medium text-slate-700">
            Tipo
          </label>
          <input
            id="tipo"
            name="tipo"
            placeholder="Ex.: CNC"
            value={form.tipo}
            onChange={handleChange}
            className={formInputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="capacidadePorHora"
            className="text-sm font-medium text-slate-700"
          >
            Capacidade por hora
          </label>
          <input
            id="capacidadePorHora"
            name="capacidadePorHora"
            type="number"
            min={1}
            step={1}
            placeholder="Ex.: 120"
            value={form.capacidadePorHora}
            onChange={handleChange}
            className={formInputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={formInputClass}
            required
          >
            {MACHINE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={formButtonClass}
        >
          {isSubmitting ? "Salvando…" : "Cadastrar máquina"}
        </button>
      </form>
    </AuthLayout>
  );
}
