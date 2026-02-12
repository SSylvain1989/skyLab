interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  totalReviews: number;
  totalMyPRs: number;
}

export function SearchBar({
  value,
  onChange,
  totalReviews,
  totalMyPRs,
}: SearchBarProps) {
  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl px-4 py-2.5 focus-within:border-[var(--accent)] transition-colors">
        <svg
          className="w-[18px] h-[18px] text-[var(--text-tertiary)] shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={`Rechercher dans ${totalReviews + totalMyPRs} pull requests...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[var(--text-primary)] text-[15px] placeholder:text-[var(--text-tertiary)] focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
