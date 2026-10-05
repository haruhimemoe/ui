/**
 * @file playground/components/SurfacesClient.tsx
 * @desc The /surfaces page's client half: a CopyField and both SegmentedControl sizes, for
 *       play:axe's after-copy state.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { CopyField, SegmentedControl } from "@haruhimemoe/ui";
import { useState } from "react";

export function SurfacesClient() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [scale, setScale] = useState<"fit" | "actual">("fit");
  return (
    <div className="flex flex-col gap-4">
      <CopyField label="Pack key" value="AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8" />
      <SegmentedControl
        label="View"
        options={[
          { value: "list", label: "List" },
          { value: "grid", label: "Grid" },
        ]}
        value={view}
        onChange={setView}
      />
      <SegmentedControl
        label="Preview size"
        hideLabel
        size="sm"
        options={[
          { value: "fit", label: "Fit (64%)" },
          { value: "actual", label: "Actual size" },
        ]}
        value={scale}
        onChange={setScale}
      />
    </div>
  );
}
