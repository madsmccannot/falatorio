import { View, StyleSheet } from "react-native";
import { BannerAd as GBannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAds } from "./AdProvider";
import { useEntitlements } from "@/hooks/useEntitlements";
import { spacing } from "@falatorio/ui/tokens";

const AD_UNIT_ID = __DEV__ ? TestIds.BANNER : process.env["EXPO_PUBLIC_ADMOB_BANNER_ID"] ?? TestIds.BANNER;

export function BannerAdComponent() {
  const { initialized, gdprConsent } = useAds();
  const { isSuper } = useEntitlements();

  if (isSuper || !initialized) return null;

  return (
    <View style={styles.container}>
      <GBannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !gdprConsent,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
});
