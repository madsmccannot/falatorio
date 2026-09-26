import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { Loading } from "@/components/ui/Loading";
import { Card } from "@/components/ui/Card";
import { getString, KEYS } from "@/lib/storage";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { SKILL_DOMAINS } from "@falatorio/core";
import Svg, { Path } from "react-native-svg";

const NON_LATIN_L1S = new Set(["hi", "bn", "ur", "ar", "zh", "ru", "uk", "ko", "ja"]);

const ALPHABET_GROUPS = [
  { id: "vowels", letters: ["A", "E", "I", "O", "U"], label: "Vogais" },
  { id: "accented", letters: ["A/E/O", "A/E/O", "A/O", "A", "C"], diacritics: ["´", "^", "~", "`", "¸"], label: "Acentos e sinais" },
  { id: "consonants_1", letters: ["B", "C", "D", "F", "G"], label: "Consoantes I" },
  { id: "consonants_2", letters: ["H", "J", "K", "L", "M"], label: "Consoantes II" },
  { id: "consonants_3", letters: ["N", "P", "Q", "R", "S"], label: "Consoantes III" },
  { id: "consonants_4", letters: ["T", "V", "W", "X", "Z"], label: "Consoantes IV" },
  { id: "digraphs", letters: ["LH", "NH", "CH", "RR", "SS"], label: "Digrafos" },
];

const DOMAIN_LABELS: Record<string, Record<string, string>> = {
  phonetics: { en: "Phonetics", pt: "Fonética" },
  morphology: { en: "Morphology", pt: "Morfologia" },
  tenses_moods: { en: "Tenses & Moods", pt: "Tempos e modos" },
  determiners: { en: "Determiners", pt: "Determinantes" },
  pronouns: { en: "Pronouns", pt: "Pronomes" },
  prepositions: { en: "Prepositions", pt: "Preposições" },
  syntax: { en: "Syntax", pt: "Sintaxe" },
  lexicon: { en: "Vocabulary", pt: "Vocabulário" },
  pragmatics: { en: "Pragmatics", pt: "Pragmática" },
  orthography: { en: "Spelling", pt: "Ortografia" },
};

