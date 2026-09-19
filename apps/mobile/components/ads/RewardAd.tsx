import { useCallback, useEffect, useRef, useState } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useAds } from "./AdProvider";
import { useEntitlements } from "@/hooks/useEntitlements";

const AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : process.env["EXPO_PUBLIC_ADMOB_REWARD_ID"] ?? TestIds.REWARDED;

export function useRewardAd() {
  const { initialized, gdprConsent } = useAds();
  const { isSuper } = useEntitlements();
  const adRef = useRef<RewardedAd | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isSuper || !initialized) return;

    const ad = RewardedAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: !gdprConsent,
    });

    const unsubLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setIsReady(true)
    );

    const unsubEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {}
    );

    ad.load();
    adRef.current = ad;

    return () => {
      unsubLoaded();
      unsubEarned();
    };
  }, [initialized, isSuper, gdprConsent]);

  const show = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isSuper || !isReady || !adRef.current) {
        resolve(false);
        return;
      }

      const ad = adRef.current;

      const unsubEarned = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          unsubEarned();
          setIsReady(false);

          const nextAd = RewardedAd.createForAdRequest(AD_UNIT_ID, {
            requestNonPersonalizedAdsOnly: !gdprConsent,
          });
          nextAd.addAdEventListener(RewardedAdEventType.LOADED, () =>
            setIsReady(true)
          );
          nextAd.load();
          adRef.current = nextAd;

          resolve(true);
        }
      );

      ad.show();
    });
  }, [isSuper, isReady, gdprConsent]);

  return { show, isReady: isReady && !isSuper };
}
