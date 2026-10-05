/**
 * @file scripts/consumer-fixture/src/app/Surfaces.tsx
 * @desc The 0.13.0 Server Components, rendered straight from the Server Component page.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { Surface, surfaceClasses } from "@haruhimemoe/ui";

// The 0.13.0 server components, rendered straight from the Server Component page.
export function Surfaces() {
  return (
    <section aria-label="Surfaces" className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        <Surface as="li">Surface item</Surface>
      </ul>
      <a href="/docs" className={surfaceClasses({ className: "block hover:bg-b3" })}>
        Surface link
      </a>
    </section>
  );
}
