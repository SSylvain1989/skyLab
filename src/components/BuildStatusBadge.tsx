import type { EASBuildStatus } from "../types/eas";

const config: Record<
  EASBuildStatus,
  { label: string; dot: string; pulse?: boolean }
> = {
  FINISHED: { label: "Success", dot: "bg-[var(--fresh)]" },
  ERRORED: { label: "Erreur", dot: "bg-[var(--stale)]" },
  IN_PROGRESS: { label: "En cours", dot: "bg-[var(--aging)]", pulse: true },
  IN_QUEUE: { label: "En queue", dot: "bg-[var(--aging)]" },
  NEW: { label: "Nouveau", dot: "bg-[var(--aging)]" },
  CANCELED: { label: "Annule", dot: "bg-[var(--text-tertiary)]" },
  PENDING_CANCEL: { label: "Annulation", dot: "bg-[var(--text-tertiary)]" },
};

interface BuildStatusBadgeProps {
  status: EASBuildStatus;
}

export function BuildStatusBadge({ status }: BuildStatusBadgeProps) {
  const { label, dot, pulse } = config[status];
  return (
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
      <span
        className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse ? "animate-pulse" : ""}`}
      />
      {label}
    </span>
  );
}
