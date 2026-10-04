/**
 * @file tests/components/content/CopyMarkdownButton.test.tsx
 * @desc Component tests for CopyMarkdownButton: a successful fetch-then-copy, a non-ok response, a
 *       clipboard rejection and a network error, each announced in the status with no unhandled
 *       rejection; custom labels; finished classes; accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyMarkdownButton } from "../../../src/components/content/CopyMarkdownButton.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

let clipboardOriginal: PropertyDescriptor | undefined;
let rejections: unknown[] = [];
const onRejection = (event: PromiseRejectionEvent) => {
  rejections.push(event.reason);
};

beforeEach(() => {
  clipboardOriginal = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  rejections = [];
  window.addEventListener("unhandledrejection", onRejection);
});

afterEach(() => {
  if (clipboardOriginal) Object.defineProperty(navigator, "clipboard", clipboardOriginal);
  else Reflect.deleteProperty(navigator, "clipboard");
  window.removeEventListener("unhandledrejection", onRejection);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Swaps in a clipboard whose writeText does what the test says. */
const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: spy } });
  return spy;
};

describe("CopyMarkdownButton", () => {
  it("fetches the href, copies the body, and says so in the status", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") });
    vi.stubGlobal("fetch", fetchSpy);
    const writeText = stubClipboard(() => Promise.resolve());

    render(<CopyMarkdownButton href="/docs/guide.md" />);
    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole("button", { name: "Copy as Markdown" }));
    expect(fetchSpy).toHaveBeenCalledWith("/docs/guide.md");
    expect(writeText).toHaveBeenCalledWith("# Hi");
    expect(status).toHaveTextContent("Copied");
    expect(rejections).toEqual([]);
  });

  it("announces the failure on a non-ok response, without calling the clipboard", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    const writeText = stubClipboard(() => Promise.resolve());

    render(<CopyMarkdownButton href="/docs/missing.md" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
    expect(writeText).not.toHaveBeenCalled();
    expect(rejections).toEqual([]);
  });

  it("announces the failure when the clipboard rejects", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") }),
    );
    stubClipboard(() => Promise.reject(new Error("denied")));

    render(<CopyMarkdownButton href="/docs/guide.md" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
    expect(rejections).toEqual([]);
  });

  it("announces the failure on a network error, never throwing", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const writeText = stubClipboard(() => Promise.resolve());

    render(<CopyMarkdownButton href="/docs/guide.md" />);
    await expect(user.click(screen.getByRole("button"))).resolves.not.toThrow();
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
    expect(writeText).not.toHaveBeenCalled();
    expect(rejections).toEqual([]);
  });

  it("uses custom label and status text", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") }),
    );
    stubClipboard(() => Promise.resolve());

    render(
      <CopyMarkdownButton
        href="/docs/guide.md"
        label="Copy markdown"
        copiedLabel="Markdown copied."
        failedLabel="No luck."
      />,
    );
    await user.click(screen.getByRole("button", { name: "Copy markdown" }));
    expect(screen.getByRole("status")).toHaveTextContent("Markdown copied.");
  });

  it("uses the finished secondary button classes, with no cx merge needed", () => {
    render(<CopyMarkdownButton href="/docs/guide.md" />);
    expect(screen.getByRole("button")).toHaveClass("bg-b3", "text-c1", "rounded-full");
  });

  it("has no axe violations before and after copying", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") }),
    );
    stubClipboard(() => Promise.resolve());

    const { container } = render(<CopyMarkdownButton href="/docs/guide.md" />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    await expectNoAxeViolations(container);
  });
});
