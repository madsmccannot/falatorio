import { useState } from "react";
import { trpc } from "@/lib/trpc";

export function useAdReward() {
  const [isWatching, setIsWatching] = useState(false);
  const adDecision = trpc.ads.getAdDecision.useQuery({ placement: "reward" });
  const recordMutation = trpc.ads.recordAdView.useMutation();
  const utils = trpc.useUtils();

  const canWatch = adDecision.data?.show ?? false;

  const claimReward = async (rewardType: "heart" | "ouro") => {
    setIsWatching(true);
    try {
      const result = await recordMutation.mutateAsync({
        adType: "reward",
        rewardType,
      });

      await utils.hearts.getState.invalidate();
      await utils.economy.getBalance.invalidate();
      await utils.ads.getAdDecision.invalidate();

      return result;
    } finally {
      setIsWatching(false);
    }
  };

  return {
    canWatch,
    isWatching,
    claimReward,
    options: adDecision.data?.options ?? null,
  };
}
