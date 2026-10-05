/**
 * @file scripts/consumer-fixture/src/app/ClientDialogs.tsx
 * @desc The 0.14.0 dialogs, closed, from a client file: a ConfirmDialog trigger and a bare Dialog.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { ConfirmDialog, Dialog } from "@haruhimemoe/ui";

export function ClientDialogs() {
  return (
    <section aria-label="0.14.0 dialogs">
      <ConfirmDialog
        trigger="Delete pool"
        title="Delete OWC 2026?"
        description="This can't be undone."
        tone="destructive"
        typeToConfirm="OWC 2026"
        onConfirm={() => {}}
      />
      <Dialog open={false} onDismiss={() => {}} aria-label="Consumer dialog">
        <p>Never shown.</p>
      </Dialog>
    </section>
  );
}
