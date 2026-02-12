import { openUrl } from "@tauri-apps/plugin-opener";
import type { EASBuild } from "../types/eas";
import { timeAgo } from "../utils/time";
import { BuildStatusBadge } from "./BuildStatusBadge";

interface BuildCardProps {
  build: EASBuild;
  detailsUrl: string;
  onQRCode: (url: string) => void;
}

function PlatformIcon({ platform }: { platform: "IOS" | "ANDROID" }) {
  if (platform === "IOS") {
    return (
      <svg className="w-4 h-4 shrink-0 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 shrink-0 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.341c-.583 0-1.05.468-1.05 1.051s.468 1.051 1.05 1.051c.584 0 1.051-.468 1.051-1.051s-.467-1.051-1.051-1.051zm-11.046 0c-.583 0-1.051.468-1.051 1.051s.468 1.051 1.051 1.051c.583 0 1.05-.468 1.05-1.051s-.467-1.051-1.05-1.051zm11.405-6.02l1.997-3.46a.416.416 0 00-.152-.567.416.416 0 00-.568.152L17.12 8.95c-1.543-.703-3.272-1.094-5.12-1.094s-3.577.39-5.12 1.094L4.84 5.446a.416.416 0 00-.568-.152.416.416 0 00-.152.567l1.997 3.46C2.688 11.186.343 14.56 0 18.545h24c-.344-3.985-2.688-7.36-6.118-9.224z" />
    </svg>
  );
}

export function BuildCard({ build, detailsUrl, onQRCode }: BuildCardProps) {
  const handleClick = () => {
    openUrl(detailsUrl);
  };

  const handleQR = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = build.artifacts?.buildUrl || detailsUrl;
    onQRCode(url);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (build.artifacts?.buildUrl) {
      openUrl(build.artifacts.buildUrl);
    }
  };

  const distLabel = build.distribution || "unknown";
  const gitRef = build.gitCommitHash?.slice(0, 7);
  const version = build.appVersion
    ? build.appBuildVersion
      ? `${build.appVersion} (${build.appBuildVersion})`
      : build.appVersion
    : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left flex items-start gap-3 mx-2 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-colors cursor-pointer group"
    >
      <div className="mt-0.5 shrink-0">
        <PlatformIcon platform={build.platform} />
      </div>

      <div className="flex-1 min-w-0">
        {/* First row: distribution, status, time */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {distLabel}
          </span>
          <BuildStatusBadge status={build.status} />
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {timeAgo(new Date(build.createdAt))}
          </span>
        </div>

        {/* Second row: git hash, version */}
        <div className="flex items-center gap-2 mt-1">
          {gitRef && (
            <span className="text-[12px] text-[var(--text-tertiary)] font-mono">
              {gitRef}
            </span>
          )}
          {version && (
            <span className="text-[12px] text-[var(--text-secondary)]">
              {version}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {build.artifacts?.buildUrl && (
          <>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1 rounded-md hover:bg-[var(--bg-active)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all cursor-pointer"
              title="Telecharger"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleQR}
              className="p-1 rounded-md hover:bg-[var(--bg-active)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all cursor-pointer"
              title="QR Code"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm14 3h.01M17 17h.01M14 14h3v3h-3v-3zm3 3h3v3h-3v-3z" />
              </svg>
            </button>
          </>
        )}
        <svg
          className="w-3.5 h-3.5 text-[var(--text-tertiary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </button>
  );
}
