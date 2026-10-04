/**
 * @file tests/components/content/CopyMarkdownButton.test.tsx
 * @desc Component tests for CopyMarkdownButton: the ClipboardItem path (a promised Blob written
 *       inside the click, for Safari) and the fetch-then-writeText fallback, each with success, a
 *       non-ok response, a clipboard rejection and a network error announced in the status with
 *       no unhandled rejection; custom labels; finished classes; accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buttonClasses } from "../../../src/components/basics/buttonStyles.js";
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

/** A minimal ClipboardItem stand-in that keeps the promised data it was built with. */
class FakeClipboardItem {
  constructor(readonly items: Record<string, Promise<Blob>>) {}
}

/**
 * Stubs ClipboardItem and a clipboard whose write awaits each item's text/plain promise, as a
 * browser does, then hands the copied text to `onText` (which may reject, like a denied write).
 */
const stubClipboardItem = (onText: (text: string) => Promise<void> = () => Promise.resolve()) => {
  vi.stubGlobal("ClipboardItem", FakeClipboardItem);
  const writeText = vi.fn(() => Promise.resolve());
  const write = vi.fn(async (items: FakeClipboardItem[]) => {
    for (const item of items) {
      const blob = await item.items["text/plain"];
      expect(blob?.type).toBe("text/plain");
      await onText(await (blob as Blob).text());
    }
  });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { write, writeText },
  });
  return { write, writeText };
};

describe("CopyMarkdownButton with ClipboardItem", () => {
  it("starts clipboard.write inside the click with a promised Blob, and says Copied", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") });
    vi.stubGlobal("fetch", fetchSpy);
    const copied: string[] = [];
    const { write, writeText } = stubClipboardItem(async (text) => {
      copied.push(text);
    });

    render(<CopyMarkdownButton href="/docs/guide.md" />);
    await user.click(screen.getByRole("button"));
    expect(fetchSpy).toHaveBeenCalledWith("/docs/guide.md");
    expect(write).toHaveBeenCalledTimes(1);
    expect(writeText).not.toHaveBeenCalled();
    expect(copied).toEqual(["# Hi"]);
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    expect(rejections).toEqual([]);
  });

  it("announces the failure on a non-ok response", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    const copied: string[] = [];
    stubClipboardItem(async (text) => {
      copied.push(text);
    });

    render(<CopyMarkdownButton href="/docs/missing.md" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
    expect(copied).toEqual([]);
    expect(rejections).toEqual([]);
  });

  it("announces the failure on a network error", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    stubClipboardItem();

    render(<CopyMarkdownButton href="/docs/guide.md" />);
    await expect(user.click(screen.getByRole("button"))).resolves.not.toThrow();
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
    expect(rejections).toEqual([]);
  });

  it("announces the failure when the clipboard rejects the write", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") }),
    );
    stubClipboardItem(() => Promise.reject(new Error("denied")));

    render(<CopyMarkdownButton href="/docs/guide.md" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
    expect(rejections).toEqual([]);
  });
});

describe("CopyMarkdownButton", () => {
  it("falls back to fetch then writeText when ClipboardItem is missing", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("ClipboardItem", undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hi") }),
    );
    const write = vi.fn(() => Promise.resolve());
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write, writeText },
    });

    render(<CopyMarkdownButton href="/docs/guide.md" />);
    await user.click(screen.getByRole("button"));
    expect(write).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith("# Hi");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

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

  it("uses exactly Button's secondary classes, so the copy can't drift", () => {
    render(<CopyMarkdownButton href="/docs/x.md" />);
    expect(screen.getByRole("button").className).toBe(buttonClasses({ variant: "secondary" }));
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
