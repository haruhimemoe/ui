/**
 * @file tests/helpers/rangeSlider.tsx
 * @desc Shared RangeSlider test setup: a stateful harness, the star-rating slider most tests use,
 *       queries for the two thumbs and two boxes, and an m:ss format and parse pair.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { vi } from "vitest";
import {
  RangeSlider,
  type RangeSliderProps,
  type RangeSliderValue,
} from "../../src/components/filters/RangeSlider.js";

export type HarnessProps = Omit<RangeSliderProps, "value" | "onChange" | "label"> & {
  initial: RangeSliderValue;
  label?: string;
  onChange?: (value: RangeSliderValue) => void;
};

/** A RangeSlider that keeps its own state, the way an app would use it. */
export function Harness({ initial, label = "Star rating", onChange, ...props }: HarnessProps) {
  const [value, setValue] = useState<RangeSliderValue>(initial);
  return (
    <RangeSlider
      label={label}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
}

export const stars = (props: Partial<HarnessProps> = {}) => {
  const onChange = vi.fn();
  render(
    <Harness
      initial={[2, 6]}
      min={0}
      max={10}
      step={0.1}
      openEnded
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange };
};

export const lowThumb = () => screen.getByRole("slider", { name: "Minimum Star rating" });
export const highThumb = () => screen.getByRole("slider", { name: "Maximum Star rating" });
export const lowBox = () => screen.getByRole("textbox", { name: "Minimum Star rating" });
export const highBox = () => screen.getByRole("textbox", { name: "Maximum Star rating" });
export const thumbValue = (el: HTMLElement) => (el as HTMLInputElement).value;

export const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
export const readClock = (text: string) => {
  const match = /^(\d+):(\d{2})$/.exec(text);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};
