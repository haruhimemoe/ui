/**
 * @file src/components/mdx/MdxKbd.tsx
 * @desc react-markdown/MDX's `kbd` override: Kbd's key look, with react-markdown's `node` prop
 *       dropped before it reaches the native `<kbd>`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { Kbd, type KbdProps } from "../basics/Kbd.js";

/**
 * @function MdxKbd
 * @param props {KbdProps & { node?: unknown }} native kbd props, plus react-markdown's node
 *        (dropped)
 * @returns {JSX.Element} a `<kbd>` styled as a key
 */
export function MdxKbd({ node: _node, ...props }: KbdProps & { node?: unknown }) {
  return <Kbd {...props} />;
}
