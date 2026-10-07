import { useState } from "react";
import { View, Text, FlatList, Pressable, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { Loading } from "@/components/ui/Loading";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";

type Tab = "followers" | "following";

export default function FollowersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("followers");

  const followers = trpc.user.getFollowers.useQuery({});
  const following = trpc.user.getFollowing.useQuery({});
  const data = tab === "followers" ? followers.data : following.data;
  const isLoading = tab === "followers" ? followers.isLoading : following.isLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.backArrow, { color: theme.textMuted }]}>{"<-"}</Text>
        </Pressable>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab("followers")}
            style={[styles.tab, tab === "followers" && { borderBottomColor: colors.primary[500], borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === "followers" ? theme.text : theme.textMuted }]}>
              {t("profile.followers")} ({followers.data?.length ?? 0})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("following")}
            style={[styles.tab, tab === "following" && { borderBottomColor: colors.primary[500], borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === "following" ? theme.text : theme.textMuted }]}>
              {t("profile.following")} ({following.data?.length ?? 0})
            </Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <Loading message={t("profile.loading")} />
      ) : !data || data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {tab === "followers" ? t("profile.no_followers") : t("profile.not_following")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/profile/${item.id}`);
              }}
            >
              <View style={[styles.row, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>
                      {(item.name ?? "?").slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.info}>
                  <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.username, { color: theme.textMuted }]}>
                    @{item.username}
                  </Text>
                </View>
                <Text style={[styles.xp, { color: colors.xp }]}>
                  {item.totalXp.toLocaleString()} XP
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: "600",
  },
  tabs: {
    flex: 1,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },
  username: {
    fontSize: typography.sizes.xs,
  },
  xp: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
  },
});
