/**
 * @file scripts/axe-playground.mjs
 * @desc Builds the playground (the Next app in playground/ that imports src/ directly), serves it,
 *       and runs axe-core in headless Chromium over the command palette's states on / at a desktop
 *       and a phone width, on a touch phone (rows measured at 44px) and under more contrast, color
 *       contrast on: closed, open, a nested page, an argument prompt and no results. Then it runs
 *       the same pass over /mdx (the MDX components: callouts, Shiki code blocks, a wide table) at
 *       both widths. The jsdom tests can't see contrast or scrollable regions, and the consumer
 *       check only sees closed pages. Prints one line per violation (with up to five targets) and
 *       exits 1 on any. Usage: `bun run play:axe` (CI runs it after the consumer check; Chromium is
 *       installed for that).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
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
try {
  await waitForServer(origin, 30000);
  const browser = await chromium.launch();
  for (const [viewportName, options] of Object.entries(CONTEXTS)) {
    const context = await browser.newContext({ ...options, colorScheme: "dark" });
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
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
if (failures.length > 0) {
  console.error(`\n${failures.join("\n")}\n\n${failures.length} axe violations`);
  process.exit(1);
}
console.log("\nplayground: no axe violations");
