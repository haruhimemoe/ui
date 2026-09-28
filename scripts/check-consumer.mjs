/**
 * @file scripts/check-consumer.mjs
 * @desc Builds and packs the package, installs the tarball into a throwaway Next.js 16 + Tailwind
 *       4 app (app router, Nunito from next/font, the two CSS imports) at this repo's pinned
 *       versions, renders one static page with every exported component, and runs `next build`.
 *       It then checks that the build passed, that the emitted CSS holds classes only the library
 *       uses (so the theme's @source line works), and that the page prerendered with client
 *       components inside, including a data-only FilterPanel straight from the Server Component
 *       page, and a NavLinks with no internal link that renders on the server alone. Header-only
 *       pages check what the README says about the nav: the client list loads no tailwind-merge;
 *       with only external and text-only links nothing hydrates beyond a bare page's Next
 *       modules; a relative href skips the client list but hydrates next/link; and NavLinks in
 *       an app's own Client Component brings tailwind-merge. Before the build, plain Node
 *       imports the installed package, the way Vitest in a consuming app does. Usage:
 *       `node scripts/check-consumer.mjs [--keep]` (--keep leaves the app in the temp dir). Needs
 *       the npm registry and Google Fonts. The app's source lives in scripts/consumer-fixture/
 *       as real files; this script writes only the config that depends on the pins and the temp
 *       dir, then runs the build and the assertions.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

import { execFileSync } from "node:child_process";
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
];

// The fixture app's pages, layout and stylesheet: real files that Biome lints and
// `bun run typecheck` checks (scripts/consumer-fixture/tsconfig.json maps the package to src/).
const FIXTURE = path.join(root, "scripts", "consumer-fixture", "src");

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
        },
        devDependencies: {
          "@tailwindcss/postcss": pin("@tailwindcss/postcss"),
          "@types/node": pin("@types/node"),
          "@types/react": pin("@types/react"),
          "@types/react-dom": pin("@types/react-dom"),
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
  write("next.config.mjs", `export default { turbopack: { root: ${JSON.stringify(dir)} } };\n`);
  write("postcss.config.mjs", `export default { plugins: { "@tailwindcss/postcss": {} } };\n`);
  cpSync(FIXTURE, path.join(dir, "src"), { recursive: true });

  console.log(`consumer: installing into ${dir}`);
  run("bun", ["install", "--no-progress"]);

  // Node's ESM resolver, as Vitest uses for node_modules: every import in dist must resolve.
  console.log("consumer: importing the package in plain Node");
  const exported = run("node", [
    "--input-type=module",
    "-e",
    'const ui = await import("@haruhimemoe/ui"); console.log(Object.keys(ui).length);',
  ]).trim();
  if (!(Number(exported) > 20)) throw new Error(`Node imported only ${exported} exports`);

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
      [/<caption class="sr-only">Slots<\/caption>/, "Table with a hidden caption"],
      [/<th[^>]*scope="row"[^>]*>NM1<\/th>/, "Th as a row header"],
      [
        /<a\b(?=[^>]*href="https:\/\/discord\.gg\/example")(?=[^>]*aria-label="Discord")[^>]*><svg\b[^>]*viewBox="0 0 24 24"/,
        "SiteFooter's Discord link with DiscordIcon",
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

  if (failures.length > 0) {
    throw new Error(`${failures.join("\n")}\n\nnext build output:\n${build}`);
  }
  console.log(
    "consumer: ok (next build passed, library CSS generated, pages prerendered, nav as documented)",
  );
} catch (error) {
  console.error(`consumer: FAILED\n${error.stdout ?? ""}${error.stderr ?? error.message}`);
  process.exitCode = 1;
} finally {
  if (keep) console.log(`consumer: kept ${dir}`);
  else rmSync(dir, { recursive: true, force: true });
}
