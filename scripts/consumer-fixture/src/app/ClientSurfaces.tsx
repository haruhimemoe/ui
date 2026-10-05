/**
 * @file scripts/consumer-fixture/src/app/ClientSurfaces.tsx
 * @desc The 0.13.0 client components, from a client file.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { CopyField } from "@haruhimemoe/ui";

// The 0.13.0 client components, from a client file.
export function ClientSurfaces() {
  return (
    <section aria-label="Client surfaces" className="flex flex-col gap-4">
      <CopyField label="Pack key" value="PACKKEY123" copyLabel="Copy key" />
    </section>
  );
}
