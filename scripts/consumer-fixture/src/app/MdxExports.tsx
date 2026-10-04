/**
 * @file scripts/consumer-fixture/src/app/MdxExports.tsx
 * @desc Renders every runtime export of @haruhimemoe/ui/mdx on the main page, so the consumer
 *       check's "every export is rendered" scan (which reads .tsx files, not .mdx) sees them.
 *       Registers Shiki for the main page's CodeBlock (stripped for the no-Shiki build).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import "@haruhimemoe/ui/shiki";
import { Card } from "@haruhimemoe/ui";
import { Callout, CodeBlock, mdxComponents, parseCodeMeta, slugify } from "@haruhimemoe/ui/mdx";

/**
 * @function MdxExports
 * @returns {JSX.Element} a card with a Callout, a CodeBlock, an MDX heading and the helpers' output
 */
export function MdxExports() {
  return (
    <Card title="MDX">
      <mdxComponents.h3>Exports</mdxComponents.h3>
      <Callout type="note">Fixture</Callout>
      <CodeBlock code="bun add shiki" lang="bash" />
      <p>
        Meta title {parseCodeMeta('title="x"').title}, slug {slugify("A B")}.
      </p>
    </Card>
  );
}
