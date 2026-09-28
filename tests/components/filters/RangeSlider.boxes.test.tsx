/**
 * @file tests/components/filters/RangeSlider.boxes.test.tsx
 * @desc RangeSlider box tests: typed values that clamp, snap and commit on blur or Enter, Escape,
 *       empty boxes, comma decimals, and custom format and parse.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RangeSlider } from "../../../src/components/filters/RangeSlider.js";
import {
  clock,
  Harness,
  highBox,
  lowBox,
  lowThumb,
  readClock,
  stars,
  thumbValue,
} from "../../helpers/rangeSlider.js";

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
