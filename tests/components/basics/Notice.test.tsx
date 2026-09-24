/**
 * @file tests/components/basics/Notice.test.tsx
 * @desc Component tests for Notice: tones, live roles, element choice, native props, className,
 *       ref, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Notice } from "../../../src/components/basics/Notice.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Notice", () => {
  it("renders a small muted paragraph with no role by default", () => {
    render(<Notice>Nothing here yet.</Notice>);
    const notice = screen.getByText("Nothing here yet.");
    expect(notice.tagName).toBe("P");
    expect(notice).toHaveClass("text-sm", "text-c3");
    expect(notice).not.toHaveAttribute("role");
  });

  it("uses amber for warnings and rose for errors", () => {
    render(
      <div>
        <Notice tone="warning">Careful.</Notice>
        <Notice tone="error">Broken.</Notice>
      </div>,
    );
    expect(screen.getByText("Careful.")).toHaveClass("text-amber-300");
    expect(screen.getByText("Broken.")).toHaveClass("text-rose-300");
    expect(screen.getByText("Broken.")).not.toHaveClass("text-c3");
  });

  it("does not announce an error unless live is set", () => {
    render(<Notice tone="error">Quiet error.</Notice>);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("announces a live error as an alert", () => {
    render(
      <Notice tone="error" live>
        Couldn't save.
      </Notice>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save.");
  });

  it("announces live info and warnings as a status", () => {
    render(
      <div>
        <Notice live>Saved.</Notice>
        <Notice tone="warning" live>
          Almost full.
        </Notice>
      </div>,
    );
    expect(screen.getAllByRole("status").map((el) => el.textContent)).toEqual([
      "Saved.",
      "Almost full.",
    ]);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("lets a caller role win over the live role", () => {
    render(
      <Notice tone="error" live role="status">
        Soft error.
      </Notice>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Soft error.");
  });

  it("renders a div for block content", () => {
    render(
      <Notice as="div" tone="error" live>
        <ul>
          <li>Line 3: not a beatmap link.</li>
        </ul>
      </Notice>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.tagName).toBe("DIV");
    expect(alert).toHaveClass("text-sm", "text-rose-300");
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("appends a caller className and passes native props and ref through", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(
      <Notice ref={ref} id="err" className="font-bold" data-testid="notice">
        Text
      </Notice>,
    );
    expect(ref.current).toBe(screen.getByTestId("notice"));
    expect(ref.current).toHaveAttribute("id", "err");
    expect(ref.current?.className.endsWith(" font-bold")).toBe(true);
  });

  it("has no axe violations in any tone, live or not", async () => {
    const { container } = render(
      <main>
        <Notice>Info.</Notice>
        <Notice tone="warning">Warning.</Notice>
        <Notice tone="error">Error.</Notice>
        <Notice live>Live info.</Notice>
        <Notice tone="error" live>
          Live error.
        </Notice>
        <Notice as="div" tone="warning">
          <ul>
            <li>One</li>
          </ul>
        </Notice>
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
