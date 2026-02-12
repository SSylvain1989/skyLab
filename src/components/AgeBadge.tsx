import type { AgeCategory } from "../types/github";

const config: Record<AgeCategory, { label: string; dot: string }> = {
  fresh: { label: "< 1j", dot: "bg-[var(--fresh)]" },
  aging: { label: "1-2j", dot: "bg-[var(--aging)]" },
  stale: { label: "> 2j", dot: "bg-[var(--stale)]" },
};

interface AgeBadgeProps {
  age: AgeCategory;
}

export function AgeBadge({ age }: AgeBadgeProps) {
  const { label, dot } = config[age];
  return (
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
