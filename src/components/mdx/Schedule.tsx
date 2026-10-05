/**
 * @file src/components/mdx/Schedule.tsx
 * @desc An MDX-authored schedule: an ordered list of rows, each a `when` (a `<time>` with
 *       `dateTime` for a real date, or plain text for a relative one like "Week 1"), a bold label
 *       and an optional note. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** One row: when it happens, what it's called, and an optional note. */
export type ScheduleItem = {
  /** The row's displayed time, e.g. "Week 1" or "Oct 4, 2026". */
  when: ReactNode;
  /** A machine-readable date/time for `when`, rendered as a `<time datetime>`. */
  dateTime?: string | undefined;
  /** The row's label. */
  label: ReactNode;
  /** A short note under the label. */
  note?: ReactNode | undefined;
};

/** Native ol props (children replaced by the rendered items), plus the schedule's items. */
export type ScheduleProps = Omit<ComponentProps<"ol">, "children"> & {
  /** The schedule's rows, in order. */
  items: readonly ScheduleItem[];
};

const LIST = "mt-4 flex list-none! flex-col gap-4 border-b3 border-l-2 pl-4!";
const ROW = "mt-0! flex flex-col gap-1 sm:grid sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-4";
const WHEN = "text-c3 tabular-nums";

/**
 * @function Schedule
 * @param props {ScheduleProps} the items, plus native ol props
 * @returns {JSX.Element} an ordered list of rows, each a when, a bold label and an optional note
 */
export function Schedule({ items, className, ...props }: ScheduleProps) {
  return (
    <ol className={cx(LIST, className)} {...props}>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: authored content, never reordered
        <li key={index} className={ROW}>
          {item.dateTime ? (
            <time dateTime={item.dateTime} className={WHEN}>
              {item.when}
            </time>
          ) : (
            <span className={WHEN}>{item.when}</span>
          )}
          <div>
            <p className="mt-0! font-bold text-c1">{item.label}</p>
            {item.note ? <p className="mt-0! text-c3 text-sm">{item.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
