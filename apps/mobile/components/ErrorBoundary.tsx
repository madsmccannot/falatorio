import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { captureError } from "@/lib/sentry";
import { trackError } from "@/lib/analytics";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, typography } from "@falatorio/ui/tokens";

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("error.title" as any)}</Text>
      <Text style={styles.subtitle}>{t("error.subtitle" as any)}</Text>
      <Button
        title={t("error.retry" as any)}
        onPress={onReset}
        style={styles.button}
      />
    </View>
  );
}

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureError(error, { componentStack: info.componentStack ?? "" });
    trackError(error.message, "error_boundary");
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.neutral[0],
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});
