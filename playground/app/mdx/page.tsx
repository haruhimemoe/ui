/**
 * @file playground/app/mdx/page.tsx
 * @desc The MDX components by hand, without an MDX compiler: section headings, highlighted and
 *       plain code blocks, each callout type (direct and as a callout blockquote) and a wide table
 *       in its scroll region, inside Prose. Imports @haruhimemoe/ui/shiki so code highlights. `bun
 *       run play:axe` checks it at two widths. Links to /mdx/article, the 0.17.0 sample post.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import "@haruhimemoe/ui/shiki";
import { ButtonLink, PageHeader, PageShell, Prose } from "@haruhimemoe/ui";
import { Callout, CodeBlock, mdxComponents } from "@haruhimemoe/ui/mdx";

const POOL = `const pool = await getPool(1);
const maps = pool.maps.filter((map) => map.mods.includes("HD"));
console.log(maps.length);
`;

/**
 * @function MdxPage
 * @returns {JSX.Element} every MDX component rendered directly, as compiled MDX would
 */
export default function MdxPage() {
  const { h2: H2, h3: H3, blockquote: Blockquote, table: Table } = mdxComponents;
  return (
    <PageShell>
      <PageHeader
        title="MDX components"
        lead="What @haruhimemoe/ui/mdx renders for compiled MDX."
        actions={
          <>
            <ButtonLink href="/mdx/article">Sample post</ButtonLink>
            <ButtonLink href="/">Home</ButtonLink>
          </>
        }
      />
      <Prose>
        <H2>Usage</H2>
        <CodeBlock code={POOL} lang="ts" title="pool.ts" highlight={[2]} />
        <CodeBlock code={"++[>+<-]\n"} lang="brainfuck" />
        <CodeBlock code="bun add shiki" lang="bash" />
        <H2>Usage</H2>
        <H3>Callouts</H3>
        <Blockquote data-callout="note">
          <p>Built pools stay private until you share them.</p>
        </Blockquote>
        <Callout type="note">A note, rendered directly.</Callout>
        <Callout type="tip">Tips render too.</Callout>
        <Callout type="warning">Deleting a pool can't be undone.</Callout>
        <Callout type="tip" title="Custom title">
          A callout with its own label.
        </Callout>
        <Blockquote>
          <p>A plain blockquote stays a blockquote.</p>
        </Blockquote>
        <H3>Tables</H3>
        <Table>
          <thead>
            <tr>
              <th>Mod</th>
              <th>Multiplier</th>
              <th>Notes on a long column that makes the table wide enough to scroll on a phone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>HD</td>
              <td>1.06</td>
              <td>Hidden_mod_long_unbroken_token_that_forces_horizontal_scroll_on_a_phone_width</td>
            </tr>
          </tbody>
        </Table>
      </Prose>
    </PageShell>
  );
}
