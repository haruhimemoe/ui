/**
 * @file scripts/consumer-fixture/src/app/MdxExports.tsx
 * @desc Renders every runtime export of @haruhimemoe/ui/mdx on the main page, so the consumer
 *       check's "every export is rendered" scan (which reads .tsx files, not .mdx) sees them.
 *       Registers Shiki for the main page's CodeBlock (stripped for the no-Shiki build).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import "@haruhimemoe/ui/shiki";
import { Card, kbdClasses, Toc } from "@haruhimemoe/ui";
import {
  Callout,
  CodeBlock,
  Embed,
  Figure,
  Glossary,
  Kbd,
  MdxLinkCard,
  mdxComponents,
  parseCodeMeta,
  parseEmbedUrl,
  Schedule,
  Steps,
  slugify,
  Term,
} from "@haruhimemoe/ui/mdx";

const TOC_ITEMS = [
  { id: "seeding", text: "Seeding", depth: 2 as const },
  { id: "rolls", text: "Rolls", depth: 2 as const },
];

/**
 * @function MdxExports
 * @returns {JSX.Element} a card with every ./mdx and root content export rendered
 */
export function MdxExports() {
  return (
    <Card title="MDX">
      <mdxComponents.h3>Exports</mdxComponents.h3>
      <Callout type="note">Fixture</Callout>
      <CodeBlock code="bun add shiki" lang="bash" />
      <p>
        Meta title {parseCodeMeta('title="x"').title}, slug {slugify("A B")}, embed provider{" "}
        {parseEmbedUrl("https://youtu.be/dQw4w9WgXcQ")?.provider}.
      </p>
      <Steps>
        <ol>
          <li>Step one.</li>
          <li>Step two.</li>
        </ol>
      </Steps>
      <Figure
        src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='8'%20height='8'%3E%3Crect%20width='8'%20height='8'%20fill='%23ff66ab'/%3E%3C/svg%3E"
        alt="Fixture square"
        width={8}
        height={8}
        caption="A caption"
      />
      <Embed url="https://youtu.be/dQw4w9WgXcQ" />
      <MdxLinkCard href="https://osu.ppy.sh/wiki" title="osu! wiki" />
      <Schedule items={[{ when: "Week 1", label: "Fixture week" }]} />
      <Glossary entries={[{ term: "FM", definition: "Free mod." }]} />
      <p>
        See <Term term="FM">freemod</Term>. Press <Kbd>Ctrl</Kbd>.{" "}
        <span className={kbdClasses}>K</span>
      </p>
      <Toc items={TOC_ITEMS} maxDepth={4} />
    </Card>
  );
}
