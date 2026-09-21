import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useTheme, getThemePref, setThemePref, type ThemePref } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { getBoolean, setBoolean } from "@/lib/storage";
import { BookIcon, HeartIcon, BoltIcon, ShieldIcon } from "@/components/icons";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import Svg, { Path } from "react-native-svg";

function ChevronRight({ size = 20, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BackArrow({ size = 24, color = "#E2E8F0" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon({ size = 20, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SunMoonIcon({ size = 20, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function VolumeIcon({ size = 20, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const [themePref, setThemePrefState] = useState<ThemePref>(() => getThemePref());
  const [soundEnabled, setSoundEnabled] = useState(() => getBoolean("settings_sound") !== false);
  const [hapticsEnabled, setHapticsEnabled] = useState(() => getBoolean("settings_haptics") !== false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => getBoolean("settings_notifications") !== false);
  const [dailyReminder, setDailyReminder] = useState(() => getBoolean("settings_daily_reminder") !== false);

  const toggleSound = (v: boolean) => {
    setSoundEnabled(v);
    setBoolean("settings_sound", v);
  };
  const toggleHaptics = (v: boolean) => {
    setHapticsEnabled(v);
    setBoolean("settings_haptics", v);
  };
  const toggleNotifications = (v: boolean) => {
    setNotificationsEnabled(v);
    setBoolean("settings_notifications", v);
  };
  const toggleDailyReminder = (v: boolean) => {
    setDailyReminder(v);
    setBoolean("settings_daily_reminder", v);
  };

  const handleThemePref = (pref: ThemePref) => {
    setThemePrefState(pref);
    setThemePref(pref);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.settingsBg, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.settingsBorder }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <BackArrow color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t("settings.title")}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionHeader, { color: theme.settingsHeader }]}>{t("settings.account")}</Text>
        <View style={[styles.card, { backgroundColor: theme.settingsCard, borderColor: theme.settingsBorder }]}>
          <SettingsNavRow
            icon={<BookIcon size={20} color={colors.primary[500]} />}
            label={t("settings.language_level")}
            theme={theme}
          />
          <Divider color={theme.settingsBorder} />
          <SettingsNavRow
            icon={<ShieldIcon size={20} color={colors.primary[500]} />}
            label={t("settings.privacy")}
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.settingsHeader }]}>{t("settings.preferences")}</Text>
        <View style={[styles.card, { backgroundColor: theme.settingsCard, borderColor: theme.settingsBorder }]}>
          <SettingsThemeRow
            icon={<SunMoonIcon size={20} color={colors.info} />}
            label={t("settings.theme")}
            value={themePref}
            onChange={handleThemePref}
            theme={theme}
            t={t as (key: string) => string}
          />
          <Divider color={theme.settingsBorder} />
          <SettingsToggleRow
            icon={<VolumeIcon size={20} color={colors.streak} />}
            label={t("settings.sound")}
            value={soundEnabled}
            onToggle={toggleSound}
            theme={theme}
          />
          <Divider color={theme.settingsBorder} />
          <SettingsToggleRow
            icon={<BoltIcon size={20} color={colors.xp} />}
            label={t("settings.haptics")}
            value={hapticsEnabled}
            onToggle={toggleHaptics}
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.settingsHeader }]}>{t("settings.notifications_section")}</Text>
        <View style={[styles.card, { backgroundColor: theme.settingsCard, borderColor: theme.settingsBorder }]}>
          <SettingsToggleRow
            icon={<BellIcon size={20} color={colors.primary[500]} />}
            label={t("settings.notifications")}
            value={notificationsEnabled}
            onToggle={toggleNotifications}
            theme={theme}
          />
          <Divider color={theme.settingsBorder} />
          <SettingsToggleRow
            icon={<HeartIcon size={20} color={colors.heart} />}
            label={t("settings.daily_reminder")}
            sublabel={t("settings.daily_reminder_desc")}
            value={dailyReminder}
            onToggle={toggleDailyReminder}
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.settingsHeader }]}>{t("settings.subscription")}</Text>
        <View style={[styles.card, { backgroundColor: theme.settingsCard, borderColor: theme.settingsBorder }]}>
          <SettingsNavRow
            icon={<HeartIcon size={20} color={colors.crystal} />}
            label={t("settings.manage_plan")}
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.settingsHeader }]}>{t("settings.support")}</Text>
        <View style={[styles.card, { backgroundColor: theme.settingsCard, borderColor: theme.settingsBorder }]}>
          <SettingsNavRow label={t("settings.help")} theme={theme} />
          <Divider color={theme.settingsBorder} />
          <SettingsNavRow label={t("settings.terms")} theme={theme} />
          <Divider color={theme.settingsBorder} />
          <SettingsNavRow label={t("settings.privacy_policy")} theme={theme} />
          <Divider color={theme.settingsBorder} />
          <SettingsNavRow label={t("settings.about")} theme={theme} />
        </View>

        <Text style={[styles.version, { color: theme.textMuted }]}>
          Falatório v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

