import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo, useCallback } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import { Loading } from "@/components/ui/Loading";
import { Card } from "@/components/ui/Card";
import { getString, KEYS } from "@/lib/storage";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { SKILL_DOMAINS } from "@falatorio/core";
import { getProfile } from "@falatorio/core/l1-profiles";
import type { L1Code } from "@falatorio/core";
import { PronunciationGuide } from "@/components/pronunciation";
import Svg, { Path } from "react-native-svg";

const NON_LATIN_L1S = new Set(["hi", "bn", "ur", "ar", "zh", "ru", "uk", "ko", "ja"]);

interface LetterEntry {
  letter: string;
  word: string;
  ipa: string;
}

const ALPHABET_GROUPS: { id: string; label: string; entries: LetterEntry[] }[] = [
  {
    id: "vowels", label: "Vogais",
    entries: [
      { letter: "A", word: "água", ipa: "/a/" },
      { letter: "E", word: "escola", ipa: "/e/, /ɛ/" },
      { letter: "I", word: "ilha", ipa: "/i/" },
      { letter: "O", word: "olho", ipa: "/o/, /ɔ/" },
      { letter: "U", word: "uva", ipa: "/u/" },
    ],
  },
  {
    id: "accented", label: "Acentos e sinais",
    entries: [
      { letter: "Á", word: "água (agudo)", ipa: "/a/" },
      { letter: "Â", word: "câmara (circunflexo)", ipa: "/ɐ/" },
      { letter: "Ã", word: "lã (til)", ipa: "/ɐ̃/" },
      { letter: "Ç", word: "ação (cedilha)", ipa: "/s/" },
    ],
  },
  {
    id: "consonants_1", label: "Consoantes I",
    entries: [
      { letter: "B", word: "bola", ipa: "/b/" },
      { letter: "C", word: "casa", ipa: "/k/" },
      { letter: "D", word: "dado", ipa: "/d/" },
      { letter: "F", word: "faca", ipa: "/f/" },
      { letter: "G", word: "gato", ipa: "/g/" },
    ],
  },
  {
    id: "consonants_2", label: "Consoantes II",
    entries: [
      { letter: "H", word: "hora (mudo)", ipa: "—" },
      { letter: "J", word: "janela", ipa: "/ʒ/" },
      { letter: "K", word: "kiwi", ipa: "/k/" },
      { letter: "L", word: "lua", ipa: "/l/" },
      { letter: "M", word: "mesa", ipa: "/m/" },
    ],
  },
  {
    id: "consonants_3", label: "Consoantes III",
    entries: [
      { letter: "N", word: "navio", ipa: "/n/" },
      { letter: "P", word: "pato", ipa: "/p/" },
      { letter: "Q", word: "queijo", ipa: "/k/" },
      { letter: "R", word: "rio", ipa: "/ʁ/" },
      { letter: "S", word: "sapo", ipa: "/s/" },
    ],
  },
  {
    id: "consonants_4", label: "Consoantes IV",
    entries: [
      { letter: "T", word: "tomate", ipa: "/t/" },
      { letter: "V", word: "vento", ipa: "/v/" },
      { letter: "W", word: "web", ipa: "/w/" },
      { letter: "X", word: "xadrez", ipa: "/ʃ/" },
      { letter: "Z", word: "zebra", ipa: "/z/" },
    ],
  },
  {
    id: "digraphs", label: "Digrafos",
    entries: [
      { letter: "LH", word: "olho", ipa: "/ʎ/" },
      { letter: "NH", word: "vinho", ipa: "/ɲ/" },
      { letter: "CH", word: "chave", ipa: "/ʃ/" },
      { letter: "RR", word: "carro", ipa: "/ʁ/" },
      { letter: "SS", word: "passo", ipa: "/s/" },
    ],
  },
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

function AlphabetExerciseModal({
  visible,
  group,
  onClose,
  onComplete,
  theme,
  t,
}: {
  visible: boolean;
  group: typeof ALPHABET_GROUPS[number] | null;
  onClose: () => void;
  onComplete: (groupId: string) => void;
  theme: ReturnType<typeof useTheme>;
  t: (key: TKey) => string;
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!group) return null;

  const sessionEntries = group.entries.slice(0, 4);
  const current = sessionEntries[step];
  if (!current) return null;

  const distractors = useMemo(() => {
    const all = ALPHABET_GROUPS.flatMap((g) => g.entries.map((e) => e.letter));
    const unique = [...new Set(all)].filter((l) => l !== current.letter);
    const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...shuffled, current.letter].sort(() => Math.random() - 0.5);
    return options;
  }, [current.letter, step]);

  const handleSelect = (letter: string) => {
    setSelected(letter);
    setShowResult(true);
    if (letter === current.letter) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowResult(false);
    if (step + 1 >= sessionEntries.length) {
      onComplete(group.id);
      onClose();
      setStep(0);
    } else {
      setStep(step + 1);
    }
  };

  const handleClose = () => {
    setStep(0);
    setSelected(null);
    setShowResult(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
        <View style={styles.modalHeader}>
          <ProgressBar progress={(step + 1) / sessionEntries.length} color={colors.primary[500]} />
          <Text style={[styles.modalStep, { color: theme.textSecondary }]}>
            {step + 1} / {sessionEntries.length}
          </Text>
        </View>

        <View style={styles.modalBody}>
          <Animated.View entering={FadeInDown.duration(300)} key={step}>
            <Text style={[styles.modalQuestion, { color: theme.text }]}>
              {t("reference.word_example")}:
            </Text>
            <Text style={[styles.modalWord, { color: colors.primary[600] }]}>
              {current.word}
            </Text>
            <Text style={[styles.modalIpa, { color: theme.textMuted }]}>
              {current.ipa}
            </Text>

            <Text style={[styles.modalInstruction, { color: theme.textSecondary }]}>
              {t("reference.letter_tap")}
            </Text>

            <View style={styles.optionsGrid}>
              {distractors.map((letter) => {
                const isSelected = selected === letter;
                const isCorrect = letter === current.letter;
                let bgColor = theme.bgCard;
                let borderCol = theme.border;
                if (showResult && isSelected && isCorrect) {
                  bgColor = "#D1FAE5";
                  borderCol = "#059669";
                } else if (showResult && isSelected && !isCorrect) {
                  bgColor = "#FEE2E2";
                  borderCol = "#DC2626";
                } else if (showResult && isCorrect) {
                  bgColor = "#D1FAE5";
                  borderCol = "#059669";
                }
                return (
                  <Pressable
                    key={letter}
                    onPress={() => !showResult && handleSelect(letter)}
                    style={[styles.optionButton, { backgroundColor: bgColor, borderColor: borderCol }]}
                  >
                    <Text style={[styles.optionLetter, { color: theme.text }]}>{letter}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {showResult && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Pressable onPress={handleNext} style={[styles.nextButton, { backgroundColor: colors.primary[500] }]}>
                <Text style={styles.nextButtonText}>
                  {step + 1 >= sessionEntries.length ? t("reference.complete") : t("reference.next")}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function ReferenceScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, l1: lang } = useTranslation();
  const l1 = getString(KEYS.SELECTED_L1) ?? "en";
  const isNonLatin = NON_LATIN_L1S.has(l1);

  const glossary = trpc.mastery.getUserGlossary.useQuery(undefined, {
    enabled: true,
  });

  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [alphabetProgress, setAlphabetProgress] = useState<Record<string, number>>({});
  const [exerciseGroup, setExerciseGroup] = useState<typeof ALPHABET_GROUPS[number] | null>(null);

  const profile = useMemo(() => {
    try {
      return getProfile(l1 as L1Code);
    } catch {
      return null;
    }
  }, [l1]);

  const phoneticDifficulties = profile?.transfer?.phoneticDifficulties ?? [];

  const groupedGlossary = (glossary.data ?? []).reduce<Record<string, typeof glossary.data>>((acc, ki) => {
    const domain = ki.domain;
    if (!acc[domain]) acc[domain] = [];
    acc[domain]!.push(ki);
    return acc;
  }, {});

  const toggleDomain = (domain: string) => {
    setExpandedDomain((prev) => (prev === domain ? null : domain));
  };

  const handleExerciseComplete = useCallback((groupId: string) => {
    setAlphabetProgress((prev) => ({
      ...prev,
      [groupId]: Math.min((prev[groupId] ?? 0) + 0.25, 1),
    }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

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
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExerciseGroup(group);
                    }}
                  >
                    <Text style={[styles.alphabetLetters, { color: theme.text }]}>
                      {group.entries.slice(0, 3).map((e) => e.letter).join(" ")}
                    </Text>
                    <Text style={[styles.alphabetLabel, { color: theme.textMuted }]}>
                      {group.label}
                    </Text>
                    <ProgressBar progress={progress} color={colors.primary[500]} />
                    <Text style={[styles.practiceLabel, { color: colors.primary[500] }]}>
                      {t("reference.practice")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {phoneticDifficulties.length > 0 && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: isNonLatin ? spacing.xl : 0 }]}>
              {t("reference.phonetics_title")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              {t("reference.phonetics_desc")}
            </Text>
            <PronunciationGuide
              difficulties={phoneticDifficulties}
              l1Name={profile?.name ?? l1}
            />
          </Animated.View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.xl }]}>
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

      <AlphabetExerciseModal
        visible={!!exerciseGroup}
        group={exerciseGroup}
        onClose={() => setExerciseGroup(null)}
        onComplete={handleExerciseComplete}
        theme={theme}
        t={t}
      />
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
  practiceLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    marginTop: spacing.sm,
    textAlign: "center",
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
  modalContainer: {
    flex: 1,
    paddingTop: spacing["2xl"],
  },
  modalHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  modalStep: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  modalQuestion: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalWord: {
    fontSize: typography.sizes["3xl"],
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  modalIpa: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    marginBottom: spacing["2xl"],
    fontFamily: typography.mono?.fontFamily,
  },
  modalInstruction: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
  },
  optionButton: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetter: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
  },
  nextButton: {
    marginTop: spacing["2xl"],
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
});
