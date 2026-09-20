import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import {
  createPlacementState,
  recordPlacementResponse,
  getPlacementResult,
  type PlacementQuestion,
} from "@falatorio/core/lesson";
import { getString, KEYS } from "@/lib/storage";
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

    return (
      <View style={[styles.container, styles.resultContainer, { paddingTop: insets.top + spacing["5xl"] }]}>
        <Text style={styles.resultLevel}>{result.cefrLevel}</Text>
        <Text style={styles.resultTitle}>Your estimated level</Text>
        <Text style={styles.resultSubtitle}>
          You got {correctCount}/{totalQuestions} correct.
          We'll start your journey at {result.cefrLevel}.
        </Text>
        <Button
          title="Choose your plan"
          onPress={() => router.push("/onboarding/plan")}
          size="lg"
          style={styles.resultButton}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1}/{totalQuestions}
        </Text>
      </View>

      <Animated.View
        key={currentIndex}
        entering={FadeInRight.duration(250)}
        exiting={FadeOutLeft.duration(200)}
        style={styles.questionContainer}
      >
        <Text style={styles.question}>{question!.prompt}</Text>

        {question!.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === question!.correct;
          const showFeedback = selectedOption !== null;

          return (
            <Pressable
              key={index}
              onPress={() => handleSelectOption(index)}
              disabled={selectedOption !== null}
              style={[styles.option, showFeedback && isCorrect && styles.optionCorrect, showFeedback && isSelected && !isCorrect && styles.optionWrong]}
            >
              <Text style={[styles.optionText, showFeedback && isCorrect && styles.optionTextCorrect]}>{option}</Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.lg,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral[200],
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
    color: colors.neutral[500],
    fontWeight: "600",
  },
  questionContainer: {
    flex: 1,
  },
  question: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing["2xl"],
    lineHeight: 28,
  },
  option: {
    backgroundColor: colors.neutral[0],
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionCorrect: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  optionWrong: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  optionText: {
    fontSize: typography.sizes.md,
    fontWeight: "500",
    color: colors.neutral[900],
  },
  optionTextCorrect: {
    color: colors.primary[700],
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  resultLevel: {
    fontSize: 56,
    fontWeight: "800",
    color: colors.primary[600],
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  resultSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing["3xl"],
  },
  resultButton: {
    width: "100%",
  },
});
