/**
 * @file scripts/consumer-fixture/src/app/Labels26.tsx
 * @desc Renders 0.26.0's English label defaults, so the consumer check sees every new export
 *       used from a server component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

import {
  BRAND_PAGE_LABELS,
  CONTENT_PAGE_LABELS,
  PALETTE_LABELS,
  SITE_COMMAND_LABELS,
} from "@haruhimemoe/ui";
import { CODE_BLOCK_LABELS } from "@haruhimemoe/ui/mdx";

export function Labels26() {
  return (
    <p>
      {[
        BRAND_PAGE_LABELS.colors,
        CONTENT_PAGE_LABELS.readingTime(2),
        PALETTE_LABELS.results(2),
        SITE_COMMAND_LABELS.goTo("Home"),
        CODE_BLOCK_LABELS.copyName(null),
      ].join(", ")}
    </p>
  );
}
