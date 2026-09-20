import type React from "react";
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { colors, spacing, radii } from "@falatorio/ui/tokens";

export interface ModalProps {
  visible: boolean;
  onClose?: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  dismissable?: boolean;
}

export function Modal({
  visible,
  onClose,
  onDismiss,
  children,
  dismissable = true,
}: ModalProps) {
  const handleClose = onClose ?? onDismiss ?? (() => {});
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissable ? handleClose : undefined}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Pressable
          style={styles.backdrop}
          onPress={dismissable ? handleClose : undefined}
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
