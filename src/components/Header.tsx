import { timeAgo } from "../utils/time";

interface HeaderProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
  onSettingsClick: () => void;
  activeTab?: "prs" | "builds";
  onTabChange?: (tab: "prs" | "builds") => void;
  showBuildTab?: boolean;
}

export function Header({
  lastUpdated,
  isLoading,
  onRefresh,
  onSettingsClick,
  activeTab = "prs",
  onTabChange,
  showBuildTab = false,
}: HeaderProps) {
  return (
    <div data-tauri-drag-region className="flex items-center justify-between px-5 pt-4 pb-1">
      <div data-tauri-drag-region className="flex items-center gap-2.5">
        <svg className="w-6 h-6 text-[var(--text-primary)]" viewBox="0 -3.1 2490.3 2493" xmlns="http://www.w3.org/2000/svg">
          <path d="m1245.2 1.6c-687.6 0-1245.2 557.4-1245.2 1245.1 0 550.2 356.8 1016.9 851.5 1181.5 62.2 11.5 85.1-27 85.1-59.9 0-29.7-1.2-127.8-1.7-231.8-346.4 75.3-419.5-146.9-419.5-146.9-56.6-143.9-138.3-182.2-138.3-182.2-113-77.3 8.5-75.7 8.5-75.7 125 8.8 190.9 128.3 190.9 128.3 111.1 190.4 291.3 135.3 362.3 103.5 11.2-80.5 43.4-135.4 79.1-166.5-276.6-31.5-567.3-138.3-567.3-615.4 0-135.9 48.6-247 128.3-334.2-12.9-31.3-55.5-157.9 12.1-329.4 0 0 104.6-33.5 342.5 127.6 99.3-27.6 205.8-41.4 311.7-41.9 105.8.5 212.4 14.3 311.9 41.9 237.7-161.1 342.1-127.6 342.1-127.6 67.8 171.5 25.1 298.2 12.2 329.5 79.8 87.2 128.1 198.3 128.1 334.2 0 478.2-291.3 583.6-568.6 614.4 44.7 38.6 84.5 114.4 84.5 230.6 0 166.6-1.4 300.7-1.4 341.7 0 33.1 22.4 72 85.5 59.7 494.5-164.8 850.8-631.4 850.8-1181.4 0-687.7-557.5-1245.1-1245.1-1245.1" fill="currentColor"/>
        </svg>
        {showBuildTab && onTabChange ? (
          <div className="flex items-center bg-[var(--bg-elevated)] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onTabChange("prs")}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                activeTab === "prs"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              PRs
            </button>
            <button
              type="button"
              onClick={() => onTabChange("builds")}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                activeTab === "builds"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Builds
            </button>
          </div>
        ) : (
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            skyLab
          </span>
        )}
        {lastUpdated && (
          <span className="text-[11px] text-[var(--text-tertiary)] ml-1">
            {timeAgo(lastUpdated)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all disabled:opacity-40 cursor-pointer"
          title="Rafraichir"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={onSettingsClick}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all cursor-pointer"
          title="Parametres"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
