import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, Dimensions, BackHandler, Modal,
  Animated as RNAnimated, Image,
} from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { trpc } from "@/lib/trpc";
import { useHearts } from "@/hooks/useHearts";
import { useStreak } from "@/hooks/useStreak";
import { useOuro } from "@/hooks/useOuro";
import { Loading } from "@/components/ui/Loading";
import {
  HeartIcon, StreakIcon, GoldPrisms, BookIcon, ChestIcon,
  StarIcon, BoltIcon, LockIcon, CheckIcon, ChevronRightIcon,
} from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { useAdReward } from "@/hooks/useAdReward";
import { BannerAdComponent } from "@/components/ads/BannerAd";
import { useEntitlements } from "@/hooks/useEntitlements";
import { colors, spacing, radii, typography } from "@falatorio/ui/tokens";
import { OURO, HEARTS } from "@falatorio/core";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NODE_SIZE = 64;
const PATH_CENTER = SCREEN_WIDTH / 2;
const PATH_AMPLITUDE = 80;
const NODE_GAP = 20;

function getUnitColor(index: number): string {
  return colors.unitColors[index % colors.unitColors.length]!;
}

const PATH_OFFSETS = [0, 0.6, 1, 0.8, 0, -0.6, -1, -0.8];

function getNodeX(globalIndex: number): number {
  const phase = PATH_OFFSETS[globalIndex % PATH_OFFSETS.length]!;
  return PATH_CENTER - NODE_SIZE / 2 + phase * PATH_AMPLITUDE;
}

const ARC_SIZE = NODE_SIZE + 30;
const ARC_RADIUS = 40;
const ARC_STROKE = 5;
const ARC_GLOW_STROKE = 10;
const ARC_GAP_DEG = 10;
const NODE_3D_DEPTH = 7;
const NODE_RADIUS = NODE_SIZE / 2;

function darkenColor(hex: string, amount = 0.35): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function getEstimatedXp(sectionSortOrder: number, isLastInUnit: boolean, isRepeat: boolean): number {
  if (isRepeat) return 15;
  if (isLastInUnit) return 50;
  return sectionSortOrder >= 2 ? 30 : 25;
}

type LessonNode = {
  id: string;
  sortOrder: number;
  nodeType: "lesson" | "chest";
  sessionsRequired: number;
  rewardConfig: { type: string; amount: number } | null;
  completed: boolean;
  completedSessions: number;
};

type UnitWithLessons = {
  id: string;
  title: Record<string, string>;
  theme: string;
  description: Record<string, string> | null;
  sortOrder: number;
  colorIndex: number;
  guidePhrases: Array<Record<string, string>>;
  lessons: LessonNode[];
};

type SelectedLesson = {
  id: string;
  nodeType: "lesson" | "chest";
  unitTitle: string;
  unitColor: string;
  lessonNum: number;
  totalLessons: number;
  completed: boolean;
  completedSessions: number;
  isLastInUnit: boolean;
  sessionsRequired: number;
  sectionSortOrder: number;
  locked: boolean;
};

