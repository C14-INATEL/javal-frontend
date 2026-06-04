import { useEffect, type ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** Texto em destaque (ex.: nome do item a excluir). */
  highlight?: string;
  /** `danger`: exclusão (padrão). `neutral`: confirmações sem tom destrutivo. */
  variant?: "danger" | "neutral";
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  /** Texto do botão de confirmação enquanto `isLoading` (ex.: "Resolvendo…"). */
  loadingConfirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function TrashIcon() {
  return (
    <svg
      className="w-7 h-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-7 h-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function ConfirmDialog({
  open,
  title,
  description,
  highlight,
  variant = "danger",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  loadingConfirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="presentation"
      onClick={isLoading ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent ${
            variant === "danger"
              ? "from-red-500/10"
              : "from-cyan-500/10"
          }`}
          aria-hidden
        />

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 transition disabled:opacity-40"
        >
          <CloseIcon />
        </button>

        <div className="relative px-6 pt-8 pb-2 text-center">
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${
              variant === "danger"
                ? "bg-red-500/10 text-red-400 ring-red-500/20"
                : "bg-cyan-500/10 text-cyan-400 ring-cyan-500/20"
            }`}
          >
            {variant === "danger" ? <TrashIcon /> : <CheckIcon />}
          </div>

          <h2
            id="confirm-dialog-title"
            className="text-xl font-semibold tracking-tight text-white"
          >
            {title}
          </h2>

          <div id="confirm-dialog-description" className="mt-4 space-y-3">
            {highlight ? (
              <>
                <p className="text-sm text-slate-400">
                  {variant === "danger"
                    ? "Você está prestes a excluir"
                    : "Confirme os dados abaixo"}
                </p>
                <div className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3">
                  <p className="text-sm font-semibold text-white truncate">
                    {highlight}
                  </p>
                </div>
                <div className="flex justify-center px-1">
                  <div className="flex max-w-[min(100%,18rem)] items-start gap-2 text-left text-sm text-amber-400/90">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      />
                    </svg>
                    <span className="min-w-0 leading-snug">
                      {description ??
                        (variant === "danger"
                          ? "Esta ação é permanente e não pode ser desfeita."
                          : "Confirme para continuar.")}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              description && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {description}
                </p>
              )
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3 border-t border-white/10 bg-slate-950/40 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-800/80 border border-white/10 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white border transition disabled:opacity-50 ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500 border-red-500/40"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-105 border-cyan-500/30"
            }`}
          >
            {isLoading
              ? loadingConfirmLabel ??
                (variant === "danger" ? "Excluindo…" : "Processando…")
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
