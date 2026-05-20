import type { ReactNode } from "react";
import conveyorImg from "../assets/conveyor.png";

export const formInputClass =
  "w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 focus:bg-white transition";

export const formButtonClass =
  "w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <aside className="relative lg:w-[44%] xl:w-[42%] flex flex-col items-center justify-center overflow-hidden px-8 py-12 lg:py-16">
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950"
            aria-hidden
          />
          <div
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            <div className="mb-8 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
              <img
                src={conveyorImg}
                alt="Automação industrial — braço robótico e esteira"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-lg"
              />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[0.2em] text-white">
              JAVAL
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xs">
              Gestão inteligente de produção e máquinas industriais
            </p>

            <div className="mt-8 hidden lg:flex gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-400/15 text-amber-300 border border-amber-400/25">
                Automação
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                Produção
              </span>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8 bg-slate-50">
          <div
            className={`w-full ${wide ? "max-w-xl" : "max-w-md"} bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10`}
          >
            <div className="lg:hidden flex justify-center mb-6">
              <img
                src={conveyorImg}
                alt=""
                className="w-20 h-20 object-contain opacity-90"
                aria-hidden
              />
            </div>

            <header className="mb-8 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 mb-1">
                JAVAL
              </p>
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-slate-500 text-sm">{subtitle}</p>
            </header>

            {children}

            {footer && (
              <footer className="mt-6 pt-2 border-t border-slate-100">
                {footer}
              </footer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
