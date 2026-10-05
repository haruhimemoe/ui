/**
 * @file playground/components/DialogDemos.tsx
 * @desc /dialogs: five ConfirmDialogs for trying by hand and for play:axe: plain, destructive,
 *       type-to-confirm, one whose action fails and one that stays pending for 5 s.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { ConfirmDialog } from "@haruhimemoe/ui";

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export function DialogDemos() {
  return (
    <div className="flex flex-wrap gap-3">
      <ConfirmDialog
        trigger="Archive pack"
        title="Archive this pack?"
        description="It leaves your list. You can bring it back from Archived."
        confirmLabel="Archive"
        onConfirm={() => wait(300)}
      />
      <ConfirmDialog
        trigger="Delete pack"
        title="Delete this pack?"
        description="Its short link stops working for everyone. This can't be undone."
        tone="destructive"
        confirmLabel="Delete for good"
        onConfirm={() => wait(300)}
      />
      <ConfirmDialog
        trigger="Delete pool"
        title="Delete OWC 2026?"
        description="This deletes the pool for you and everyone who edits it."
        tone="destructive"
        typeToConfirm="OWC 2026"
        confirmLabel="Delete pool for good"
        onConfirm={() => wait(300)}
      />
      <ConfirmDialog
        trigger="Hand over pool"
        title="Hand OWC 2026 to peppy?"
        description="They get every owner setting. Only they can give it back."
        confirmLabel="Hand it over"
        failedMessage={(error) => (error as Error).message}
        onConfirm={async () => {
          await wait(300);
          throw new Error("peppy already owns 50 pools.");
        }}
      />
      <ConfirmDialog
        trigger="Revoke key"
        title="Revoke this key?"
        description="Anything using it stops working right away."
        tone="destructive"
        confirmLabel="Revoke now"
        pendingLabel="Revoking…"
        onConfirm={() => wait(5000)}
      />
    </div>
  );
}
