/**
 * @file scripts/consumer-fixture/src/app/MapsClientFixture.tsx
 * @desc The 0.16.0 map display's client-only pieces, rendered from the app's own "use client"
 *       file: a button that calls stopMapPreview() (the call an app makes on a route change).
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { Button, stopMapPreview } from "@haruhimemoe/ui";

/**
 * @function MapsClientFixture
 * @returns {JSX.Element} a button that stops any playing preview clip
 */
export function MapsClientFixture() {
  return (
    <Button variant="secondary" onClick={() => stopMapPreview()}>
      Stop any map preview
    </Button>
  );
}
