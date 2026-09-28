"use client";

import {
  CharCounter,
  ReportDisclosure,
  type TabItem,
  Tabs,
  tabId,
  tabPanelId,
  VISIBILITIES,
  VISIBILITY_TEXT,
  type Visibility,
  VisibilitySelect,
} from "@haruhimemoe/ui";
import { useState } from "react";

const TABS: readonly TabItem<"write" | "preview">[] = [
  { id: "write", label: "Write" },
  { id: "preview", label: "Preview" },
];

// The 0.5.0 components, from a client file.
export function ClientAdditions05() {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [visibility, setVisibility] = useState<Visibility>("private");
  return (
    <section aria-label="0.5.0 additions">
      <Tabs label="Editor view" idPrefix="ed" tabs={TABS} value={tab} onChange={setTab} />
      <div role="tabpanel" id={tabPanelId("ed", tab)} aria-labelledby={tabId("ed", tab)}>
        <CharCounter count={1234} limit={60000} />
      </div>
      <VisibilitySelect value={visibility} onChange={setVisibility} />
      <p>{VISIBILITIES.map((value) => VISIBILITY_TEXT[value].label).join(", ")}</p>
      <VisibilitySelect as="select" id="vis" value={visibility} onChange={setVisibility} />
      <ReportDisclosure maxLength={500} onSubmit={async () => ({ ok: true })} />
    </section>
  );
}
