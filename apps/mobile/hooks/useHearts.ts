import { trpc } from "@/lib/trpc";

export function useHearts() {
  const state = trpc.hearts.getState.useQuery();
  const refillMutation = trpc.hearts.refillWithOuro.useMutation();
  const continueMutation = trpc.hearts.continueWithOuro.useMutation();
  const utils = trpc.useUtils();

  const refillWithOuro = async () => {
    await refillMutation.mutateAsync();
    await utils.hearts.getState.invalidate();
    await utils.economy.getBalance.invalidate();
  };

  const continueWithOuro = async (sessionId: string) => {
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
    refillWithOuro,
    continueWithOuro,
    isRefilling: refillMutation.isPending,
    isContinuing: continueMutation.isPending,
  };
}
