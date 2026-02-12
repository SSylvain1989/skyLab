import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMyPRs, fetchReviewRequests } from "../services/github";
import type { ReviewRequest } from "../types/github";

interface UseGitHubPRsOptions {
  username: string;
  token: string;
  pollingInterval: number; // minutes
  enabled: boolean;
}

export function useGitHubPRs({
  username,
  token,
  pollingInterval,
  enabled,
}: UseGitHubPRsOptions) {
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [myPRs, setMyPRs] = useState<ReviewRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFetchingRef = useRef(false);

  const doFetch = useCallback(
    async (signal?: AbortSignal) => {
      if (!username || !token) return;
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const [reviews, mine] = await Promise.all([
          fetchReviewRequests(username, token, signal),
          fetchMyPRs(username, token, signal),
        ]);
        if (signal?.aborted) return;
        setReviewRequests(reviews);
        setMyPRs(mine);
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
    [username, token],
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

  return { reviewRequests, myPRs, isLoading, error, lastUpdated, refresh: manualRefresh };
}
