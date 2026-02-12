import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { ReviewRequest } from "../types/github";
import type { DisplayOptions } from "./PRSection";
import { AgeBadge } from "./AgeBadge";
import { CIBadge } from "./CIBadge";

interface PRCardProps {
  pr: ReviewRequest;
  showAge?: boolean;
  display: DisplayOptions;
}

export function PRCard({ pr, showAge = true, display }: PRCardProps) {
  const [copied, setCopied] = useState(false);
  const url = pr.pull_request?.html_url || pr.html_url;

  const handleClick = () => {
    openUrl(url);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left flex items-start gap-3 mx-2 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-colors cursor-pointer group"
    >
      {/* Avatar */}
      <img
        src={pr.user.avatar_url}
        alt={pr.user.login}
        className="w-8 h-8 rounded-full mt-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="text-[14px] font-medium text-[var(--text-primary)] leading-snug truncate transition-colors">
          {pr.title}
        </p>

        {/* Repo + PR number */}
        <p className="text-[12px] text-[var(--text-secondary)] mt-1">
          {pr.repoName}
          <span className="text-[var(--text-tertiary)] ml-1.5">#{pr.number}</span>
        </p>

        {/* Author + badges */}
        <div className="flex items-center flex-wrap gap-2 mt-1">
          <span className="text-[12px] text-[var(--text-tertiary)]">
            {pr.user.login}
          </span>
          {showAge && <AgeBadge age={pr.age} />}
          {display.showCIBadge && <CIBadge status={pr.ciStatus} />}
          {pr.diffStats && (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-mono bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
              <span className="text-[var(--fresh)]">+{pr.diffStats.additions}</span>
              <span className="text-[var(--stale)]">&minus;{pr.diffStats.deletions}</span>
            </span>
          )}
          {pr.draft && (
            <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded font-medium">
              Draft
            </span>
          )}
        </div>

        {/* Notion link */}
        {display.showNotionLink && pr.notionLink && (
          <div className="mt-1.5">
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                openUrl(pr.notionLink!.url);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  openUrl(pr.notionLink!.url);
                }
              }}
              className="inline-flex items-center gap-1 text-[12px] text-[var(--accent)] hover:underline cursor-pointer min-w-0"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="truncate max-w-[40ch]">{pr.notionLink.title}</span>
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Copy link */}
        {display.showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-[var(--bg-active)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all cursor-pointer"
            title="Copier le lien de la PR"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-[var(--fresh)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        )}

        {/* Open in browser */}
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
