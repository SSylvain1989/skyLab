interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-6 px-4">
      <p className="text-[13px] text-[var(--text-tertiary)]">{message}</p>
    </div>
  );
}
