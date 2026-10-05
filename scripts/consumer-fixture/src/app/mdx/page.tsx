/**
 * @file scripts/consumer-fixture/src/app/mdx/page.tsx
 * @desc Renders the fixture's MDX content from src/content/features.mdx. The content moved out of
 *       app/ here because with mdxExports on, an MDX file used directly as a Next page would carry
 *       toc/words/readingMinutes exports that Next's page-export type check may reject; a real app
 *       imports MDX through a content loader instead, which this matches.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import Features from "../../content/features.mdx";

/**
 * @function MdxPage
 * @returns {JSX.Element} the compiled features.mdx content
 */
export default function MdxPage() {
  return <Features />;
}
