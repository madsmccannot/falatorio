import React, { createContext, useContext } from "react";
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import { storage, KEYS } from "@/lib/storage";

type AdContextValue = {
  initialized: boolean;
  gdprConsent: boolean;
};

const AdContext = createContext<AdContextValue>({
  initialized: false,
  gdprConsent: false,
});

export function useAds() {
  return useContext(AdContext);
}

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = React.useState(false);
  const gdprConsent = storage.getBoolean(KEYS.GDPR_CONSENT) ?? false;

  React.useEffect(() => {
    (async () => {
      try {
        await mobileAds().setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.PG,
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
        });
        await mobileAds().initialize();
        setInitialized(true);
      } catch {
        setInitialized(false);
      }
    })();
  }, []);

  return (
    <AdContext.Provider value={{ initialized, gdprConsent }}>
      {children}
    </AdContext.Provider>
  );
}
