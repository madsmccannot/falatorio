import { View, ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OuroBalance } from "@/components/shop/OuroBalance";
import { OuroPacks } from "@/components/shop/OuroPacks";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";

export default function OuroPacksScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("ouro.section"),
          headerRight: () => <OuroBalance />,
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <OuroPacks />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
