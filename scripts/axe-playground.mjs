/**
 * @file scripts/axe-playground.mjs
 * @desc Builds the playground (the Next app in playground/ that imports src/ directly), serves it,
 *       and runs axe-core in headless Chromium over the command palette's states on / at a desktop
 *       and a phone width, on a touch phone (rows measured at 44px) and under more contrast, color
 *       contrast on: closed, open, a nested page, an argument prompt and no results. Then it runs
 *       the same pass over /mdx (the MDX components: callouts, Shiki code blocks, a wide table),
 *       /surfaces (the 0.13.0 layout pieces) at both widths, /surfaces a second time after a Copy
 *       press and a SegmentedControl pick, then /dialogs (ConfirmDialog closed, open, part-typed,
 *       pending, failed), and once more under forced colors, checking that the current LinkRow
 *       link and the checked SegmentedControl option keep their underline. The jsdom tests can't
 *       see contrast or scrollable regions, and the consumer check only sees closed pages. Prints
 *       one line per violation (with up to five targets) and exits 1 on any. Usage:
 *       `bun run play:axe` (CI runs it after the consumer check; Chromium is installed for that).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Mon Oct 5, 2026
 */

import { execFileSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const next = path.join(root, "node_modules", ".bin", "next");
const port = Number(process.env.AXE_PORT ?? 3985);
const origin = `http://127.0.0.1:${port}`;
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };

/** The contexts every state runs in: two widths, a touch phone and more contrast. */
const CONTEXTS = {
  desktop: { viewport: { width: 1280, height: 900 } },
  phone: { viewport: { width: 390, height: 844 } },
  coarse: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  contrast: { viewport: { width: 1280, height: 900 }, contrast: "more" },
};
/** The media query each extra context must match, so a pass means it was really checked. */
const MEDIA = { coarse: "(pointer: coarse)", contrast: "(prefers-contrast: more)" };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/**
 * The palette's states: a name, the keys that reach it from the previous state, and text or a
 * selector that proves it was reached (so an "ok" means the state was checked, not skipped).
 */
const STATES = [
  { name: "closed", keys: [], expect: { missing: "[role=combobox]" } },
  // "mod" is Command on a Mac (the browser decides, as the palette does) and Control elsewhere.
  { name: "open", keys: ["mod+k"], expect: { selector: "[role=combobox]" } },
  { name: "nested page", keys: ["m", "o", "d", "Enter"], expect: { text: "Mods" } },
  {
    name: "argument prompt",
    // Escape pops to the root, whose query is still "mod": clear it before typing.
    keys: ["Escape", "mod+a", "Backspace", "j", "u", "m", "p", "Enter"],
    expect: { selector: "[role=combobox][placeholder='Beatmap id']" },
  },
  {
    name: "no results",
    keys: ["Escape", "mod+a", "Backspace", "z", "z", "z", "z"],
    // The root has a provider, so the empty state is its "No results" row after its 400 ms.
    expect: { text: "No results for “zzzz”" },
    wait: 900,
  },
];

/** /dialogs: each state from a fresh load, with a check that it was reached. */
const DIALOG_STATES = [
  {
    name: "closed",
    run: async () => {},
    reached: async (page) => (await page.locator("dialog[open]").count()) === 0,
  },
  {
    name: "open",
    run: (page) => page.getByRole("button", { name: "Archive pack" }).click(),
    reached: async (page) =>
      (await page.getByRole("alertdialog", { name: "Archive this pack?" }).count()) === 1,
  },
  {
    name: "typed partial",
    run: async (page) => {
      await page.getByRole("button", { name: "Delete pool", exact: true }).click();
      await page.keyboard.type("OWC");
    },
    reached: async (page) => (await page.locator("dialog[open] input").inputValue()) === "OWC",
  },
  {
    name: "pending",
    run: async (page) => {
      await page.getByRole("button", { name: "Revoke key" }).click();
      await page.getByRole("button", { name: "Revoke now" }).click();
    },
    reached: async (page) => (await page.locator("dialog[open] [aria-busy=true]").count()) === 1,
  },
  {
    name: "failed",
    run: async (page) => {
      await page.getByRole("button", { name: "Hand over pool" }).click();
      await page.getByRole("button", { name: "Hand it over" }).click();
      await page.getByRole("alert").filter({ hasText: "peppy already owns 50 pools." }).waitFor();
    },
    reached: async (page) =>
      (await page
        .getByRole("alert")
        .filter({ hasText: "peppy already owns 50 pools." })
        .count()) === 1,
  },
];

