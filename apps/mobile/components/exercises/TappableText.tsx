import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { WordTooltip } from "./WordTooltip";
import { useWordTranslation, type TranslationDirection } from "@/hooks/useWordTranslation";

interface TappableTextProps {
  text: string;
  direction?: TranslationDirection;
  newWords?: string[];
  textStyle?: object;
}

function tokenize(text: string): { word: string; trailing: string }[] {
  const matches = text.match(/\S+/g);
  if (!matches) return [];
  return matches.map((token) => {
    const match = token.match(/^([\p{L}\p{N}'-]+)(.*)/u);
    if (!match) return { word: token, trailing: "" };
    return { word: match[1] ?? token, trailing: match[2] ?? "" };
  });
}

export function TappableText({
  text,
  direction = "pt-to-l1",
  newWords,
  textStyle,
}: TappableTextProps) {
  const theme = useTheme();
  const { translate, getGenderPair } = useWordTranslation();
  const newWordsSet = useRef(new Set((newWords ?? []).map((w) => w.toLowerCase()))).current;
  const [tooltip, setTooltip] = useState<{
    word: string;
    translations: string[];
    isNew: boolean;
    position: { x: number; y: number };
    genderHint: string | null;
  } | null>(null);

  const tokens = tokenize(text);

  const handleWordPress = useCallback(
    (word: string, event: { nativeEvent: { pageX: number; pageY: number } }) => {
      const clean = word.toLowerCase();
      const translations = translate(clean, direction);
      const isNew = newWordsSet.has(clean);

      if (translations.length > 0 || isNew) {
        const { pageX, pageY } = event.nativeEvent;
        const pair = getGenderPair(clean);
        let genderHint: string | null = null;

        if (pair) {
          const label = pair.g === "m" ? "masc" : "fem";
          const altLabel = pair.g === "m" ? "fem" : "masc";
          genderHint = `${clean} (${label}) / ${pair.alt} (${altLabel})`;
        }

        setTooltip({
          word: clean,
          translations: translations.length > 0 ? translations : [word],
          isNew,
          position: { x: pageX, y: pageY },
          genderHint,
        });
      }
    },
    [translate, direction, newWordsSet, getGenderPair],
  );

  const dismissTooltip = useCallback(() => setTooltip(null), []);

  return (
    <View style={styles.container}>
      {tokens.map((token, i) => {
        const isNew = newWordsSet.has(token.word.toLowerCase());
        return (
          <Pressable
            key={`${token.word}-${i}`}
            onPress={(e) => handleWordPress(token.word, e)}
            style={({ pressed }) => [
              styles.wordWrap,
              isNew && styles.newWordBg,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.word,
                textStyle,
                { color: theme.text },
                isNew && styles.newWordText,
              ]}
            >
              {token.word}
              {token.trailing}
            </Text>
          </Pressable>
        );
      })}

      {tooltip && (
        <WordTooltip
          word={tooltip.word}
          translations={tooltip.translations}
          isNew={tooltip.isNew}
          position={tooltip.position}
          onDismiss={dismissTooltip}
          genderHint={tooltip.genderHint}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  wordWrap: {
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  word: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.lg * 1.5,
  },
  pressed: {
    opacity: 0.6,
  },
  newWordBg: {
    backgroundColor: colors.primary[100],
    borderRadius: 4,
  },
  newWordText: {
    color: colors.primary[700],
    fontWeight: "600",
  },
});
