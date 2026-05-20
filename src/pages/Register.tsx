import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout, {
  formButtonClass,
  formInputClass,
} from "../components/AuthLayout";
import { getRegisterErrorMessage } from "../lib/registerErrors";
import { isValidCnpj } from "../lib/validation";
import { registerCompany } from "../services/companies";

export default function Register() {
  const [form, setForm] = useState({
    companyName: "",
    cnpj: "",
    email: "",
    phone: "",
    responsible: "",
    password: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.acceptTerms) {
      setError("É necessário aceitar os termos de uso para continuar.");
      return;
    }

    if (!isValidCnpj(form.cnpj)) {
      setError("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCompany({
        companyName: form.companyName.trim(),
        cnpj: form.cnpj,
        email: form.email.trim(),
        phone: form.phone.trim(),
        responsible: form.responsible.trim(),
        password: form.password,
      });
      setSuccess("Cadastro realizado com sucesso!");
      setForm({
        companyName: "",
        cnpj: "",
        email: "",
        phone: "",
        responsible: "",
        password: "",
        acceptTerms: false,
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
      title="Cadastro da Empresa"
      subtitle="Crie sua conta e comece a gerenciar a produção"
      footer={
        <p className="text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="text-cyan-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
          >
            Entrar
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
          <label
            htmlFor="companyName"
            className="text-sm font-medium text-slate-700"
          >
            Nome da empresa
          </label>
          <input
            id="companyName"
            name="companyName"
            placeholder="Sua empresa Ltda"
            onChange={handleChange}
            className={formInputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cnpj" className="text-sm font-medium text-slate-700">
            CNPJ
          </label>
          <input
            id="cnpj"
            name="cnpj"
            inputMode="numeric"
            placeholder="00.000.000/0001-00"
            value={form.cnpj}
            onChange={handleChange}
            className={formInputClass}
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="contato@empresa.com"
              onChange={handleChange}
              className={formInputClass}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              placeholder="(11) 99999-9999"
              onChange={handleChange}
              className={formInputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="responsible"
            className="text-sm font-medium text-slate-700"
          >
            Responsável
          </label>
          <input
            id="responsible"
            name="responsible"
            placeholder="Nome do responsável"
            onChange={handleChange}
            className={formInputClass}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              onChange={handleChange}
              className={`${formInputClass} pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            name="acceptTerms"
            onChange={handleChange}
            className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span>
            Eu concordo com os{" "}
            <span className="text-cyan-600 font-medium">Termos de Uso</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className={formButtonClass}
        >
          {isSubmitting ? "Enviando…" : "Concluir cadastro"}
        </button>
      </form>
    </AuthLayout>
  );
}