/** Set AXE_SHOTS to a directory to save a screenshot per state and width. */
const shots = process.env.AXE_SHOTS;

const waitForServer = async (url, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`${url} did not answer within ${timeoutMs}ms`);
};

console.log("playground: next build");
// --webpack: src/ imports its own files as ".js", which webpack's extensionAlias maps to .ts/.tsx.
execFileSync(next, ["build", "playground", "--webpack"], {
  cwd: root,
  env,
  stdio: ["ignore", "ignore", "inherit"],
});

const server = spawn(next, ["start", "playground", "-p", String(port)], {
  cwd: root,
  env,
  stdio: ["ignore", "ignore", "inherit"],
});
const failures = [];
/** Runs axe on the page as it is and records each violation under `name`. */
const runAxe = async (page, name) => {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  for (const violation of results.violations) {
    const targets = violation.nodes.slice(0, 5).map((node) => `    ${node.target.join(" ")}`);
    failures.push(
      [`${name}: ${violation.id} (${violation.impact}) ${violation.help}`, ...targets].join("\n"),
    );
  }
  console.log(
    `${name}: ${results.violations.length ? `${results.violations.length} violations` : "ok"}`,
  );
};
try {
  await waitForServer(origin, 30000);
  const browser = await chromium.launch();
  for (const [viewportName, options] of Object.entries(CONTEXTS)) {
    const context = await browser.newContext({
      ...options,
      colorScheme: "dark",
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    const response = await page.goto(`${origin}/`, { waitUntil: "load" });
    if (response?.status() !== 200)
      throw new Error(`/ answered ${response?.status() ?? "nothing"}`);
    await page.waitForTimeout(500);
    const query = MEDIA[viewportName];
    if (query && !(await page.evaluate((q) => matchMedia(q).matches, query))) {
      throw new Error(`${viewportName}: the browser doesn't match ${query}`);
    }
    const mod = (await page.evaluate(() => /mac/i.test(navigator.platform))) ? "Meta" : "Control";
    for (const state of STATES) {
      for (const key of state.keys) await page.keyboard.press(key.replace("mod", mod));
      if (state.keys.length > 0) await page.waitForTimeout(state.wait ?? 150);
      const reached = state.expect.missing
        ? (await page.locator(state.expect.missing).count()) === 0
        : state.expect.selector
          ? (await page.locator(state.expect.selector).count()) > 0
          : (await page.getByText(state.expect.text, { exact: true }).count()) > 0;
      if (!reached) throw new Error(`${viewportName} ${state.name}: state not reached`);
      if (shots) {
        await page.screenshot({
          path: path.join(shots, `${viewportName}-${state.name.replace(/\s+/g, "-")}.png`),
        });
      }
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const violation of results.violations) {
        const targets = violation.nodes.slice(0, 5).map((node) => `    ${node.target.join(" ")}`);
        failures.push(
          [
            `${viewportName} ${state.name}: ${violation.id} (${violation.impact}) ${violation.help}`,
            ...targets,
          ].join("\n"),
        );
      }
      console.log(
        `${viewportName} ${state.name}: ${results.violations.length ? `${results.violations.length} violations` : "ok"}`,
      );
      // On a touchscreen every palette row must be a 44px target.
      if (viewportName === "coarse" && state.name === "open") {
        const heights = await page
          .locator("[role=option]")
          .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height));
        if (heights.length === 0) failures.push("coarse open: no [role=option] rows to measure");
        for (const height of heights) {
          if (Math.round(height) < 44)
            failures.push(`coarse open: a palette row is ${height}px, under 44px`);
        }
      }
    }
    // The MDX components: callouts, highlighted code and a wide table in its scroll region.
    const mdx = await page.goto(`${origin}/mdx`, { waitUntil: "load" });
    if (mdx?.status() !== 200) throw new Error(`/mdx answered ${mdx?.status() ?? "nothing"}`);
    await page.waitForTimeout(500);
    if ((await page.locator("[role=note]").count()) === 0) {
      throw new Error(`${viewportName} /mdx: no [role=note], the callouts didn't render`);
    }
    if (shots) await page.screenshot({ path: path.join(shots, `${viewportName}-mdx.png`) });
    const mdxResults = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    for (const violation of mdxResults.violations) {
      const targets = violation.nodes.slice(0, 5).map((node) => `    ${node.target.join(" ")}`);
      failures.push(
        [
          `${viewportName} /mdx: ${violation.id} (${violation.impact}) ${violation.help}`,
          ...targets,
        ].join("\n"),
      );
    }
    console.log(
      `${viewportName} /mdx: ${mdxResults.violations.length ? `${mdxResults.violations.length} violations` : "ok"}`,
    );
    // The 0.13.0 surfaces: as rendered, then after a copy and a SegmentedControl pick.
    const surfaces = await page.goto(`${origin}/surfaces`, { waitUntil: "load" });
    if (surfaces?.status() !== 200)
      throw new Error(`/surfaces answered ${surfaces?.status() ?? "nothing"}`);
    await page.waitForTimeout(500);
    if ((await page.locator("[data-card-link]").count()) === 0) {
      throw new Error(`${viewportName} /surfaces: no [data-card-link], LinkCard didn't render`);
    }
    await runAxe(page, `${viewportName} /surfaces`);
    await page.getByRole("button", { name: "Copy", exact: true }).click();
    await page.locator("label", { hasText: "Grid" }).click();
    await page.waitForTimeout(150);
    const copied =
      (await page.locator("output", { hasText: /Copied\.|Couldn't copy/ }).count()) > 0;
    const picked = (await page.locator("input[type=radio][value=grid]:checked").count()) > 0;
    if (!copied || !picked)
      throw new Error(`${viewportName} /surfaces after copy: state not reached`);
    if (shots) await page.screenshot({ path: path.join(shots, `${viewportName}-surfaces.png`) });
    await runAxe(page, `${viewportName} /surfaces after copy`);
    // /dialogs: ConfirmDialog closed, open, part-typed, pending and failed.
    for (const state of DIALOG_STATES) {
      const loaded = await page.goto(`${origin}/dialogs`, { waitUntil: "load" });
      if (loaded?.status() !== 200) {
        throw new Error(`/dialogs answered ${loaded?.status() ?? "nothing"}`);
      }
      await page.waitForTimeout(300);
      await state.run(page);
      // Past the 150 ms open fade, so contrast is measured at full opacity.
      await page.waitForTimeout(400);
      if (!(await state.reached(page))) {
        throw new Error(`${viewportName} /dialogs ${state.name}: state not reached`);
      }
      if (shots) {
        await page.screenshot({
          path: path.join(shots, `${viewportName}-dialogs-${state.name.replace(/\s+/g, "-")}.png`),
        });
      }
      await runAxe(page, `${viewportName} /dialogs ${state.name}`);
    }
    await context.close();
  }
  // Forced colors: the current-state underlines must survive the system palette.
  // CONTEXTS (0.12.0) replaced VIEWPORTS: take the desktop viewport from it.
  const forced = await browser.newContext({
    viewport: CONTEXTS.desktop.viewport,
    colorScheme: "dark",
    forcedColors: "active",
  });
  const forcedPage = await forced.newPage();
  await forcedPage.goto(`${origin}/surfaces`, { waitUntil: "load" });
  await forcedPage.waitForTimeout(500);
  const underlined = async (selector) =>
    forcedPage
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
  for (const [selector, what] of [
    ['nav[aria-label="Changelog filter"] a[aria-current="page"]', "the current LinkRow link"],
    ["label:has(input[value=list]:checked)", "the checked SegmentedControl option"],
  ]) {
    const line = await underlined(selector);
    if (!line.includes("underline"))
      failures.push(`forced colors /surfaces: ${what} has no underline (${line})`);
  }
  await runAxe(forcedPage, "forced colors /surfaces");
  await forced.close();
  await browser.close();
} finally {
  server.kill();
}
if (failures.length > 0) {
  console.error(`\n${failures.join("\n")}\n\n${failures.length} axe violations`);
  process.exit(1);
}
console.log("\nplayground: no axe violations");
