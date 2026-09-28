/**
 * @file tests/components/filters/RangeSlider.props.test.tsx
 * @desc RangeSlider props tests: disabled state, native props and ref, guarded step and bounds,
 *       accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { RangeSlider } from "../../../src/components/filters/RangeSlider.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { highBox, highThumb, lowBox, lowThumb } from "../../helpers/rangeSlider.js";

describe("RangeSlider guards", () => {
  it("steps by 1 when step is 0, negative or NaN, and never reports NaN", async () => {
    const user = userEvent.setup();
    for (const step of [0, -0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const onChange = vi.fn();
      const { unmount } = render(
        <RangeSlider
          label="BPM"
          min={100}
          max={200}
          step={step}
          value={[150, 180]}
          onChange={onChange}
        />,
      );
      expect(screen.getByRole("slider", { name: "Minimum BPM" })).toHaveAttribute("step", "1");
      await user.click(screen.getByRole("slider", { name: "Minimum BPM" }));
      await user.keyboard("{ArrowRight}");
      expect(onChange, String(step)).toHaveBeenLastCalledWith([151, 180]);
      await user.clear(screen.getByRole("textbox", { name: "Maximum BPM" }));
      await user.keyboard("172.4{Enter}");
      expect(onChange, String(step)).toHaveBeenLastCalledWith([150, 172]);
      unmount();
    }
  });

  it("swaps bounds given as max below min", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangeSlider label="Stars" min={10} max={0} value={[2, 6]} onChange={onChange} />);
    const low = screen.getByRole("slider", { name: "Minimum Stars" });
    expect(low).toHaveAttribute("min", "0");
    expect(low).toHaveAttribute("max", "10");
    expect(low).toHaveValue("2");
    await user.click(low);
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith([0, 6]);
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
