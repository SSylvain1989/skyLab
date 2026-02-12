import type { CIStatus } from "../types/github";

const config: Record<
  Exclude<CIStatus, null>,
  { label: string; dot: string; spin?: boolean }
> = {
  success: { label: "CI passed", dot: "bg-[var(--fresh)]" },
  failure: { label: "CI failed", dot: "bg-[var(--stale)]" },
  pending: { label: "CI running", dot: "bg-[var(--aging)]", spin: true },
  neutral: { label: "CI skipped", dot: "bg-[var(--text-tertiary)]" },
};

interface CIBadgeProps {
  status: CIStatus;
}

export function CIBadge({ status }: CIBadgeProps) {
  if (!status) return null;
  const { label, dot, spin } = config[status];
  return (
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
      <span
        className={`w-1.5 h-1.5 rounded-full ${dot} ${spin ? "animate-pulse" : ""}`}
      />
      {label}
    </span>
  );
}
