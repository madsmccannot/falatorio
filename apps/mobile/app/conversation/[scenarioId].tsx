import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/lib/theme";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type Message = {
  id: string;
  role: "user" | "tutor";
  text: string;
  errors?: Array<{ type: string; userSaid: string; correct: string; explanation: string }>;
};

export default function ConversationScreen() {
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [selectedError, setSelectedError] = React.useState<Message["errors"]>(undefined);
  const [startError, setStartError] = React.useState(false);

  const startMutation = trpc.conversation.startSession.useMutation();
  const sendMutation = trpc.conversation.sendMessage.useMutation();
  const completeMutation = trpc.conversation.completeSession.useMutation();

  React.useEffect(() => {
    (async () => {
      try {
        const result = await startMutation.mutateAsync({ scenarioId: scenarioId! });
        setSessionId(result.sessionId);
        setMessages([
          {
            id: "tutor-0",
            role: "tutor",
            text: "Ola! Vamos praticar portugues. Diz-me alguma coisa!",
          },
        ]);
      } catch {
        setStartError(true);
      }
    })();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    const userText = input.trim();
    setInput("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await sendMutation.mutateAsync({
        sessionId,
        message: userText,
      });

      const tutorMsg: Message = {
        id: `tutor-${Date.now()}`,
        role: "tutor",
        text: result.reply,
        errors: result.errors?.length ? result.errors : undefined,
      };
      setMessages((prev) => [...prev, tutorMsg]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "tutor",
        text: "Something went wrong. Try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleEnd = async () => {
    if (sessionId) {
      try {
        await completeMutation.mutateAsync({ sessionId });
      } catch {}
    }
    router.back();
  };

  if (startError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Could not start conversation.
        </Text>
        <Button title="Go back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  if (startMutation.isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <Loading fullScreen message="Starting conversation..." />
      </View>
    );
  }

  const userBubbleBg = colors.primary[600];
  const tutorBubbleBg = theme.isDark ? theme.bgCard : colors.neutral[0];
  const tutorBorderColor = theme.border;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.topBar, { borderBottomColor: theme.border, backgroundColor: theme.bgElevated }]}>
        <Button title="End" onPress={handleEnd} variant="ghost" size="sm" />
        <Text style={[styles.topTitle, { color: theme.text }]}>{scenarioId}</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeInUp.duration(200)}
            style={[
              styles.bubble,
              item.role === "user"
                ? [styles.userBubble, { backgroundColor: userBubbleBg }]
                : [styles.tutorBubble, { backgroundColor: tutorBubbleBg, borderColor: tutorBorderColor }],
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === "user"
                  ? styles.userText
                  : { color: theme.text },
              ]}
            >
              {item.text}
            </Text>
            {item.errors && item.errors.length > 0 && (
              <Button
                title={`${item.errors.length} error${item.errors.length > 1 ? "s" : ""} found`}
                onPress={() => setSelectedError(item.errors)}
                variant="ghost"
                size="sm"
                style={styles.errorButton}
              />
            )}
          </Animated.View>
        )}
      />

      {sendMutation.isPending && (
        <View style={styles.typing}>
          <Text style={[styles.typingText, { color: theme.textMuted }]}>Tutor is typing...</Text>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm, borderTopColor: theme.border, backgroundColor: theme.bgElevated }]}>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.bgInput, color: theme.text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Type in Portuguese..."
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={500}
          editable={!sendMutation.isPending}
        />
        <Button
          title="Send"
          onPress={handleSend}
          size="sm"
          disabled={!input.trim() || sendMutation.isPending}
          loading={sendMutation.isPending}
        />
      </View>

      <Modal
        visible={!!selectedError}
        onDismiss={() => setSelectedError(undefined)}
      >
        <Text style={[styles.modalTitle, { color: theme.text }]}>Errors in your message</Text>
        {selectedError?.map((err, i) => (
          <View key={i} style={[styles.errorCard, { backgroundColor: theme.bgInput }]}>
            <Text style={styles.errorFragment}>"{err.userSaid}"</Text>
            <Text style={styles.errorCorrection}>{err.correct}</Text>
            <Text style={[styles.errorExplanation, { color: theme.textSecondary }]}>{err.explanation}</Text>
          </View>
        ))}
        <Button
          title="Got it"
          onPress={() => setSelectedError(undefined)}
          style={{ marginTop: spacing.md }}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  topTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  errorText: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    textAlign: "center",
  },
  messageList: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  bubble: {
    maxWidth: "80%",
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: radii.xs,
  },
  tutorBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: radii.xs,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
  },
  errorButton: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  typing: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  typingText: {
    fontSize: typography.sizes.xs,
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  errorCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorFragment: {
    fontSize: typography.sizes.sm,
    color: colors.accent[600],
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  errorCorrection: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  errorExplanation: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
});
