import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { ChatIcon, LockIcon, StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import Svg, { Path } from "react-native-svg";

function ArrowLeftIcon({ size = 24, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MicLargeIcon({ size = 48, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SoundWaveIcon({ size = 20, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12h2m4-6v12m4-16v20m4-16v12m4-6h2" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const PT_EU_SOUNDS = [
  { sound: "nh", ipa: "/ɲ/", example: "vinho", tip: "like_ny" },
  { sound: "lh", ipa: "/ʎ/", example: "filho", tip: "like_ly" },
  { sound: "ão", ipa: "/ɐ̃w̃/", example: "pão", tip: "nasal_dipthong" },
  { sound: "õe", ipa: "/õj̃/", example: "lições", tip: "nasal_dipthong" },
  { sound: "r", ipa: "/ʁ/", example: "rato", tip: "uvular_r" },
  { sound: "-r", ipa: "/ɾ/", example: "caro", tip: "flap_r" },
  { sound: "s/z", ipa: "/ʃ/ʤ/", example: "casas", tip: "sibilant" },
] as const;

export default function SpeakScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = trpc.lesson.hasCompletedLesson.useQuery();

  const hasCompleted = data?.hasCompleted ?? false;

  if (isLoading) {
    return <Loading fullScreen message="" />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeftIcon size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>{t("practice.speak_title")}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t("practice.speak_desc")}</Text>
        </View>
      </View>

      {!hasCompleted ? (
        <View style={styles.centered}>
          <LockIcon size={48} color={theme.textMuted} />
          <Text style={[styles.lockedTitle, { color: theme.text }]}>
            {t("practice.locked_title")}
          </Text>
          <Text style={[styles.lockedText, { color: theme.textMuted }]}>
            {t("practice.locked_text")}
          </Text>
          <Button
            title={t("lesson.go_back")}
            onPress={() => router.back()}
            variant="outline"
            style={{ marginTop: spacing.xl }}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroIcon, { backgroundColor: colors.streak + "20" }]}>
            <MicLargeIcon size={48} color={colors.streak} />
          </View>

          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            {t("practice.speak_tip")}
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            PT-EU
          </Text>

          {PT_EU_SOUNDS.map((s) => (
            <View
              key={s.sound}
              style={[styles.soundCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            >
              <View style={[styles.soundBadge, { backgroundColor: colors.primary[100] }]}>
                <Text style={[styles.soundBadgeText, { color: colors.primary[700] }]}>{s.sound}</Text>
              </View>
              <View style={styles.soundInfo}>
                <Text style={[styles.soundIpa, { color: theme.textSecondary }]}>{s.ipa}</Text>
                <Text style={[styles.soundExample, { color: theme.text }]}>{s.example}</Text>
              </View>
              <SoundWaveIcon size={18} color={theme.textMuted} />
            </View>
          ))}

          <View style={styles.conversationSection}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/conversation");
              }}
              style={[styles.conversationCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.info + "20" }]}>
                <ChatIcon size={24} color={colors.info} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {t("practice.go_conversation")}
                </Text>
                <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>
                  {t("practice.conversation_desc")}
                </Text>
              </View>
              <StarIcon size={16} color={theme.textMuted} />
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  lockedTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  lockedText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
    alignItems: "center",
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  soundCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  soundBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  soundBadgeText: {
    fontSize: typography.sizes.md,
    fontWeight: "800",
  },
  soundInfo: {
    flex: 1,
  },
  soundIpa: {
    fontSize: typography.sizes.xs,
    fontWeight: "500",
  },
  soundExample: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    marginTop: 2,
  },
  conversationSection: {
    width: "100%",
    marginTop: spacing.xl,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
});
