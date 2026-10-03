/**
 * @file src/components/palette/PaletteInput.tsx
 * @desc The palette's top line (internal): breadcrumb chips for nested pages or the argument
 *       being collected, the combobox input, and the validation message under it. The input is
 *       the dialog's one focusable thing, so its row shows focus: the bottom border turns h1 on
 *       focus-visible, the cue 0.7.0's fields use. The error line is a status region that is
 *       always mounted, so a message that appears is announced.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { type Ref, useId } from "react";

/** The input's state and ids. */
export type PaletteInputProps = {
  ref: Ref<HTMLInputElement>;
  value: string;
  placeholder: string;
  label: string;
  crumbs: readonly string[];
  listId: string;
  activeId: string | undefined;
  error: string | undefined;
  onChange: (value: string) => void;
};

/**
 * @function PaletteInput
 * @param props {PaletteInputProps} value, placeholder, name, crumbs, list and active ids, error
 * @returns {JSX.Element} the crumbs, the combobox and its error line
 */
export function PaletteInput({
  ref,
  value,
  placeholder,
  label,
  crumbs,
  listId,
  activeId,
  error,
  onChange,
}: PaletteInputProps) {
  const errorId = `${useId()}-error`;
  return (
    <div className="border-b4 border-b has-[input:focus-visible]:border-h1">
      <div className="flex items-center gap-2 px-4 py-3">
        {crumbs.map((crumb, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: crumbs repeat and are positional
          <span key={index} className="shrink-0 rounded bg-b4 px-2 py-0.5 text-c3 text-xs">
            {crumb}
          </span>
        ))}
        <input
          ref={ref}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base text-c1 outline-hidden placeholder:text-c4 sm:text-lg"
        />
      </div>
      {/* Always mounted so a message that appears is announced; sr-only takes no room while empty. */}
      <p
        id={errorId}
        role="status"
        className={error ? "px-4 pb-2 text-rose-300 text-xs" : "sr-only"}
      >
        {error}
      </p>
    </div>
  );
}
