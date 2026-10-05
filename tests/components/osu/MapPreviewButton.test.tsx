/**
 * @file tests/components/osu/MapPreviewButton.test.tsx
 * @desc MapPreviewButton: plays the set's clip from b.ppy.sh and stops it, one clip at a time,
 *       resets when the clip ends, renders nothing for a bad set id, stops once no button for its
 *       set is left, label and src overrides, classes, and axe. Playback is stubbed.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MapPreviewButton } from "../../../src/components/osu/MapPreviewButton.js";
import { stopMapPreview } from "../../../src/components/osu/previewPlayer.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

let played: HTMLMediaElement[] = [];
beforeEach(() => {
  played = [];
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    played.push(this);
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
});
afterEach(() => {
  act(() => stopMapPreview());
  vi.restoreAllMocks();
});

describe("MapPreviewButton", () => {
  it("plays one clip at a time and stops it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <MapPreviewButton beatmapsetId={1} song="A" />
        <MapPreviewButton beatmapsetId={2} song="B" />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Play preview of A" }));
    expect(played.map((audio) => audio.src)).toEqual(["https://b.ppy.sh/preview/1.mp3"]);
    await user.click(screen.getByRole("button", { name: "Play preview of B" }));
    expect(screen.getByRole("button", { name: "Play preview of A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop preview of B" }).className).toContain(
      "bg-h2/70",
    );
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Stop preview of B" }));
    expect(screen.getByRole("button", { name: "Play preview of B" })).toBeInTheDocument();
  });

  it("resets its button when the clip ends", async () => {
    const user = userEvent.setup();
    render(<MapPreviewButton beatmapsetId={1} song="A" />);
    await user.click(screen.getByRole("button", { name: "Play preview of A" }));
    act(() => played[0]?.dispatchEvent(new Event("ended")));
    expect(screen.getByRole("button", { name: "Play preview of A" })).toBeInTheDocument();
  });

  it("renders nothing for a set id that isn't a positive whole number", () => {
    for (const id of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
      const { container, unmount } = render(<MapPreviewButton beatmapsetId={id} song="A" />);
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
  });

  it("stops the clip once no button for its set is left on the page", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <MapPreviewButton beatmapsetId={1} song="A" />
        <MapPreviewButton beatmapsetId={1} song="A" />
      </>,
    );
    await user.click(
      screen.getAllByRole("button", { name: "Play preview of A" })[0] as HTMLElement,
    );
    rerender(<MapPreviewButton beatmapsetId={1} song="A" />);
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
    rerender(<MapPreviewButton beatmapsetId={2} song="B" />);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
  });

  it("takes label and src overrides, and fills its parent", async () => {
    const user = userEvent.setup();
    render(
      <MapPreviewButton
        beatmapsetId={1}
        song="A"
        src="/clips/a.mp3"
        labels={{ play: (s) => `Hören: ${s}`, stop: (s) => `Stopp: ${s}` }}
      />,
    );
    const button = screen.getByRole("button", { name: "Hören: A" });
    expect(button.className).toContain("size-full");
    expect(button.className).toContain("bg-b6/45");
    expect(button.className).toContain("transition-colors");
    await user.click(button);
    expect(played[0]?.src).toContain("/clips/a.mp3");
    expect(screen.getByRole("button", { name: "Stopp: A" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<MapPreviewButton beatmapsetId={1} song="xi - Blue Zenith" />);
    await expectNoAxeViolations(container);
  });
});
