/**
 * @file tests/components/filters/RangeSlider.test.tsx
 * @desc Component tests for RangeSlider: labels and ARIA values, the open "+" top end, values from
 *       outside the bounds, the track fill, and focus styles.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RangeSlider } from "../../../src/components/filters/RangeSlider.js";
import {
  highBox,
  highThumb,
  lowBox,
  lowThumb,
  stars,
  thumbValue,
} from "../../helpers/rangeSlider.js";

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
  it("hides the thumbs' outlines with outline-hidden (forced-colors still paints it); boxes keep the theme outline", () => {
    stars();
    for (const control of [lowThumb(), highThumb()]) {
      const classes = control.className.split(/\s+/);
      expect(classes).toContain("focus-visible:outline-hidden");
      expect(classes).not.toContain("focus-visible:outline-none");
    }
    for (const control of [lowBox(), highBox()]) {
      expect(control.className.split(/\s+/).some((c) => c.includes("outline-"))).toBe(false);
    }
  });

  it("draws 24px thumbs on a 24px track box, the WCAG 2.2 target size", () => {
    stars();
    const classes = lowThumb().className.split(/\s+/);
    expect(classes).toContain("[&::-webkit-slider-thumb]:size-6");
    expect(classes).toContain("[&::-moz-range-thumb]:size-6");
    expect(classes).toContain("h-6");
    expect(lowThumb().parentElement).toHaveClass("h-6");
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
