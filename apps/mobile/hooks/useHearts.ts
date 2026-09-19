import { trpc } from "@/lib/trpc";

export function useHearts() {
  const state = trpc.hearts.getState.useQuery();
  const refillMutation = trpc.hearts.refillWithCrystals.useMutation();
  const continueMutation = trpc.hearts.continueWithCrystals.useMutation();
  const utils = trpc.useUtils();

  const refillWithCrystals = async () => {
    await refillMutation.mutateAsync();
    await utils.hearts.getState.invalidate();
    await utils.economy.getBalance.invalidate();
  };

  const continueWithCrystals = async (sessionId: string) => {
    const result = await continueMutation.mutateAsync({ sessionId });
    await utils.hearts.getState.invalidate();
    await utils.economy.getBalance.invalidate();
    return result;
  };

  return {
    hearts: state.data?.hearts ?? 0,
    unlimited: state.data?.unlimited ?? false,
    nextRefillAt: state.data?.nextRefillAt ?? null,
    nextRefillIn: state.data?.nextRefillAt
      ? Math.max(0, new Date(state.data.nextRefillAt).getTime() - Date.now())
      : null,
    isLoading: state.isLoading,
    refillWithCrystals,
    continueWithCrystals,
    isRefilling: refillMutation.isPending,
    isContinuing: continueMutation.isPending,
  };
}
