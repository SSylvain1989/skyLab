export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubLabel {
  name: string;
  color: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  user: GitHubUser;
  repository_url: string;
  created_at: string;
  updated_at: string;
  draft: boolean;
  labels: GitHubLabel[];
  pull_request?: {
    html_url: string;
  };
}

export type AgeCategory = "fresh" | "aging" | "stale";
export type CIStatus = "success" | "failure" | "pending" | "neutral" | null;

export interface NotionLink {
  url: string;
  title: string;
}

export interface DiffStats {
  additions: number;
  deletions: number;
}

export interface ReviewRequest extends GitHubPR {
  age: AgeCategory;
  repoName: string;
  ciStatus: CIStatus;
  notionLink: NotionLink | null;
  diffStats: DiffStats | null;
}

export interface Settings {
  token: string;
  username: string;
  pollingInterval: number; // in minutes
  darkMode: boolean;
  showNotionLink: boolean;
  showCopyButton: boolean;
  showCIBadge: boolean;
  expoToken: string;
  expoProjectSlug: string; // format "account/project"
  activeTab: "prs" | "builds";
}

export const DEFAULT_SETTINGS: Settings = {
  token: "",
  username: "",
  pollingInterval: 5,
  darkMode: true,
  showNotionLink: true,
  showCopyButton: true,
  showCIBadge: true,
  expoToken: "",
  expoProjectSlug: "",
  activeTab: "prs",
};
