import { fetch } from "@tauri-apps/plugin-http";
import pLimit from "p-limit";
import type {
  AgeCategory,
  CIStatus,
  DiffStats,
  GitHubPR,
  NotionLink,
  ReviewRequest,
} from "../types/github";

const GITHUB_API = "https://api.github.com";
const limit = pLimit(5);

function calcAge(dateStr: string): AgeCategory {
  const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  if (hours < 24) return "fresh";
  if (hours < 48) return "aging";
  return "stale";
}

function extractRepoName(repositoryUrl: string): string {
  // repository_url format: https://api.github.com/repos/owner/name
  const parts = repositoryUrl.split("/");
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

async function searchIssues(
  query: string,
  token: string,
  signal?: AbortSignal,
): Promise<GitHubPR[]> {
  const url = `${GITHUB_API}/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=50`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.message || `GitHub API error: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  return data.items;
}

interface PRDetails {
  sha: string | null;
  diffStats: DiffStats | null;
}

async function fetchPRDetails(
  repoFullName: string,
  prNumber: number,
  token: string,
  signal?: AbortSignal,
): Promise<PRDetails> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${repoFullName}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        signal,
      },
    );
    if (!res.ok) return { sha: null, diffStats: null };
    const data = await res.json();
    return {
      sha: data.head?.sha || null,
      diffStats:
        data.additions != null && data.deletions != null
          ? { additions: data.additions, deletions: data.deletions }
          : null,
    };
  } catch {
    return { sha: null, diffStats: null };
  }
}

async function fetchCIStatus(
  repoFullName: string,
  sha: string,
  token: string,
  signal?: AbortSignal,
): Promise<CIStatus> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${repoFullName}/commits/${sha}/check-runs?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        signal,
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const runs = data.check_runs as Array<{
      status: string;
      conclusion: string | null;
    }>;
    if (runs.length === 0) return null;

    const hasInProgress = runs.some(
      (r) => r.status === "in_progress" || r.status === "queued",
    );
    if (hasInProgress) return "pending";

    const hasFailed = runs.some((r) =>
      ["failure", "timed_out", "cancelled", "action_required"].includes(
        r.conclusion ?? "",
      ),
    );
    if (hasFailed) return "failure";

    const allNeutral = runs.every((r) =>
      ["neutral", "skipped"].includes(r.conclusion ?? ""),
    );
    if (allNeutral) return "neutral";

    return "success";
  } catch {
    return null;
  }
}

function extractNotionLinkFromHtml(html: string): NotionLink | null {
  const match = html.match(
    /<a[^>]+href="(https?:\/\/[^"]*notion\.so[^"]*)"[^>]*>([^<]+)<\/a>/,
  );
  if (!match) return null;
  const url = match[1];
  const title = match[2];
  return { title: title.startsWith("http") ? "Notion" : title, url };
}

async function fetchNotionLink(
  repoFullName: string,
  prNumber: number,
  token: string,
  signal?: AbortSignal,
): Promise<NotionLink | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${repoFullName}/issues/${prNumber}/comments?per_page=30`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.full+json",
        },
        signal,
      },
    );
    if (!res.ok) return null;
    const comments = (await res.json()) as Array<{
      body_html?: string;
      user: { login: string };
    }>;

    // Priorite au bot notion-workspace
    const botComment = comments.find((c) =>
      c.user.login.toLowerCase().includes("notion-workspace"),
    );
    if (botComment?.body_html) {
      const link = extractNotionLinkFromHtml(botComment.body_html);
      if (link) return link;
    }

    // Fallback : n'importe quel commentaire avec un lien Notion
    for (const comment of comments) {
      if (!comment.body_html) continue;
      const link = extractNotionLinkFromHtml(comment.body_html);
      if (link) return link;
    }
    return null;
  } catch {
    return null;
  }
}

async function enrichPRs(
  prs: ReviewRequest[],
  token: string,
  signal?: AbortSignal,
): Promise<ReviewRequest[]> {
  const enriched = await Promise.all(
    prs.map((pr) =>
      limit(async () => {
        const [details, notionLink] = await Promise.all([
          fetchPRDetails(pr.repoName, pr.number, token, signal),
          fetchNotionLink(pr.repoName, pr.number, token, signal),
        ]);
        const ciStatus = details.sha
          ? await fetchCIStatus(pr.repoName, details.sha, token, signal)
          : null;
        return { ...pr, ciStatus, notionLink, diffStats: details.diffStats };
      }),
    ),
  );
  return enriched;
}

export async function fetchReviewRequests(
  username: string,
  token: string,
  signal?: AbortSignal,
): Promise<ReviewRequest[]> {
  const prs = await searchIssues(
    `review-requested:${username} is:pr is:open`,
    token,
    signal,
  );

  const mapped = prs.map((pr) => ({
    ...pr,
    age: calcAge(pr.created_at),
    repoName: extractRepoName(pr.repository_url),
    ciStatus: null as CIStatus,
    notionLink: null,
    diffStats: null,
  }));

  return enrichPRs(mapped, token, signal);
}

export async function fetchMyPRs(
  username: string,
  token: string,
  signal?: AbortSignal,
): Promise<ReviewRequest[]> {
  const prs = await searchIssues(
    `author:${username} is:pr is:open`,
    token,
    signal,
  );

  const mapped = prs.map((pr) => ({
    ...pr,
    age: calcAge(pr.created_at),
    repoName: extractRepoName(pr.repository_url),
    ciStatus: null as CIStatus,
    notionLink: null,
    diffStats: null,
  }));

  return enrichPRs(mapped, token, signal);
}
