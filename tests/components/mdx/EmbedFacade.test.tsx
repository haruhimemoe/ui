/**
 * @file tests/components/mdx/EmbedFacade.test.tsx
 * @desc The click-to-load player: a plain click swaps in the iframe (nocookie YouTube with start,
 *       Twitch with parent) and focuses it; a modified click follows the link instead.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EmbedFacade } from "../../../src/components/mdx/EmbedFacade.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("EmbedFacade", () => {
  it("swaps in a nocookie YouTube iframe with autoplay and start, and focuses it", async () => {
    const { container } = render(
      <EmbedFacade
        target={{ provider: "youtube", id: "dQw4w9WgXcQ", start: 90 }}
        title="Finals"
        poster={null}
        watchUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s"
      />,
    );
    await userEvent.click(screen.getByRole("link", { name: "Play video: Finals" }));
    const frame = container.querySelector("iframe");
    expect(frame).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&start=90",
    );
    expect(frame).toHaveAttribute("title", "Finals");
    expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(frame?.getAttribute("allow")).toContain("autoplay");
    expect(document.activeElement).toBe(frame);
    await expectNoAxeViolations(container);
  });

  it.each([
    [
      { provider: "twitch", kind: "video", id: "22" } as const,
      "https://player.twitch.tv/?video=v22&parent=localhost&autoplay=true",
    ],
    [
      { provider: "twitch", kind: "channel", id: "osulive" } as const,
      "https://player.twitch.tv/?channel=osulive&parent=localhost&autoplay=true",
    ],
    [
      { provider: "twitch", kind: "clip", id: "Clip-1" } as const,
      "https://clips.twitch.tv/embed?clip=Clip-1&parent=localhost&autoplay=true",
    ],
  ])("builds the Twitch player URL with this page's host as parent", async (target, src) => {
    const { container } = render(
      <EmbedFacade target={target} title="VOD" poster={null} watchUrl="https://www.twitch.tv/" />,
    );
    await userEvent.click(screen.getByRole("link"));
    expect(container.querySelector("iframe")).toHaveAttribute("src", src);
  });

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ])("lets a modified click (%o) follow the link", (init) => {
    const { container } = render(
      <EmbedFacade
        target={{ provider: "youtube", id: "dQw4w9WgXcQ" }}
        title="Finals"
        poster={null}
        watchUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />,
    );
    const notPrevented = fireEvent.click(screen.getByRole("link"), init);
    expect(notPrevented).toBe(true);
    expect(container.querySelector("iframe")).toBeNull();
  });
});
