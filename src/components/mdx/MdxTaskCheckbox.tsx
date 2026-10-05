/**
 * @file src/components/mdx/MdxTaskCheckbox.tsx
 * @desc react-markdown/MDX's `input` override: GFM task-list checkboxes become named, disabled
 *       checkboxes ("Done" / "Not done"), since the list item's own text is next to, not inside,
 *       the input. Any other input (an app's own JSX) passes through unchanged. Drops the `node`
 *       prop react-markdown passes to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";

/** Native input props, plus react-markdown's node (dropped). */
export type MdxTaskCheckboxProps = ComponentProps<"input"> & { node?: unknown };

/**
 * @function MdxTaskCheckbox
 * @param props {MdxTaskCheckboxProps} the input GFM renders for a task list item
 * @returns {JSX.Element} a disabled checkbox named "Done" or "Not done" for task lists; any
 *          other input as given
 */
export function MdxTaskCheckbox({ node: _node, ...props }: MdxTaskCheckboxProps) {
  if (props.type !== "checkbox") return <input {...props} />;
  const { checked, ...rest } = props;
  return (
    <input
      {...rest}
      type="checkbox"
      checked={Boolean(checked)}
      disabled
      aria-label={checked ? "Done" : "Not done"}
    />
  );
}
