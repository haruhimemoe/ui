/**
 * @file src/components/mdx/Steps.tsx
 * @desc A numbered-rail wrapper for an ordered list of instructions: a left border with a
 *       counter badge per `<li>`, replacing the browser's own list markers. Wraps a plain `<ol>`
 *       so MDX content keeps writing ordinary Markdown lists; Steps only adds the look. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** Native div props: wraps a child `<ol>` of `<li>` steps. */
export type StepsProps = ComponentProps<"div">;

// ! beats Prose's [&_ol]:list-decimal and [&_ol]:pl-6, which tie on specificity.
const STEPS = [
  "[&>ol]:mt-4 [&>ol]:ml-3 [&>ol]:list-none! [&>ol]:border-b3 [&>ol]:border-l-2 [&>ol]:pl-6! [&>ol]:[counter-reset:step]",
  "[&>ol>li]:relative [&>ol>li]:mt-4 [&>ol>li]:[counter-increment:step]",
  "[&>ol>li]:before:absolute [&>ol>li]:before:-left-[37px] [&>ol>li]:before:flex [&>ol>li]:before:size-6 [&>ol>li]:before:items-center [&>ol>li]:before:justify-center [&>ol>li]:before:rounded-full [&>ol>li]:before:bg-b4 [&>ol>li]:before:font-bold [&>ol>li]:before:text-c1 [&>ol>li]:before:text-xs [&>ol>li]:before:content-[counter(step)]",
  "[&>ol>li>strong:first-child]:text-c1 [&>ol>li>p:first-child>strong:first-child]:text-c1",
].join(" ");

/**
 * @function Steps
 * @param props {StepsProps} native div props; children is the `<ol>` of steps
 * @returns {JSX.Element} a div that numbers its child `<ol>`'s items with a left rail
 */
export function Steps({ className, ...props }: StepsProps) {
  return <div className={cx(STEPS, className)} {...props} />;
}
