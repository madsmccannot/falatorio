import { trpc } from "@/lib/trpc";
import { hasFeature, type Feature } from "@falatorio/core/entitlements";
import type { Tier } from "@falatorio/core";

export function useEntitlements() {
  const session = trpc.auth.getSession.useQuery();

  const tier: Tier = (session.data?.tier as Tier) ?? "free";
  const isSuper = tier === "super";

  const can = (feature: Feature): boolean => {
    return hasFeature(tier, feature);
  };

  return {
    tier,
    isSuper,
    can,
    isLoading: session.isLoading,
  };
}
