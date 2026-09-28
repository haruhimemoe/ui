/**
 * @file tests/components/forms/ReportDisclosure.test.tsx
 * @desc Component tests for ReportDisclosure: closed at first, sends the trimmed reason, done
 *       with the caller's or the default message, errors kept for a retry, a throw, one send at a
 *       time, the words and limits, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ReportDisclosure,
  type ReportResult,
} from "../../../src/components/forms/ReportDisclosure.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const open = async (user: ReturnType<typeof userEvent.setup>, summary = "Report") => {
  await user.click(screen.getByRole("button", { name: summary }));
  return screen.getByRole("textbox", { name: "What's wrong with it?" });
};

describe("ReportDisclosure", () => {
  it("starts closed, sends the trimmed reason, then says it's done", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async (): Promise<ReportResult> => ({ ok: true }));
    const { container } = render(<ReportDisclosure onSubmit={onSubmit} maxLength={200} />);
    expect(screen.getByRole("button", { name: "Report" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    const field = await open(user);
    expect(field).toBeRequired();
    expect(field).toHaveAttribute("minlength", "3");
    expect(field).toHaveAttribute("maxlength", "200");
    expect(field).toHaveAttribute("rows", "3");
    await expectNoAxeViolations(container);
    await user.type(field, "  spam links  ");
    await user.click(screen.getByRole("button", { name: "Send report" }));
    expect(onSubmit).toHaveBeenCalledWith("spam links");
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks. Your report was sent.");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows the caller's done message (already reported)", async () => {
    const user = userEvent.setup();
    render(
      <ReportDisclosure
        summary="Report this template"
        onSubmit={async () => ({ ok: true, message: "You already reported it." })}
      />,
    );
    await user.type(await open(user, "Report this template"), "bad");
    await user.click(screen.getByRole("button", { name: "Send report" }));
    expect(await screen.findByRole("status")).toHaveTextContent("You already reported it.");
  });

  it("keeps the form with the error for a retry, and says a throw", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<(reason: string) => Promise<ReportResult>>()
      .mockResolvedValueOnce({ ok: false, message: "Too many reports." })
      .mockRejectedValueOnce(new Error("offline"));
    render(<ReportDisclosure onSubmit={onSubmit} />);
    const field = await open(user);
    await user.type(field, "broken");
    await user.click(screen.getByRole("button", { name: "Send report" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many reports.");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveValue("broken");
    await user.click(screen.getByRole("button", { name: "Send report" }));
    expect(await screen.findByText("Couldn't send the report. Try again.")).toBeInTheDocument();
  });

  it("sends once while pending, with the pending label", async () => {
    const user = userEvent.setup();
    let finish: (result: ReportResult) => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<ReportResult>((resolve) => {
          finish = resolve;
        }),
    );
    render(<ReportDisclosure onSubmit={onSubmit} pendingLabel="Sending it…" />);
    await user.type(await open(user), "spam");
    await user.click(screen.getByRole("button", { name: "Send report" }));
    const pending = screen.getByRole("button", { name: "Sending it…" });
    expect(pending).toBeDisabled();
    screen.getByRole("textbox").closest("form")?.requestSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    finish({ ok: false, message: "No." });
    expect(await screen.findByRole("button", { name: "Send report" })).toBeEnabled();
  });
});
