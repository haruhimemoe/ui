/**
 * @file tests/components/mdx/Embed.test.tsx
 * @desc Embed: the facade link to the watch page, the YouTube poster (default, custom, off),
 *       Twitch with no poster, default titles, and a plain link for a URL it can't embed.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Embed } from "../../../src/components/mdx/Embed.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const YT = "https://youtu.be/dQw4w9WgXcQ?t=90";

describe("Embed", () => {
  it("renders a facade link to the watch page with the YouTube poster", async () => {
    const { container } = render(<Embed url={YT} title="Grand finals" />);
    const link = screen.getByRole("link", { name: "Play video: Grand finals" });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s");
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(container.firstElementChild).toHaveClass("aspect-video");
    expect(container.querySelector("iframe")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("uses a custom poster, or none with poster={false}", () => {
    const { container, rerender } = render(<Embed url={YT} poster="/local.jpg" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/local.jpg");
    rerender(<Embed url={YT} poster={false} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("names a Twitch video by default and draws no poster", async () => {
    const { container } = render(<Embed url="https://www.twitch.tv/videos/2245123456" />);
    expect(screen.getByRole("link", { name: "Play video: Twitch video" })).toHaveAttribute(
      "href",
      "https://www.twitch.tv/videos/2245123456",
    );
    expect(container.querySelector("img")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("falls back to a plain external link for a URL it can't embed", () => {
    const { container } = render(<Embed url="https://vimeo.com/1" title="Old VOD" />);
    const link = screen.getByRole("link", { name: "Old VOD" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(container.querySelector("iframe, img")).toBeNull();
  });
});
