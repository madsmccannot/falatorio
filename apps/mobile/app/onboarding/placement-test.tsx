import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { onboardingStyles } from "@/lib/styles";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import {
  createPlacementState,
  recordPlacementResponse,
  getPlacementResult,
  type PlacementQuestion,
} from "@falatorio/core/lesson";
import { getString, setString, KEYS } from "@/lib/storage";
import type { L1Code } from "@falatorio/core";

type DisplayQuestion = PlacementQuestion & {
  prompt: string;
  options: string[];
  correct: number;
};

const SAMPLE_QUESTIONS: DisplayQuestion[] = [
  { id: "1", difficulty: 1, cefrTarget: "A1", prompt: "How do you say 'hello' in Portuguese?", options: ["Olá", "Hola", "Bonjour", "Ciao"], correct: 0 },
  { id: "2", difficulty: 1, cefrTarget: "A1", prompt: "What does 'obrigado' mean?", options: ["Goodbye", "Please", "Thank you", "Sorry"], correct: 2 },
  { id: "3", difficulty: 2, cefrTarget: "A2", prompt: "Choose the correct: 'Eu ___ português.'", options: ["falar", "falo", "fala", "falei"], correct: 1 },
  { id: "4", difficulty: 2, cefrTarget: "A2", prompt: "'Autocarro' means:", options: ["Car", "Train", "Bus", "Airplane"], correct: 2 },
  { id: "5", difficulty: 3, cefrTarget: "B1", prompt: "'Estou a fazer' is equivalent to:", options: ["I was doing", "I am doing", "I will do", "I did"], correct: 1 },
  { id: "6", difficulty: 3, cefrTarget: "B1", prompt: "Which is PT-EU for 'mobile phone'?", options: ["Celular", "Telemóvel", "Móvel", "Portátil"], correct: 1 },
  { id: "7", difficulty: 4, cefrTarget: "B2", prompt: "'Oxalá que ele venha' uses which mood?", options: ["Indicative", "Conditional", "Subjunctive", "Imperative"], correct: 2 },
  { id: "8", difficulty: 4, cefrTarget: "B2", prompt: "'Desenrascar-se' best translates to:", options: ["To give up", "To figure it out", "To complain", "To run away"], correct: 1 },
  { id: "9", difficulty: 5, cefrTarget: "C1", prompt: "'Dir-lhe-ia' is an example of:", options: ["Enclisis", "Proclisis", "Mesoclisis", "Apheresis"], correct: 2 },
  { id: "10", difficulty: 5, cefrTarget: "C1", prompt: "'Pôr-do-sol' — the verb 'pôr' is:", options: ["Regular -ar", "Regular -er", "Regular -ir", "Irregular"], correct: 3 },
];

export default function PlacementTestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const shared = useMemo(() => onboardingStyles(theme), [theme.isDark]);
  const l1 = (getString(KEYS.SELECTED_L1) ?? "en") as L1Code;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const totalQuestions = Math.min(SAMPLE_QUESTIONS.length, 10);
  const question = SAMPLE_QUESTIONS[currentIndex];
  const progress = (currentIndex + 1) / totalQuestions;

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOption(index);

    const isCorrect = index === question!.correct;
    setAnswers((prev) => [...prev, isCorrect]);

    setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) {
        setShowResult(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      }
    }, 800);
  };

  if (showResult) {
    const correctCount = answers.filter(Boolean).length;
    let state = createPlacementState(SAMPLE_QUESTIONS, l1);
    for (let i = 0; i < answers.length; i++) {
      const q = SAMPLE_QUESTIONS[i]!;
      state = recordPlacementResponse(state, q.id, answers[i]!, q.difficulty);
    }
    const result = getPlacementResult(state);
    setString(KEYS.PLACEMENT_LEVEL, result.cefrLevel);

    return (
      <View style={[shared.screen, local.resultContainer, { paddingTop: insets.top + spacing["5xl"] }]}>
        <Text style={[local.resultLevel, { color: theme.isDark ? colors.primary[400] : colors.primary[600] }]}>
          {result.cefrLevel}
        </Text>
        <Text style={[local.resultTitle, { color: theme.text }]}>{t("onboarding.result_title")}</Text>
        <Text style={[local.resultSubtitle, { color: theme.textMuted }]}>
          {t("onboarding.result_text", { correct: correctCount, total: totalQuestions, level: result.cefrLevel })}
        </Text>
        <Button
          title={t("onboarding.choose_plan")}
          onPress={() => router.push("/onboarding/plan")}
          size="lg"
          style={local.resultButton}
        />
      </View>
    );
  }

  return (
    <View style={[shared.screen, { paddingTop: insets.top + spacing.xl }]}>
      <View style={local.progressContainer}>
        <View style={[local.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[local.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={[local.progressText, { color: theme.textMuted }]}>
          {currentIndex + 1}/{totalQuestions}
        </Text>
      </View>

      <Animated.View
        key={currentIndex}
        entering={FadeInRight.duration(250)}
        exiting={FadeOutLeft.duration(200)}
        style={local.questionContainer}
      >
        <Text style={[local.question, { color: theme.text }]}>{question!.prompt}</Text>

        {question!.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === question!.correct;
          const showFeedback = selectedOption !== null;

          return (
            <Pressable
              key={index}
              onPress={() => handleSelectOption(index)}
              disabled={selectedOption !== null}
              style={[
                shared.optionCardVertical,
                showFeedback && isCorrect && { borderColor: colors.primary[600], backgroundColor: theme.optionSelectedBg },
                showFeedback && isSelected && !isCorrect && { borderColor: colors.accent[500], backgroundColor: theme.isDark ? "#2D1111" : colors.accent[50] },
              ]}
            >
              <Text style={[shared.optionLabel, { fontWeight: "500" }, showFeedback && isCorrect && shared.optionLabelSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const local = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  questionContainer: {
    flex: 1,
  },
  question: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing["2xl"],
    lineHeight: 28,
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  resultLevel: {
    fontSize: 56,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  resultSubtitle: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing["3xl"],
  },
  resultButton: {
    width: "100%",
  },
});
