import { trpc } from "@/lib/trpc";

export function useCrystals() {
  const balance = trpc.economy.getBalance.useQuery();
  const history = trpc.economy.getHistory.useQuery({ limit: 20, offset: 0 });
  const utils = trpc.useUtils();

  const refreshBalance = () => utils.economy.getBalance.invalidate();

  return {
    balance: balance.data?.balance ?? 0,
    history: history.data ?? [],
    isLoading: balance.isLoading,
    refreshBalance,
  };
}
