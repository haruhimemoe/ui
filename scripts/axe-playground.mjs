/**
 * @file scripts/axe-playground.mjs
 * @desc Builds the playground (the Next app in playground/ that imports src/ directly), serves
 *       it, and runs axe-core in headless Chromium over the command palette's states on / at a
 *       desktop and a phone width, color contrast on: closed, open, a nested page, an argument
 *       prompt and no results. The jsdom tests can't see contrast or scrollable regions, and the
 *       consumer check only sees the closed page. Prints one line per violation (with up to five
 *       targets) and exits 1 on any. Usage: `bun run play:axe` (CI runs it after the consumer
 *       check; Chromium is installed for that).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
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

const VIEWPORTS = { desktop: { width: 1280, height: 900 }, phone: { width: 390, height: 844 } };
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
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({ viewport, colorScheme: "dark" });
    const page = await context.newPage();
    const response = await page.goto(`${origin}/`, { waitUntil: "load" });
    if (response?.status() !== 200)
      throw new Error(`/ answered ${response?.status() ?? "nothing"}`);
    await page.waitForTimeout(500);
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
    }
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
