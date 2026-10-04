/**
 * @file src/components/mdx/mdxComponents.ts
 * @desc The element override map for @next/mdx's `useMDXComponents` and react-markdown's
 *       `components` prop: links, headings (h2/h3), fenced code, tables and callout blockquotes.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { MdxBlockquote } from "./MdxBlockquote.js";
import { MdxH2, MdxH3 } from "./MdxHeading.js";
import { MdxLink } from "./MdxLink.js";
import { MdxPre } from "./MdxPre.js";
import { MdxTable } from "./MdxTable.js";

/** The element overrides for @next/mdx's useMDXComponents and react-markdown's `components`. */
export const mdxComponents = {
  a: MdxLink,
  blockquote: MdxBlockquote,
  h2: MdxH2,
  h3: MdxH3,
  pre: MdxPre,
  table: MdxTable,
};
