import { type StatusOrdem } from "../services/orders";

const STATUS_LABELS: Record<StatusOrdem, string> = {
  PENDENTE: "Pendente",
  EM_PRODUCAO: "Em produção",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

const STATUS_STYLES = {
  dark: {
    PENDENTE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    EM_PRODUCAO: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    FINALIZADA: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    CANCELADA: "bg-rose-500/15 text-rose-300 border-rose-500/35",
  },
} as const;

export function getStatusOrdemLabel(status: StatusOrdem): string {
  return STATUS_LABELS[status];
}

type OrderStatusBadgeProps = {
  status: StatusOrdem;
  variant?: keyof typeof STATUS_STYLES;
};

/** Badge colorido por valor de `StatusOrdem`. */
export default function OrderStatusBadge({
  status,
  variant = "dark",
}: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[variant][status]}`}
    >
      {getStatusOrdemLabel(status)}
    </span>
  );
}
