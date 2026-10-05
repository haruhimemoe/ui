/**
 * @file playground/app/dialogs/page.tsx
 * @desc The dialogs page: ConfirmDialog in its states, for trying by hand and for play:axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { PageHeader, PageShell } from "@haruhimemoe/ui";
import { DialogDemos } from "@/components/DialogDemos";

export default function DialogsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Dialogs"
        lead="ConfirmDialog: plain, destructive, type-to-confirm, failing, and pending for 5 s."
      />
      <DialogDemos />
    </PageShell>
  );
}
