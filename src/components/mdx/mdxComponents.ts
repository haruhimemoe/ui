/**
 * @file src/components/mdx/mdxComponents.ts
 * @desc The element override map for @next/mdx's `useMDXComponents` and react-markdown's
 *       `components` prop: links, headings (h2/h3/h4), fenced code, tables, callout blockquotes,
 *       lazy images, native details, keyboard keys, task checkboxes and embed divs.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import { MdxBlockquote } from "./MdxBlockquote.js";
import { MdxDetails } from "./MdxDetails.js";
import { MdxDiv } from "./MdxDiv.js";
import { MdxH2, MdxH3, MdxH4 } from "./MdxHeading.js";
import { MdxImg } from "./MdxImg.js";
import { MdxKbd } from "./MdxKbd.js";
import { MdxLink } from "./MdxLink.js";
import { MdxPre } from "./MdxPre.js";
import { MdxTable } from "./MdxTable.js";
import { MdxTaskCheckbox } from "./MdxTaskCheckbox.js";

/** The element overrides for @next/mdx's useMDXComponents and react-markdown's `components`. */
export const mdxComponents = {
  a: MdxLink,
  blockquote: MdxBlockquote,
  details: MdxDetails,
  div: MdxDiv,
  h2: MdxH2,
  h3: MdxH3,
  h4: MdxH4,
  img: MdxImg,
  input: MdxTaskCheckbox,
  kbd: MdxKbd,
  pre: MdxPre,
  table: MdxTable,
};
