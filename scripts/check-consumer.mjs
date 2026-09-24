/**
 * @file scripts/check-consumer.mjs
 * @desc Builds and packs the package, installs the tarball into a throwaway Next.js 16 + Tailwind
 *       4 app (app router, Nunito from next/font, the two CSS imports) at this repo's pinned
 *       versions, renders one static page with every exported component, and runs `next build`.
 *       It then checks that the build passed, that the emitted CSS holds classes only the library
 *       uses (so the theme's @source line works), and that the page prerendered with client
 *       components inside. Usage: `node scripts/check-consumer.mjs [--keep]` (--keep leaves the
 *       app in the temp dir). Needs the npm registry and Google Fonts.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { execFileSync } from "node:child_process";
import {
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

const PAGE = `import {
  Button,
  ButtonLink,
  buttonClasses,
  Card,
  Checkbox,
  Chip,
  CopyButton,
  fieldClasses,
  GitHubIcon,
  HaruhimeWordmark,
  HaruhimeWordmarkLink,
  JsonLd,
  NavLinks,
  Notice,
  PageHeader,
  PageShell,
  Pagination,
  Prose,
  Select,
  SiteFooter,
  type SiteFooterColumn,
  SiteHeader,
  type SiteLinkItem,
  Textarea,
  TextInput,
} from "@haruhimemoe/ui";
import Link from "next/link";
import { Filters } from "./Filters";

const LINKS: SiteLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "osu!", href: "https://osu.ppy.sh" },
  { label: "Pools", note: "soon" },
];

const COLUMNS: SiteFooterColumn[] = [
  { title: "Site", items: [{ label: "Home", href: "/" }, { label: "Sheets", note: "soon" }] },
  { title: "Elsewhere", items: [{ label: "osu!", href: "https://osu.ppy.sh" }] },
];

export default function Page() {
  return (
    <PageShell
      header={
        <SiteHeader
          brand={<Link href="/">consumer</Link>}
          links={LINKS}
          actions={<Button variant="ghost">Sign in</Button>}
        />
      }
      footer={<SiteFooter columns={COLUMNS} finePrint="Not affiliated with osu!." />}
    >
      <JsonLd data={{ "@type": "WebSite", name: "consumer" }} />
      <PageHeader
        title="Consumer check"
        lead="Every component, from the packed tarball."
        meta="0.1.0"
        actions={<ButtonLink href="/docs">Docs</ButtonLink>}
      />
      <nav aria-label="Secondary">
        <NavLinks links={LINKS} align="center" />
      </nav>
      <Card title="Basics">
        <Button>Primary</Button>
        <ButtonLink href="https://osu.ppy.sh" variant="secondary" target="_blank">
          osu!
        </ButtonLink>
        <a href="/plain" className={buttonClasses({ variant: "ghost", size: "lg" })}>
          Plain link
        </a>
        <Notice tone="warning" live>
          Heads up.
        </Notice>
        <Prose>
          <h2>Prose</h2>
          <p>
            Text with <code>code</code>.
          </p>
        </Prose>
      </Card>
      <Card title="Forms">
        <TextInput id="name" label="Name" hint="Shown on the pack." defaultValue="" />
        <Textarea id="notes" label="Notes" error="Too long." />
        <Select id="mode" label="Mode" defaultValue="osu">
          <option value="osu">osu!</option>
          <option value="taiko">osu!taiko</option>
        </Select>
        <Checkbox id="video" label="Include video" hint="Bigger download" defaultChecked />
        <select aria-label="Move to" className={fieldClasses("!w-auto")}>
          <option>Top</option>
        </select>
      </Card>
      <Card title="Actions">
        <CopyButton text="https://example.com" label="Copy link" />
        <Pagination page={2} pageCount={3} hrefFor={(page) => \`/?page=\${page}\`} />
        <Chip pressed>HD</Chip>
        <GitHubIcon />
        <HaruhimeWordmark />
        <HaruhimeWordmarkLink />
      </Card>
      <Filters />
    </PageShell>
  );
}
`;

// Callbacks can't cross from a Server Component, so the stateful filters live in a client file.
const FILTERS = `"use client";

import {
  ChipGroup,
  type ChipOption,
  FilterPanel,
  FilterRow,
  RangeSlider,
  type RangeSliderValue,
} from "@haruhimemoe/ui";
import { useState } from "react";

const MODS: ChipOption[] = [
  { value: "HD", label: "HD" },
  { value: "HR", label: "HR" },
  { value: "DT", label: "DT" },
];

export function Filters() {
  const [mods, setMods] = useState<string[]>(["HD"]);
  const [stars, setStars] = useState<RangeSliderValue>([0, null]);
  const active = mods.length > 0 || stars[0] > 0 || stars[1] !== null;
  return (
    <FilterPanel
      title="Filters"
      resultCount="12 packs"
      active={active}
      onClear={() => {
        setMods([]);
        setStars([0, null]);
      }}
    >
      <FilterRow label="Mods">
        <ChipGroup label="Mods" hideLabel options={MODS} value={mods} onChange={setMods} />
      </FilterRow>
      <FilterRow label="Star rating">
        <RangeSlider
          label="Star rating"
          hideLabel
          min={0}
          max={10}
          step={0.1}
          openEnded
          value={stars}
          onChange={setStars}
        />
      </FilterRow>
    </FilterPanel>
  );
}
`;

const LAYOUT = `import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = { title: "consumer" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="bg-b5 font-sans text-c2 antialiased">{children}</body>
    </html>
  );
}
`;

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
  write(
    "src/app/globals.css",
    `@import "tailwindcss";\n@import "@haruhimemoe/ui/theme.css";\n\n:root {\n  --hue: 200;\n}\n`,
  );
  write("src/app/layout.tsx", LAYOUT);
  write("src/app/page.tsx", PAGE);
  write("src/app/Filters.tsx", FILTERS);

  console.log(`consumer: installing into ${dir}`);
  run("bun", ["install", "--no-progress"]);

  console.log("consumer: next build");
  const build = run(path.join(dir, "node_modules", ".bin", "next"), ["build"]);

  const failures = [];
  const css = readCss(path.join(dir, ".next", "static"));
  if (!css) failures.push("no CSS emitted under .next/static");
  for (const [selector, from] of LIBRARY_CLASSES) {
    if (!css.includes(selector)) failures.push(`CSS is missing ${selector} (${from})`);
  }
  if (!css.includes("--hue")) failures.push("CSS is missing the theme's --hue palette");

  const html = path.join(dir, ".next", "server", "app", "index.html");
  if (!existsSync(html)) {
    failures.push("/ did not prerender (.next/server/app/index.html is missing)");
  } else {
    const page = readFileSync(html, "utf8");
    const expected = [
      ["Consumer check", "PageHeader"],
      ["Page 2 of 3", "Pagination"],
      ["Copy link", "CopyButton (client)"],
      ["Minimum Star rating", "RangeSlider (client)"],
      ['aria-pressed="true"', "Chip (client)"],
      ["12 packs", "FilterPanel (client)"],
      ['aria-current="page"', "NavLinks marking the current page (client)"],
      ["application/ld+json", "JsonLd"],
    ];
    for (const [text, from] of expected) {
      if (!page.includes(text)) failures.push(`prerendered / is missing ${text} (${from})`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`${failures.join("\n")}\n\nnext build output:\n${build}`);
  }
  console.log("consumer: ok (next build passed, library CSS generated, / prerendered)");
} catch (error) {
  console.error(`consumer: FAILED\n${error.stdout ?? ""}${error.stderr ?? error.message}`);
  process.exitCode = 1;
} finally {
  if (keep) console.log(`consumer: kept ${dir}`);
  else rmSync(dir, { recursive: true, force: true });
}
