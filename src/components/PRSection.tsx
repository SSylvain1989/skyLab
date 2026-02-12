import type { ReviewRequest } from "../types/github";
import { EmptyState } from "./EmptyState";
import { PRCard } from "./PRCard";

export interface DisplayOptions {
  showNotionLink: boolean;
  showCopyButton: boolean;
  showCIBadge: boolean;
}

interface PRSectionProps {
  title: string;
  count: number;
  prs: ReviewRequest[];
  showAge?: boolean;
  emptyMessage: string;
  display: DisplayOptions;
}

export function PRSection({
  title,
  count,
  prs,
  showAge = true,
  emptyMessage,
  display,
}: PRSectionProps) {
  return (
    <div className="mt-1">
      <div className="px-5 py-1.5 flex items-center gap-2">
        <h2 className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          {title}
        </h2>
        <span className="text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-md font-medium">
          {count}
        </span>
      </div>
      {prs.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        prs.map((pr) => <PRCard key={pr.id} pr={pr} showAge={showAge} display={display} />)
      )}
    </div>
  );
}
