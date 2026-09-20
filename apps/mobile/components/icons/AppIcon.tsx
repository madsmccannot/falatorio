import type React from "react";
import { GoldPrisms } from "./GoldPrisms";
import { HeartIcon } from "./HeartIcon";
import { StreakIcon } from "./StreakIcon";
import { StarIcon } from "./StarIcon";
import { LockIcon } from "./LockIcon";
import { TrophyIcon } from "./TrophyIcon";
import { FlameIcon } from "./FlameIcon";
import { ShieldIcon } from "./ShieldIcon";
import { CrownIcon } from "./CrownIcon";
import { BoltIcon } from "./BoltIcon";
import { RocketIcon } from "./RocketIcon";
import { TimerIcon } from "./TimerIcon";
import { BookIcon } from "./BookIcon";
import { BooksIcon } from "./BooksIcon";
import { FootstepsIcon } from "./FootstepsIcon";
import { StrengthIcon } from "./StrengthIcon";
import { VolcanoIcon } from "./VolcanoIcon";
import { BankIcon } from "./BankIcon";
import { CoffeeIcon } from "./CoffeeIcon";
import { TaxiIcon } from "./TaxiIcon";
import { PencilIcon } from "./PencilIcon";
import { ChatIcon } from "./ChatIcon";
import { MedalIcon } from "./MedalIcon";

type IconProps = { size?: number; color?: string };

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  prisms: GoldPrisms,
  heart: HeartIcon,
  streak: StreakIcon,
  star: StarIcon,
  lock: LockIcon,
  trophy: TrophyIcon,
  flame: FlameIcon,
  shield: ShieldIcon,
  crown: CrownIcon,
  bolt: BoltIcon,
  rocket: RocketIcon,
  timer: TimerIcon,
  book: BookIcon,
  books: BooksIcon,
  footsteps: FootstepsIcon,
  strength: StrengthIcon,
  volcano: VolcanoIcon,
  bank: BankIcon,
  coffee: CoffeeIcon,
  taxi: TaxiIcon,
  pencil: PencilIcon,
  chat: ChatIcon,
  medal: MedalIcon,
};

type Props = {
  name: string;
  size?: number;
  color?: string;
};

export function AppIcon({ name, size = 24, color }: Props) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} />;
}
