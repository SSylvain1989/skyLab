import type { EASBuildGroup } from "../types/eas";
import { BuildCard } from "./BuildCard";

interface BuildProfileSectionProps {
  group: EASBuildGroup;
  accountName: string;
  projectSlug: string;
  onQRCode: (url: string) => void;
}

export function BuildProfileSection({
  group,
  accountName,
  projectSlug,
  onQRCode,
}: BuildProfileSectionProps) {
  return (
    <div className="mt-1">
      <div className="px-5 py-1.5 flex items-center gap-2">
        <h2 className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          {group.profile}
        </h2>
        <span className="text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-md font-medium">
          {group.builds.length}
        </span>
      </div>
      {group.builds.map((build) => (
        <BuildCard
          key={build.id}
          build={build}
          detailsUrl={`https://expo.dev/accounts/${accountName}/projects/${projectSlug}/builds/${build.id}`}
          onQRCode={onQRCode}
        />
      ))}
    </div>
  );
}
