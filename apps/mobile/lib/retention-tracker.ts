import { getString, setString } from "./storage";
import { trackFunnelReturn } from "./analytics";
import { captureEvent } from "./posthog";

const KEY_FIRST_OPEN = "falatorio_first_open";
const KEY_LAST_D1_CHECK = "falatorio_d1_fired";
const KEY_LAST_D7_CHECK = "falatorio_d7_fired";

export function checkRetentionMilestones(): void {
  try {
    const now = Date.now();
    const firstOpenStr = getString(KEY_FIRST_OPEN as any);

    if (!firstOpenStr) {
      setString(KEY_FIRST_OPEN as any, String(now));
      return;
    }

    const firstOpen = Number(firstOpenStr);
    const daysSinceFirst = (now - firstOpen) / (1000 * 60 * 60 * 24);

    if (daysSinceFirst >= 1 && !getString(KEY_LAST_D1_CHECK as any)) {
      trackFunnelReturn("d1");
      captureEvent("retention_d1", { days_since_install: Math.floor(daysSinceFirst) });
      setString(KEY_LAST_D1_CHECK as any, String(now));
    }

    if (daysSinceFirst >= 7 && !getString(KEY_LAST_D7_CHECK as any)) {
      trackFunnelReturn("d7");
      captureEvent("retention_d7", { days_since_install: Math.floor(daysSinceFirst) });
      setString(KEY_LAST_D7_CHECK as any, String(now));
    }
  } catch {
    // storage not available
  }
}