function ProgressArcs({
  total,
  completed,
  color,
  locked,
  isSelected,
}: {
  total: number;
  completed: number;
  color: string;
  locked: boolean;
  isSelected?: boolean;
}) {
  if (total <= 0) return null;
  const r = ARC_RADIUS;
  const cx = ARC_SIZE / 2;
  const cy = ARC_SIZE / 2;
  const segAngle = (360 - total * ARC_GAP_DEG) / total;

  const arcs = Array.from({ length: total }, (_, i) => {
    const startDeg = -90 + i * (segAngle + ARC_GAP_DEG);
    const endDeg = startDeg + segAngle;
    const sr = (startDeg * Math.PI) / 180;
    const er = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(sr);
    const y1 = cy + r * Math.sin(sr);
    const x2 = cx + r * Math.cos(er);
    const y2 = cy + r * Math.sin(er);
    const la = segAngle > 180 ? 1 : 0;
    const filled = i < completed;
    return { i, x1, y1, x2, y2, la, filled, d: `M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2}` };
  });

  return (
    <Svg
      width={ARC_SIZE}
      height={ARC_SIZE}
    >
      {!locked && arcs.map((a) => (
        <Path
          key={`g${a.i}`}
          d={a.d}
          stroke={color}
          strokeWidth={ARC_GLOW_STROKE}
          strokeOpacity={isSelected ? (a.filled ? 0.55 : 0.3) : (a.filled ? 0.25 : 0.1)}
          fill="none"
          strokeLinecap="butt"
        />
      ))}
      {arcs.map((a) => {
        let stroke: string;
        let strokeOpacity = 1;
        if (locked) {
          stroke = "#6B7280";
          strokeOpacity = 0.25;
        } else if (isSelected) {
          stroke = "#FFFFFF";
          strokeOpacity = a.filled ? 1 : 0.45;
        } else {
          stroke = color;
          strokeOpacity = a.filled ? 1 : 0.4;
        }
        return (
          <Path
            key={a.i}
            d={a.d}
            stroke={stroke}
            strokeWidth={ARC_STROKE}
            strokeOpacity={strokeOpacity}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}

function LessonPathNode({
  node,
  globalIndex,
  unitColor,
  locked,
  sessionsRequired,
  isSelected,
  theme,
  onPress,
}: {
  node: LessonNode;
  globalIndex: number;
  unitColor: string;
  locked: boolean;
  sessionsRequired: number;
  isSelected: boolean;
  theme: ReturnType<typeof import("@/lib/theme").useTheme>;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const pressAnim = useRef(new RNAnimated.Value(0)).current;
  const isChest = node.nodeType === "chest";
  const nodeX = getNodeX(globalIndex);
  const isCompleted = node.completed;
  const filledSessions = isChest ? 0 : Math.min(node.completedSessions, sessionsRequired);

  const bgColor = locked
    ? (theme.isDark ? "#374151" : colors.neutral[300])
    : isChest
      ? colors.ouro
      : unitColor;
  const shadowBg = locked
    ? (theme.isDark ? "#1F2937" : colors.neutral[400])
    : darkenColor(isChest ? colors.ouro : unitColor);
  const rimColor = locked ? (theme.isDark ? "#2D3748" : colors.neutral[400]) : shadowBg;

  useEffect(() => {
    if (!isSelected) {
      RNAnimated.spring(pressAnim, {
        toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8,
      }).start();
    }
  }, [isSelected]);

  const handlePressIn = () => {
    RNAnimated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    if (!locked) {
      RNAnimated.spring(pressAnim, { toValue: NODE_3D_DEPTH, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    }
  };
  const handlePressOut = () => {
    RNAnimated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };

  const nodeIcon = isChest ? (
    <ChestIcon size={28} />
  ) : isCompleted ? (
    <CheckIcon size={26} color={locked ? "#9CA3AF" : "#FFFFFF"} />
  ) : (
    <StarIcon size={26} color={locked ? "#9CA3AF" : "#FFFFFF"} />
  );

  return (
    <View style={styles.nodeRow}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          Haptics.impactAsync(locked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={[styles.nodeWrapper, { left: nodeX }]}
      >
        <View style={{ alignItems: "center", overflow: "visible" as const }}>
          {isChest ? (
            <RNAnimated.View style={{ transform: [{ scale: scaleAnim }], opacity: locked ? 0.4 : 1 }}>
              <ChestIcon size={NODE_SIZE + 8} />
            </RNAnimated.View>
          ) : (
            <View style={{ position: "relative", width: NODE_SIZE, height: NODE_SIZE + NODE_3D_DEPTH, alignItems: "center", justifyContent: "center", overflow: "visible" as const }}>
              {!locked && sessionsRequired > 0 && (
                <View pointerEvents="none" style={{ position: "absolute", top: -(ARC_SIZE - NODE_SIZE) / 2 + NODE_3D_DEPTH / 2, left: -(ARC_SIZE - NODE_SIZE) / 2, overflow: "visible" as const }}>
                  <ProgressArcs
                    total={sessionsRequired}
                    completed={filledSessions}
                    color={unitColor}
                    locked={false}
                    isSelected={isSelected}
                  />
                </View>
              )}
              {!locked && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: NODE_SIZE,
                    height: NODE_SIZE,
                    borderRadius: NODE_RADIUS,
                    backgroundColor: shadowBg,
                  }}
                />
              )}
              <RNAnimated.View
                style={{
                  position: "absolute",
                  top: locked ? NODE_3D_DEPTH : 0,
                  transform: locked
                    ? [{ scale: scaleAnim }]
                    : [{ translateY: pressAnim }, { scale: scaleAnim }],
                }}
              >
                <View
                  style={[
                    styles.nodeCircle,
                    { backgroundColor: bgColor, borderColor: rimColor },
                  ]}
                >
                  {!locked && (
                    <View style={styles.nodeHighlight} />
                  )}
                  <View style={styles.nodeInnerShadow}>
                    {nodeIcon}
                  </View>
                </View>
              </RNAnimated.View>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

function QuestBanner() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const quests = trpc.quests.getDailyQuests.useQuery();
  const data = quests.data ?? [];
  const completed = data.filter((q) => q.completed).length;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/quests");
      }}
      style={[styles.questBanner, { backgroundColor: theme.dueCard, borderColor: theme.dueBorder }]}
    >
      <BoltIcon size={20} color={colors.xp} />
      <View style={styles.questBannerContent}>
        <Text style={[styles.questBannerTitle, { color: theme.text }]}>
          {t("quests.daily_title")}
        </Text>
        <View style={[styles.questBannerTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.questBannerFill, { width: `${(completed / 3) * 100}%` as any }]} />
        </View>
      </View>
      <Text style={[styles.questBannerCount, { color: theme.textMuted }]}>{completed}/3</Text>
      <ChevronRightIcon size={16} color={theme.textMuted} />
    </Pressable>
  );
}

function UnitGuideModal({
  visible,
  unit,
  sectionNum,
  l1,
  onClose,
  theme,
  t,
}: {
  visible: boolean;
  unit: UnitWithLessons | null;
  sectionNum: number;
  l1: string;
  onClose: () => void;
  theme: ReturnType<typeof useTheme>;
  t: (key: import("@/lib/i18n").TKey) => string;
}) {
  if (!unit) return null;
  const unitTitle = (unit.title as Record<string, string>)["pt"] ?? unit.theme;
  const descMap = unit.description as Record<string, string> | null;
  const unitDesc = descMap
    ? (descMap[l1] ?? descMap["en"] ?? descMap["pt"] ?? null)
    : null;
  const unitColor = getUnitColor(unit.colorIndex);
  const lessonsCount = unit.lessons.filter((l) => l.nodeType === "lesson").length;
  const completed = unit.lessons.filter((l) => l.completed).length;
  const progressPct = lessonsCount > 0 ? (completed / lessonsCount) * 100 : 0;
  const phrases = unit.guidePhrases ?? [];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.guideContainer, { backgroundColor: theme.bg }]}>
        <View style={styles.guideHeader}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[styles.guideClose, { color: theme.textMuted }]}>{"X"}</Text>
          </Pressable>
        </View>

        <View style={[styles.guideHero, { backgroundColor: unitColor }]}>
          <Text style={styles.guideHeroLabel}>
            {t("learn.section").toUpperCase()} {sectionNum}, {t("learn.unit").toUpperCase()} {unit.sortOrder + 1}
          </Text>
          <Text style={styles.guideHeroTitle}>{unitTitle}</Text>
          <View style={styles.guideProgress}>
            <View style={styles.guideProgressTrack}>
              <View style={[styles.guideProgressFill, { width: `${progressPct}%` as any, backgroundColor: "#FFFFFF" }]} />
            </View>
            <Text style={styles.guideProgressLabel}>{completed}/{lessonsCount}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.guideBody}>
          {unitDesc && (
            <Text style={[styles.guideDesc, { color: theme.textSecondary }]}>{unitDesc}</Text>
          )}

          {phrases.length > 0 ? (
            <View style={styles.guideSection}>
              <Text style={[styles.guideSectionTitle, { color: theme.text }]}>
                {t("learn.unit_guide_vocab")}
              </Text>
              {phrases.map((phrase, idx) => {
                const ptText = phrase["pt"] ?? "";
                const l1Text = phrase[l1] ?? phrase["en"] ?? "";
                return (
                  <View key={idx} style={[styles.guidePhrase, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                    <Text style={[styles.guidePhraseTextPt, { color: theme.text }]}>{ptText}</Text>
                    {l1 !== "pt" && l1Text !== "" && (
                      <Text style={[styles.guidePhraseTextL1, { color: theme.textMuted }]}>{l1Text}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.guideEmpty}>
              <BookIcon size={40} color={theme.textMuted} />
              <Text style={[styles.guideEmptyText, { color: theme.textMuted }]}>
                {t("learn.unit_guide_empty")}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function formatCountdown(ms: number | null): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function StreakModal({
  visible, onClose, theme, t, currentDays, longestDays,
  freezeAvailable, isActive, balance, onPurchaseFreeze, onStartLesson,
}: {
  visible: boolean;
  onClose: () => void;
  theme: ReturnType<typeof useTheme>;
  t: (key: any) => string;
  currentDays: number;
  longestDays: number;
  freezeAvailable: boolean;
  isActive: boolean;
  balance: number;
  onPurchaseFreeze: () => void;
  onStartLesson: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"personal" | "friends">("personal");
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const following = trpc.user.getFollowing.useQuery({}, { enabled: visible && tab === "friends" });

  const dayLabels = [
    t("streak.sun"), t("streak.mon"), t("streak.tue"), t("streak.wed"),
    t("streak.thu"), t("streak.fri"), t("streak.sat"),
  ];

  const today = new Date();
  const calDays = useMemo(() => {
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number; active: boolean; isToday: boolean; isFrozen: boolean } | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const active = isPast || (isToday && isActive);
      cells.push({ day: d, active, isToday, isFrozen: false });
    }
    return cells;
  }, [calMonth, isActive]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const prevMonth = () => {
    setCalMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };
  const nextMonth = () => {
    setCalMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const isPersonal = tab === "personal";
  const heroColor = isPersonal ? "#1CB0F6" : "#FF9600";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
        <View style={[styles.modalHeader, { backgroundColor: heroColor }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[styles.modalClose, { color: "#FFFFFF" }]}>{"X"}</Text>
          </Pressable>
          <Text style={[styles.modalHeaderTitle, { color: "#FFFFFF" }]}>{t("streak.title")}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.streakTabRow}>
          <Pressable
            onPress={() => setTab("personal")}
            style={[styles.streakTab, isPersonal && { borderBottomColor: heroColor, borderBottomWidth: 3 }]}
          >
            <Text style={[styles.streakTabText, { color: isPersonal ? heroColor : theme.textMuted }]}>
              {t("streak.personal")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("friends")}
            style={[styles.streakTab, !isPersonal && { borderBottomColor: "#FF9600", borderBottomWidth: 3 }]}
          >
            <Text style={[styles.streakTabText, { color: !isPersonal ? "#FF9600" : theme.textMuted }]}>
              {t("streak.friends")}
            </Text>
          </Pressable>
        </View>

        {isPersonal ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={[styles.streakHero, { backgroundColor: heroColor }]}>
              <Text style={styles.streakSocietyBadge}>{t("streak.society")}</Text>
              <Text style={styles.streakBigNum}>{currentDays}</Text>
              <Text style={styles.streakSubtext}>{t("streak.day_streak")}</Text>
            </View>

            {!isActive && (
              <View style={[styles.streakFrozenCard, { backgroundColor: theme.isDark ? "#1F2937" : "#1A1A2E" }]}>
                <View style={[styles.freezeIconWrap, { backgroundColor: "rgba(28,176,246,0.15)" }]}>
                  <StreakIcon size={28} color="#1CB0F6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: typography.sizes.md, lineHeight: 22 }}>
                    {t("streak.keep_going")}
                  </Text>
                  <Pressable onPress={onStartLesson}>
                    <Text style={{ color: "#1CB0F6", fontWeight: "800", fontSize: typography.sizes.sm, marginTop: 4 }}>
                      {t("streak.start_lesson")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={[styles.modalBody, { paddingBottom: 0 }]}>
              <Text style={[styles.streakCalendarTitle, { color: theme.text }]}>
                {t("streak.calendar")}
              </Text>
              <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.calendarNav}>
                  <Pressable onPress={prevMonth} hitSlop={12}>
                    <Text style={[styles.calendarArrow, { color: theme.textMuted }]}>{"<"}</Text>
                  </Pressable>
                  <Text style={[styles.calendarMonthLabel, { color: theme.text }]}>
                    {monthNames[calMonth.month]} {calMonth.year}
                  </Text>
                  <Pressable onPress={nextMonth} hitSlop={12}>
                    <Text style={[styles.calendarArrow, { color: theme.textMuted }]}>{">"}</Text>
                  </Pressable>
                </View>
                <View style={styles.calendarDayHeaders}>
                  {dayLabels.map((l, i) => (
                    <Text key={i} style={[styles.calendarDayHeader, { color: theme.textMuted }]}>{l}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {calDays.map((cell, i) => (
                    <View key={i} style={styles.calendarCell}>
                      {cell ? (
                        <View style={[
                          styles.calendarDayCircle,
                          cell.active
                            ? { backgroundColor: "#FF9600" }
                            : cell.isToday
                              ? { backgroundColor: "transparent", borderWidth: 2, borderColor: "#1CB0F6" }
                              : {},
                        ]}>
                          <Text style={[
                            styles.calendarDayText,
                            { color: cell.active ? "#FFFFFF" : cell.isToday ? "#1CB0F6" : theme.textMuted },
                          ]}>
                            {cell.day}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.streakStatsGrid}>
                  <View style={styles.streakStatBlock}>
                    <Text style={[styles.streakStatBlockNum, { color: "#FF9600" }]}>{currentDays}</Text>
                    <Text style={[styles.streakStatBlockLabel, { color: theme.textMuted }]}>{t("streak.current")}</Text>
                  </View>
                  <View style={[styles.streakStatBlockDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.streakStatBlock}>
                    <Text style={[styles.streakStatBlockNum, { color: theme.text }]}>{longestDays}</Text>
                    <Text style={[styles.streakStatBlockLabel, { color: theme.textMuted }]}>{t("streak.longest")}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.freezeRow}>
                  <View style={[styles.freezeIconWrap, { backgroundColor: freezeAvailable ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.12)" }]}>
                    <StreakIcon size={24} color={freezeAvailable ? "#10B981" : "#3B82F6"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalCardTitle, { color: theme.text }]}>{t("streak.freeze_buy")}</Text>
                    <Text style={[styles.modalCardDesc, { color: theme.textMuted }]}>{t("streak.freeze_desc")}</Text>
                  </View>
                </View>
                {freezeAvailable ? (
                  <View style={[styles.freezeActiveBadge, { backgroundColor: "rgba(16,185,129,0.12)" }]}>
                    <View style={[styles.freezeActiveDot, { backgroundColor: "#10B981" }]} />
                    <Text style={{ color: "#10B981", fontWeight: "700", fontSize: typography.sizes.sm }}>
                      {t("streak.freeze_active")}
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.freezeBuyBtn, {
                      backgroundColor: theme.isDark ? "#1F2937" : colors.neutral[100],
                      opacity: balance < OURO.COST_STREAK_FREEZE ? 0.5 : 1,
                    }]}
                    onPress={onPurchaseFreeze}
                    disabled={balance < OURO.COST_STREAK_FREEZE}
                  >
                    <GoldPrisms size={16} />
                    <Text style={[styles.modalSecondaryBtnText, { color: theme.text }]}>
                      {OURO.COST_STREAK_FREEZE}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={[styles.streakHero, { backgroundColor: "#FF9600", paddingVertical: spacing["2xl"] }]}>
              <StreakIcon size={64} color="#FFFFFF" />
            </View>

            <View style={styles.modalBody}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                <Text style={[styles.streakCalendarTitle, { color: theme.text, marginBottom: 0 }]}>
                  {t("streak.friend_streaks")}
                </Text>
                <Pressable onPress={() => {
                  onClose();
                  router.push("/profile/followers");
                }}>
                  <Text style={{ color: "#FF9600", fontWeight: "800", fontSize: typography.sizes.sm }}>
                    {t("streak.edit")}
                  </Text>
                </Pressable>
              </View>

              {(following.data ?? []).length === 0 ? (
                <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border, alignItems: "center", paddingVertical: spacing["2xl"] }]}>
                  <Text style={[styles.modalCardDesc, { color: theme.textMuted, textAlign: "center" }]}>
                    {t("streak.no_friends")}
                  </Text>
                </View>
              ) : (
                (following.data ?? []).map((friend) => (
                  <Pressable
                    key={friend.id}
                    onPress={() => {
                      onClose();
                      router.push(`/profile/${friend.id}`);
                    }}
                  >
                    <View style={[styles.friendStreakRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                      {friend.avatarUrl ? (
                        <Image source={{ uri: friend.avatarUrl }} style={styles.friendAvatar} />
                      ) : (
                        <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
                          <Text style={styles.friendAvatarInitial}>
                            {(friend.name ?? "?").slice(0, 1).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.friendName, { color: theme.text }]} numberOfLines={1}>
                        {friend.name}
                      </Text>
                      <StreakIcon size={16} color="#9CA3AF" />
                      <Text style={[styles.friendStreakCount, { color: theme.textMuted }]}>
                        {friend.streakDays ?? 0}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}

              <Pressable
                onPress={() => {
                  onClose();
                  router.push("/profile/followers");
                }}
                style={[styles.friendStreakRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              >
                <View style={[styles.friendAvatar, { borderWidth: 2, borderColor: theme.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center" }]}>
                  <Text style={{ color: theme.textMuted, fontSize: 20, fontWeight: "300" }}>+</Text>
                </View>
                <Text style={[styles.friendName, { color: theme.textMuted }]}>
                  {t("streak.invite_friend")}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function HeartsModal({
  visible, onClose, theme, t, hearts, unlimited,
  nextRefillIn, balance, onRefill, isRefilling, onPractice,
  canWatchAd, isWatchingAd, onWatchAd,
}: {
  visible: boolean;
  onClose: () => void;
  theme: ReturnType<typeof useTheme>;
  t: (key: any) => string;
  hearts: number;
  unlimited: boolean;
  nextRefillIn: number | null;
  balance: number;
  onRefill: () => void;
  isRefilling: boolean;
  onPractice: () => void;
  canWatchAd: boolean;
  isWatchingAd: boolean;
  onWatchAd: () => void;
}) {
  const heartIcons = Array.from({ length: HEARTS.MAX }, (_, i) => i < hearts);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[styles.modalClose, { color: theme.textMuted }]}>{"X"}</Text>
          </Pressable>
          <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>{t("hearts.title")}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.heartsHero, { backgroundColor: colors.heart }]}>
          <View style={styles.heartsRowBig}>
            {heartIcons.map((filled, i) => (
              <View key={i} style={styles.heartIconWrap}>
                <HeartIcon size={40} color={filled ? "#FFFFFF" : "rgba(255,255,255,0.25)"} />
              </View>
            ))}
          </View>
          <Text style={styles.heartsCountBig}>
            {unlimited ? "UNLIMITED" : `${hearts}/${HEARTS.MAX}`}
          </Text>
          {!unlimited && hearts < HEARTS.MAX && hearts > 0 && (
            <Text style={styles.heartsSubtext}>{t("hearts.empty_message")}</Text>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.modalBody}>
          {unlimited ? (
            <View style={[styles.heartsStatusCard, { backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }]}>
              <View style={[styles.heartsStatusDot, { backgroundColor: "#10B981" }]} />
              <Text style={[styles.heartsStatusText, { color: "#10B981" }]}>
                {t("hearts.unlimited_message")}
              </Text>
            </View>
          ) : hearts >= HEARTS.MAX ? (
            <View style={[styles.heartsStatusCard, { backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }]}>
              <View style={[styles.heartsStatusDot, { backgroundColor: "#10B981" }]} />
              <Text style={[styles.heartsStatusText, { color: "#10B981" }]}>
                {t("hearts.full_message")}
              </Text>
            </View>
          ) : (
            <>
              {hearts === 0 && (
                <View style={[styles.heartsStatusCard, { backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }]}>
                  <Text style={[styles.heartsStatusText, { color: colors.heart }]}>
                    {t("hearts.empty_message")}
                  </Text>
                </View>
              )}

              {nextRefillIn != null && nextRefillIn > 0 && (
                <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                  <View style={styles.timerRow}>
                    <View>
                      <Text style={[styles.modalCardDesc, { color: theme.textMuted }]}>
                        {t("hearts.next_refill")}
                      </Text>
                      <Text style={[styles.timerText, { color: theme.text }]}>
                        {formatCountdown(nextRefillIn)}
                      </Text>
                    </View>
                    <View style={styles.timerBar}>
                      <View style={[styles.timerBarTrack, { backgroundColor: theme.isDark ? "#374151" : colors.neutral[200] }]}>
                        <View style={[styles.timerBarFill, {
                          backgroundColor: colors.heart,
                          width: `${Math.max(5, 100 - (nextRefillIn / (HEARTS.REFILL_INTERVAL_MS)) * 100)}%` as any,
                        }]} />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {!unlimited && hearts < HEARTS.MAX && (
            <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.heartsOptionRow}>
                <View style={[styles.heartsOptionIcon, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
                  <HeartIcon size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalCardTitle, { color: theme.text }]}>{t("hearts.refill_ouro")}</Text>
                  <Text style={[styles.modalCardDesc, { color: theme.textMuted }]}>
                    {HEARTS.MAX - hearts} / {HEARTS.MAX}
                  </Text>
                </View>
              </View>
              <Pressable
                style={[styles.heartsRefillBtn, {
                  backgroundColor: colors.heart,
                  opacity: balance < OURO.COST_HEART_REFILL || isRefilling ? 0.5 : 1,
                }]}
                onPress={onRefill}
                disabled={balance < OURO.COST_HEART_REFILL || isRefilling}
              >
                <GoldPrisms size={16} />
                <Text style={styles.modalPrimaryBtnText}>{OURO.COST_HEART_REFILL}</Text>
              </Pressable>
            </View>
          )}

          {!unlimited && (
            <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.heartsOptionRow}>
                <View style={[styles.heartsOptionIcon, { backgroundColor: "rgba(59,130,246,0.1)" }]}>
                  <StarIcon size={20} color="#3B82F6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalCardTitle, { color: theme.text }]}>{t("hearts.practice_btn")}</Text>
                  <Text style={[styles.modalCardDesc, { color: theme.textMuted }]}>
                    {t("hearts.practice_desc")}
                  </Text>
                </View>
              </View>
              <Pressable
                style={[styles.heartsPracticeBtn, { backgroundColor: "#3B82F6" }]}
                onPress={onPractice}
              >
                <Text style={styles.modalPrimaryBtnText}>{t("hearts.practice_btn")}</Text>
              </Pressable>
            </View>
          )}

          {!unlimited && hearts < HEARTS.MAX && (
            <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: canWatchAd ? 1 : 0.5 }]}>
              <View style={styles.heartsOptionRow}>
                <View style={[styles.heartsOptionIcon, { backgroundColor: "rgba(255,165,0,0.1)" }]}>
                  <BoltIcon size={20} color="#FFA500" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalCardTitle, { color: theme.text }]}>{t("hearts.watch_ad")}</Text>
                  <Text style={[styles.modalCardDesc, { color: theme.textMuted }]}>
                    {t("hearts.watch_ad_desc")}
                  </Text>
                </View>
              </View>
              <Pressable
                style={[styles.heartsRefillBtn, {
                  backgroundColor: "#FFA500",
                  opacity: !canWatchAd || isWatchingAd ? 0.5 : 1,
                }]}
                onPress={onWatchAd}
                disabled={!canWatchAd || isWatchingAd}
              >
                <BoltIcon size={16} color="#FFFFFF" />
                <Text style={styles.modalPrimaryBtnText}>{t("hearts.watch_ad")}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { hearts, unlimited, nextRefillIn, refillWithOuro, isRefilling } = useHearts();
  const { currentDays, longestDays, freezeAvailable, isActive, purchaseFreeze } = useStreak();
  const { balance } = useOuro();
  const { t, l1 } = useTranslation();
  const { isSuper } = useEntitlements();
  const { canWatch: canWatchAd, isWatching: isWatchingAd, claimReward: claimAdReward } = useAdReward();

  const [showSections, setShowSections] = useState(false);
  const [showUnitGuide, setShowUnitGuide] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [visibleUnitIdx, setVisibleUnitIdx] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(null);

  const unitYPositions = useRef<number[]>([]);

  const coursesQuery = trpc.content.getCourses.useQuery();
  const courseId = coursesQuery.data?.[0]?.id ?? null;

  const sectionsQuery = trpc.content.getSections.useQuery(
    { courseId: courseId! },
    { enabled: !!courseId },
  );

  const allSections = useMemo(() => {
    return (sectionsQuery.data ?? []).filter((s) => s.sectionType !== "daily_refresh");
  }, [sectionsQuery.data]);

  const dailyRefresh = useMemo(() => {
    return (sectionsQuery.data ?? []).find((s) => s.sectionType === "daily_refresh");
  }, [sectionsQuery.data]);

  useEffect(() => {
    if (allSections.length > 0 && !activeSectionId) {
      const firstIncomplete = allSections.find((s) => s.completedLessons < s.totalLessons);
      setActiveSectionId((firstIncomplete ?? allSections[0])?.id ?? null);
    }
  }, [allSections, activeSectionId]);

  const currentSection = allSections.find((s) => s.id === activeSectionId);
  const currentSectionIdx = allSections.findIndex((s) => s.id === activeSectionId);

  const sectionMapQuery = trpc.content.getSectionMap.useQuery(
    { sectionId: activeSectionId! },
    { enabled: !!activeSectionId && !showSections },
  );

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (showStreakModal) { setShowStreakModal(false); return true; }
      if (showHeartsModal) { setShowHeartsModal(false); return true; }
      if (showUnitGuide) { setShowUnitGuide(false); return true; }
      if (showSections) { setShowSections(false); return true; }
      return true;
    });
    return () => handler.remove();
  }, [showSections, showUnitGuide, showStreakModal, showHeartsModal]);

  const isLoading = coursesQuery.isLoading || (!!courseId && sectionsQuery.isLoading);

  const handleSelectSection = useCallback((sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSectionId(sectionId);
    setShowSections(false);
    setVisibleUnitIdx(0);
    unitYPositions.current = [];
  }, []);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const positions = unitYPositions.current;
    if (positions.length === 0) return;

    const bannerOffset = 80;
    let idx = 0;
    for (let i = positions.length - 1; i >= 0; i--) {
      if (scrollY + bannerOffset >= (positions[i] ?? 0)) {
        idx = i;
        break;
      }
    }
    setVisibleUnitIdx(idx);
  }, []);

  const handleUnitLayout = useCallback((unitIdx: number, e: LayoutChangeEvent) => {
    unitYPositions.current[unitIdx] = e.nativeEvent.layout.y;
  }, []);

  const renderTopBar = () => (
    <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable style={styles.topBarStat} onPress={() => router.push("/tabs/shop")}>
        <GoldPrisms size={20} />
        <Text style={[styles.topBarValue, { color: colors.ouro }]}>{balance}</Text>
      </Pressable>
      <Pressable style={styles.topBarStat} onPress={() => setShowHeartsModal(true)}>
        <HeartIcon size={20} />
        <Text style={[styles.topBarValue, { color: colors.heart }]}>
          {unlimited ? "∞" : hearts}
        </Text>
      </Pressable>
      <Pressable style={styles.topBarStat} onPress={() => setShowStreakModal(true)}>
        <StreakIcon size={20} color={colors.streak} />
        <Text style={[styles.topBarValue, { color: colors.streak }]}>{currentDays}</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.bgCard }]}>
        <BookIcon size={48} color={theme.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{t("learn.empty_title")}</Text>
      <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t("learn.empty_text")}</Text>
    </View>
  );

  // -- SECTIONS VIEW --
  if (showSections) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        <View style={[styles.sectionHeaderBar, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => setShowSections(false)} hitSlop={12}>
            <Text style={[styles.backArrow, { color: theme.textMuted }]}>{"←"}</Text>
          </Pressable>
          <Text style={[styles.sectionHeaderTitle, { color: theme.text }]} numberOfLines={1}>
            {t("learn.section")}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.sectionListContainer}
          showsVerticalScrollIndicator={false}
        >
          <QuestBanner />
          {allSections.length === 0 && renderEmpty()}
          {allSections.map((section) => {
            const sectionColor = colors.sectionColors[section.sortOrder % colors.sectionColors.length]!;
            const title = (section.title as Record<string, string>)["pt"] ?? "";
            const isActive = section.id === activeSectionId;
            const unitRange = section.unitCount > 0
              ? `${section.unitStart}–${section.unitEnd}`
              : "";
            const progressPct = section.totalLessons > 0
              ? Math.round((section.completedLessons / section.totalLessons) * 100)
              : 0;

            return (
              <Pressable
                key={section.id}
                onPress={() => handleSelectSection(section.id)}
              >
                <View style={[
                  styles.sectionLargeCard,
                  { backgroundColor: theme.bgCard, borderColor: isActive ? sectionColor : theme.border, borderWidth: isActive ? 2 : 1 },
                ]}>
                  <View style={[styles.sectionColorBlock, { backgroundColor: sectionColor }]}>
                    <View style={styles.sectionColorContent}>
                      <View style={styles.sectionIconCircle}>
                        <BookIcon size={32} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.sectionCardBody}>
                    <Text style={[styles.sectionLargeLabel, { color: theme.textMuted }]}>
                      {t("learn.section").toUpperCase()} {section.sortOrder + 1}
                    </Text>
                    <Text style={[styles.sectionLargeTitle, { color: theme.text }]} numberOfLines={2}>
                      {title}
                    </Text>

                    <View style={styles.sectionMetaRow}>
                      {unitRange ? (
                        <View style={[styles.sectionUnitBadge, { backgroundColor: sectionColor + "20" }]}>
                          <Text style={[styles.sectionUnitBadgeText, { color: sectionColor }]}>
                            {section.unitCount === 1 ? "1 unidade" : `Unidades ${unitRange}`}
                          </Text>
                        </View>
                      ) : null}
                      <View style={[styles.sectionCefrBadge, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                        <Text style={[styles.sectionCefrText, { color: theme.textMuted }]}>
                          {section.cefrMin}{section.cefrMax !== section.cefrMin ? `–${section.cefrMax}` : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.sectionProgressTrack, { backgroundColor: theme.border }]}>
                      <View style={[styles.sectionProgressFill, { backgroundColor: sectionColor, width: `${progressPct}%` as any }]} />
                    </View>

                    {section.sortOrder > 0 && progressPct === 0 && (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(
                            `/section-test?sectionId=${section.id}&sectionTitle=${encodeURIComponent(title)}&cefrMin=${section.cefrMin}&cefrMax=${section.cefrMax}`,
                          );
                        }}
                        hitSlop={8}
                      >
                        <Text style={[styles.sectionSkipLink, { color: sectionColor }]}>
                          {t("learn.skip_here")}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}

          {dailyRefresh && (
            <View style={[styles.sectionLargeCard, { backgroundColor: theme.bgCard, borderColor: theme.border, opacity: 0.55 }]}>
              <View style={[styles.sectionColorBlock, { backgroundColor: theme.isDark ? "#4B5563" : colors.neutral[400] }]}>
                <View style={styles.sectionColorContent}>
                  <View style={styles.sectionIconCircle}>
                    <LockIcon size={32} color="#FFFFFF" />
                  </View>
                </View>
              </View>
              <View style={styles.sectionCardBody}>
                <Text style={[styles.sectionLargeLabel, { color: theme.textMuted }]}>
                  {t("learn.daily_refresh").toUpperCase()}
                </Text>
                <Text style={[styles.sectionLargeTitle, { color: theme.textMuted }]}>
                  {t("learn.daily_refresh")}
                </Text>
                <Text style={[styles.sectionLockedText, { color: theme.textMuted }]}>
                  {t("learn.daily_refresh_locked")}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // -- LOADING / ERROR --
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        <Loading message={t("learn.loading")} />
      </View>
    );
  }

  if (coursesQuery.isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {renderTopBar()}
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Erro de ligação</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {coursesQuery.error?.message ?? "Não foi possível carregar os cursos."}
          </Text>
          <Pressable
            onPress={() => coursesQuery.refetch()}
            style={{ marginTop: spacing.lg, padding: spacing.md }}
          >
            <Text style={{ color: colors.primary[500], fontWeight: "700", fontSize: typography.sizes.md }}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // -- DEFAULT: UNIT PATH --
  const unitsLoading = !!activeSectionId && sectionMapQuery.isLoading;
  const unitsData = (sectionMapQuery.data ?? []) as UnitWithLessons[];

  const visibleUnit = unitsData[visibleUnitIdx];
  const bannerColor = visibleUnit
    ? getUnitColor(visibleUnit.colorIndex)
    : currentSection
      ? colors.sectionColors[currentSectionIdx % colors.sectionColors.length]!
      : colors.primary[500];
  const bannerSectionNum = currentSection ? currentSection.sortOrder + 1 : 1;
  const bannerUnitNum = visibleUnit ? visibleUnit.sortOrder + 1 : 1;
  const bannerTitle = visibleUnit
    ? ((visibleUnit.title as Record<string, string>)["pt"] ?? visibleUnit.theme)
    : currentSection
      ? ((currentSection.title as Record<string, string>)["pt"] ?? "")
      : "";

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {renderTopBar()}

      {currentSection && (
        <View style={[styles.currentSectionBanner, { backgroundColor: bannerColor }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSections(true);
            }}
            style={styles.currentSectionContent}
          >
            <Text style={styles.currentSectionLabel}>
              {t("learn.section").toUpperCase()} {bannerSectionNum}, {t("learn.unit").toUpperCase()} {bannerUnitNum}
            </Text>
            <Text style={styles.currentSectionTitle} numberOfLines={1}>
              {bannerTitle}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowUnitGuide(true);
            }}
            style={styles.currentSectionAction}
          >
            <BookIcon size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      {unitsLoading ? (
        <Loading message={t("learn.loading")} />
      ) : unitsData.length === 0 ? (
        renderEmpty()
      ) : (
        <ScrollView
          contentContainerStyle={[styles.pathContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {(() => {
            let prevUnitLastCompleted = true;
            let globalNodeIdx = 0;
            return unitsData.map((unit, unitIdx) => {
              const unitColor = getUnitColor(unit.colorIndex);
              const unitTitle = (unit.title as Record<string, string>)["pt"] ?? unit.theme;
              const unitLocked = !prevUnitLastCompleted && unit.colorIndex > 0;

              const rendered = (
                <View
                  key={unit.id}
                  onLayout={(e) => handleUnitLayout(unitIdx, e)}
                >
                  {unitIdx > 0 && (
                    <View style={styles.unitDivider}>
                      <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
                      <Text style={[styles.unitDividerText, { color: theme.textMuted }]} numberOfLines={1}>
                        {unitTitle}
                      </Text>
                      <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
                    </View>
                  )}

                  {unitLocked && unitIdx > 0 && (
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(
                          `/section-test?sectionId=${activeSectionId}&sectionTitle=${encodeURIComponent(bannerTitle)}&cefrMin=${currentSection?.cefrMin ?? "A1"}&cefrMax=${currentSection?.cefrMax ?? "A2"}`,
                        );
                      }}
                      style={[styles.jumpHereBtn, { borderColor: theme.border }]}
                    >
                      <Text style={[styles.jumpHereText, { color: unitColor }]}>
                        {t("learn.skip_here")}
                      </Text>
                    </Pressable>
                  )}

                  {unit.lessons.map((lesson, lIdx) => {
                    const prevCompleted = lIdx === 0
                      ? prevUnitLastCompleted
                      : unit.lessons[lIdx - 1]!.completed;
                    const isLocked = unitLocked || (lIdx > 0 && !prevCompleted);

                    const thisGlobalIdx = globalNodeIdx;
                    globalNodeIdx++;

                    const sectionSort = currentSection?.sortOrder ?? 0;
                    const isLastLesson = lIdx === unit.lessons.length - 1 && lesson.nodeType === "lesson";

                    return (
                      <LessonPathNode
                        key={lesson.id}
                        node={lesson}
                        globalIndex={thisGlobalIdx}
                        unitColor={unitColor}
                        locked={isLocked}
                        sessionsRequired={lesson.sessionsRequired}
                        isSelected={selectedLesson?.id === lesson.id}
                        theme={theme}
                        onPress={() => {
                          const lessonCount = unit.lessons.filter((l) => l.nodeType === "lesson").length;
                          setSelectedLesson({
                            id: lesson.id,
                            nodeType: lesson.nodeType,
                            unitTitle: unitTitle,
                            unitColor,
                            lessonNum: lIdx + 1,
                            totalLessons: lessonCount,
                            completed: lesson.completed,
                            completedSessions: lesson.completedSessions ?? 0,
                            isLastInUnit: isLastLesson,
                            sessionsRequired: lesson.sessionsRequired,
                            sectionSortOrder: sectionSort,
                            locked: isLocked,
                          });
                        }}
                      />
                    );
                  })}

                  <View style={styles.unitSpacer} />
                </View>
              );

              const lastLesson = unit.lessons[unit.lessons.length - 1];
              prevUnitLastCompleted = lastLesson ? lastLesson.completed : true;

              return rendered;
            });
          })()}

          <View style={styles.dailyRefreshBanner}>
            <View style={styles.unitDivider}>
              <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.unitDividerText, { color: theme.textMuted }]}>
                {t("learn.daily_refresh")}
              </Text>
              <View style={[styles.unitDividerLine, { backgroundColor: theme.border }]} />
            </View>
            <View style={[styles.lockBadge, { backgroundColor: theme.isDark ? "#4B5563" : colors.neutral[400] }]}>
              <LockIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.dailyRefreshLocked, { color: theme.textMuted }]}>
              {t("learn.daily_refresh_locked")}
            </Text>
          </View>
        </ScrollView>
      )}

      {!isSuper && <BannerAdComponent />}

      <UnitGuideModal
        visible={showUnitGuide}
        unit={visibleUnit ?? null}
        sectionNum={bannerSectionNum}
        l1={l1}
        onClose={() => setShowUnitGuide(false)}
        theme={theme}
        t={t}
      />

      <Modal
        visible={!!selectedLesson}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLesson(null)}
      >
        <Pressable style={styles.tooltipBackdrop} onPress={() => setSelectedLesson(null)}>
          <View
            style={[styles.tooltipCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.tooltipStrip, { backgroundColor: selectedLesson?.locked ? (theme.isDark ? "#4B5563" : colors.neutral[400]) : selectedLesson?.unitColor }]} />
            <View style={styles.tooltipBody}>
              <Text style={[styles.tooltipTitle, { color: theme.text }]} numberOfLines={1}>
                {selectedLesson?.unitTitle}
              </Text>
              {selectedLesson?.locked ? (
                <>
                  <Text style={[styles.tooltipSub, { color: theme.textMuted }]}>
                    {t("learn.locked_message")}
                  </Text>
                  <View style={[styles.tooltipBtn, { backgroundColor: theme.isDark ? "#374151" : colors.neutral[300] }]}>
                    <Text style={[styles.tooltipBtnText, { color: theme.textMuted }]}>
                      {t("learn.locked_button")}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.tooltipSub, { color: theme.textMuted }]}>
                    {selectedLesson?.nodeType === "chest"
                      ? t("learn.chest")
                      : `${t("learn.lesson")} ${selectedLesson?.lessonNum ?? 1} / ${selectedLesson?.totalLessons ?? 1}`}
                  </Text>
                  {selectedLesson && selectedLesson.nodeType === "lesson" && selectedLesson.sessionsRequired > 0 && (
                    <View style={styles.tooltipArcsRow}>
                      {Array.from({ length: selectedLesson.sessionsRequired }, (_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.tooltipArcDot,
                            {
                              backgroundColor: i < selectedLesson.completedSessions
                                ? selectedLesson.unitColor
                                : `${selectedLesson.unitColor}30`,
                            },
                          ]}
                        />
                      ))}
                      <Text style={[styles.tooltipArcLabel, { color: theme.textMuted }]}>
                        {Math.min(selectedLesson.completedSessions, selectedLesson.sessionsRequired)}/{selectedLesson.sessionsRequired}
                      </Text>
                    </View>
                  )}
                  <Pressable
                    style={[styles.tooltipBtn, { backgroundColor: selectedLesson?.nodeType === "chest" ? colors.ouro : (selectedLesson?.unitColor ?? colors.primary[500]) }]}
                    onPress={() => {
                      const sl = selectedLesson!;
                      setSelectedLesson(null);
                      if (sl.nodeType === "chest") {
                        router.push(`/lesson/chest?lessonId=${sl.id}`);
                      } else {
                        router.push(`/lesson/${sl.id}`);
                      }
                    }}
                  >
                    <Text style={styles.tooltipBtnText}>
                      {selectedLesson?.nodeType === "chest"
                        ? t("chest.open").toUpperCase()
                        : selectedLesson?.completed
                          ? t("learn.recap").toUpperCase()
                          : t("result.continue").toUpperCase()}
                    </Text>
                    {selectedLesson?.nodeType === "lesson" && (
                      <Text style={styles.tooltipBtnXp}>
                        +{getEstimatedXp(selectedLesson.sectionSortOrder, selectedLesson.isLastInUnit, selectedLesson.completed)} XP
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>

      <StreakModal
        visible={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        theme={theme}
        t={t}
        currentDays={currentDays}
        longestDays={longestDays}
        freezeAvailable={freezeAvailable}
        isActive={isActive}
        balance={balance}
        onPurchaseFreeze={purchaseFreeze}
        onStartLesson={() => {
          setShowStreakModal(false);
        }}
      />

      <HeartsModal
        visible={showHeartsModal}
        onClose={() => setShowHeartsModal(false)}
        theme={theme}
        t={t}
        hearts={hearts}
        unlimited={unlimited}
        nextRefillIn={nextRefillIn}
        balance={balance}
        onRefill={refillWithOuro}
        isRefilling={isRefilling}
        onPractice={() => {
          setShowHeartsModal(false);
          router.push("/tabs/practice");
        }}
        canWatchAd={canWatchAd}
        isWatchingAd={isWatchingAd}
        onWatchAd={async () => {
          await claimAdReward("heart");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // -- Top stats bar --
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["3xl"],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  topBarStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  topBarValue: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  // -- Current section/unit banner --
  currentSectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  currentSectionContent: {
    flex: 1,
  },
  currentSectionLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  currentSectionTitle: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  currentSectionAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },

  // -- Section header bar --
  sectionHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: "600",
  },
  sectionHeaderTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    flex: 1,
  },

  // -- Path view --
  pathContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  nodeRow: {
    height: NODE_SIZE + NODE_3D_DEPTH + NODE_GAP,
    position: "relative",
    overflow: "visible" as const,
  },
  nodeWrapper: {
    position: "absolute",
    top: 0,
    alignItems: "center",
    width: NODE_SIZE,
    overflow: "visible" as const,
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_RADIUS,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  nodeHighlight: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    height: "45%",
    borderTopLeftRadius: NODE_RADIUS,
    borderTopRightRadius: NODE_RADIUS,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  nodeInnerShadow: {
    width: NODE_SIZE - 12,
    height: NODE_SIZE - 12,
    borderRadius: NODE_RADIUS - 6,
    alignItems: "center",
    justifyContent: "center",
  },

  // -- Unit dividers --
  unitDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  unitDividerLine: {
    flex: 1,
    height: 1,
  },
  unitDividerText: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    maxWidth: "60%" as any,
    textAlign: "center",
  },
  jumpHereBtn: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  jumpHereText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  unitSpacer: {
    height: spacing.lg,
  },

  // -- Daily Refresh --
  dailyRefreshBanner: {
    marginTop: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  lockBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  dailyRefreshLocked: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 18,
  },

  // -- Section list --
  sectionListContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
    gap: spacing.lg,
  },
  sectionLargeCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionColorBlock: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionColorContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCardBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionLargeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  sectionLargeTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    lineHeight: 26,
  },
  sectionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  sectionUnitBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  sectionUnitBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  sectionCefrBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  sectionCefrText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  sectionProgressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  sectionProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  sectionSkipLink: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
    paddingTop: spacing.xs,
  },
  sectionLockedText: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },

  // -- Shared --
  list: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["5xl"],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
  questBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  questBannerContent: {
    flex: 1,
    gap: 4,
  },
  questBannerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  questBannerTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  questBannerFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  questBannerCount: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  guideContainer: {
    flex: 1,
  },
  guideHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  guideClose: {
    fontSize: 18,
    fontWeight: "700",
  },
  guideHero: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["2xl"],
    alignItems: "center",
  },
  guideHeroLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  guideHeroTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  guideBody: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  guideDesc: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  guideProgress: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.sm,
    width: "100%",
    maxWidth: 200,
  },
  guideProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  guideProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  guideProgressLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
  guideSection: {
    marginBottom: spacing.xl,
  },
  guideSectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  guidePhrase: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  guidePhraseTextPt: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    lineHeight: 22,
  },
  guidePhraseTextL1: {
    fontSize: typography.sizes.sm,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 4,
  },
  guideEmpty: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
    gap: spacing.md,
  },
  guideEmptyText: {
    fontSize: typography.sizes.md,
    textAlign: "center",
  },

  // -- Lesson tooltip --
  tooltipBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  tooltipCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing["5xl"],
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  tooltipStrip: {
    height: 5,
  },
  tooltipBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tooltipTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  tooltipSub: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  tooltipArcsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  tooltipArcDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tooltipArcLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    marginLeft: 2,
  },
  tooltipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  tooltipBtnText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  tooltipBtnXp: {
    color: "rgba(255,255,255,0.85)",
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },

  // -- Shared modal styles --
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalClose: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalHeaderTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  modalBody: {
    padding: spacing.lg,
    paddingBottom: 60,
    gap: spacing.md,
  },
  modalCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalCardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  modalCardDesc: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  modalCardText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    textAlign: "center",
  },
  modalPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  modalPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  modalSecondaryBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },

  // -- Streak modal --
  streakTabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  streakTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  streakTabText: {
    fontSize: typography.sizes.sm,
    fontWeight: "800",
    letterSpacing: 1,
  },
  streakHero: {
    paddingVertical: spacing["3xl"],
    alignItems: "center",
    gap: spacing.sm,
  },
  streakSocietyBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: "800",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  streakBigNum: {
    fontSize: 72,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -3,
    marginTop: -4,
  },
  streakSubtext: {
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
  streakFrozenCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: -spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    gap: spacing.md,
  },
  streakCalendarTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  calendarNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  calendarArrow: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
  },
  calendarMonthLabel: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  calendarDayHeaders: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: `${100 / 7}%` as any,
    alignItems: "center",
    paddingVertical: 4,
  },
  calendarDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayText: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  friendStreakRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendAvatarPlaceholder: {
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarInitial: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  friendName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  friendStreakCount: {
    fontSize: typography.sizes.md,
    fontWeight: "700",
  },
  streakStatsGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakStatBlock: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  streakStatBlockNum: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  streakStatBlockLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  streakStatBlockDivider: {
    width: 1,
    height: 40,
  },
  streakStartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  freezeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  freezeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  freezeActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  freezeActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  freezeBuyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },

  // -- Hearts modal --
  heartsHero: {
    paddingVertical: spacing["3xl"],
    alignItems: "center",
    gap: spacing.md,
  },
  heartsRowBig: {
    flexDirection: "row",
    gap: 6,
  },
  heartIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  heartsCountBig: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  heartsSubtext: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  heartsStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  heartsStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heartsStatusText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    flex: 1,
  },
  heartsOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heartsOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heartsRefillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  heartsPracticeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  timerRow: {
    gap: spacing.sm,
  },
  timerBar: {
    marginTop: spacing.xs,
  },
  timerBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  timerBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  timerText: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "800",
  },
});
