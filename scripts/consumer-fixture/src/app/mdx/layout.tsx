/**
 * @file scripts/consumer-fixture/src/app/mdx/layout.tsx
 * @desc Wraps the /mdx page in a shell, a page heading and Prose, so axe sees the MDX output in
 *       a landmark under a level-one heading, as an app's docs page would.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { PageHeader, PageShell, Prose } from "@haruhimemoe/ui";
import type { ReactNode } from "react";

/**
 * @function MdxLayout
 * @param props {{ children: ReactNode }} the compiled MDX page
 * @returns {JSX.Element} the page in a shell with a heading and Prose
 */
export default function MdxLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      <PageHeader title="MDX check" lead="An MDX page through @next/mdx and the remark plugin." />
      <Prose>{children}</Prose>
    </PageShell>
  );
}
