import { trpc } from "@/lib/trpc";

export function useStreak() {
  const streak = trpc.gamification.getStreak.useQuery();
  const recordMutation = trpc.gamification.recordDailyActivity.useMutation();
  const freezeMutation = trpc.gamification.purchaseStreakFreeze.useMutation();
  const utils = trpc.useUtils();

  const recordActivity = async () => {
    const result = await recordMutation.mutateAsync();
    await utils.gamification.getStreak.invalidate();
    return result;
  };

  const purchaseFreeze = async () => {
    const result = await freezeMutation.mutateAsync();
    await utils.gamification.getStreak.invalidate();
    await utils.economy.getBalance.invalidate();
    return result;
  };

  return {
    currentDays: streak.data?.currentDays ?? 0,
    longestDays: streak.data?.longestDays ?? 0,
    freezeAvailable: streak.data?.freezeAvailable ?? false,
    isActive: streak.data?.isActive ?? false,
    isLoading: streak.isLoading,
    recordActivity,
    purchaseFreeze,
  };
}
