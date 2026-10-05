/**
 * @file tests/components/osu/MapCover.test.tsx
 * @desc MapCover: url from the set id, src override, pixel size and aspect per size, the
 *       placeholder with no usable id, the default empty alt, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapCover } from "../../../src/components/osu/MapCover.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("MapCover", () => {
  it("loads the set's list@2x cover, lazy, decorative, at osu!'s pixel size", () => {
    const { container } = render(<MapCover beatmapsetId={39804} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://assets.ppy.sh/beatmaps/39804/covers/list@2x.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("width", "300");
    expect(img).toHaveAttribute("height", "300");
    expect(img?.className).toContain("aspect-square");
    expect(img?.className).toContain("bg-b5");
  });

  it("takes a src override and an alt for a standalone banner", () => {
    const { container } = render(
      <MapCover beatmapsetId={39804} src="/covers/local.jpg" alt="FREEDOM DiVE cover" />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "/covers/local.jpg");
    expect(container.querySelector("img")).toHaveAttribute("alt", "FREEDOM DiVE cover");
  });

  it("sizes wide covers from osu!'s files", () => {
    const { container, rerender } = render(<MapCover beatmapsetId={1} size="cover@2x" />);
    let img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "1800");
    expect(img).toHaveAttribute("height", "500");
    expect(img?.className).toContain("aspect-[18/5]");
    rerender(<MapCover beatmapsetId={1} size="card" />);
    img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "400");
    expect(img).toHaveAttribute("height", "140");
    expect(img?.className).toContain("aspect-[20/7]");
    rerender(<MapCover beatmapsetId={1} size="card" shape="square" />);
    expect(container.querySelector("img")?.className).toContain("aspect-square");
  });

  it("draws a b5 placeholder with no usable id", () => {
    for (const id of [null, undefined, 0, -1, Number.NaN]) {
      const { container, unmount } = render(<MapCover beatmapsetId={id} className="size-12" />);
      expect(container.querySelector("img")).toBeNull();
      const box = container.firstElementChild as HTMLElement;
      expect(box).toHaveAttribute("aria-hidden", "true");
      expect(box).toHaveTextContent("♪");
      expect(box.className).toContain("bg-b5");
      expect(box.className).toContain("size-12");
      unmount();
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <MapCover beatmapsetId={39804} />
        <MapCover beatmapsetId={null} />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
