/**
 * @file scripts/check-consumer.mjs
 * @desc Builds and packs the package, installs the tarball into a throwaway Next.js 16 + Tailwind 4
 *       app (app router, Nunito from next/font, the two CSS imports) at this repo's pinned
 *       versions, renders one static page with every exported component, and runs `next build`. It
 *       then checks that the build passed, that the emitted CSS holds classes only the library uses
 *       (so the theme's @source line works), and that the page prerendered with client components
 *       inside, including a data-only FilterPanel straight from the Server Component page, and a
 *       NavLinks with no internal link that renders on the server alone. Header-only pages check
 *       what the README says about the nav: the client list loads no tailwind-merge; with only
 *       external and text-only links nothing hydrates beyond a bare page's Next modules; a relative
 *       href skips the client list but hydrates next/link; and NavLinks in an app's own Client
 *       Component brings tailwind-merge. An MDX page (@next/mdx, remark-gfm and the package's
 *       remark plugin) checks callouts, Shiki highlighting, heading ids and the table's scroll
 *       region. Before the build, plain Node imports the installed package and its ./mdx, ./remark
 *       and ./shiki entry points, the way Vitest in a consuming app does. After the build it serves
 *       the app and runs axe-core in headless Chromium over / and /mdx at a desktop and a phone
 *       width with color contrast on (the jsdom tests can't check contrast), WCAG 2.2 AA plus best
 *       practices. It then runs axe again on / under a coarse pointer, more contrast and reduced
 *       motion, and the media pass in scripts/consumer-media.mjs. It also checks the 0.13.0 layout
 *       pieces on / (Surface, LinkCard with CardLink, CardGrid, StatList, LinkRow, SectionHeading
 *       with its anchor, Progress, EmptyState, PrevNext, CopyField and SegmentedControl) and the CSS
 *       for LinkCard's `:not([data-card-link])` lift selector, plus a standalone /code-chip page
 *       that checks CodeChip's copy button loads no tailwind-merge. Last, it removes shiki (an
 *       optional peer) and the fixture's `import "@haruhimemoe/ui/shiki"` lines and builds again:
 *       /mdx must still prerender, with plain code. Usage: `node scripts/check-consumer.mjs
 *       [--keep]` (--keep leaves the app in the temp dir). Needs the npm registry and Google Fonts.
 *       The app's source lives in scripts/consumer-fixture/ as real files; this script writes only
 *       the config that depends on the pins and the temp dir, then runs the build and the
 *       assertions.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Oct 5, 2026
 */

