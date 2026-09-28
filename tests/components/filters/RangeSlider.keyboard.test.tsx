/**
 * @file tests/components/filters/RangeSlider.keyboard.test.tsx
 * @desc RangeSlider keyboard and pointer tests: steps on both thumbs, thumbs that can't cross,
 *       Home and End, tab order, and native change events from dragging.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  highBox,
  highThumb,
  lowBox,
  lowThumb,
  stars,
  thumbValue,
} from "../../helpers/rangeSlider.js";

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
