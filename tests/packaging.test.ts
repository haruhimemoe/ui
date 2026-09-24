/**
 * @file tests/packaging.test.ts
 * @desc Checks on what ships: Next subpath imports carry ".js" (next has no exports map, so Node
 *       ESM and Vitest in a consuming app need the file name), every file that uses client hooks
 *       starts with "use client", the client files that server components render leave
 *       tailwind-merge out of the browser bundle, the Tailwind peer range covers only versions
 *       with the utilities the components use, no declaration maps point at source that isn't
 *       published, and the changelog matches the package version, links every release, and
 *       holds only fixes in a 0.x patch release.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.join(import.meta.dirname, "..");
const src = path.join(root, "src");

const sources = readdirSync(src, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
  .map((entry) => {
    const file = path.join(entry.parentPath, entry.name);
    return { name: path.relative(root, file), text: readFileSync(file, "utf8") };
  });

const textOf = new Map(sources.map(({ name, text }) => [name, text]));

/** The first statement after the file's header comment. */
const firstStatement = (text: string): string =>
  text
    .replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "")
    .split("\n")[0]
    ?.trim() ?? "";

const isClient = (name: string): boolean =>
  firstStatement(textOf.get(name) ?? "") === '"use client";';

/**
 * The modules a source file loads at runtime, relative ones as source file names. `import type`
 * is left out: it compiles away. (`import { type X }` stays, since verbatimModuleSyntax keeps it.)
 */
const runtimeImports = (name: string): string[] =>
  [...(textOf.get(name) ?? "").matchAll(/^(?:import|export)\s(?!type\s)[\s\S]*?from "([^"]+)";/gm)]
    .map((match) => match[1] as string)
    .map((specifier) => {
      if (!specifier.startsWith(".")) return specifier;
      const base = path.join(path.dirname(name), specifier).replace(/\.js$/, "");
      const file = [`${base}.ts`, `${base}.tsx`].find((candidate) => textOf.has(candidate));
      if (!file) throw new Error(`${name}: can't resolve ${specifier}`);
      return file;
    });

/** Every module a source file loads at runtime, directly or through other source files. */
const loadsOf = (name: string, seen = new Set<string>()): Set<string> => {
  for (const target of runtimeImports(name)) {
    if (seen.has(target)) continue;
    seen.add(target);
    if (textOf.has(target)) loadsOf(target, seen);
  }
  return seen;
};

describe("shipped source", () => {
  it("finds the source files", () => {
    expect(sources.length).toBeGreaterThan(20);
  });

  it("imports next subpaths by file name (next/link.js), which Node ESM can resolve", () => {
    const bare = sources.flatMap(({ name, text }) =>
      [...text.matchAll(/from "(next\/[^"]+)"/g)]
        .map((match) => match[1] as string)
        .filter((specifier) => !specifier.endsWith(".js"))
        .map((specifier) => `${name}: ${specifier}`),
    );
    expect(bare).toEqual([]);
  });

  it('starts every file that uses client hooks or browser APIs with "use client"', () => {
    const code = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const client = sources.filter(({ text }) =>
      /\b(useState|useEffect|useLayoutEffect|useRef|usePathname|useRouter|navigator\.|document\.|window\.)/.test(
        code(text),
      ),
    );
    expect(client.map(({ name }) => name).sort()).toEqual([
      "src/components/actions/CopyButton.tsx",
      "src/components/actions/PaginationStatus.tsx",
      "src/components/filters/FilterPanel.tsx",
      "src/components/filters/RangeSlider.tsx",
      "src/components/shell/NavListClient.tsx",
    ]);
    for (const { name, text } of client) {
      expect(firstStatement(text), name).toBe('"use client";');
    }
  });

  // A client file that a server component renders ships to every page that server component is
  // on (SiteHeader is on all of them). Such a file takes finished class strings from its server
  // parent, so tailwind-merge (about 9 KB gzipped) stays on the server.
  it("keeps tailwind-merge out of the client files that server components render", () => {
    const rendered = [
      ...new Set(
        sources
          .filter(({ name }) => name !== "src/index.ts" && !isClient(name))
          .flatMap(({ name }) => runtimeImports(name))
          .filter(isClient),
      ),
    ].sort();
    for (const name of rendered) {
      expect([...loadsOf(name)], name).not.toContain("tailwind-merge");
      expect([...loadsOf(name)], name).not.toContain("src/utils/cx.ts");
    }
    expect(rendered).toEqual([
      "src/components/actions/PaginationStatus.tsx",
      "src/components/shell/NavListClient.tsx",
    ]);
  });

  it("tells a file that pulls in tailwind-merge from one that doesn't", () => {
    expect(loadsOf("src/components/basics/Card.tsx")).toContain("tailwind-merge");
    expect(loadsOf("src/components/actions/PaginationStatus.tsx")).not.toContain("tailwind-merge");
  });

  it('keeps "use client" on the chip components, which take click handlers', () => {
    for (const name of ["Chip", "ChipGroup"]) {
      const file = sources.find((s) => s.name === `src/components/filters/${name}.tsx`);
      expect(firstStatement(file?.text ?? ""), name).toBe('"use client";');
    }
  });
});

describe("package manifest and build", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const build = JSON.parse(readFileSync(path.join(root, "tsconfig.build.json"), "utf8"));

  it("asks for Tailwind 4.1 or later (wrap-anywhere), below 5", () => {
    expect(pkg.peerDependencies.tailwindcss).toBe(">=4.1.0 <5");
  });

  it("emits no declaration maps, since src is not published", () => {
    expect(pkg.files).not.toContain("src");
    expect(build.compilerOptions.declarationMap).not.toBe(true);
  });
});

describe("changelog", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const changelog = readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
  const releases = [
    ...changelog.matchAll(/^## \[(\d+)\.(\d+)\.(\d+)\] - \d{4}-\d{2}-\d{2}$/gm),
  ].map((match) => ({
    version: `${match[1]}.${match[2]}.${match[3]}`,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    notes: changelog.slice((match.index ?? 0) + match[0].length).split(/^## |^\[/m)[0] ?? "",
  }));
  const repo = "https://github.com/haruhimemoe/ui";

  it("heads its newest release with the package version", () => {
    expect(releases.length).toBeGreaterThan(0);
    expect(releases[0]?.version).toBe(pkg.version);
  });

  it("links Unreleased and every release to its diff", () => {
    const links = [...changelog.matchAll(/^\[([^\]]+)\]: (\S+)$/gm)].map((match) => match.slice(1));
    const expected = [
      ["unreleased", `${repo}/compare/v${releases[0]?.version}...HEAD`],
      ...releases.map(({ version }, i) => {
        const previous = releases[i + 1];
        return [
          version,
          previous
            ? `${repo}/compare/v${previous.version}...v${version}`
            : `${repo}/releases/tag/v${version}`,
        ];
      }),
    ];
    expect(links).toEqual(expected);
  });

  // While on 0.x, a new API or a change to how a component looks is a minor version, so a patch
  // release holds fixes only: an app on ^0.1.0 takes any 0.1.x without asking.
  it("bumps the minor version, while on 0.x, for a release that adds or changes anything", () => {
    for (const [i, release] of releases.entries()) {
      const previous = releases[i + 1];
      if (!previous || release.major > 0) continue;
      const sections = [...release.notes.matchAll(/^### (\w+)$/gm)].map((match) => match[1]);
      if (sections.every((section) => section === "Fixed" || section === "Security")) continue;
      expect(release.patch, `${release.version} has ${sections.join(", ")}`).toBe(0);
      expect(release.minor, release.version).toBe(previous.minor + 1);
    }
  });
});
