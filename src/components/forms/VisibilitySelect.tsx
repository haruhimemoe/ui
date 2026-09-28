/**
 * @file src/components/forms/VisibilitySelect.tsx
 * @desc Who can see something: private, unlisted or public, each with a line saying who that is.
 *       As radios (RadioGroup, every option's line shown) or as a native select (Select, the
 *       picked option's line as the hint). Controlled. The pools pool editor and the bb template
 *       forms, as one component; the words come from props, with generic defaults.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import { type ReactNode, useId } from "react";
import { RadioGroup } from "./RadioGroup.js";
import { Select } from "./Select.js";

/** The three visibilities, from most to least closed. */
export const VISIBILITIES = ["private", "unlisted", "public"] as const;

/** One of VISIBILITIES. */
export type Visibility = (typeof VISIBILITIES)[number];

/** A visibility's name and the line that says who sees it. */
export type VisibilityText = { label: string; hint?: ReactNode };

/** The default words, generic English. */
export const VISIBILITY_TEXT: Readonly<Record<Visibility, VisibilityText>> = {
  private: { label: "Private", hint: "Only you can see it." },
  unlisted: { label: "Unlisted", hint: "Anyone with the link can see it. It isn't listed." },
  public: { label: "Public", hint: "Anyone can see it, and it's listed." },
};

/** VisibilitySelect's props. */
export type VisibilitySelectProps = {
  /** The picked visibility. */
  value: Visibility;
  /** Called with the new visibility. */
  onChange: (value: Visibility) => void;
  /** The group's legend or the select's label (default "Who can see it"). */
  label?: ReactNode;
  /** "radio" (default) shows every option's line; "select" is a dropdown. */
  as?: "radio" | "select" | undefined;
  /** Words per visibility, merged over VISIBILITY_TEXT. */
  text?: Partial<Record<Visibility, Partial<VisibilityText>>> | undefined;
  /** The select's id, or the radios' name (default: generated). */
  id?: string | undefined;
  /** Help under the radios; for a select, replaces the picked option's line. */
  hint?: ReactNode;
  /** Error text; marks the field invalid. */
  error?: ReactNode;
  /** Turns the field off. */
  disabled?: boolean | undefined;
  /** Classes for the fieldset, or the select's wrapper. */
  className?: string | undefined;
};

const isVisibility = (value: string): value is Visibility =>
  (VISIBILITIES as readonly string[]).includes(value);

/**
 * @function VisibilitySelect
 * @param props {VisibilitySelectProps} the value, the handler, the look, the words, id, hint,
 *        error and disabled
 * @returns {JSX.Element} a RadioGroup of the three, or a Select with the picked one's line
 */
export function VisibilitySelect({
  value,
  onChange,
  label = "Who can see it",
  as = "radio",
  text,
  id,
  hint,
  error,
  disabled,
  className,
}: VisibilitySelectProps) {
  const generated = useId();
  const words = (visibility: Visibility): VisibilityText => ({
    ...VISIBILITY_TEXT[visibility],
    ...text?.[visibility],
  });
  const pick = (next: string) => {
    if (isVisibility(next)) onChange(next);
  };
  if (as === "select") {
    return (
      <Select
        id={id ?? generated}
        label={label}
        hint={hint ?? words(value).hint}
        error={error}
        value={value}
        disabled={disabled}
        wrapperClassName={className}
        onChange={(event) => pick(event.currentTarget.value)}
      >
        {VISIBILITIES.map((visibility) => (
          <option key={visibility} value={visibility}>
            {words(visibility).label}
          </option>
        ))}
      </Select>
    );
  }
  return (
    <RadioGroup
      label={label}
      name={id}
      options={VISIBILITIES.map((visibility) => ({ value: visibility, ...words(visibility) }))}
      value={value}
      onChange={pick}
      hint={hint}
      error={error}
      disabled={disabled}
      className={className}
    />
  );
}
