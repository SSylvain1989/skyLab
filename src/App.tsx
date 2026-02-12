import { useCallback, useMemo, useState } from "react";
import { BuildsView } from "./components/BuildsView";
import { Header } from "./components/Header";
import { PRSection } from "./components/PRSection";
import { QRCodeModal } from "./components/QRCodeModal";
import { SearchBar } from "./components/SearchBar";
import { SettingsView } from "./components/SettingsView";
import { useEASBuilds } from "./hooks/useEASBuilds";
import { useGitHubPRs } from "./hooks/useGitHubPRs";
import { useSettings } from "./hooks/useSettings";
import { isExpoConfigured } from "./services/storage";
import type { ReviewRequest } from "./types/github";
import "./index.css";

function filterPRs(prs: ReviewRequest[], query: string): ReviewRequest[] {
  if (!query.trim()) return prs;
  const q = query.toLowerCase();
  return prs.filter(
    (pr) =>
      pr.title.toLowerCase().includes(q) ||
      pr.repoName.toLowerCase().includes(q) ||
      pr.user.login.toLowerCase().includes(q),
  );
}

function App() {
  const {
    settings,
    configured,
    loading: settingsLoading,
    save,
    toggleDarkMode,
  } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const expoConfigured = isExpoConfigured(settings);

  const { reviewRequests, myPRs, isLoading, error, lastUpdated, refresh } =
    useGitHubPRs({
      username: settings.username,
      token: settings.token,
      pollingInterval: settings.pollingInterval,
      enabled: configured === true,
    });

  const {
    buildGroups,
    isLoading: buildsLoading,
    error: buildsError,
    lastUpdated: buildsLastUpdated,
    refresh: buildsRefresh,
  } = useEASBuilds({
    expoToken: settings.expoToken,
    projectSlug: settings.expoProjectSlug,
    pollingInterval: settings.pollingInterval,
    enabled: expoConfigured && settings.activeTab === "builds",
  });

  const dedupMyPRs = useMemo(() => {
    const reviewIds = new Set(reviewRequests.map((pr) => pr.id));
    return myPRs.filter((pr) => !reviewIds.has(pr.id));
  }, [reviewRequests, myPRs]);

  const filteredReviews = useMemo(
    () => filterPRs(reviewRequests, search),
    [reviewRequests, search],
  );
  const filteredMyPRs = useMemo(
    () => filterPRs(dedupMyPRs, search),
    [dedupMyPRs, search],
  );

  const handleTabChange = useCallback(
    async (tab: "prs" | "builds") => {
      const updated = { ...settings, activeTab: tab };
      await save(updated);
    },
    [settings, save],
  );

  // Derive account/project names from slug for building URLs
  const slugParts = settings.expoProjectSlug.split("/");
  const accountName = slugParts[0] || "";
  const projectName = slugParts[1] || "";

  const activeTab = settings.activeTab;
  const currentIsLoading = activeTab === "builds" ? buildsLoading : isLoading;
  const currentLastUpdated = activeTab === "builds" ? buildsLastUpdated : lastUpdated;
  const currentRefresh = activeTab === "builds" ? buildsRefresh : refresh;
  const currentError = activeTab === "builds" ? buildsError : error;

  // Wrapper commun : fond transparent + panel arrondi flottant (comme RetroPulse)
  const content = (() => {
    if (settingsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-[13px] text-[var(--text-tertiary)]">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Chargement...
          </div>
        </div>
      );
    }

    if (configured === false || showSettings) {
      return (
        <SettingsView
          settings={settings}
          onSave={async (s) => {
            await save(s);
            setShowSettings(false);
          }}
          onBack={configured ? () => setShowSettings(false) : undefined}
          isInitialSetup={!configured}
          onToggleDarkMode={toggleDarkMode}
        />
      );
    }

    return (
      <>
        <Header
          lastUpdated={currentLastUpdated}
          isLoading={currentIsLoading}
          onRefresh={currentRefresh}
          onSettingsClick={() => setShowSettings(true)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showBuildTab={expoConfigured}
        />

        {activeTab === "prs" && (
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              totalReviews={reviewRequests.length}
              totalMyPRs={dedupMyPRs.length}
            />

            {currentError && (
              <div className="mx-5 mb-1 px-3 py-2 bg-[var(--stale)]/10 border border-[var(--stale)]/20 rounded-lg">
                <p className="text-[12px] text-[var(--stale)]">{currentError}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
              <PRSection
                title="REVIEWS 🫵"
                count={filteredReviews.length}
                prs={filteredReviews}
                showAge={true}
                emptyMessage="Aucune review en attente"
                display={settings}
              />
              <PRSection
                title="Mes PRs"
                count={filteredMyPRs.length}
                prs={filteredMyPRs}
                showAge={false}
                emptyMessage="Aucune PR ouverte"
                display={settings}
              />
            </div>
          </>
        )}

        {activeTab === "builds" && (
          <>
            {currentError && (
              <div className="mx-5 mb-1 px-3 py-2 bg-[var(--stale)]/10 border border-[var(--stale)]/20 rounded-lg">
                <p className="text-[12px] text-[var(--stale)]">{currentError}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
              <BuildsView
                buildGroups={buildGroups}
                accountName={accountName}
                projectSlug={projectName}
                onQRCode={setQrUrl}
              />
            </div>
          </>
        )}
      </>
    );
  })();

  return (
    <main className={`m-2 h-[calc(100%-16px)] flex flex-col rounded-xl overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-strong)] ${settings.darkMode ? "" : "light"}`}>
      {content}
      {qrUrl && <QRCodeModal url={qrUrl} onClose={() => setQrUrl(null)} />}
    </main>
  );
}

export default App;