import { execFileSync, spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
// biome-ignore lint/correctness/useImportExtensions: forceJsExtensions would point this at a .js file that does not exist.
import { MEDIA_CONTEXTS, mediaPass } from "./consumer-media.mjs";

const keep = process.argv.includes("--keep");
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const pin = (name) => {
  const version = pkg.devDependencies[name];
  if (!version) throw new Error(`no pinned version for ${name} in package.json`);
  return version;
};

// The real path: on macOS the temp dir sits behind a symlink, and Turbopack's root must match.
const dir = realpathSync(mkdtempSync(path.join(tmpdir(), "ui-consumer-")));
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
const run = (command, args, cwd = dir) =>
  execFileSync(command, args, { cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const write = (file, text) => {
  mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  writeFileSync(path.join(dir, file), text);
};

/**
 * A prerendered route's HTML, the JavaScript its script tags load, and the ids of the client
 * modules its RSC payload references (the `I[id,...]` rows: what hydrates), or null if it's
 * missing.
 */
const readRoute = (name) => {
  const file = path.join(dir, ".next", "server", "app", `${name}.html`);
  if (!existsSync(file)) return null;
  const html = readFileSync(file, "utf8");
  const scripts = [...html.matchAll(/<script src="\/_next\/([^"?]+\.js)/g)].map((match) =>
    readFileSync(path.join(dir, ".next", match[1]), "utf8"),
  );
  const clients = new Set([...html.matchAll(/:I\[(\d+),/g)].map((match) => match[1]));
  return { html, scripts, clients };
};

// A class group name from tailwind-merge's default config: in a chunk, it means tailwind-merge.
const TAILWIND_MERGE = "fvn-normal";

/** Every CSS file under a directory, read and joined. */
const readCss = (from) =>
  readdirSync(from, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => readFileSync(path.join(entry.parentPath, entry.name), "utf8"))
    .join("\n");

// The consumer's own source must not use these classes, so finding them in the CSS proves they
// came from the package through the theme's @source line.
const LIBRARY_CLASSES = [
  [".w-18", "RangeSlider's value boxes"],
  [".px-2\\.5", "Chip"],
  [".bg-b6", "the header, footer and fields"],
  [".text-c3", "labels and nav links"],
  [".coarse\\:h-11", "Button md on a coarse pointer"],
  [".contrast-more\\:inset-ring", "the contrast edges"],
  [".forced-colors\\:border", "the forced-colors borders"],
];

/** Browser axe: the widths checked and the rules run. Contrast is on here, unlike in jsdom. */
const AXE_VIEWPORTS = { desktop: { width: 1280, height: 900 }, phone: { width: 390, height: 844 } };
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/** Polls a URL until it answers, or throws after the timeout. */
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

/** The routes the browser axe pass checks. */
const AXE_ROUTES = ["/", "/mdx"];

/**
 * Serves the built app and runs axe over each route at each width. Returns one failure line per
 * violation (with up to five targets), or none.
 */
const axePass = async () => {
  const port = Number(process.env.AXE_PORT ?? 3986);
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    path.join(dir, "node_modules", ".bin", "next"),
    ["start", "-p", String(port)],
    {
      cwd: dir,
      env,
      stdio: ["ignore", "ignore", "inherit"],
    },
  );
  const lines = [];
  try {
    await waitForServer(origin, 30000);
    const browser = await chromium.launch();
    for (const route of AXE_ROUTES) {
      for (const [name, viewport] of Object.entries(AXE_VIEWPORTS)) {
        const context = await browser.newContext({ viewport, colorScheme: "dark" });
        const page = await context.newPage();
        // "load", not "networkidle": the page keeps a connection open, so idle never comes.
        const response = await page.goto(`${origin}${route}`, { waitUntil: "load" });
        await page.waitForTimeout(500);
        if (response?.status() !== 200)
          throw new Error(`${route} answered ${response?.status() ?? "nothing"}`);
        const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        for (const violation of results.violations) {
          const targets = violation.nodes.slice(0, 5).map((node) => `    ${node.target.join(" ")}`);
          lines.push(
            [
              `axe ${name} ${route}: ${violation.id} (${violation.impact}) ${violation.help}`,
              ...targets,
            ].join("\n"),
          );
        }
        await context.close();
      }
    }
    // The same axe pass on / under the media a visitor can ask for: coarse targets are measured
    // at 44px there, and more contrast changes every text color.
    for (const [name, options] of Object.entries(MEDIA_CONTEXTS)) {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      await page.goto(`${origin}/`, { waitUntil: "load" });
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      for (const violation of results.violations) {
        const targets = violation.nodes.slice(0, 5).map((node) => `    ${node.target.join(" ")}`);
        lines.push(
          [
            `axe ${name} /: ${violation.id} (${violation.impact}) ${violation.help}`,
            ...targets,
          ].join("\n"),
        );
      }
      await context.close();
    }
    lines.push(...(await mediaPass(browser, origin)));
    await browser.close();
  } finally {
    server.kill();
  }
  return lines;
};

// The fixture app's pages, layout and stylesheet: real files that Biome lints and
// `bun run typecheck` checks (scripts/consumer-fixture/tsconfig.json maps the package to src/).
const FIXTURE = path.join(root, "scripts", "consumer-fixture", "src");
/** The fixture files that register Shiki: the no-Shiki build strips the import from these. */
const SHIKI_IMPORTERS = ["src/mdx-components.tsx", "src/app/MdxExports.tsx"];

try {
  console.log("consumer: building and packing");
  run("bun", ["run", "build"], root);
  const tarball = run("npm", ["pack", "--silent", "--pack-destination", dir], root).trim();

  write(
    "package.json",
    `${JSON.stringify(
      {
        name: "ui-consumer",
        private: true,
        type: "module",
        dependencies: {
          "@haruhimemoe/ui": `file:./${tarball}`,
          next: pin("next"),
          react: pin("react"),
          "react-dom": pin("react-dom"),
          shiki: pin("shiki"),
        },
        devDependencies: {
          "@mdx-js/loader": pin("@mdx-js/loader"),
          "@mdx-js/react": pin("@mdx-js/react"),
          "@next/mdx": pin("@next/mdx"),
          "@tailwindcss/postcss": pin("@tailwindcss/postcss"),
          "@types/node": pin("@types/node"),
          "@types/react": pin("@types/react"),
          "@types/mdx": pin("@types/mdx"),
          "@types/react-dom": pin("@types/react-dom"),
          "remark-gfm": pin("remark-gfm"),
          tailwindcss: pin("tailwindcss"),
          typescript: pin("typescript"),
        },
      },
      null,
      2,
    )}\n`,
  );
  write(
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["dom", "dom.iterable", "esnext"],
          strict: true,
          exactOptionalPropertyTypes: true,
          noEmit: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "react-jsx",
          skipLibCheck: true,
          allowJs: true,
          esModuleInterop: true,
          incremental: true,
          plugins: [{ name: "next" }],
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2,
    )}\n`,
  );
  // @next/mdx has no GFM: without remark-gfm the fixture's pipe table stays a paragraph.
  // Turbopack takes MDX plugins only as module names, so the library's is a default export.
  write(
    "next.config.mjs",
    [
      'import createMDX from "@next/mdx";',
      "const withMDX = createMDX({",
      "  extension: /\\.mdx?$/,",
      '  options: { remarkPlugins: ["remark-gfm", "@haruhimemoe/ui/remark"] },',
      "});",
      "export default withMDX({",
      '  pageExtensions: ["ts", "tsx", "md", "mdx"],',
      `  turbopack: { root: ${JSON.stringify(dir)} },`,
      "});",
      "",
    ].join("\n"),
  );
  write("postcss.config.mjs", `export default { plugins: { "@tailwindcss/postcss": {} } };\n`);
  cpSync(FIXTURE, path.join(dir, "src"), { recursive: true });

  console.log(`consumer: installing into ${dir}`);
  run("bun", ["install", "--no-progress"]);

  // Node's ESM resolver, as Vitest uses for node_modules: every import in dist must resolve.
  console.log("consumer: importing the package in plain Node");
  const imported = JSON.parse(
    run("node", [
      "--input-type=module",
      "-e",
      [
        'const ui = await import("@haruhimemoe/ui");',
        'const mdx = await import("@haruhimemoe/ui/mdx");',
        'const remark = await import("@haruhimemoe/ui/remark");',
        'await import("@haruhimemoe/ui/shiki");',
        "console.log(JSON.stringify({ ui: Object.keys(ui), mdx: Object.keys(mdx),",
        "  remark: typeof remark.default }));",
      ].join(" "),
    ]),
  );
  const exported = [...imported.ui, ...imported.mdx];
  if (!(imported.ui.length > 20))
    throw new Error(`Node imported only ${imported.ui.length} exports`);
  if (imported.mdx.length < 5) throw new Error(`Node imported only ${imported.mdx} from ./mdx`);
  if (imported.remark !== "function") {
    throw new Error(`./remark's default export is a ${imported.remark}, not a plugin function`);
  }
  // Every runtime export has to appear in the fixture, so a new component gets built here too.
  const fixtureText = readdirSync(FIXTURE, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .map((entry) => readFileSync(path.join(entry.parentPath, entry.name), "utf8"))
    .join("\n");
  // Both entry points count: src/index.ts's and src/mdx.ts's runtime exports.
  const unused = exported.filter((name) => !new RegExp(`\\b${name}\\b`).test(fixtureText));
  if (unused.length > 0) {
    throw new Error(`scripts/consumer-fixture renders no ${unused.join(", ")}: add them`);
  }

  console.log("consumer: next build");
  const build = run(path.join(dir, "node_modules", ".bin", "next"), ["build"]);

  const failures = [];
  const css = readCss(path.join(dir, ".next", "static"));
  if (!css) failures.push("no CSS emitted under .next/static");
  for (const [selector, from] of LIBRARY_CLASSES) {
    if (!css.includes(selector)) failures.push(`CSS is missing ${selector} (${from})`);
  }
  if (!css.includes("--hue")) failures.push("CSS is missing the theme's --hue palette");
  if (!css.includes("--h2-l")) failures.push("CSS is missing the --h2-l lightness override");
  if (!css.includes("--contrast-lift")) failures.push("CSS is missing --contrast-lift");
  if (!css.includes("prefers-reduced-motion"))
    failures.push("CSS is missing the reduced-motion rule");
  // LinkCard's lift (CARD_LINK_LIFT) is one arbitrary variant: if a Tailwind upgrade stops
  // generating it, links and buttons inside a LinkCard fall under the card link's cover.
  if (!css.includes(":not([data-card-link])")) {
    failures.push(
      "CSS is missing LinkCard's lift selector :not([data-card-link]) (CARD_LINK_LIFT)",
    );
  }

  const index = readRoute("index");
  if (!index) {
    failures.push("/ did not prerender (.next/server/app/index.html is missing)");
  } else {
    const page = index.html;
    // Markup only the named component renders: props also show up in the RSC payload, and
    // Pagination's status span carries aria-current too, so plain strings could match elsewhere.
    const expected = [
      [/>Consumer check<\/h1>/, "PageHeader"],
      [/>Page 2 of 3<\/span>/, "Pagination"],
      [/>Copy link<\/button>/, "CopyButton (client)"],
      [/<input[^>]*aria-label="Minimum Star rating"/, "RangeSlider (client)"],
      [/<button[^>]*aria-pressed="true"/, "Chip (client)"],
      [/>12 packs<\/output>/, "FilterPanel (client)"],
      [/>3 maps<\/output>/, "FilterPanel from the Server Component page (client)"],
      [
        /<a\b(?=[^>]*aria-current="page")(?=[^>]*href="\/")[^>]*>/,
        "NavLinks marking the current page (client)",
      ],
      [
        /<a[^>]*href="https:\/\/osu\.ppy\.sh\/wiki"[^>]*>osu! wiki<\/a>/,
        "NavLinks on the server alone",
      ],
      [/<script type="application\/ld\+json">/, "JsonLd"],
      [/<a\b(?=[^>]*href="\/docs")(?=[^>]*class="[^"]*text-h1)[^>]*>the docs<\/a>/, "TextLink"],
      [
        /<a\b(?=[^>]*href="https:\/\/osu\.ppy\.sh")(?=[^>]*rel="noreferrer")[^>]*>osu!<\/a>/,
        "TextLink off-site",
      ],
      [/<span[^>]*class="[^"]*amber[^"]*"[^>]*>Unranked<\/span>/, "Badge"],
      [/<caption id="[^"]+" class="sr-only">Slots<\/caption>/, "Table with a hidden caption"],
      [/<th[^>]*scope="row"[^>]*>NM1<\/th>/, "Th as a row header"],
      [/>Delete pack<\/button>/, "InlineConfirm (client)"],
      [/<a[^>]*href="mailto:haruhime@haruhime\.moe"/, "BrandPage"],
      [/<span class="font-mono text-c3 text-sm">#ff66ab<\/span>/, "BrandSwatch (client)"],
      [/>Refresh pages<\/button>/, "AsyncButton (client)"],
      [/<button[^>]*aria-expanded="false"[^>]*>Download options/, "Disclosure (client)"],
      [/aria-live="polite"[^>]*>Page 2<\/span>/, "Pagination buttons (client)"],
      [/<input[^>]*type="radio"[^>]*class="sr-only"/, "ChoiceChips (client)"],
      [
        /<button[^>]*aria-disabled="true"[^>]*title="EZ can&#x27;t go with HR\."/,
        "Chip unavailable (client)",
      ],
      [/<legend[^>]*>Who can see this pool<\/legend>/, "RadioGroup (client)"],
      [/>Type OWC 2026 to confirm<\/label>/, "TypeToConfirm (client)"],
      [/>Delete pool<\/button>/, "ConfirmDialog (client)"],
      [/<dialog[^>]*aria-label="Consumer dialog"/, "Dialog (client)"],
      [/<nav aria-label="What to search"/, "LinkTabs"],
      [/<span class="sr-only">5\.23<!-- --> <!-- -->stars/, "StarRating"],
      [
        /<abbr title="Approach rate"><span aria-hidden="true">AR<\/span><span class="sr-only">Approach rate<\/span><\/abbr>/,
        "BeatmapStats",
      ],
      [/<span[^>]*class="[^"]*bg-amber-300[^"]*"[^>]*>HD2<\/span>/, "ModBadge"],
      [/<a\b[^>]*href="https:\/\/osu\.ppy\.sh\/users\/2"[^>]*>peppy<\/a>/, "PlayerCard"],
      [/<button[^>]*aria-expanded="false"[^>]*>peppy<\/button>/, "HeaderMenu (client)"],
      [
        /<a\b(?=[^>]*href="https:\/\/discord\.gg\/example")(?=[^>]*aria-label="Discord")[^>]*><svg\b[^>]*viewBox="0 0 24 24"/,
        "SiteFooter's Discord link with DiscordIcon",
      ],
      [
        /<a\b(?=[^>]*href="\/files\/export\.json")(?=[^>]*download="")[^>]*>Download my data<\/a>/,
        "ButtonLink download",
      ],
      [
        /<a\b(?=[^>]*href="\/brand\/palette\.json")(?=[^>]*download="palette\.json")[^>]*>Download palette \(JSON\)<\/a>/,
        "TextLink download",
      ],
      [
        /<label[^>]*class="[^"]*sr-only[^"]*"[^>]*>Hidden label input<\/label>/,
        "TextInput hideLabel",
      ],
      [/<span[^>]*class="[^"]*bg-fuchsia-400[^"]*"[^>]*>fuchsia<\/span>/, "ModBadge color"],
      [
        /<output class="text-emerald-300 contrast-more:text-emerald-200 text-sm">Saved\.<\/output>/,
        "textClasses",
      ],
      [
        /<span class="text-rose-300 contrast-more:text-rose-200 text-sm font-bold">Bold error span\.<\/span>/,
        "Text as span",
      ],
      [
        /<a\b(?=[^>]*data-card-link="")(?=[^>]*href="\/docs")[^>]*>packs<\/a>/,
        "LinkCard with CardLink",
      ],
      [/<h2\b(?=[^>]*id="recent-packs")(?=[^>]*scroll-mt-20)[^>]*>Recent packs/, "SectionHeading"],
      [
        /<a\b(?=[^>]*href="#recent-packs")(?=[^>]*aria-label="Link to section: Recent packs")[^>]*>#<\/a>/,
        "SectionHeading anchor",
      ],
      [/<li\b(?=[^>]*class="[^"]*\bp-3\b)[^>]*>Surface item<\/li>/, "Surface"],
      [/<li class="[^"]*\[&amp;&gt;\*\]:w-full[^"]*">/, "CardGrid"],
      [/<dt class="text-c4 text-xs">Maps<\/dt>/, "StatList"],
      [/<nav aria-label="Changelog filter"/, "LinkRow"],
      [/<progress\b(?=[^>]*value="0.5")[^>]*>/, "Progress"],
      [/<progress\b(?![^>]*\svalue=)(?=[^>]*aria-label="Loading")[^>]*>/, "Progress indeterminate"],
      [/<nav aria-label="More guides"/, "PrevNext"],
      [/<div\b(?=[^>]*border-dashed)[^>]*><p[^>]*>Nothing here<\/p>No maps yet\./, "EmptyState"],
      [/<code class="[^"]*bg-b6[^"]*">bun add @haruhimemoe\/ui<\/code>/, "CodeChip"],
      [/<button\b[^>]*aria-label="Copy bun add @haruhimemoe\/ui"/, "CodeChip copy button (client)"],
      [/<input\b(?=[^>]*readOnly="")(?=[^>]*value="PACKKEY123")[^>]*>/, "CopyField (client)"],
      [
        /<input\b(?=[^>]*type="radio")(?=[^>]*value="fit")(?=[^>]*checked="")[^>]*>/,
        "SegmentedControl (client)",
      ],
    ];
    for (const [pattern, from] of expected) {
      if (!pattern.test(page)) failures.push(`prerendered / is missing ${pattern} (${from})`);
    }
    // CopyButton and the filters merge classes in the browser, so / must show the marker. If it
    // doesn't, the /header check below can't see tailwind-merge either.
    if (!index.scripts.some((js) => js.includes(TAILWIND_MERGE))) {
      failures.push(
        `/ loads no script with "${TAILWIND_MERGE}"; the tailwind-merge marker is stale`,
      );
    }
  }

  const header = readRoute("header");
  if (!header) {
    failures.push("/header did not prerender");
  } else {
    if (!/<a\b(?=[^>]*aria-current="page")(?=[^>]*href="\/header")[^>]*>/.test(header.html)) {
      failures.push("/header is missing its current link (the nav's client list)");
    }
    if (header.scripts.some((js) => js.includes(TAILWIND_MERGE))) {
      failures.push("/header loads tailwind-merge; the nav's client list must not");
    }
  }

  // CodeChip is a Server Component whose copy button is CodeBlock's finished-class client file.
  const codeChip = readRoute("code-chip");
  if (!codeChip) {
    failures.push("/code-chip did not prerender");
  } else {
    if (!/aria-label="Copy bun add @haruhimemoe\/ui"/.test(codeChip.html)) {
      failures.push("/code-chip is missing CodeChip's copy button");
    }
    if (codeChip.scripts.some((js) => js.includes(TAILWIND_MERGE))) {
      failures.push("/code-chip loads tailwind-merge; CodeChip's copy button must not");
    }
  }

  const bare = readRoute("bare");
  if (!bare) failures.push("/bare did not prerender");
  /** The client modules a route references beyond Next's own (those of /bare). */
  const hydrated = (route) => [...route.clients].filter((id) => !bare?.clients.has(id));

  // External and text-only links: the README says nothing in the nav hydrates.
  const offsite = readRoute("offsite");
  if (!offsite) {
    failures.push("/offsite did not prerender");
  } else {
    if (offsite.html.includes("NavListClient")) {
      failures.push("/offsite references NavListClient, though none of its links can be current");
    }
    if (bare && hydrated(offsite).length > 0) {
      failures.push(
        `/offsite hydrates client modules ${hydrated(offsite).join(", ")}, though its nav has only external and text-only links`,
      );
    }
  }

  // A relative href can't be current either, so the nav skips the client list. The README says
  // the link is still next/link, which hydrates.
  const relative = readRoute("relative");
  if (!relative) {
    failures.push("/relative did not prerender");
  } else {
    if (relative.html.includes("NavListClient")) {
      failures.push("/relative references NavListClient, though none of its links can be current");
    }
    if (bare && hydrated(relative).length === 0) {
      failures.push(
        "/relative hydrates nothing, but the README says its next/link does: update the README",
      );
    }
  }

  // NavLinks in an app's own Client Component merges its classes in the browser. The README
  // says tailwind-merge ships with it there.
  const clientNav = readRoute("client-nav");
  if (!clientNav) {
    failures.push("/client-nav did not prerender");
  } else {
    if (
      !/<a\b(?=[^>]*aria-current="page")(?=[^>]*href="\/client-nav")[^>]*>/.test(clientNav.html)
    ) {
      failures.push("/client-nav is missing its current link (NavLinks in a Client Component)");
    }
    if (!clientNav.scripts.some((js) => js.includes(TAILWIND_MERGE))) {
      failures.push(
        "/client-nav loads no tailwind-merge, but the README says NavLinks in a Client Component brings it: update the README",
      );
    }
  }

  // The MDX page: @next/mdx with remark-gfm and the library's remark plugin, built by Turbopack.
  const mdx = readRoute("mdx");
  if (!mdx) {
    failures.push("/mdx did not prerender (.next/server/app/mdx.html is missing)");
  } else {
    const html = mdx.html;
    const notes = html.match(/role="note"/g)?.length ?? 0;
    if (notes !== 3) {
      failures.push(`/mdx has ${notes} role="note", not 3 (two > [!…] callouts and a <Callout>)`);
    }
    const marked = html.match(/data-highlighted=""/g)?.length ?? 0;
    if (marked !== 1) failures.push(`/mdx has ${marked} data-highlighted lines, not 1 ({2})`);
    if (!html.includes("var(--shiki-token-")) {
      failures.push("/mdx has no var(--shiki-token-: Shiki didn't highlight the ts fence");
    }
    if (!html.includes('aria-label="Code: pool.ts"')) {
      failures.push('/mdx is missing aria-label="Code: pool.ts" (the fence title)');
    }
    for (const id of ["usage", "usage-1"]) {
      if (!html.includes(`id="${id}"`)) failures.push(`/mdx is missing id="${id}" (heading ids)`);
    }
    const brainfuck = /aria-label="Code: brainfuck"[^>]*>([\s\S]*?)<\/pre>/.exec(html);
    if (!brainfuck) {
      failures.push('/mdx is missing aria-label="Code: brainfuck" (an unknown language)');
    } else if (brainfuck[1]?.includes("--shiki-token")) {
      failures.push("/mdx colors the brainfuck block, which Shiki doesn't load");
    }
    if (!/<div(?=[^>]*role="group")(?=[^>]*aria-label="Table")[^>]*>\s*<table/.test(html)) {
      failures.push('/mdx is missing the table\'s role="group" aria-label="Table" scroll region');
    }
  }

  console.log("consumer: axe in Chromium, contrast on");
  failures.push(...(await axePass()));

  // An app without Shiki (an optional peer) must still build, with plain code blocks.
  if (failures.length === 0) {
    console.log("consumer: next build without shiki");
    run("bun", ["remove", "shiki"]);
    // An app without Shiki doesn't register it either: drop the side-effect import.
    for (const file of SHIKI_IMPORTERS) {
      const text = readFileSync(path.join(dir, file), "utf8");
      const stripped = text.replace(/^import "@haruhimemoe\/ui\/shiki";\n/m, "");
      if (stripped === text) throw new Error(`${file} has no @haruhimemoe/ui/shiki import`);
      writeFileSync(path.join(dir, file), stripped);
    }
    if (existsSync(path.join(dir, "node_modules", "shiki"))) {
      throw new Error("node_modules/shiki is still there after bun remove shiki");
    }
    const plainBuild = run(path.join(dir, "node_modules", ".bin", "next"), ["build"]);
    const plain = readRoute("mdx");
    if (!plain) {
      failures.push(`/mdx did not prerender without shiki\n${plainBuild}`);
    } else {
      if (!plain.html.includes('aria-label="Code: pool.ts"')) {
        failures.push('/mdx without shiki is missing aria-label="Code: pool.ts"');
      }
      if (plain.html.includes("var(--shiki-token-")) {
        failures.push("/mdx without shiki still has var(--shiki-token-: shiki wasn't removed");
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`${failures.join("\n")}\n\nnext build output:\n${build}`);
  }
  console.log(
    "consumer: ok (next build passed, library CSS generated, pages prerendered, nav as documented, MDX page built, axe clean, built without shiki)",
  );
} catch (error) {
  console.error(`consumer: FAILED\n${error.stdout ?? ""}${error.stderr ?? error.message}`);
  process.exitCode = 1;
} finally {
  if (keep) console.log(`consumer: kept ${dir}`);
  else rmSync(dir, { recursive: true, force: true });
}
