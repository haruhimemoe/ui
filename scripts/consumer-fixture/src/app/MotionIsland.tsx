/**
 * @file scripts/consumer-fixture/src/app/MotionIsland.tsx
 * @desc A client island reading useMotionAllowed, so the consumer check sees it hydrate and follow
 *       the browser's reduced-motion setting.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { useMotionAllowed } from "@haruhimemoe/ui";

export function MotionIsland() {
  const motion = useMotionAllowed();
  return <p data-check="motion">{motion ? "Motion allowed." : "Motion reduced or unknown."}</p>;
}
