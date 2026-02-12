export type EASBuildStatus =
  | "FINISHED"
  | "ERRORED"
  | "IN_PROGRESS"
  | "IN_QUEUE"
  | "NEW"
  | "CANCELED"
  | "PENDING_CANCEL";

export type EASPlatform = "ANDROID" | "IOS";

export interface EASBuild {
  id: string;
  status: EASBuildStatus;
  platform: EASPlatform;
  buildProfile: string | null;
  channel: string | null;
  distribution: string | null;
  gitCommitHash: string | null;
  appVersion: string | null;
  appBuildVersion: string | null;
  createdAt: string;
  completedAt: string | null;
  artifacts: {
    buildUrl: string | null;
  } | null;
  error: {
    message: string;
  } | null;
  initiatingActor: {
    __typename: string;
    id: string;
    displayName: string;
  } | null;
}

export interface EASBuildGroup {
  profile: string;
  builds: EASBuild[];
}

export interface EASAppByFullNameResponse {
  app: {
    byFullName: {
      id: string;
      slug: string;
      ownerAccount: {
        name: string;
      };
    };
  };
}

export interface EASViewBuildsResponse {
  app: {
    byId: {
      builds: EASBuild[];
    };
  };
}
