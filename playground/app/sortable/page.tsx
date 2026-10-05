/**
 * @file playground/app/sortable/page.tsx
 * @desc The sortable lists page: a single list with Up and Down, and a two-list board where NM1
 *       can't go to HD, for trying by hand and for play:axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { PageHeader, PageShell } from "@haruhimemoe/ui";
import { SortableDemo } from "@/components/SortableDemo";

export default function SortablePage() {
  return (
    <PageShell>
      <PageHeader
        title="Sortable"
        lead="A single list with Up and Down, and a two-list board where NM1 can't go to HD."
      />
      <SortableDemo />
    </PageShell>
  );
}
