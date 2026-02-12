import type { EASBuildGroup } from "../types/eas";
import { BuildProfileSection } from "./BuildProfileSection";
import { EmptyState } from "./EmptyState";

interface BuildsViewProps {
  buildGroups: EASBuildGroup[];
  accountName: string;
  projectSlug: string;
  onQRCode: (url: string) => void;
}

export function BuildsView({
  buildGroups,
  accountName,
  projectSlug,
  onQRCode,
}: BuildsViewProps) {
  if (buildGroups.length === 0) {
    return <EmptyState message="Aucun build EAS trouve" />;
  }

  return (
    <>
      {buildGroups.map((group) => (
        <BuildProfileSection
          key={group.profile}
          group={group}
          accountName={accountName}
          projectSlug={projectSlug}
          onQRCode={onQRCode}
        />
      ))}
    </>
  );
}
