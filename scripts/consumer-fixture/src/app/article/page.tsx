/**
 * @file scripts/consumer-fixture/src/app/article/page.tsx
 * @desc The fixture's article route: post.mdx on ContentPage, with the toc and reading time
 *       mdxExports produced at build time through next.config.mjs's { mdxExports: true } option.
 *       Wrapped in PageShell for the one main landmark (the fixture's root layout has none; every
 *       other route supplies its own, the way an app's own page or docs layout would).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { ContentPage, PageShell, PrevNext, Toc } from "@haruhimemoe/ui";
import type { MdxArticleModule } from "@haruhimemoe/ui/mdx";
import * as post from "../../content/post.mdx";

const page = post as unknown as MdxArticleModule;

/**
 * @function ArticlePage
 * @returns {JSX.Element} the MDX post on ContentPage, with the toc and reading time its
 *          mdxExports produced at build time
 */
export default function ArticlePage() {
  const Body = page.default;
  return (
    <PageShell>
      <ContentPage
        title="Running qualifiers"
        description="A fixture post."
        published="2026-10-01"
        lastUpdated="2026-10-04"
        readingMinutes={page.readingMinutes}
        authors={[{ name: "David", userId: 2 }]}
        toc={<Toc items={page.toc} maxDepth={4} />}
        footer={<PrevNext label="More posts" prev={{ href: "/", title: "Home" }} />}
      >
        <Body />
      </ContentPage>
    </PageShell>
  );
}