function ChevronIcon({ size = 16, color = "#94A3B8", direction = "right" }: { size?: number; color?: string; direction?: "right" | "down" }) {
  const d = direction === "down" ? "M6 9l6 6 6-6" : "M9 18l6-6-6-6";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: color + "30" }]}>
      <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function ReferenceScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, lang } = useTranslation();
  const l1 = getString(KEYS.SELECTED_L1) ?? "en";
  const isNonLatin = NON_LATIN_L1S.has(l1);

  const glossary = trpc.mastery.getUserGlossary.useQuery(undefined, {
    enabled: true,
  });

  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [alphabetProgress, setAlphabetProgress] = useState<Record<string, number>>({});

  const groupedGlossary = (glossary.data ?? []).reduce<Record<string, typeof glossary.data>>((acc, ki) => {
    const domain = ki.domain;
    if (!acc[domain]) acc[domain] = [];
    acc[domain]!.push(ki);
    return acc;
  }, {});

  const toggleDomain = (domain: string) => {
    setExpandedDomain((prev) => (prev === domain ? null : domain));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{t("reference.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isNonLatin && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t("reference.alphabet_title")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              {t("reference.alphabet_desc")}
            </Text>

            <View style={styles.alphabetGrid}>
              {ALPHABET_GROUPS.map((group) => {
                const progress = alphabetProgress[group.id] ?? 0;
                return (
                  <Pressable
                    key={group.id}
                    style={[styles.alphabetCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                    onPress={() => {
                      setAlphabetProgress((prev) => ({
                        ...prev,
                        [group.id]: Math.min((prev[group.id] ?? 0) + 0.2, 1),
                      }));
                    }}
                  >
                    <Text style={[styles.alphabetLetters, { color: theme.text }]}>
                      {group.letters.slice(0, 3).join(" ")}
                    </Text>
                    <Text style={[styles.alphabetLabel, { color: theme.textMuted }]}>
                      {group.label}
                    </Text>
                    <ProgressBar progress={progress} color={colors.primary[500]} />
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: isNonLatin ? spacing.xl : 0 }]}>
          {t("reference.glossary_title")}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          {t("reference.glossary_desc")}
        </Text>

        {glossary.isLoading ? (
          <Loading message={t("reference.loading")} />
        ) : Object.keys(groupedGlossary).length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {t("reference.glossary_empty")}
            </Text>
          </Card>
        ) : (
          SKILL_DOMAINS.filter((d) => groupedGlossary[d]).map((domain) => {
            const items = groupedGlossary[domain]!;
            const isExpanded = expandedDomain === domain;
            const domainLabel = DOMAIN_LABELS[domain]?.[lang === "pt" ? "pt" : "en"] ?? domain;

            return (
              <View key={domain} style={styles.domainSection}>
                <Pressable
                  onPress={() => toggleDomain(domain)}
                  style={[styles.domainHeader, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                >
                  <View style={styles.domainLeft}>
                    <View style={[styles.domainDot, { backgroundColor: colors.primary[500] }]} />
                    <Text style={[styles.domainName, { color: theme.text }]}>
                      {domainLabel}
                    </Text>
                    <View style={[styles.domainCount, { backgroundColor: theme.bgInput }]}>
                      <Text style={[styles.domainCountText, { color: theme.textSecondary }]}>
                        {items.length}
                      </Text>
                    </View>
                  </View>
                  <ChevronIcon
                    direction={isExpanded ? "down" : "right"}
                    color={theme.textMuted}
                  />
                </Pressable>

                {isExpanded && (
                  <Animated.View entering={FadeIn.duration(200)} style={styles.domainItems}>
                    {items.map((ki) => {
                      const explanation = ki.shortExplanation?.[lang] ?? ki.shortExplanation?.["en"] ?? null;
                      return (
                        <View
                          key={ki.id}
                          style={[styles.kiCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
                        >
                          <Text style={[styles.kiCode, { color: colors.primary[500] }]}>
                            {ki.code.split(".").slice(-1)[0]?.replace(/_/g, " ")}
                          </Text>
                          <Text style={[styles.kiRule, { color: theme.text }]}>
                            {ki.rule}
                          </Text>
                          {explanation && (
                            <Text style={[styles.kiExplanation, { color: theme.textSecondary }]}>
                              {explanation}
                            </Text>
                          )}
                          {ki.examples.length > 0 && (
                            <View style={styles.kiExamples}>
                              {ki.examples.slice(0, 3).map((ex, i) => (
                                <Text key={i} style={[styles.kiExample, { color: theme.textMuted }]}>
                                  {ex}
                                </Text>
                              ))}
                            </View>
                          )}
                          <View style={[styles.kiLevelBadge, { backgroundColor: cefrColor(ki.cefrLevel) + "20" }]}>
                            <Text style={[styles.kiLevelText, { color: cefrColor(ki.cefrLevel) }]}>
                              {ki.cefrLevel}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </Animated.View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function cefrColor(level: string): string {
  switch (level) {
    case "A1": return "#059669";
    case "A2": return "#10B981";
    case "B1": return "#F59E0B";
    case "B2": return "#D97706";
    case "C1": return "#DC2626";
    case "C2": return "#991B1B";
    default: return "#6B7280";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
    lineHeight: 20,
  },
  alphabetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  alphabetCard: {
    width: "48%",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  alphabetLetters: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    marginBottom: spacing.xs,
    letterSpacing: 2,
  },
  alphabetLabel: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 22,
  },
  domainSection: {
    marginBottom: spacing.sm,
  },
  domainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  domainLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  domainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  domainName: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },
  domainCount: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  domainCountText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  domainItems: {
    paddingLeft: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  kiCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  kiCode: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  kiRule: {
    fontSize: typography.sizes.sm,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  kiExplanation: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  kiExamples: {
    marginTop: spacing.xs,
    gap: 4,
  },
  kiExample: {
    fontSize: typography.sizes.xs,
    fontStyle: "italic",
    lineHeight: 18,
  },
  kiLevelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
  },
  kiLevelText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
