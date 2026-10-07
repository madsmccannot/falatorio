import { useState, useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { getString, KEYS } from "@/lib/storage";
import type { L1Code, CEFRLevel } from "@falatorio/core";

const PASS_THRESHOLD = 0.8;

type QuestionDef = {
  id: string;
  difficulty: number;
  cefrTarget: CEFRLevel;
  correct: number;
  prompts: Record<L1Code, string>;
  opts: Record<L1Code, string[]>;
};

const PT_ONLY: Record<L1Code, string[]> = Object.fromEntries(
  ["en","es","fr","hi","ur","ar","bn","de","zh","ru","uk","tr","pl","ko","ja"].map(
    (k) => [k, ["falar", "falo", "fala", "falei"]],
  ),
) as Record<L1Code, string[]>;

const QUESTION_BANK: QuestionDef[] = [
  {
    id: "s1", difficulty: 1, cefrTarget: "A1", correct: 0,
    prompts: { en: "How do you say 'hello' in Portuguese?", es: "Como se dice 'hola' en portugués?", fr: "Comment dit-on bonjour en portugais ?", hi: "पुर्तगाली में 'hello' कैसे कहते हैं?", ur: "پرتگالی میں 'hello' کیسه کہته ہیں؟", ar: "كيف تقول 'مرحبا' بالبرتغالية؟", bn: "পর্তুগিজে 'hello' কীভাবে বলে?", de: "Wie sagt man 'Hallo' auf Portugiesisch?", zh: "葡萄牙语中'你好'怎么说？", ru: "Как сказать «привет» на португальском?", uk: "Як сказати «привіт» португальською?", tr: "Portekizce'de 'merhaba' nasıl söylenir?", pl: "Jak się mówi 'cześć' po portugalsku?", ko: "포르투갈어로 '안녕'을 어떻게 말하나요?", ja: "ポルトガル語で「こんにちは」は？" },
    opts: Object.fromEntries(["en","es","fr","hi","ur","ar","bn","de","zh","ru","uk","tr","pl","ko","ja"].map(k => [k, ["Olá", "Hola", "Bonjour", "Ciao"]])) as Record<L1Code, string[]>,
  },
  {
    id: "s2", difficulty: 1, cefrTarget: "A1", correct: 2,
    prompts: { en: "What does 'obrigado' mean?", es: "Que significa 'obrigado'?", fr: "Que signifie obrigado ?", hi: "'obrigado' का क्या मतलब है?", ur: "'obrigado' کا کیا مطلب ہے؟", ar: "ما معنى 'obrigado'؟", bn: "'obrigado' মানে কী?", de: "Was bedeutet 'obrigado'?", zh: "'obrigado' 是什么意思？", ru: "Что означает 'obrigado'?", uk: "Що означає 'obrigado'?", tr: "'obrigado' ne anlama gelir?", pl: "Co oznacza 'obrigado'?", ko: "'obrigado'는 무슨 뜻인가요?", ja: "'obrigado' の意味は？" },
    opts: { en: ["Goodbye", "Please", "Thank you", "Sorry"], es: ["Adiós", "Por favor", "Gracias", "Perdón"], fr: ["Au revoir", "S'il vous plaît", "Merci", "Pardon"], hi: ["अलविदा", "कृपया", "धन्यवाद", "माफ़ी"], ur: ["الوداع", "براہ کرم", "شکریہ", "معافی"], ar: ["وداعاً", "من فضلك", "شكراً", "آسف"], bn: ["বিদায়", "অনুগ্রহ", "ধন্যবাদ", "দুঃখিত"], de: ["Tschüss", "Bitte", "Danke", "Entschuldigung"], zh: ["再见", "请", "谢谢", "抱歉"], ru: ["До свидания", "Пожалуйста", "Спасибо", "Извините"], uk: ["До побачення", "Будь ласка", "Дякую", "Вибачте"], tr: ["Hoşça kalın", "Lütfen", "Teşekkür ederim", "Özür dilerim"], pl: ["Do widzenia", "Proszę", "Dziękuję", "Przepraszam"], ko: ["안녕히 가세요", "부탁합니다", "감사합니다", "죄송합니다"], ja: ["さようなら", "お願いします", "ありがとう", "ごめんなさい"] },
  },
  {
    id: "s3", difficulty: 2, cefrTarget: "A2", correct: 1,
    prompts: { en: "Choose the correct: 'Eu ___ português.'", es: "Elige la correcta: 'Eu ___ português.'", fr: "Choisis la bonne réponse : 'Eu ___ português.'", hi: "सही विकल्प चुनें: 'Eu ___ português.'", ur: "صحیح انتخاب کریں: 'Eu ___ português.'", ar: "اختر الصحيح: 'Eu ___ português.'", bn: "সঠিক উত্তর বেছে নিন: 'Eu ___ português.'", de: "Wähle die richtige Form: 'Eu ___ português.'", zh: "选择正确的: 'Eu ___ português.'", ru: "Выберите правильное: 'Eu ___ português.'", uk: "Оберіть правильне: 'Eu ___ português.'", tr: "Doğru olanı seçin: 'Eu ___ português.'", pl: "Wybierz poprawną formę: 'Eu ___ português.'", ko: "올바른 것을 고르세요: 'Eu ___ português.'", ja: "正しいものを選んでください: 'Eu ___ português.'" },
    opts: PT_ONLY,
  },
  {
    id: "s4", difficulty: 2, cefrTarget: "A2", correct: 1,
    prompts: { en: "In PT-PT, 'mobile phone' is:", es: "En PT-PT, 'teléfono móvil' es:", fr: "En PT-PT, 'téléphone portable' est :", hi: "PT-PT में 'मोबाइल फ़ोन' है:", ur: "PT-PT میں 'موبائل فون' ہے:", ar: "في PT-PT، 'الهاتف المحمول' هو:", bn: "PT-PT তে 'মোবাইল ফোন' হলো:", de: "Auf PT-PT ist 'Handy':", zh: "在欧洲葡语中，'手机'是：", ru: "На PT-PT 'мобильный телефон':", uk: "На PT-PT 'мобільний телефон':", tr: "PT-PT'de 'cep telefonu':", pl: "W PT-PT 'telefon komórkowy' to:", ko: "PT-PT에서 '휴대폰'은:", ja: "PT-PTで「携帯電話」は：" },
    opts: Object.fromEntries(["en","es","fr","hi","ur","ar","bn","de","zh","ru","uk","tr","pl","ko","ja"].map(k => [k, ["Celular", "Telemóvel", "Móvel", "Portátil"]])) as Record<L1Code, string[]>,
  },
  {
    id: "s5", difficulty: 3, cefrTarget: "B1", correct: 2,
    prompts: { en: "'Se eu tivesse tempo, ___' — correct ending?", es: "'Se eu tivesse tempo, ___' — final correcto?", fr: "'Se eu tivesse tempo, ___' — bonne fin ?", hi: "'Se eu tivesse tempo, ___' — सही अंत?", ur: "'Se eu tivesse tempo, ___' — صحیح جواب؟", ar: "'Se eu tivesse tempo, ___' — النهاية الصحيحة؟", bn: "'Se eu tivesse tempo, ___' — সঠিক শেষাংশ?", de: "'Se eu tivesse tempo, ___' — richtig?", zh: "'Se eu tivesse tempo, ___' — 正确的结尾？", ru: "'Se eu tivesse tempo, ___' — правильное окончание?", uk: "'Se eu tivesse tempo, ___' — правильне закінчення?", tr: "'Se eu tivesse tempo, ___' — doğru bitiş?", pl: "'Se eu tivesse tempo, ___' — prawidłowe zakończenie?", ko: "'Se eu tivesse tempo, ___' — 올바른 결말은?", ja: "'Se eu tivesse tempo, ___' — 正しい終わりは？" },
    opts: Object.fromEntries(["en","es","fr","hi","ur","ar","bn","de","zh","ru","uk","tr","pl","ko","ja"].map(k => [k, ["vou viajar", "viajo", "viajaria", "viajei"]])) as Record<L1Code, string[]>,
  },
  {
    id: "s6", difficulty: 3, cefrTarget: "B1", correct: 0,
    prompts: { en: "'Apesar de estar cansado, ele ___'", es: "'Apesar de estar cansado, ele ___'", fr: "'Apesar de estar cansado, ele ___'", hi: "'Apesar de estar cansado, ele ___'", ur: "'Apesar de estar cansado, ele ___'", ar: "'Apesar de estar cansado, ele ___'", bn: "'Apesar de estar cansado, ele ___'", de: "'Apesar de estar cansado, ele ___'", zh: "'Apesar de estar cansado, ele ___'", ru: "'Apesar de estar cansado, ele ___'", uk: "'Apesar de estar cansado, ele ___'", tr: "'Apesar de estar cansado, ele ___'", pl: "'Apesar de estar cansado, ele ___'", ko: "'Apesar de estar cansado, ele ___'", ja: "'Apesar de estar cansado, ele ___'" },
    opts: Object.fromEntries(["en","es","fr","hi","ur","ar","bn","de","zh","ru","uk","tr","pl","ko","ja"].map(k => [k, ["continuou a trabalhar", "continua trabalhar", "continuava trabalhar", "continuou trabalho"]])) as Record<L1Code, string[]>,
  },
  {
    id: "s7", difficulty: 4, cefrTarget: "B2", correct: 3,
    prompts: { en: "'Oxalá eu ___ ir à festa!'", es: "'Oxalá eu ___ ir à festa!'", fr: "'Oxalá eu ___ ir à festa!'", hi: "'Oxalá eu ___ ir à festa!'", ur: "'Oxalá eu ___ ir à festa!'", ar: "'Oxalá eu ___ ir à festa!'", bn: "'Oxalá eu ___ ir à festa!'", de: "'Oxalá eu ___ ir à festa!'", zh: "'Oxalá eu ___ ir à festa!'", ru: "'Oxalá eu ___ ir à festa!'", uk: "'Oxalá eu ___ ir à festa!'", tr: "'Oxalá eu ___ ir à festa!'", pl: "'Oxalá eu ___ ir à festa!'", ko: "'Oxalá eu ___ ir à festa!'", ja: "'Oxalá eu ___ ir à festa!'" },
    opts: Object.fromEntries(["en","es","fr","hi","ur","ar","bn","de","zh","ru","uk","tr","pl","ko","ja"].map(k => [k, ["posso", "poderia", "podia", "possa"]])) as Record<L1Code, string[]>,
  },
  {
    id: "s8", difficulty: 5, cefrTarget: "B2", correct: 1,
    prompts: { en: "Difference between 'ser' and 'estar'?", es: "Diferencia entre 'ser' y 'estar'?", fr: "Différence entre 'ser' et 'estar' ?", hi: "'ser' और 'estar' में अंतर?", ur: "'ser' اور 'estar' میں فرق؟", ar: "الفرق بين 'ser' و'estar'؟", bn: "'ser' এবং 'estar' এর পার্থক্য?", de: "Unterschied zwischen 'ser' und 'estar'?", zh: "'ser'和'estar'的区别？", ru: "Разница между 'ser' и 'estar'?", uk: "Різниця між 'ser' і 'estar'?", tr: "'ser' ile 'estar' arasındaki fark?", pl: "Różnica między 'ser' a 'estar'?", ko: "'ser'와 'estar'의 차이는?", ja: "'ser'と'estar'の違いは？" },
    opts: { en: ["Both mean 'to have'", "Permanent vs temporary state", "Past vs present", "Formal vs informal"], es: ["Ambos significan 'tener'", "Estado permanente vs temporal", "Pasado vs presente", "Formal vs informal"], fr: ["Les deux signifient 'avoir'", "État permanent vs temporaire", "Passé vs présent", "Formel vs informel"], hi: ["दोनों 'होना' हैं", "स्थायी vs अस्थायी", "भूत vs वर्तमान", "औपचारिक vs अनौपचारिक"], ur: ["دونوں 'ہونا' ہیں", "مستقل vs عارضی", "ماضی vs حال", "رسمی vs غیر رسمی"], ar: ["كلاهما 'يملك'", "حالة دائمة vs مؤقتة", "ماضي vs حاضر", "رسمي vs غير رسمي"], bn: ["দুটোই 'থাকা'", "স্থায়ী vs অস্থায়ী", "অতীত vs বর্তমান", "আনুষ্ঠানিক vs অনানুষ্ঠানিক"], de: ["Beide bedeuten 'haben'", "Dauerhaft vs vorübergehend", "Vergangenheit vs Gegenwart", "Formell vs informell"], zh: ["都表示'有'", "永久性vs临时性状态", "过去vs现在", "正式vs非正式"], ru: ["Оба означают 'иметь'", "Постоянное vs временное", "Прошедшее vs настоящее", "Формально vs неформально"], uk: ["Обидва означають 'мати'", "Постійний vs тимчасовий стан", "Минуле vs теперішнє", "Формально vs неформально"], tr: ["İkisi de 'sahip olmak'", "Kalıcı vs geçici durum", "Geçmiş vs şimdi", "Resmî vs gayrı resmî"], pl: ["Oba znaczą 'mieć'", "Stan stały vs tymczasowy", "Przeszłość vs teraźniejszość", "Formalnie vs nieformalnie"], ko: ["둘 다 '가지다'", "영구적 vs 일시적 상태", "과거 vs 현재", "격식 vs 비격식"], ja: ["両方とも'持つ'", "恒常的vs一時的な状態", "過去vs現在", "フォーマルvsインフォーマル"] },
  },
];

const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function cefrIdx(level: CEFRLevel): number {
  return CEFR_ORDER.indexOf(level);
}

function questionsForSection(cefrMin: string, cefrMax: string, l1: L1Code) {
  const min = cefrIdx(cefrMin as CEFRLevel);
  const max = cefrIdx(cefrMax as CEFRLevel);
  const filtered = QUESTION_BANK.filter((q) => {
    const qi = cefrIdx(q.cefrTarget);
    return qi >= min && qi <= max;
  });
  const pool = filtered.length >= 3 ? filtered : QUESTION_BANK.slice(0, 5);
  return pool.map((q) => ({
    id: q.id,
    prompt: q.prompts[l1] ?? q.prompts.en,
    options: q.opts[l1] ?? q.opts.en,
    correct: q.correct,
  }));
}

export default function SectionTestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    sectionId: string;
    sectionTitle: string;
    cefrMin: string;
    cefrMax: string;
  }>();

  const l1 = (getString(KEYS.SELECTED_L1) ?? "en") as L1Code;
  const questions = useMemo(
    () => questionsForSection(params.cefrMin ?? "A1", params.cefrMax ?? "B2", l1),
    [params.cefrMin, params.cefrMax, l1],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [phase, setPhase] = useState<"test" | "pass" | "fail">("test");
  const [showExitModal, setShowExitModal] = useState(false);

  const skipMutation = trpc.content.skipSection.useMutation();
  const utils = trpc.useUtils();

  const totalQuestions = questions.length;
  const question = questions[currentIndex];
  const progress = totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0;

  const finishTest = useCallback(
    (finalAnswers: boolean[]) => {
      const correct = finalAnswers.filter(Boolean).length;
      const ratio = totalQuestions > 0 ? correct / totalQuestions : 0;
      if (ratio >= PASS_THRESHOLD) {
        setPhase("pass");
        skipMutation.mutate(
          { sectionId: params.sectionId! },
          {
            onSuccess: () => {
              utils.content.getSections.invalidate();
              utils.content.getSectionMap.invalidate();
              utils.content.getSectionProgress.invalidate();
            },
          },
        );
      } else {
        setPhase("fail");
      }
    },
    [params.sectionId, totalQuestions, skipMutation, utils],
  );

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || !question) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOption(index);

    const isCorrect = index === question.correct;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) {
        finishTest(newAnswers);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      }
    }, 800);
  };

  if (phase === "pass") {
    const correct = answers.filter(Boolean).length;
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing["5xl"], backgroundColor: theme.bg }]}>
        <View style={styles.resultContent}>
          <Text style={[styles.resultIcon, { color: colors.success }]}>OK</Text>
          <Text style={[styles.resultTitle, { color: theme.text }]}>
            {t("learn.section_test_pass")}
          </Text>
          <Text style={[styles.resultSubtitle, { color: theme.textMuted }]}>
            {correct}/{totalQuestions} - {params.sectionTitle ?? ""}
          </Text>
          <Button
            title={t("learn.section_test_continue")}
            onPress={() => router.back()}
            size="lg"
            style={styles.resultButton}
          />
        </View>
      </View>
    );
  }

  if (phase === "fail") {
    const correct = answers.filter(Boolean).length;
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing["5xl"], backgroundColor: theme.bg }]}>
        <View style={styles.resultContent}>
          <Text style={[styles.resultIcon, { color: colors.accent[500] }]}>X</Text>
          <Text style={[styles.resultTitle, { color: theme.text }]}>
            {t("learn.section_test_fail")}
          </Text>
          <Text style={[styles.resultSubtitle, { color: theme.textMuted }]}>
            {correct}/{totalQuestions} ({Math.round(PASS_THRESHOLD * 100)}%+)
          </Text>
          <Button
            title={t("learn.section_test_retry")}
            onPress={() => {
              setCurrentIndex(0);
              setAnswers([]);
              setSelectedOption(null);
              setPhase("test");
            }}
            size="lg"
            style={styles.resultButton}
          />
          <Button
            title={t("learn.section_test_back")}
            onPress={() => router.back()}
            variant="outline"
            size="lg"
            style={styles.resultButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl, backgroundColor: theme.bg }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => setShowExitModal(true)} hitSlop={12} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: theme.textSecondary }]}>X</Text>
        </Pressable>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.textMuted }]}>
          {currentIndex + 1}/{totalQuestions}
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
        {t("learn.section_test_title")}
      </Text>
      <Text style={[styles.sectionName, { color: theme.text }]} numberOfLines={1}>
        {params.sectionTitle ?? ""}
      </Text>

      {question && (
        <Animated.View
          key={currentIndex}
          entering={FadeInRight.duration(250)}
          exiting={FadeOutLeft.duration(200)}
          style={styles.questionContainer}
        >
          <Text style={[styles.question, { color: theme.text }]}>{question.prompt}</Text>

          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correct;
            const showFeedback = selectedOption !== null;

            return (
              <Pressable
                key={index}
                onPress={() => handleSelectOption(index)}
                disabled={selectedOption !== null}
                style={[
                  styles.optionCard,
                  { backgroundColor: theme.bgCard, borderColor: theme.border },
                  showFeedback && isCorrect && { borderColor: colors.primary[600], backgroundColor: theme.bgAccent },
                  showFeedback && isSelected && !isCorrect && { borderColor: colors.accent[500], backgroundColor: theme.isDark ? "#2D1111" : colors.accent[50] },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: theme.text },
                    showFeedback && isCorrect && { color: colors.primary[theme.isDark ? 400 : 700], fontWeight: "700" },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      <Modal visible={showExitModal} transparent animationType="fade" onRequestClose={() => setShowExitModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowExitModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.bgElevated }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t("learn.section_test_exit_title")}</Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>{t("learn.section_test_exit_desc")}</Text>
            <View style={styles.modalButtons}>
              <Button
                title={t("learn.section_test_stay")}
                onPress={() => setShowExitModal(false)}
                size="lg"
                style={styles.modalBtn}
              />
              <Button
                title={t("learn.section_test_leave")}
                onPress={() => { setShowExitModal(false); router.back(); }}
                variant="outline"
                size="lg"
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 18,
    fontWeight: "700",
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
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "right",
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  sectionName: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    marginBottom: spacing.xl,
  },
  questionContainer: {
    flex: 1,
    gap: spacing.md,
  },
  question: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    lineHeight: 30,
    marginBottom: spacing.lg,
  },
  optionCard: {
    borderWidth: 2,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  optionText: {
    fontSize: typography.sizes.md,
    fontWeight: "500",
  },
  resultContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  resultIcon: {
    fontSize: 48,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  resultTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "700",
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  resultButton: {
    width: "100%",
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: spacing.xl,
  },
  modalContent: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalDesc: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  modalButtons: {
    gap: spacing.sm,
  },
  modalBtn: {
    width: "100%",
  },
});
