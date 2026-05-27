import {
  getMachineStatusLabel,
  type MachineStatus,
} from "../services/machines";

const STATUS_STYLES = {
  light: {
    ATIVA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INATIVA: "bg-slate-100 text-slate-600 border-slate-200",
    MANUTENCAO: "bg-amber-50 text-amber-800 border-amber-200",
  },
  dark: {
    ATIVA: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    INATIVA: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    MANUTENCAO: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
} as const;

type MachineStatusBadgeProps = {
  status: MachineStatus;
  variant?: keyof typeof STATUS_STYLES;
};

export default function MachineStatusBadge({
  status,
  variant = "light",
}: MachineStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[variant][status]}`}
    >
      {getMachineStatusLabel(status)}
    </span>
  );
}
