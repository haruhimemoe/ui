/**
 * @file tests/components/basics/useMotionAllowed.test.tsx
 * @desc Unit tests for useMotionAllowed: true without reduced motion, false with it, live changes,
 *       the listener removed on unmount, false without matchMedia and on the server, and Safari
 *       13's addListener-only MediaQueryList.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMotionAllowed } from "../../../src/components/basics/useMotionAllowed.js";

type Listener = () => void;

/** Puts a matchMedia stub on window whose `matches` the test can flip. */
const stubMatchMedia = (reduced: boolean, legacy = false) => {
  const listeners = new Set<Listener>();
  // Spies kept outside the list: a conditional spread types the list as a union, and tsc rejects
  // reading removeListener off the member that lacks it.
  const removeListener = vi.fn((listener: Listener) => {
    listeners.delete(listener);
  });
  const list = {
    matches: reduced,
    media: "(prefers-reduced-motion: reduce)",
    ...(legacy
      ? {
          addListener: vi.fn((listener: Listener) => {
            listeners.add(listener);
          }),
          removeListener,
        }
      : {
          addEventListener: vi.fn((_type: string, listener: Listener) => {
            listeners.add(listener);
          }),
          removeEventListener: vi.fn((_type: string, listener: Listener) => {
            listeners.delete(listener);
          }),
        }),
  };
  const matchMedia = vi.fn(() => list);
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });
  return {
    list,
    listeners,
    matchMedia,
    removeListener,
    flip(next: boolean) {
      list.matches = next;
      for (const listener of listeners) listener();
    },
  };
};

function Probe() {
  return <p>{useMotionAllowed() ? "motion" : "still"}</p>;
}

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: undefined,
  });
});

describe("useMotionAllowed", () => {
  it("is true when the visitor doesn't ask for reduced motion", () => {
    const { matchMedia } = stubMatchMedia(false);
    render(<Probe />);
    expect(screen.getByText("motion")).toBeInTheDocument();
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("is false when the visitor asks for reduced motion", () => {
    stubMatchMedia(true);
    render(<Probe />);
    expect(screen.getByText("still")).toBeInTheDocument();
  });

  it("follows a change of the setting", () => {
    const media = stubMatchMedia(false);
    render(<Probe />);
    act(() => media.flip(true));
    expect(screen.getByText("still")).toBeInTheDocument();
    act(() => media.flip(false));
    expect(screen.getByText("motion")).toBeInTheDocument();
  });

  it("removes its listener on unmount", () => {
    const media = stubMatchMedia(false);
    const { unmount } = render(<Probe />);
    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });

  it("is false without matchMedia", () => {
    render(<Probe />);
    expect(screen.getByText("still")).toBeInTheDocument();
  });

  it("is false on the server", () => {
    stubMatchMedia(false);
    expect(renderToString(<Probe />)).toContain("still");
  });

  it("works with Safari 13's addListener-only MediaQueryList", () => {
    const media = stubMatchMedia(false, true);
    const { unmount } = render(<Probe />);
    expect(screen.getByText("motion")).toBeInTheDocument();
    act(() => media.flip(true));
    expect(screen.getByText("still")).toBeInTheDocument();
    unmount();
    expect(media.removeListener).toHaveBeenCalledTimes(1);
    expect(media.listeners.size).toBe(0);
  });
});
