/**
 * @file src/components/mdx/articleModule.ts
 * @desc The shape of a compiled MDX article module with mdxExports on, for `await import(...)`.
 *       Structural, so consumers need no @types/mdx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ReactNode } from "react";
import type { TocItem } from "../../remark/articleData.js";

/** A compiled MDX module with remarkHaruhime's `mdxExports: true`. */
export type MdxArticleModule = {
  default: (props: { components?: Record<string, unknown> | undefined }) => ReactNode;
  toc: TocItem[];
  readingMinutes: number;
  words: number;
};
