/**
 * @file tests/components/filters/RangeSlider.test.tsx
 * @desc Component tests for RangeSlider: labels and ARIA values, the open "+" top end, keyboard
 *       steps on both thumbs, thumbs that can't cross, boxes that clamp, snap and commit on blur
 *       or Enter, custom format and parse, disabled state, native props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  RangeSlider,
  type RangeSliderProps,
  type RangeSliderValue,
} from "../../../src/components/filters/RangeSlider.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

type HarnessProps = Omit<RangeSliderProps, "value" | "onChange" | "label"> & {
  initial: RangeSliderValue;
  label?: string;
  onChange?: (value: RangeSliderValue) => void;
};

/** A RangeSlider that keeps its own state, the way an app would use it. */
function Harness({ initial, label = "Star rating", onChange, ...props }: HarnessProps) {
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

const stars = (props: Partial<HarnessProps> = {}) => {
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

const lowThumb = () => screen.getByRole("slider", { name: "Minimum Star rating" });
const highThumb = () => screen.getByRole("slider", { name: "Maximum Star rating" });
const lowBox = () => screen.getByRole("textbox", { name: "Minimum Star rating" });
const highBox = () => screen.getByRole("textbox", { name: "Maximum Star rating" });
const thumbValue = (el: HTMLElement) => (el as HTMLInputElement).value;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const readClock = (text: string) => {
  const match = /^(\d+):(\d{2})$/.exec(text);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

describe("RangeSlider labels and values", () => {
  it("is a group named by its label, with a named slider and box at each end", () => {
    stars();
    const group = screen.getByRole("group", { name: "Star rating" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getAllByRole("slider")).toHaveLength(2);
    expect(lowBox()).toHaveValue("2");
    expect(highBox()).toHaveValue("6");
    expect(screen.getByText("Star rating")).toHaveClass("font-bold", "text-c3", "text-sm");
  });

  it("gives both thumbs the full bounds, the step, and a formatted value text", () => {
    stars({ format: (n) => n.toFixed(1) });
    for (const thumb of [lowThumb(), highThumb()]) {
      expect(thumb).toHaveAttribute("type", "range");
      expect(thumb).toHaveAttribute("min", "0");
      expect(thumb).toHaveAttribute("max", "10");
      expect(thumb).toHaveAttribute("step", "0.1");
    }
    expect(thumbValue(lowThumb())).toBe("2");
    expect(lowThumb()).toHaveAttribute("aria-valuetext", "2.0");
    expect(thumbValue(highThumb())).toBe("6");
    expect(highThumb()).toHaveAttribute("aria-valuetext", "6.0");
    expect(lowBox()).toHaveValue("2.0");
  });

  it("takes custom names for the two ends", () => {
    render(
      <RangeSlider
        label="BPM"
        minLabel="Lowest BPM"
        maxLabel="Highest BPM"
        min={60}
        max={300}
        value={[60, 300]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("slider", { name: "Lowest BPM" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Highest BPM" })).toBeInTheDocument();
  });

  it("shows an open top end as max+ at the top of the track", () => {
    stars({ initial: [0, null] });
    expect(highBox()).toHaveValue("10+");
    expect(highThumb()).toHaveAttribute("aria-valuetext", "10+");
    expect(thumbValue(highThumb())).toBe("10");
  });

  it("treats a top end at max as open when openEnded", () => {
    stars({ initial: [3, 10] });
    expect(highBox()).toHaveValue("10+");
  });

  it("shows a null top end as plain max when not openEnded", () => {
    stars({ initial: [3, null], openEnded: false });
    expect(highBox()).toHaveValue("10");
    expect(highThumb()).toHaveAttribute("aria-valuetext", "10");
  });

  it("puts values from outside (a URL, say) back inside the bounds and in order", () => {
    stars({ initial: [-4, 2], openEnded: false, min: 3 });
    expect(lowBox()).toHaveValue("3");
    expect(highBox()).toHaveValue("3");
    expect(thumbValue(highThumb())).toBe("3");
  });

  it("treats a NaN or infinite end (a bad URL value) as no limit on that end", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <RangeSlider
        label="Star rating"
        min={0}
        max={10}
        step={0.1}
        openEnded
        value={[Number("abc"), Number.NaN]}
        onChange={onChange}
      />,
    );
    expect(lowBox()).toHaveValue("0");
    expect(highBox()).toHaveValue("10+");
    await user.click(lowThumb());
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith([0.1, null]);

    rerender(
      <RangeSlider
        label="Star rating"
        min={0}
        max={10}
        step={0.1}
        value={[Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]}
        onChange={onChange}
      />,
    );
    expect(lowBox()).toHaveValue("0");
    expect(highBox()).toHaveValue("10");
    await user.click(highThumb());
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith([0, 9.9]);
  });

  it("fills the track between the two thumbs", () => {
    const { container } = render(
      <RangeSlider label="Length" min={0} max={200} value={[50, 150]} onChange={() => {}} />,
    );
    const fill = container.querySelector<HTMLElement>("[data-range-fill]");
    expect(fill?.style.left).toBe("25%");
    expect(fill?.style.right).toBe("25%");
  });

  it("fills to the end of the track for an open top end", () => {
    const { container } = render(
      <RangeSlider
        label="BPM"
        min={60}
        max={300}
        value={[180, null]}
        openEnded
        onChange={() => {}}
      />,
    );
    const fill = container.querySelector<HTMLElement>("[data-range-fill]");
    expect(fill?.style.left).toBe("50%");
    expect(fill?.style.right).toBe("0%");
  });

  it("does not divide by zero when min equals max", () => {
    const { container } = render(
      <RangeSlider label="Maps" min={5} max={5} value={[5, 5]} onChange={() => {}} />,
    );
    const fill = container.querySelector<HTMLElement>("[data-range-fill]");
    expect(fill?.style.left).toBe("0%");
  });

  it("lifts the low thumb on top past the middle, so parked thumbs can separate", () => {
    const { rerender } = render(
      <RangeSlider label="Star rating" min={0} max={10} value={[2, 8]} onChange={() => {}} />,
    );
    expect(lowThumb()).not.toHaveClass("z-10");
    rerender(
      <RangeSlider label="Star rating" min={0} max={10} value={[10, 10]} onChange={() => {}} />,
    );
    expect(lowThumb()).toHaveClass("z-10");
  });
});

describe("RangeSlider focus styles", () => {
  it("hides outlines with outline-hidden, which forced-colors mode still paints", () => {
    stars();
    for (const control of [lowThumb(), highThumb(), lowBox(), highBox()]) {
      const classes = control.className.split(/\s+/);
      expect(classes).toContain("focus-visible:outline-hidden");
      expect(classes).not.toContain("focus-visible:outline-none");
    }
  });

  it("rings a focused thumb in solid h1, not a see-through one", () => {
    stars();
    const classes = lowThumb().className.split(/\s+/);
    expect(classes).toContain("focus-visible:[&::-webkit-slider-thumb]:ring-h1");
    expect(classes).toContain("focus-visible:[&::-moz-range-thumb]:ring-h1");
    expect(classes.some((c) => c.includes("ring-h1/"))).toBe(false);
  });

  it("paints the fill in the system highlight color in forced-colors mode", () => {
    const { container } = render(
      <RangeSlider label="Length" min={0} max={200} value={[50, 150]} onChange={() => {}} />,
    );
    expect(container.querySelector("[data-range-fill]")).toHaveClass(
      "forced-colors:bg-[Highlight]",
    );
  });
});

describe("RangeSlider keyboard", () => {
  it("moves the low thumb one step with the arrow keys", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.tab();
    await user.tab();
    expect(lowThumb()).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith([2.1, 6]);
    await user.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenLastCalledWith([2.2, 6]);
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith([1.9, 6]);
    expect(thumbValue(lowThumb())).toBe("1.9");
    expect(lowThumb()).toHaveAttribute("aria-valuetext", "1.9");
    expect(lowBox()).toHaveValue("1.9");
  });

  it("moves ten steps with Page Up and Page Down", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    highThumb().focus();
    await user.keyboard("{PageDown}");
    expect(onChange).toHaveBeenLastCalledWith([2, 5]);
    await user.keyboard("{PageUp}{PageUp}");
    expect(onChange).toHaveBeenLastCalledWith([2, 7]);
  });

  it("goes as far as it can with Home and End, without crossing the other thumb", async () => {
    const user = userEvent.setup();
    const { onChange } = stars({ openEnded: false });
    lowThumb().focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith([6, 6]);
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith([0, 6]);

    highThumb().focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith([0, 0]);
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith([0, 10]);
  });

  it("keeps the thumbs from crossing: pushing into the other thumb changes nothing", async () => {
    const user = userEvent.setup();
    const { onChange } = stars({ initial: [4, 4] });
    lowThumb().focus();
    await user.keyboard("{ArrowRight}{PageUp}");
    highThumb().focus();
    await user.keyboard("{ArrowLeft}{PageDown}");
    expect(onChange).not.toHaveBeenCalled();
    expect(thumbValue(lowThumb())).toBe("4");
    expect(thumbValue(highThumb())).toBe("4");
  });

  it("opens the top end (null) when the high thumb reaches max, and closes it again", async () => {
    const user = userEvent.setup();
    const { onChange } = stars({ initial: [2, 9.9] });
    highThumb().focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith([2, null]);
    expect(highBox()).toHaveValue("10+");
    expect(highThumb()).toHaveAttribute("aria-valuetext", "10+");

    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledTimes(1);

    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith([2, 9.9]);
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith([2, null]);
  });

  it("stops at max, not null, when the slider is not openEnded", async () => {
    const user = userEvent.setup();
    const { onChange } = stars({ initial: [2, 9.9], openEnded: false });
    highThumb().focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith([2, 10]);
    expect(highBox()).toHaveValue("10");
  });

  it("keeps the open top end when the low thumb moves", async () => {
    const user = userEvent.setup();
    const { onChange } = stars({ initial: [5, null] });
    lowThumb().focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith([10, null]);
  });

  it("leaves other keys (Tab, letters) alone", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    lowThumb().focus();
    await user.keyboard("a");
    await user.tab();
    expect(highThumb()).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reaches every control with Tab in reading order", async () => {
    const user = userEvent.setup();
    stars();
    await user.tab();
    expect(lowBox()).toHaveFocus();
    await user.tab();
    expect(lowThumb()).toHaveFocus();
    await user.tab();
    expect(highThumb()).toHaveFocus();
    await user.tab();
    expect(highBox()).toHaveFocus();
  });
});

describe("RangeSlider pointer (native change events)", () => {
  it("clamps a dragged thumb at the other thumb", () => {
    const { onChange } = stars();
    fireEvent.change(lowThumb(), { target: { value: "8" } });
    expect(onChange).toHaveBeenLastCalledWith([6, 6]);
    fireEvent.change(highThumb(), { target: { value: "1" } });
    expect(onChange).toHaveBeenLastCalledWith([6, 6]);
  });

  it("drags parked thumbs apart in either direction, mid-track", () => {
    // Both at 3.0: the high thumb is on top. Dragging it left moves the low end instead.
    const { onChange } = stars({ initial: [3, 3] });
    fireEvent.pointerDown(highThumb());
    fireEvent.change(highThumb(), { target: { value: "2.5" } });
    expect(onChange).toHaveBeenLastCalledWith([2.5, 3]);
    // The same drag keeps moving the low end, even once the thumbs are apart.
    fireEvent.change(highThumb(), { target: { value: "2.4" } });
    expect(onChange).toHaveBeenLastCalledWith([2.4, 3]);
    fireEvent.pointerUp(highThumb());
    // A new change after the drag moves the high end again.
    fireEvent.change(highThumb(), { target: { value: "2.8" } });
    expect(onChange).toHaveBeenLastCalledWith([2.4, 2.8]);
  });

  it("drags parked thumbs apart to the right past the middle, where the low thumb is on top", () => {
    const { onChange } = stars({ initial: [6, 6] });
    fireEvent.pointerDown(lowThumb());
    fireEvent.change(lowThumb(), { target: { value: "6.5" } });
    expect(onChange).toHaveBeenLastCalledWith([6, 6.5]);
    fireEvent.pointerCancel(lowThumb());
    fireEvent.change(lowThumb(), { target: { value: "5" } });
    expect(onChange).toHaveBeenLastCalledWith([5, 6.5]);
  });

  it("does not swap ends for a change without a pointer (assistive tech steps)", () => {
    const { onChange } = stars({ initial: [3, 3] });
    fireEvent.change(highThumb(), { target: { value: "2.9" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports null when the high thumb is dragged to the top of an open-ended track", () => {
    const { onChange } = stars();
    fireEvent.change(highThumb(), { target: { value: "10" } });
    expect(onChange).toHaveBeenLastCalledWith([2, null]);
  });
});

describe("RangeSlider boxes", () => {
  it("commits a typed low value on Enter", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(lowBox());
    await user.type(lowBox(), "3.5");
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([3.5, 6]);
    expect(lowBox()).toHaveFocus();
    expect(lowBox()).toHaveValue("3.5");
    expect(thumbValue(lowThumb())).toBe("3.5");
  });

  it("commits a typed high value on blur", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(highBox());
    await user.type(highBox(), "7.2");
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith([2, 7.2]);
    expect(highBox()).toHaveValue("7.2");
  });

  it("clamps typed values to the bounds and to the other end", async () => {
    const user = userEvent.setup();
    const { onChange } = stars({ openEnded: false });
    await user.clear(lowBox());
    await user.type(lowBox(), "-3{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([0, 6]);
    await user.clear(lowBox());
    await user.type(lowBox(), "9{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([6, 6]);
    await user.clear(highBox());
    await user.type(highBox(), "1{Enter}");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(highBox()).toHaveValue("6");
    await user.clear(highBox());
    await user.type(highBox(), "50{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([6, 10]);
  });

  it("snaps typed values to the step", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(lowBox());
    await user.type(lowBox(), "3.14{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([3.1, 6]);

    render(<Harness label="BPM" initial={[120, 200]} min={60} max={300} step={5} />);
    const bpm = screen.getByRole("textbox", { name: "Minimum BPM" });
    await user.clear(bpm);
    await user.type(bpm, "143{Enter}");
    expect(bpm).toHaveValue("145");
  });

  it("opens the top end for a typed value at or past max, or a trailing +", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(highBox());
    await user.type(highBox(), "12{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([2, null]);
    expect(highBox()).toHaveValue("10+");

    await user.clear(highBox());
    await user.type(highBox(), "8{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([2, 8]);
    await user.clear(highBox());
    await user.type(highBox(), "10+{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([2, null]);
  });

  it("reads an empty box as no limit on that end", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(lowBox());
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith([0, 6]);
    await user.clear(highBox());
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith([0, null]);
  });

  it("reads an empty top box as max when not openEnded", async () => {
    const user = userEvent.setup();
    const { onChange } = stars({ openEnded: false });
    await user.clear(highBox());
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([2, 10]);
  });

  it("reads a comma as the decimal separator (comma-locale keypads)", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(lowBox());
    await user.type(lowBox(), "5,5{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([5.5, 6]);
  });

  it("opens a decimal keypad by default, and a text keyboard with a custom parse", () => {
    const { rerender } = render(
      <RangeSlider label="Star rating" min={0} max={10} value={[2, 6]} onChange={() => {}} />,
    );
    expect(lowBox()).toHaveAttribute("inputmode", "decimal");
    expect(highBox()).toHaveAttribute("inputmode", "decimal");
    rerender(
      <RangeSlider
        label="Star rating"
        min={0}
        max={600}
        value={[0, 600]}
        onChange={() => {}}
        format={clock}
        parse={readClock}
      />,
    );
    // m:ss needs a ":" key, which the decimal keypad lacks.
    expect(lowBox()).toHaveAttribute("inputmode", "text");
    expect(highBox()).toHaveAttribute("inputmode", "text");
    rerender(
      <RangeSlider
        label="Star rating"
        min={0}
        max={600}
        value={[0, 600]}
        onChange={() => {}}
        parse={readClock}
        inputMode="numeric"
      />,
    );
    expect(lowBox()).toHaveAttribute("inputmode", "numeric");
  });

  it("puts the current value back for text it can't read", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(lowBox());
    await user.type(lowBox(), "hard{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(lowBox()).toHaveValue("2");
  });

  it("puts the current value back on Escape without committing", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(highBox());
    await user.type(highBox(), "4{Escape}");
    expect(highBox()).toHaveValue("6");
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("lets Escape through when nothing was typed", () => {
    stars();
    // fireEvent returns false only when a handler called preventDefault.
    expect(fireEvent.keyDown(lowBox(), { key: "Escape" })).toBe(true);
    expect(lowBox()).toHaveValue("2");
  });

  it("does not report a change when the committed value is the same", async () => {
    const user = userEvent.setup();
    const { onChange } = stars();
    await user.clear(lowBox());
    await user.type(lowBox(), "2.0{Enter}");
    await user.click(lowBox());
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(lowBox()).toHaveValue("2");
  });

  it("uses custom format and parse (lengths as m:ss)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        label="Length"
        initial={[90, null]}
        min={0}
        max={600}
        step={15}
        openEnded
        format={clock}
        parse={readClock}
        onChange={onChange}
      />,
    );
    const low = screen.getByRole("textbox", { name: "Minimum Length" });
    const high = screen.getByRole("textbox", { name: "Maximum Length" });
    expect(low).toHaveValue("1:30");
    expect(high).toHaveValue("10:00+");
    expect(screen.getByRole("slider", { name: "Maximum Length" })).toHaveAttribute(
      "aria-valuetext",
      "10:00+",
    );

    await user.clear(high);
    await user.type(high, "3:10{Enter}");
    expect(onChange).toHaveBeenLastCalledWith([90, 195]);
    expect(high).toHaveValue("3:15");

    await user.clear(low);
    await user.type(low, "90{Enter}");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(low).toHaveValue("1:30");
  });
});

describe("RangeSlider props and accessibility", () => {
  it("disables both thumbs and both boxes", () => {
    render(
      <RangeSlider
        label="Star rating"
        min={0}
        max={10}
        value={[2, 6]}
        onChange={() => {}}
        disabled
      />,
    );
    const group = screen.getByRole("group", { name: "Star rating" });
    expect(group).toBeDisabled();
    expect(group).toHaveClass("disabled:opacity-50");
    for (const control of [lowThumb(), highThumb(), lowBox(), highBox()]) {
      expect(control).toBeDisabled();
    }
  });

  it("leaves the group name to a surrounding FilterRow with hideLabel, keeping the end names", () => {
    render(
      <RangeSlider
        label="BPM"
        hideLabel
        min={60}
        max={300}
        value={[60, 300]}
        onChange={() => {}}
        disabled
      />,
    );
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByText("BPM")).toBeNull();
    expect(screen.getByRole("slider", { name: "Minimum BPM" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Maximum BPM" })).toBeDisabled();
  });

  it("appends a caller className and passes native props and a ref through", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <RangeSlider
        ref={ref}
        label="Maps"
        min={1}
        max={40}
        value={[1, 40]}
        onChange={() => {}}
        className="mt-4"
        data-testid="maps"
      />,
    );
    const group = screen.getByRole("group", { name: "Maps" });
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute("data-testid", "maps");
    expect(group.className.endsWith(" mt-4")).toBe(true);
  });

  it("has no axe violations open-ended, closed, hidden-label and disabled", async () => {
    const { container } = render(
      <div>
        <RangeSlider
          label="Star rating"
          min={0}
          max={10}
          step={0.1}
          openEnded
          value={[5.5, null]}
          onChange={() => {}}
        />
        <RangeSlider label="Maps" hideLabel min={1} max={40} value={[10, 20]} onChange={() => {}} />
        <RangeSlider
          label="BPM"
          min={60}
          max={300}
          value={[60, 300]}
          onChange={() => {}}
          disabled
        />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
