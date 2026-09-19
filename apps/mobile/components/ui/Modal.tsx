import React from "react";
import {
  Modal as RNModal,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { colors, spacing, radii } from "@fala-pt/ui/tokens";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissable?: boolean;
}

export function Modal({
  visible,
  onClose,
  children,
  dismissable = true,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissable ? onClose : undefined}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Pressable
          style={styles.backdrop}
          onPress={dismissable ? onClose : undefined}
        />
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(300)}
          exiting={SlideOutDown.duration(200)}
          style={styles.content}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing["5xl"],
    maxHeight: "80%",
  },
});
