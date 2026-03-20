import { useState } from "react";
//import axios from "axios";
import { registerMachine } from "../services/machines";

export default function RegisterMachine() {
    // Dados iniciais de registro da máquina
  const [form, setForm] = useState({
    name: "",
    model: "",
    sector: "",
    serialNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setIsSubmitting(true);

    try {
      // fazer conexao com back
      console.log("Máquina:", form);

      setSuccess("Máquina cadastrada com sucesso!");

      setForm({
        name: "",
        model: "",
        sector: "",
        serialNumber: "",
      });
    } catch (err) {
      setError("Erro ao cadastrar máquina.");
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
        <h1 className="text-center text-5xl font-extrabold text-slate-900">
          JAVAL
        </h1>

        <h2 className="text-center text-lg text-slate-600">
          Cadastro de Máquina
        </h2>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded">{error}</p>
        )}

        {success && (
          <p className="bg-green-100 text-green-700 p-2 rounded">{success}</p>
        )}

        <input
          name="name"
          placeholder="Nome da máquina"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        <input
          name="model"
          placeholder="Modelo"
          value={form.model}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        <input
          name="sector"
          placeholder="Setor"
          value={form.sector}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="serialNumber"
          placeholder="Número de série"
          value={form.serialNumber}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar Máquina"}
        </button>
      </form>
    </div>
  );
}