function SettingsNavRow({
  icon,
  label,
  theme,
}: {
  icon?: React.ReactNode;
  label: string;
  theme: ReturnType<typeof import("@/lib/theme").useTheme>;
}) {
  return (
    <Pressable style={styles.row}>
      <View style={styles.rowLeft}>
        {icon && <View style={styles.rowIcon}>{icon}</View>}
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <ChevronRight color={theme.textMuted} />
    </Pressable>
  );
}

function SettingsThemeRow({
  icon,
  label,
  value,
  onChange,
  theme,
  t,
}: {
  icon?: React.ReactNode;
  label: string;
  value: ThemePref;
  onChange: (pref: ThemePref) => void;
  theme: ReturnType<typeof import("@/lib/theme").useTheme>;
  t: (key: string) => string;
}) {
  const options: { key: ThemePref; labelKey: string }[] = [
    { key: "system", labelKey: "settings.theme_system" },
    { key: "light", labelKey: "settings.theme_light" },
    { key: "dark", labelKey: "settings.theme_dark" },
  ];

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {icon && <View style={styles.rowIcon}>{icon}</View>}
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <View style={themePickerStyles.segmented}>
        {options.map((opt) => {
          const active = value === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={[
                themePickerStyles.segment,
                { backgroundColor: active ? (theme.isDark ? "#1E2D45" : "#E2E8F0") : "transparent" },
              ]}
            >
              <Text
                style={[
                  themePickerStyles.segmentText,
                  { color: active ? theme.text : theme.textMuted },
                ]}
              >
                {t(opt.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SettingsToggleRow({
  icon,
  label,
  sublabel,
  value,
  onToggle,
  disabled,
  theme,
}: {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  value: boolean;
  onToggle?: (v: boolean) => void;
  disabled?: boolean;
  theme: ReturnType<typeof import("@/lib/theme").useTheme>;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {icon && <View style={styles.rowIcon}>{icon}</View>}
        <View>
          <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
          {sublabel && (
            <Text style={[styles.rowSublabel, { color: theme.textMuted }]}>{sublabel}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: theme.switchTrack, true: theme.switchTrackActive }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  sectionHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowLabel: {
    fontSize: typography.sizes.md,
    fontWeight: "500",
  },
  rowSublabel: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: spacing.lg + 32 + spacing.md,
  },
  version: {
    textAlign: "center",
    fontSize: typography.sizes.xs,
    marginTop: spacing["2xl"],
    marginBottom: spacing.xl,
  },
});

const themePickerStyles = StyleSheet.create({
  segmented: {
    flexDirection: "row",
    borderRadius: radii.sm,
    overflow: "hidden",
    gap: 2,
  },
  segment: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.xs,
  },
  segmentText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
});
