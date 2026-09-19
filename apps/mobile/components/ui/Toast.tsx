import React, { useEffect, useCallback, createContext, useContext, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radii, typography, shadows } from "@fala-pt/ui/tokens";

type ToastType = "success" | "error" | "info";

interface ToastData {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  show: (data: ToastData) => void;
  showToast: (data: ToastData) => void;
}

const noop = () => {};
const ToastContext = createContext<ToastContextValue>({ show: noop, showToast: noop });

export function useToast() {
  return useContext(ToastContext);
}

const TYPE_COLORS: Record<ToastType, { bg: string; text: string }> = {
  success: { bg: colors.primary[600], text: "#FFFFFF" },
  error: { bg: colors.accent[600], text: "#FFFFFF" },
  info: { bg: colors.neutral[800], text: "#FFFFFF" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const translateY = useSharedValue(-100);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => setToast(null), []);

  const show = useCallback((data: ToastData) => {
    setToast(data);
  }, []);

  useEffect(() => {
    if (toast) {
      translateY.value = withTiming(0, { duration: 250 });
      translateY.value = withDelay(
        toast.duration ?? 2500,
        withTiming(-100, { duration: 200 }, () => {
          runOnJS(hide)();
        }),
      );
    }
  }, [toast, translateY, hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const style = toast ? TYPE_COLORS[toast.type] : TYPE_COLORS.info;

  return (
    <ToastContext.Provider value={{ show, showToast: show }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            shadows.md,
            { backgroundColor: style.bg, top: insets.top + spacing.sm },
            animatedStyle,
          ]}
        >
          <Text style={[styles.text, { color: style.text }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    zIndex: 9999,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.body.fontFamily,
    fontWeight: "500",
    textAlign: "center",
  },
});
