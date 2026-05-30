import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, {
  formButtonClass,
  formInputClass,
} from "../components/AuthLayout";
import { getRegisterErrorMessage } from "../lib/registerErrors";
import { createProduto } from "../services/produtos";

export default function ProductNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    tempoProducaoUnitario: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const minutos = Number(form.tempoProducaoUnitario);
    if (!Number.isInteger(minutos) || minutos < 1) {
      setError(
        "Informe o tempo de produção por unidade em minutos (número inteiro ≥ 1)."
      );
      return;
    }

    const nome = form.nome.trim();
    if (!nome) {
      setError("Informe o nome do produto.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduto({
        nome,
        tempoProducaoUnitario: minutos,
      });
      setSuccess("Produto cadastrado com sucesso!");
      setTimeout(() => navigate("/products"), 1200);
      setForm({ nome: "", tempoProducaoUnitario: "" });
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      wide
      title="Cadastro de produto"
      subtitle="Defina o nome e o tempo de produção por unidade (em minutos)"
      footer={
        <p className="text-center text-sm text-slate-600">
          <Link
            to="/products"
            className="text-cyan-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
          >
            ← Voltar para a lista
          </Link>
        </p>
      }
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
            Nome do produto
          </label>
          <input
            id="nome"
            name="nome"
            placeholder="Ex.: Parafuso M8"
            value={form.nome}
            onChange={handleChange}
            className={formInputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tempoProducaoUnitario"
            className="text-sm font-medium text-slate-700"
          >
            Tempo de produção por unidade (minutos)
          </label>
          <input
            id="tempoProducaoUnitario"
            name="tempoProducaoUnitario"
            type="number"
            min={1}
            step={1}
            placeholder="Ex.: 15"
            value={form.tempoProducaoUnitario}
            onChange={handleChange}
            className={formInputClass}
            required
          />
          <p className="text-xs text-slate-500">
            Valor inteiro mínimo 1 (minutos por unidade produzida).
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={formButtonClass}
        >
          {isSubmitting ? "Salvando…" : "Cadastrar produto"}
        </button>
      </form>
    </AuthLayout>
  );
}
