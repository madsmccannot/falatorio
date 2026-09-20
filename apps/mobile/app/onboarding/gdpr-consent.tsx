import { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { setBoolean, KEYS } from "@/lib/storage";

export default function GDPRConsentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    setLoading(true);
    setBoolean(KEYS.GDPR_CONSENT, true);
    router.push("/onboarding/select-goal");
  };

  const handleDecline = () => {
    setBoolean(KEYS.GDPR_CONSENT, false);
    router.push("/onboarding/select-goal");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Privacy & Ads</Text>
        <Text style={styles.subtitle}>
          Falatório is free to use. Ads help keep it that way.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What we collect</Text>
          <Text style={styles.cardText}>
            Learning progress, exercise scores, and usage patterns to personalize your experience.
            No data is sold to third parties.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personalized ads</Text>
          <Text style={styles.cardText}>
            If you consent, we show ads tailored to your interests.
            Without consent, you still see ads — just not personalized ones.
            Super subscribers see zero ads.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your rights</Text>
          <Text style={styles.cardText}>
            You can change this anytime in Settings. You can request data export or deletion at any time.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title="Accept personalized ads"
          onPress={handleAccept}
          loading={loading}
          size="lg"
        />
        <Button
          title="Continue without personalization"
          onPress={handleDecline}
          variant="ghost"
          size="md"
          style={styles.declineButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.neutral[500],
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  cardText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  declineButton: {
    marginTop: spacing.sm,
  },
});
