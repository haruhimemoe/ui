/**
 * @file src/components/filters/FilterPanel.tsx
 * @desc Filter panel (osu! beatmap listing style): a titled card of FilterRows with a live result
 *       count and a "Clear filters" link. On phones the rows fold away behind a disclosure button;
 *       from `sm` up they are always shown.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import { type ComponentProps, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<section>` prop except `title`, plus the panel's title, count and clear action. */
export type FilterPanelProps = Omit<ComponentProps<"section">, "title"> & {
  /** The panel heading; it also names the panel and its phone disclosure button. */
  title: ReactNode;
  /** Heading level for the title (default 2). */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** Shown in an `<output aria-live="polite">`, so screen readers hear each new count. */
  resultCount?: ReactNode;
  /** True while any filter is set; shows the clear button. */
  active?: boolean | undefined;
  /** Called by the clear button. The button shows only when `active` is true and this is set. */
  onClear?: (() => void) | undefined;
  /** Text of the clear button (default "Clear filters"). */
  clearLabel?: ReactNode;
  /** Whether the rows start open on phones (default false). Ignored from `sm` up. */
  defaultOpen?: boolean | undefined;
};

/**
 * @function FilterPanel
 * @param props {FilterPanelProps} title, FilterRows as children, an optional result count and
 *        clear action, plus native section props. `onClear` is a function, so render this from
 *        client code.
 * @returns {JSX.Element} a `<section>` named by its heading. When the clear button is used and
 *          disappears, focus moves to the heading instead of getting lost.
 */
export function FilterPanel({
  title,
  headingLevel = 2,
  resultCount,
  active = false,
  onClear,
  clearLabel = "Clear filters",
  defaultOpen = false,
  className,
  children,
  ...props
}: FilterPanelProps) {
  const titleId = useId();
  const bodyId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cleared = useRef(false);
  const showClear = active && onClear !== undefined;

  // The clear button unmounts once the filters are cleared. If it took focus with it (focus fell
  // back to the body), put focus on the heading so keyboard users keep their place.
  useEffect(() => {
    if (showClear) return;
    const focused = document.activeElement;
    if (cleared.current && (focused === null || focused === document.body)) {
      headingRef.current?.focus();
    }
    cleared.current = false;
  }, [showClear]);

  const Heading = `h${headingLevel}` as const;

  return (
    <section
      aria-labelledby={titleId}
      className={cx("flex flex-col gap-4 rounded-[10px] bg-b4 p-5 text-c2", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1">
          <Heading
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="font-bold text-c1 text-lg"
          >
            {title}
          </Heading>
          <button
            type="button"
            aria-labelledby={titleId}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen(!open)}
            className="inline-flex size-8 items-center justify-center rounded-full text-c2 transition-colors hover:bg-b3 hover:text-c1 sm:hidden"
          >
            <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </button>
        </div>
        <output aria-live="polite" className="text-c3 text-sm">
          {resultCount}
        </output>
        {showClear ? (
          <button
            type="button"
            onClick={() => {
              cleared.current = true;
              onClear();
            }}
            className="ml-auto font-bold text-h1 text-sm transition-colors hover:text-c1"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
      <div id={bodyId} className={cx("flex-col gap-3", open ? "flex" : "hidden sm:flex")}>
        {children}
      </div>
    </section>
  );
}
