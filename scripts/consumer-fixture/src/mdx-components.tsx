/**
 * @file scripts/consumer-fixture/src/mdx-components.tsx
 * @desc The fixture app's MDX element overrides for @next/mdx: the library's mdxComponents,
 *       with Shiki registered so code blocks highlight. The consumer check strips the
 *       @haruhimemoe/ui/shiki import for its no-Shiki build.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import "@haruhimemoe/ui/shiki";
import { mdxComponents } from "@haruhimemoe/ui/mdx";
import type { MDXComponents } from "mdx/types";

/**
 * @function useMDXComponents
 * @returns {MDXComponents} the library's element overrides, for every MDX page
 */
export function useMDXComponents(): MDXComponents {
  return { ...mdxComponents };
}
