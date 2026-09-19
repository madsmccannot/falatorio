import { useCallback, useEffect, useRef } from "react";
import {
  InterstitialAd as GInterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useAds } from "./AdProvider";
import { useEntitlements } from "@/hooks/useEntitlements";

const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TestIds.INTERSTITIAL;

export function useInterstitialAd() {
  const { initialized, gdprConsent } = useAds();
  const { isSuper } = useEntitlements();
  const adRef = useRef<GInterstitialAd | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (isSuper || !initialized) return;

    const ad = GInterstitialAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: !gdprConsent,
    });

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      ad.load();
    });

    ad.load();
    adRef.current = ad;

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, [initialized, isSuper, gdprConsent]);

  const show = useCallback(async () => {
    if (isSuper || !loadedRef.current || !adRef.current) return false;
    adRef.current.show();
    return true;
  }, [isSuper]);

  return { show, isReady: loadedRef.current && !isSuper };
}
