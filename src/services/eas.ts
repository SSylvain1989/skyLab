import { fetch } from "@tauri-apps/plugin-http";
import type {
  EASAppByFullNameResponse,
  EASBuild,
  EASBuildGroup,
  EASViewBuildsResponse,
} from "../types/eas";

const EAS_GRAPHQL_URL = "https://api.expo.dev/graphql";

let cachedAppId: { slug: string; appId: string; accountName: string; projectName: string } | null = null;

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(EAS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`EAS API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(`EAS GraphQL error: ${json.errors[0].message}`);
  }

  return json.data as T;
}

function normalizeSlug(slug: string): string {
  // Ensure the slug starts with @ for the GraphQL API
  const trimmed = slug.trim().replace(/^@/, "");
  return `@${trimmed}`;
}

async function resolveAppId(
  projectSlug: string,
  token: string,
  signal?: AbortSignal,
): Promise<{ appId: string; accountName: string; projectName: string }> {
  if (cachedAppId && cachedAppId.slug === projectSlug) {
    return cachedAppId;
  }

  const fullName = normalizeSlug(projectSlug);

  const query = `
    query AppByFullName($fullName: String!) {
      app {
        byFullName(fullName: $fullName) {
          id
          slug
          ownerAccount {
            name
          }
        }
      }
    }
  `;

  const data = await graphqlRequest<EASAppByFullNameResponse>(
    query,
    { fullName },
    token,
    signal,
  );

  const app = data.app.byFullName;
  cachedAppId = {
    slug: projectSlug,
    appId: app.id,
    accountName: app.ownerAccount.name,
    projectName: app.slug,
  };

  return cachedAppId;
}

async function fetchBuilds(
  appId: string,
  token: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<EASBuild[]> {
  const query = `
    query ViewBuilds($appId: String!, $offset: Int!, $limit: Int!) {
      app {
        byId(appId: $appId) {
          builds(offset: $offset, limit: $limit) {
            id
            status
            platform
            buildProfile
            channel
            distribution
            gitCommitHash
            appVersion
            appBuildVersion
            createdAt
            completedAt
            artifacts {
              buildUrl
            }
            error {
              message
            }
            initiatingActor {
              __typename
              id
              displayName
            }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest<EASViewBuildsResponse>(
    query,
    { appId, offset: 0, limit },
    token,
    signal,
  );

  return data.app.byId.builds;
}

function groupByProfile(builds: EASBuild[]): EASBuildGroup[] {
  const groups = new Map<string, EASBuild[]>();

  for (const build of builds) {
    const profile = build.buildProfile || "local";
    if (!groups.has(profile)) {
      groups.set(profile, []);
    }
    groups.get(profile)!.push(build);
  }

  const result: EASBuildGroup[] = [];

  for (const [profile, profileBuilds] of groups) {
    // Sort by createdAt desc
    profileBuilds.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Keep only the latest build per platform
    const latestByPlatform = new Map<string, EASBuild>();
    for (const build of profileBuilds) {
      if (!latestByPlatform.has(build.platform)) {
        latestByPlatform.set(build.platform, build);
      }
    }

    result.push({
      profile,
      builds: Array.from(latestByPlatform.values()),
    });
  }

  // Sort profiles alphabetically
  result.sort((a, b) => a.profile.localeCompare(b.profile));

  return result;
}

export async function fetchEASBuilds(
  projectSlug: string,
  token: string,
  signal?: AbortSignal,
): Promise<EASBuildGroup[]> {
  const { appId } = await resolveAppId(projectSlug, token, signal);
  const builds = await fetchBuilds(appId, token, 20, signal);
  return groupByProfile(builds);
}

export function getBuildDetailsUrl(
  accountName: string,
  projectSlug: string,
  buildId: string,
): string {
  return `https://expo.dev/accounts/${accountName}/projects/${projectSlug}/builds/${buildId}`;
}

export { resolveAppId };
