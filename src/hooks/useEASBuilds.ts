import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEASBuilds } from "../services/eas";
import type { EASBuildGroup } from "../types/eas";

interface UseEASBuildsOptions {
  expoToken: string;
  projectSlug: string;
  pollingInterval: number; // minutes
  enabled: boolean;
}

export function useEASBuilds({
  expoToken,
  projectSlug,
  pollingInterval,
  enabled,
}: UseEASBuildsOptions) {
  const [buildGroups, setBuildGroups] = useState<EASBuildGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFetchingRef = useRef(false);

  const doFetch = useCallback(
    async (signal?: AbortSignal) => {
      if (!expoToken || !projectSlug) return;
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const groups = await fetchEASBuilds(projectSlug, expoToken, signal);
        if (signal?.aborted) return;
        setBuildGroups(groups);
        setLastUpdated(new Date());
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        isFetchingRef.current = false;
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [expoToken, projectSlug],
  );

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    doFetch(controller.signal);

    const intervalId = setInterval(
      () => doFetch(controller.signal),
      pollingInterval * 60 * 1000,
    );

    return () => {
      controller.abort();
      clearInterval(intervalId);
      isFetchingRef.current = false;
    };
  }, [enabled, doFetch, pollingInterval]);

  const manualRefresh = useCallback(() => {
    doFetch();
  }, [doFetch]);

  return { buildGroups, isLoading, error, lastUpdated, refresh: manualRefresh };
}
