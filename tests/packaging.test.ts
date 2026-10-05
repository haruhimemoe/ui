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
 * @modified Sun Oct 4, 2026
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
      "src/components/actions/AsyncButton.tsx",
      "src/components/actions/CopyButton.tsx",
      "src/components/actions/InlineConfirm.tsx",
      "src/components/actions/PaginationStatus.tsx",
      "src/components/actions/useLatestStatus.ts",
      "src/components/basics/Disclosure.tsx",
      "src/components/basics/Tabs.tsx",
      "src/components/basics/useMotionAllowed.ts",
      "src/components/brand/BrandSwatch.tsx",
      "src/components/content/ContentNav.tsx",
      "src/components/content/ContentSearch.tsx",
      "src/components/content/CopyMarkdownButton.tsx",
      "src/components/dialogs/ConfirmDialog.tsx",
      "src/components/dialogs/Dialog.tsx",
      "src/components/dialogs/scrollLock.ts",
      "src/components/filters/FilterPanel.tsx",
      "src/components/filters/RangeBox.tsx",
      "src/components/filters/RangeSlider.tsx",
      "src/components/forms/ReportDisclosure.tsx",
      "src/components/forms/TypeToConfirm.tsx",
      "src/components/mdx/CodeCopyButton.tsx",
      "src/components/osu/MapCopyIdButton.tsx",
      "src/components/osu/MapCopyScope.tsx",
      "src/components/osu/MapPreviewButton.tsx",
      "src/components/palette/CommandPalette.tsx",
      "src/components/palette/CommandPaletteButton.tsx",
      "src/components/palette/PaletteList.tsx",
      "src/components/palette/paletteEvents.ts",
      "src/components/palette/platform.ts",
      "src/components/palette/siteCommands.ts",
      "src/components/palette/useProviderSearch.ts",
      "src/components/shell/HeaderMenu.tsx",
      "src/components/shell/NavListClient.tsx",
      "src/components/sortable/sortableDrag.ts",
      "src/components/sortable/sortableFocus.ts",
      "src/components/sortable/sortablePointer.ts",
      "src/components/sortable/sortablePointerDrag.ts",
      "src/components/sortable/useSortable.ts",
    ]);
    for (const { name, text } of client) {
      expect(firstStatement(text), name).toBe('"use client";');
    }
  });

  it('marks the preview player "use client" (module state, browser Audio)', () => {
    expect(firstStatement(textOf.get("src/components/osu/previewPlayer.ts") ?? "")).toBe(
      '"use client";',
    );
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
      "src/components/actions/PaginationButton.tsx",
      "src/components/actions/PaginationStatus.tsx",
      "src/components/brand/BrandSwatch.tsx",
      "src/components/content/CopyMarkdownButton.tsx",
      "src/components/mdx/CodeCopyButton.tsx",
      "src/components/osu/MapCopyIdButton.tsx",
      "src/components/osu/MapCopyScope.tsx",
      "src/components/shell/NavListClient.tsx",
    ]);
  });

  it("tells a file that pulls in tailwind-merge from one that doesn't", () => {
    expect(loadsOf("src/components/basics/Card.tsx")).toContain("tailwind-merge");
    expect(loadsOf("src/components/actions/PaginationStatus.tsx")).not.toContain("tailwind-merge");
  });

  // Shiki is optional: a static import would break the build of an app that doesn't install it.
  it("loads shiki only through dynamic import()", () => {
    const staticImports = sources.flatMap(({ name, text }) =>
      [...text.matchAll(/^(?:import|export)\s(?!type\s)[\s\S]*?from "(shiki[^"]*)";/gm)].map(
        (match) => `${name}: ${match[1]}`,
      ),
    );
    expect(staticImports).toEqual([]);
  });

  it('keeps "use client" on the components that define their own event handlers', () => {
    for (const name of [
      "filters/Chip",
      "filters/ChipGroup",
      "filters/ChoiceChips",
      "forms/RadioGroup",
      // useId only, which the regex above doesn't match; still a client file.
      "palette/PaletteInput",
      "forms/CopyField",
      "forms/SegmentedControl",
      "sortable/SortableList",
    ]) {
      const file = sources.find((s) => s.name === `src/components/${name}.tsx`);
      expect(firstStatement(file?.text ?? ""), name).toBe('"use client";');
    }
  });

  it("exports the 0.12.0 additions from the barrel", async () => {
    const ui = await import("../src/index.js");
    for (const name of ["useMotionAllowed", "Text", "textClasses"])
      expect(ui, name).toHaveProperty(name);
  });

  it('starts every dialogs/ file except dialogStyles.ts with "use client"', () => {
    const dialogs = sources.filter(({ name }) => name.startsWith("src/components/dialogs/"));
    expect(dialogs.map(({ name }) => name).sort()).toEqual([
      "src/components/dialogs/ConfirmDialog.tsx",
      "src/components/dialogs/Dialog.tsx",
      "src/components/dialogs/confirmTypes.ts",
      "src/components/dialogs/dialogStyles.ts",
      "src/components/dialogs/scrollLock.ts",
    ]);
    // dialogStyles.ts holds class strings, confirmTypes.ts types and text: both server-safe.
    const serverSafe = ["dialogStyles.ts", "confirmTypes.ts"];
    for (const { name, text } of dialogs) {
      if (serverSafe.some((file) => name.endsWith(file))) expect(isClient(name), name).toBe(false);
      else expect(firstStatement(text), name).toBe('"use client";');
    }
  });

  it("exports the dialogs from the root", async () => {
    const ui = await import("../src/index.js");
    expect(typeof ui.Dialog).toBe("function");
    expect(typeof ui.ConfirmDialog).toBe("function");
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

  it("exports the MDX components, the remark plugin and the Shiki registration as subpaths", () => {
    expect(pkg.exports["./mdx"]).toEqual({ types: "./dist/mdx.d.ts", default: "./dist/mdx.js" });
    expect(pkg.exports["./remark"]).toEqual({
      types: "./dist/remark/index.d.ts",
      default: "./dist/remark/index.js",
    });
    expect(pkg.exports["./shiki"]).toEqual({
      types: "./dist/shiki.d.ts",
      default: "./dist/shiki.js",
    });
  });

  // `import "@haruhimemoe/ui/shiki"` is a bare side-effect import: bundlers drop it otherwise.
  it("marks the Shiki registration as a side effect", () => {
    expect(pkg.sideEffects).toEqual(["**/*.css", "./dist/shiki.js"]);
  });

  it("keeps Shiki an optional peer, so apps without code blocks don't install it", () => {
    expect(pkg.dependencies).toEqual({ "tailwind-merge": "3.7.0" });
    expect(pkg.peerDependencies.shiki).toBe(">=4.5.0 <5");
    expect(pkg.peerDependenciesMeta?.shiki?.optional).toBe(true);
    expect(pkg.devDependencies.shiki).toBe("4.5.0");
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
