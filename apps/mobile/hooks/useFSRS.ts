import { trpc } from "@/lib/trpc";

export function useFSRS() {
  const dueReviews = trpc.progress.getDueReviews.useQuery({ limit: 20 });
  const utils = trpc.useUtils();

  const refreshReviews = () => utils.progress.getDueReviews.invalidate();

  return {
    dueItems: dueReviews.data ?? [],
    dueCount: dueReviews.data?.length ?? 0,
    isLoading: dueReviews.isLoading,
    refreshReviews,
  };
}
