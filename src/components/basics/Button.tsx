/**
 * @file src/components/basics/Button.tsx
 * @desc Pill button primitive. Defaults to type="button" so it never submits a form by accident.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";
import { type ButtonSize, type ButtonVariant, buttonClasses } from "./buttonStyles.js";

/** Every native `<button>` prop (including `ref`), plus a variant and a size. */
export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
};

/**
 * @function Button
 * @param props {ButtonProps} native button props, plus an optional variant and size
 * @returns {JSX.Element} a `<button>` styled as a pill
 */
export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
