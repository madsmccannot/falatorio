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
import { colors, spacing, radii, typography } from "@fala-pt/ui/tokens";

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
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [selectedError, setSelectedError] = React.useState<Message["errors"]>(undefined);

  const startMutation = trpc.conversation.startSession.useMutation();
  const sendMutation = trpc.conversation.sendMessage.useMutation();
  const completeMutation = trpc.conversation.completeSession.useMutation();

  React.useEffect(() => {
    (async () => {
      const result = await startMutation.mutateAsync({ scenarioId: scenarioId! });
      setSessionId(result.sessionId);
      setMessages([
        {
          id: "tutor-0",
          role: "tutor",
          text: "Olá! Vamos praticar português. Diz-me alguma coisa!",
        },
      ]);
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
  };

  const handleEnd = async () => {
    if (sessionId) {
      await completeMutation.mutateAsync({ sessionId });
    }
    router.back();
  };

  if (startMutation.isPending) {
    return <Loading fullScreen message="Starting conversation..." />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.topBar}>
        <Button title="End" onPress={handleEnd} variant="ghost" size="sm" />
        <Text style={styles.topTitle}>{scenarioId}</Text>
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
              item.role === "user" ? styles.userBubble : styles.tutorBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === "user" ? styles.userText : styles.tutorText,
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
          <Text style={styles.typingText}>Tutor is typing...</Text>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type in Portuguese..."
          placeholderTextColor={colors.neutral[400]}
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
        <Text style={styles.modalTitle}>Errors in your message</Text>
        {selectedError?.map((err, i) => (
          <View key={i} style={styles.errorCard}>
            <Text style={styles.errorFragment}>"{err.userSaid}"</Text>
            <Text style={styles.errorCorrection}>{err.correct}</Text>
            <Text style={styles.errorExplanation}>{err.explanation}</Text>
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
    backgroundColor: colors.neutral[50],
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  topTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    color: colors.neutral[900],
    textTransform: "capitalize",
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
    backgroundColor: colors.primary[600],
    borderBottomRightRadius: radii.xs,
  },
  tutorBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.neutral[0],
    borderBottomLeftRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  bubbleText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
  },
  tutorText: {
    color: colors.neutral[900],
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
    color: colors.neutral[400],
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.neutral[900],
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  errorCard: {
    backgroundColor: colors.neutral[50],
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
    color: colors.neutral[600],
    lineHeight: 18,
  },
});
