/**
 * @file scripts/consumer-media.mjs
 * @desc The consumer check's media pass: opens the built fixture at / under a coarse pointer, more
 *       contrast, reduced motion and forced colors, and measures what jsdom can't: a Button in a
 *       flex column keeps its content width, Button md and a TextInput are 44px tall with 16px
 *       input text on a coarse pointer, a Textarea keeps at least its 96px (6rem) minimum height
 *       on a coarse pointer instead of shrinking to the field look's 44px, c4 is lighter and Card
 *       has an inset ring under more contrast, transitions take 0.01ms under reduced motion except
 *       inside data-motion="essential", a Button keeps a 1px border in forced colors, and download
 *       links are plain <a download> that the page never prefetches. Each context first checks
 *       that the browser really matches its media query, so a pass means the state was measured.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

const DESKTOP = { viewport: { width: 1280, height: 900 }, colorScheme: "dark" };

/** The contexts axe also runs on / (check-consumer.mjs imports this). */
export const MEDIA_CONTEXTS = {
  coarse: {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
  },
  contrast: { ...DESKTOP, contrast: "more" },
  motion: { ...DESKTOP, reducedMotion: "reduce" },
};

const FORCED = { ...DESKTOP, forcedColors: "active" };
const DOWNLOADS = ["/files/export.json", "/brand/palette.json"];

/**
 * @function toMs
 * @param value {string} a computed transition-duration ("0.15s", "1e-05s", "150ms", a list)
 * @returns {number} the first duration in milliseconds
 */
export const toMs = (value) => {
  const first = value.split(",")[0]?.trim() ?? "";
  return first.endsWith("ms") ? Number.parseFloat(first) : Number.parseFloat(first) * 1000;
};

/**
 * @function luminanceOf
 * @param rgb {string} a computed color ("rgb(r, g, b)" or "rgba(...)")
 * @returns {number} its relative luminance
 */
export const luminanceOf = (rgb) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map((n) => {
    const c = Number(n) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
};

/** Everything the pass reads from one page, in one evaluate. */
const read = (page) =>
  page.evaluate(() => {
    const el = (check) => document.querySelector(`[data-check="${check}"]`);
    const style = (node) => (node ? getComputedStyle(node) : null);
    const box = (node) => node?.getBoundingClientRect() ?? null;
    const button = el("button");
    const input = el("input");
    const textarea = el("textarea");
    return {
      stackWidth: box(el("stack"))?.width ?? 0,
      buttonWidth: box(button)?.width ?? 0,
      buttonHeight: box(button)?.height ?? 0,
      buttonTransition: style(button)?.transitionDuration ?? "",
      buttonBorder: style(button)?.borderTopWidth ?? "",
      essentialTransition: style(el("essential"))?.transitionDuration ?? "",
      inputHeight: box(input)?.height ?? 0,
      inputFont: style(input)?.fontSize ?? "",
      textareaHeight: box(textarea)?.height ?? 0,
      c4: style(el("c4"))?.color ?? "",
      cardShadow: style(el("card"))?.boxShadow ?? "",
      motionText: el("motion")?.textContent ?? "",
      downloads: [...document.querySelectorAll("a[download]")].map((a) => a.getAttribute("href")),
    };
  });

/** Opens / in a fresh context, scrolls the downloads into view, and returns what it read. */
const visit = async (browser, origin, options, query) => {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(new URL(request.url()).pathname));
  try {
    await page.goto(`${origin}/`, { waitUntil: "load" });
    await page.locator('[data-check="downloads"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const matches = query ? await page.evaluate((q) => matchMedia(q).matches, query) : true;
    return { matches, requests, values: await read(page) };
  } finally {
    await context.close();
  }
};

/**
 * @function mediaPass
 * @param browser {import("playwright").Browser} a launched Chromium
 * @param origin {string} the served fixture app
 * @returns {Promise<string[]>} one failure line per broken expectation, or none
 */
export const mediaPass = async (browser, origin) => {
  const failures = [];
  const fail = (line) => failures.push(`media: ${line}`);

  const base = await visit(browser, origin, DESKTOP, null);
  const v = base.values;
  if (!(v.buttonWidth > 0 && v.buttonWidth < v.stackWidth)) {
    fail(`a Button in a flex column is ${v.buttonWidth}px in a ${v.stackWidth}px column (w-fit)`);
  }
  if (Math.round(toMs(v.buttonTransition)) !== 150)
    fail(`Button transition is ${v.buttonTransition}, not 150ms`);
  if (v.motionText !== "Motion allowed.") fail(`useMotionAllowed island says "${v.motionText}"`);
  for (const href of DOWNLOADS) {
    if (!v.downloads.includes(href)) fail(`${href} is not an <a download>`);
    if (base.requests.includes(href)) fail(`${href} was requested (prefetched) without a click`);
  }

  const coarse = await visit(browser, origin, MEDIA_CONTEXTS.coarse, "(pointer: coarse)");
  if (!coarse.matches) fail("the coarse context doesn't match (pointer: coarse)");
  if (Math.round(coarse.values.buttonHeight) !== 44) {
    fail(`Button md is ${coarse.values.buttonHeight}px on a coarse pointer, not 44px`);
  }
  if (Math.round(coarse.values.inputHeight) < 44) {
    fail(`TextInput is ${coarse.values.inputHeight}px on a coarse pointer, under 44px`);
  }
  if (coarse.values.inputFont !== "16px")
    fail(`TextInput text is ${coarse.values.inputFont} on a coarse pointer`);
  if (Math.round(coarse.values.textareaHeight) < 96) {
    fail(`Textarea is ${coarse.values.textareaHeight}px on a coarse pointer, under 96px (6rem)`);
  }

  const contrast = await visit(
    browser,
    origin,
    MEDIA_CONTEXTS.contrast,
    "(prefers-contrast: more)",
  );
  if (!contrast.matches) fail("the contrast context doesn't match (prefers-contrast: more)");
  if (!(luminanceOf(contrast.values.c4) > luminanceOf(v.c4))) {
    fail(`text-c4 is ${contrast.values.c4} under more contrast, not lighter than ${v.c4}`);
  }
  if (!contrast.values.cardShadow.includes("inset")) {
    fail(`Card has no inset ring under more contrast (box-shadow ${contrast.values.cardShadow})`);
  }

  const motion = await visit(
    browser,
    origin,
    MEDIA_CONTEXTS.motion,
    "(prefers-reduced-motion: reduce)",
  );
  if (!motion.matches) fail("the motion context doesn't match (prefers-reduced-motion: reduce)");
  if (toMs(motion.values.buttonTransition) > 0.011) {
    fail(`Button transition is ${motion.values.buttonTransition} under reduced motion, not 0.01ms`);
  }
  if (Math.round(toMs(motion.values.essentialTransition)) !== 150) {
    fail(`data-motion="essential" Button is ${motion.values.essentialTransition}, not 150ms`);
  }
  if (motion.values.motionText !== "Motion reduced or unknown.") {
    fail(`useMotionAllowed island says "${motion.values.motionText}" under reduced motion`);
  }

  const forced = await visit(browser, origin, FORCED, "(forced-colors: active)");
  if (!forced.matches) fail("the forced-colors context doesn't match (forced-colors: active)");
  if (forced.values.buttonBorder !== "1px") {
    fail(`Button border is ${forced.values.buttonBorder} in forced colors, not 1px`);
  }

  return failures;
};
