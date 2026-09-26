import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from "react-native";
import { useTheme } from "@/lib/theme";
import { colors, spacing, typography } from "@falatorio/ui/tokens";
import { WordTooltip } from "./WordTooltip";
import { useWordTranslation } from "@/hooks/useWordTranslation";

interface TappableTextProps {
  text: string;
  newWords?: string[];
  onWordTap?: (word: string) => void;
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

export function TappableText({ text, newWords, onWordTap }: TappableTextProps) {
  const theme = useTheme();
  const { translate } = useWordTranslation();
  const newWordsSet = useRef(new Set((newWords ?? []).map((w) => w.toLowerCase()))).current;
  const [tooltip, setTooltip] = useState<{
    word: string;
    translation: string;
    isNew: boolean;
    position: { x: number; y: number };
  } | null>(null);
  const containerRef = useRef<View>(null);

  const tokens = tokenize(text);

  const handleWordPress = useCallback(
    (word: string, event: LayoutChangeEvent | { nativeEvent: { pageX: number; pageY: number } }) => {
      const clean = word.toLowerCase();
      onWordTap?.(clean);

      const translation = translate(clean);
      const isNew = newWordsSet.has(clean);

      if (translation || isNew) {
        const { pageX, pageY } = event.nativeEvent as any;
        setTooltip({
          word: clean,
          translation: translation ?? word,
          isNew,
          position: { x: pageX, y: pageY },
        });
      }
    },
    [onWordTap, translate, newWordsSet],
  );

  const dismissTooltip = useCallback(() => setTooltip(null), []);

  return (
    <View ref={containerRef} style={styles.container}>
      {tokens.map((token, i) => {
        const isNew = newWordsSet.has(token.word.toLowerCase());
        return (
          <Pressable
            key={`${token.word}-${i}`}
            onPress={(e) => handleWordPress(token.word, e)}
            style={({ pressed }) => [
              styles.wordWrap,
              isNew && { backgroundColor: colors.primary[100], borderRadius: 4 },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.word,
                { color: theme.text },
                isNew && { color: colors.primary[700], fontWeight: "600" },
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
          translation={tooltip.translation}
          isNew={tooltip.isNew}
          position={tooltip.position}
          onDismiss={dismissTooltip}
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
});
