import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import conveyorImg from "../assets/conveyor.png";
import { clearAuthSession, getAuthCompany } from "../lib/auth";

type AppLayoutProps = {
  category?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function AppLayout({
  category = "JAVAL",
  title,
  subtitle,
  action,
  children,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const company = getAuthCompany();

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-amber-400/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/machines"
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg"
          >
            <img
              src={conveyorImg}
              alt=""
              className="w-9 h-9 object-contain"
              aria-hidden
            />
            <span className="text-lg font-extrabold tracking-[0.15em] text-white">
              JAVAL
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {company && (
              <p className="hidden sm:block text-sm text-slate-400 truncate max-w-[200px]">
                <span className="text-slate-500">Empresa: </span>
                <span className="text-slate-200 font-medium">
                  {company.companyName}
                </span>
              </p>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 transition focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-2">
              {category}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
