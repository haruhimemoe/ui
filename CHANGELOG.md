# Changelog

All notable changes to `@haruhimemoe/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While on 0.x, a change to how a component looks is a minor version.

## [Unreleased]

### Added

- Motion tokens in `theme.css`: `duration-short` (150ms), `duration-medium` (250ms), `duration-long` (400ms), `ease-standard`, `ease-enter` and `ease-exit`. Every `transition-*` now reads `duration-short` and `ease-standard`, the values it had.
- One reduced-motion rule: under `prefers-reduced-motion: reduce` every animation and transition finishes in 0.01ms and smooth scrolling turns off, in the kit and in the app's own markup. `data-motion="essential"` keeps an element's motion.
- High contrast: under `prefers-contrast: more`, `c2`, `c3`, `c4` and `h1` get 8 points lighter and `h2` 4 points darker, through `--contrast-lift` (`0%` opts out).
- The `coarse:` variant (`@media (pointer: coarse)`), for a touchscreen as the main pointer.
- `useMotionAllowed()` (client): true when the visitor allows motion, false on the server, during hydration and under reduced motion, live. Lifted from haruhime.moe's homepage banner.
- `Text` and `textClasses`: a line of text in six tones (`default` c2, `muted` c3, `subtle` c4, `error`, `warning` amber-300, `success`) and three sizes, for the error, warning and muted text apps wrote by hand.
- `download` on `ButtonLink` and `TextLink` renders a plain `<a download>` (no prefetch, no client routing), for any value but `false`.
- `hideLabel` on `TextInput`, `Select`, `Textarea`, `Checkbox` and `RadioGroup`: the label (legend for RadioGroup) is hidden visually but still names the control, with no gap left above it.

### Changed

- `c2`, `c3`, `c4`, `h1` and `h2` are defined through lightness variables (`--c2-l`, `--c3-l` and `--c4-l` join `--h1-l` and `--h2-l`) plus the contrast lift. The default colors are unchanged.
- `Notice`, field errors, `CharCounter`, `AsyncButton`'s failure text and the palette's input error use Text's tones, so they get one step lighter under more contrast.
- **Button no longer stretches** in a flex column or a grid cell: `buttonClasses()` adds `w-fit` (Button, ButtonLink, AsyncButton, CopyButton, Pagination). Pass `className="w-full"` where a full-width button is wanted. `self-start` on buttons is now a no-op.
- Buttons at `md` are 44px tall on touch screens (`coarse:h-11`). Secondary and ghost buttons get a `c4` edge under more contrast; every button keeps a 1px border in forced colors, and a disabled one uses the system's GrayText there.
- `CopyMarkdownButton` follows Button's classes again (a test now pins its copy).
- `BrandPage`'s file links are `TextLink download`.
- Fields are 44px tall with 16px text on touch screens (no iOS zoom), checkbox and radio rows 44px tall, and a field's border is `c4` under more contrast.

## [0.11.2] - 2026-10-04

### Fixed

- `CopyMarkdownButton` copies on Safari and iOS: where `ClipboardItem` exists, the clipboard write starts inside the click with the fetched Markdown as a promised Blob, instead of after an awaited fetch that loses the user activation. Other browsers keep the fetch-then-`writeText` path.

## [0.11.1] - 2026-10-04

### Fixed

- BrandPage asset previews use an empty alt, so axe no longer reports image-redundant-alt next to the download link.

## [0.11.0] - 2026-10-04

### Added

- `ContentNav` and `ContentLayout`: a content section's side navigation and page grid, a port of bb's docs sidebar and layout. `ContentNav` (client) takes `groups` (`ContentNavGroup[]`, each an optional `heading` and `ContentNavItem[]`) and an index link, marks the current page `aria-current="page"`, shows `navTitle ?? title` (clamped to two lines, the full title on the link's `title` attribute) and an optional `badge`. `ContentLayout` (server) lays the nav in a 14rem column beside the page from `lg` up, taking `nav` as an already-rendered slot so it stays section-agnostic (docs today, a blog section later). New types: `ContentNavItem`, `ContentNavGroup`, `ContentSearchItem`.
- `searchContent`, `ContentSearch` and `ContentIndex`: a content section's search, a port of bb's docs search. `searchContent(items, query)` is pure: a blank query returns everything, otherwise every typed word must appear in an item's `title`, `navTitle`, `description`, `badge` or `keywords`, title-prefix matches first. `ContentSearch` (client) is a `TextInput` plus a polite live-region count ("12 pages.", "1 match.", "3 matches.", the unfiltered noun set by `countNoun`, default `["page", "pages"]`) over `ContentIndex`. `ContentIndex` (server) is the bare card grid, for a section with too few entries to search (`/legal`, a handful of guides).
- `ContentPage` and `CopyMarkdownButton`: a content section's page. `ContentPage` (server) is `PageHeader` (`title`, `description` as its `lead`), a meta row with `lastUpdated` (a `<time dateTime>`) and, when `markdownHref` is set, `CopyMarkdownButton`, plus `actions`; optional `jsonLd` (one `Record<string, unknown>`, passed to `JsonLd`); then the body in `Prose`. `CopyMarkdownButton` (client) fetches `href` and copies the response body to the clipboard, reporting the result like `CopyButton`; any failure (the fetch, the response, or the clipboard) shows the same message and it never throws. Finished class strings (no `cx`), so `ContentPage` ships no tailwind-merge for it.
- `BrandPage` and `BrandSwatch`: a product's `/brand` page, `<BrandPage {...brandPageData("pools")} />` with `@haruhimemoe/brand`'s data (typed structurally; ui doesn't depend on brand). Sections: Name, Logo (each file previewed on a dark or light tile, with a `download` link), Colors (`BrandSwatch`, click to copy the hex), Type (`fonts`, default Nunito), Do's and don'ts, osu!, Family (only with `familyHref`), Contact (`mailto:`), plus `slots.afterLogo`, `slots.afterColors` and `slots.end`. `BrandSwatch` (client) has finished class strings, so `BrandPage` ships no tailwind-merge. New types: `BrandPageProps`, `BrandPageAsset`, `BrandPageFont`, `BrandSwatchProps`.

## [0.10.0] - 2026-10-04

### Added

- `PlayerCard`: osu!-web's user card from plain props (cover, avatar, country and team flags, supporter heart, username linking to the profile, an optional status row). It never fetches; apps pass a snapshot.

## [0.9.0] - 2026-10-03

### Added

- `@haruhimemoe/ui/mdx`: `mdxComponents` (the `a`/`h2`/`h3`/`pre`/`table`/`blockquote` element overrides for `@next/mdx` and `react-markdown`), `CodeBlock` (a fenced code block, Shiki-highlighted when registered), `Callout` (a note/tip/warning aside, also reached through a GitHub-style `> [!NOTE]` blockquote), `parseCodeMeta` and `slugify`.
- `@haruhimemoe/ui/remark`: `remarkHaruhime` (default export, for Turbopack's module-name-only `remarkPlugins`) plus the named `remarkCodeMeta`, `remarkCallouts` and `remarkHeadingIds`, and `createSlugger`.
- `@haruhimemoe/ui/shiki`: an opt-in side-effect import (`shiki` is now an optional peer dependency) that registers Shiki's core highlighter for `CodeBlock`. An app that skips it, or doesn't install `shiki`, gets plain code blocks instead of a build failure.
- `theme.css`: `--shiki-foreground`, `--shiki-background` and the `--shiki-token-*` variables Shiki's CSS-variables theme reads, derived from `--hue` like the rest of the palette.

### Changed

- `Prose` styles a `pre` at any depth, excluding `CodeBlock`'s own (`role="group"`), so a plain `pre` nested inside `li` or `blockquote` keeps its fence look while `CodeBlock` (as `mdxComponents`' `pre` override renders it) keeps its own. `Prose` also styles `blockquote`.
- `CodeBlock` accepts every native `<div>` prop (`id`, `data-*`, `aria-*`, …) except `code`, `lang`, `title` and `highlight`, spread onto its wrapper.

## [0.8.0] - 2026-10-03

### Added

- `CommandPalette`: a mod+k command palette in a native `<dialog>`. Fuzzy search over commands with group headings and marked matches, nested pages (Backspace or Escape go back), async providers that search as you type (debounced, aborted when superseded), argument prompts (text, number, choice) before a command runs, a Recent group from localStorage, and a calculator row (`2*21` → `= 42`, Enter copies). Command shortcuts (`mod+shift+c`, chords like `g p`) work while the palette is closed. `openCommandPalette(page?)` opens it from anywhere; `CommandPaletteButton` is the header button with the platform hint. Built as a combobox over a listbox, with an `h1` edge on the active row, a focus cue on the input row, status errors and a polite result count.
- `siteCommands(options)`: the defaults every tool gets: Go to each nav page, Open each other haruhime tool, Copy page URL, Go back, Scroll to top, Reload, Open on GitHub, Sign in / My account / Sign out, Keyboard shortcuts, Report a bug.
- `fuzzyScore` and `evaluate` / `formatResult` are public, so an app can rank its provider rows the same way and reuse the calculator.
- `playground/`: a Next.js app in the repo that renders the components from `src/` (`bun run play`), and `bun run play:axe`, which builds it and runs axe-core in Chromium over the palette's states. Not published.

### Changed

- `Checkbox` and `RadioGroup` boxes are 24px (WCAG 2.2 target size; they were the browser's 13px), centered on the first line of their label. `Disclosure` and `HeaderMenu` buttons are at least 24px tall.
- The consumer check runs axe-core in headless Chromium over the fixture page with color contrast and target-size checks on, at 1280 and 390 wide, after `next build`. CI installs Chromium for it.

## [0.7.0] - 2026-10-03

### Changed

- Accessibility pass (WCAG 2.2 AA). Fields keep the theme's 2px focus outline instead of hiding it behind a 1px border change. `RangeSlider` thumbs and chips are 24px, the minimum target size. The default `--h1-l` is `76%` (was `70%`), so `h1` text on `b5` clears 4.5:1 at every hue; pink gets a touch lighter at the default hue. `StarRating` picks its text color by contrast (white on the 6.5 to 7 star violet band, where gold was 3.9:1). `Table`'s scrolling wrapper is a focusable `<section>` named by the caption or `scrollLabel`. `SiteFooter` holds its columns in one `<nav>` (`navLabel`, default "Footer"), each column a `<section>` with its title as a heading (`headingLevel`, default 2), instead of a `<nav>` per column. `ReportDisclosure` keeps its status line mounted from the start and moves focus to it after a send. Field errors are `role="status"`, not `role="alert"`; radios no longer carry `aria-invalid` (the group describes the error). Text-only nav entries drop `aria-disabled`. `BeatmapStats` reads full stat names to screen readers.

### Added

- `CharCounter`'s `live` prop: announces only the over-limit text.
- `Table`'s `scrollLabel`, `SiteFooter`'s `navLabel` and `headingLevel`.
- README: an "Accessibility" section with the house rules every component follows.

## [0.6.0] - 2026-09-28

### Added

- `SiteFooter`'s `tools` prop: a "haruhime tools" column linking the other live haruhime.moe tools (packs, pools, bb) and "All tools" on www, with the current tool left out. `HARUHIME_TOOLS` and `haruhimeToolsColumn` export the same data for a custom footer.

## [0.5.1] - 2026-09-28

### Security

- `JsonLd` also escapes `>`, `&`, U+2028 and U+2029 as JSON unicode escapes, not only `<`. The data parses back unchanged.

## [0.5.0] - 2026-09-28

### Added

- `Tabs`: an ARIA tab list for panels on the same page. The chosen tab is the only one in the Tab order; Left and Right (wrapping), Home and End pick and focus a tab. `tabId` and `tabPanelId` give the ids that tie a tab to its panel. Moved from bb.haruhime.moe.
- `CharCounter`: "1,234 / 60,000 characters", bold rose with how many to cut once over the limit. The caller counts. Moved from bb.haruhime.moe.
- `VisibilitySelect`: private, unlisted or public with a line each saying who sees it, as radios or a select, with the words overridable. Also `VISIBILITIES`, `VISIBILITY_TEXT` and the `Visibility` and `VisibilityText` types. It replaces the pools pool editor's radios and bb's template selects.
- `ReportDisclosure`: a report reason in a disclosure, sent through `onSubmit`, which returns a `ReportResult`; done replaces the form with a status line, an error stays on the field for a retry. Moved from bb.haruhime.moe (ReportForm).

## [0.4.0] - 2026-09-28

### Added

- `SiteFooter` takes `discordLabel` (default "Discord"), the Discord link's accessible name, as `githubLabel` does for GitHub.
- `HeadingLevel` (`2 | 3 | 4 | 5 | 6`), the type of `headingLevel` on `Card` and `FilterPanel`.
- `TextLink` and `linkClasses`: a text link in two looks, `accent` (`h1`, underlined, for running text) and `plain` (bold `c1`, underlined on hover, for names in lists). Like `ButtonLink`, it is `next/link` inside the app and a plain `<a>` off-site.
- `Badge`: a small pill for a status or tag, in `neutral`, `accent`, `warning` or `muted` (an outlined "beta" tag).
- Table primitives: `Table` (a sideways-scrolling wrapper, and a caption that can be for screen readers only), `THead`, `TBody`, `Th` (`scope="col"` by default, bold for `scope="row"`) and `Td`, with `numeric` for `tabular-nums` cells. They carry the look the apps' tables share.
- `cx`, the class merger the components use (tailwind-merge), and its `ClassValue` type.
- `InlineConfirm`: a two-step confirm in the page. Opening moves focus to cancel; cancel, Escape or a confirm that resolves puts it back on the trigger, so focus never falls to the page body. The open confirm is a group named by its question. A pending confirm keeps focus and ignores presses; a failed one stays open.
- `AsyncButton`: runs an async action and announces its result (or a failure, in rose) in an `<output>`, one run at a time, with an optional pending label.
- `Disclosure`: a button with `aria-expanded` and `aria-controls` that shows and hides a panel, which stays in the page while hidden. Uncontrolled, or controlled with `open` and `onOpenChange`.
- `RadioGroup`: a native radio fieldset on the `Checkbox` look, with a legend, per-option hints, and a group hint and error. Controlled or uncontrolled.
- `TypeToConfirm`: a form whose submit stays off until a name is typed exactly, for actions that can't be undone.
- `ChoiceChips`: single-select chips as native radios (arrow keys move and pick), with `Chip`'s look and `ChipGroup`'s `label` and `hideLabel`.
- `Chip` and `ChipOption` take `unavailableReason`: the chip is blocked but stays focusable (`aria-disabled`), with the reason as its description and title.
- `LinkTabs`: a named nav of pill links with `aria-current="page"` on the current one.
- `HeaderMenu`: the header's account disclosure (button, links, extra controls), closed by Escape (focus back on the button), a click outside, a link, or focus leaving it.
- osu! display pieces: `StarRating` (a pill on osu!'s star-rating spectrum that reads "5.23 stars"), `BeatmapStats` (CS, AR, OD, HP, BPM and length from plain numbers) and `ModBadge` (a slot pill colored by its mod bucket).
- `Pagination` button mode: `onPageChange` instead of `hrefFor`, for results fetched in place. `pageCount` can be `null` (the status reads "Page X", and `hasNext` says whether Next works). The ends stay in place with `aria-disabled`, and the status is a polite live region.

### Changed

- `Card` takes `headingLevel` `5` and `6` too, like `FilterPanel`.

### Fixed

- Hrefs that browsers read as off-site now count as external: `/\host`, `\\host`, and a URL behind leading spaces or control characters. Before, `ButtonLink` sent them through `next/link` without its `rel="noreferrer"` default, and a nav hydrated its client list for them.
- `Pagination` normalizes `page` and `pageCount`: `NaN` reads as page 1 (a `NaN` count as one page), a page past either end is pulled back inside, and fractions are dropped. Before, `page={NaN}` showed "Page NaN of 5" with no links, and page 99 of 5 linked to page 98.
- `CopyButton` reports only the latest press. A slow earlier copy that failed after a later one worked no longer replaces "Copied." with the failure.
- `SiteHeader` and `NavLinks` key entries by label and href, as `SiteFooter` does, so two entries with the same href no longer share a React key.
- `Checkbox` keeps an `aria-labelledby` you pass, after its own label. Before, it was dropped.
- `RangeSlider` counts a `step` of `0`, below `0` or not finite as `1`, and swaps `min` and `max` given the wrong way round. Before, `step={0}` sent `NaN` to `onChange` on every key press or drag.

### Security

- The release workflow pins every GitHub Action to a full commit SHA and npm to an exact version, since that job holds the npm publish token. It also runs the coverage floor and the consumer check before publishing, as CI does. Dependabot (the `bun` and `github-actions` ecosystems) keeps the pins and the exact dependency versions current.
- Report vulnerabilities through GitHub's private vulnerability reporting first, or by email (SECURITY.md).

## [0.3.0] - 2026-09-25

### Added

- `DiscordIcon`: the Discord logo as an inline SVG in the current text color, sized and hidden from screen readers like `GitHubIcon`. The path is Simple Icons' `discord.svg` (CC0 1.0). Discord's brand guidelines ask for the logo in color, black or white, so set one of those as the text color.
- `SiteFooter` takes `discordHref`. When set, a Discord icon link named "Discord" sits before the GitHub icon in the last row, at the same size. The logo stays white and dims on hover instead of changing color, as Discord's guidelines ask. Without `discordHref` the footer is unchanged.

## [0.2.0] - 2026-09-24

### Added

- `Card` takes `headingLevel` (`2`, `3` or `4`, default `2`), like `FilterPanel`, for a card that sits under another heading.

### Fixed

- `SiteHeader` and `NavLinks` no longer send tailwind-merge to the browser on every page. `NavLinks` is now a Server Component: it merges its classes on the server and hands finished class strings to a small client list that only reads the path for `aria-current`. In a Next.js 16 build, the nav's client chunk drops from about 12 KB to 4 KB gzipped. When no link can be the current page (all external or text-only), the list renders on the server alone and nothing in the nav hydrates.
- `Prose` no longer puts the `h2` or `h3` top margin above a heading that opens the block: its first child gets `mt-0`. The README shows the one-class pattern for content wrapped in `<section>`s.

## [0.1.0] - 2026-09-23

### Added

- `@haruhimemoe/ui/theme.css`: the osu!-web palette as Tailwind 4 colors (`b1` to `b6`, `c1` to `c4`, `h1`, `h2`) driven by one `--hue` (default 333), `--h1-l` and `--h2-l` to move `h1` and `h2` lightness at hues where the defaults fall under 4.5:1 contrast, Nunito as `font-sans` through `--font-nunito`, a visible focus ring, and an `@source` line so an app's Tailwind generates the components' classes.
- Basics: `Button`, `ButtonLink` (next/link, or a plain `<a>` for external URLs), `buttonClasses`, `Card`, `PageHeader`, `Notice` (info, warning, error; optionally live) and `Prose`.
- Forms: `TextInput`, `Textarea`, `Select` and `Checkbox`, each with a label, hint and error wired through `aria-describedby` and `aria-invalid`, plus `fieldClasses` for bare controls.
- Actions: `CopyButton` (a client component that reports "Copied." or a failure in an `<output>`), `Pagination` and `JsonLd`.
- Icons: `GitHubIcon`, `HaruhimeWordmark` and `HaruhimeWordmarkLink`.
- Filters: `Chip` and `ChipGroup` (toggle pills with `aria-pressed`), `RangeSlider` (two thumbs with editable ends, keyboard support, an open "+" top end, comma decimals, and an `inputMode` that switches to the text keyboard with a custom `parse`), `FilterRow` and `FilterPanel` (the osu! beatmap listing layout, collapsible on phones, with a live result count and "Clear filters").
- `className` on every component, and the extras passed to `buttonClasses` and `fieldClasses`, merge with tailwind-merge: a caller's class replaces a built-in one that sets the same property (`fieldClasses("w-auto")` drops `w-full`).
- Shell: `SiteHeader` (brand slot, nav links as data with `aria-current`, actions slot), `NavLinks`, `SiteFooter` (link columns as data, fine print, the haruhime.moe wordmark and a GitHub link) and `PageShell` (skip link, header, main, footer).

[unreleased]: https://github.com/haruhimemoe/ui/compare/v0.11.2...HEAD
[0.11.2]: https://github.com/haruhimemoe/ui/compare/v0.11.1...v0.11.2
[0.11.1]: https://github.com/haruhimemoe/ui/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/haruhimemoe/ui/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/haruhimemoe/ui/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/haruhimemoe/ui/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/haruhimemoe/ui/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/haruhimemoe/ui/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/haruhimemoe/ui/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/haruhimemoe/ui/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/haruhimemoe/ui/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/haruhimemoe/ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/haruhimemoe/ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/haruhimemoe/ui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/haruhimemoe/ui/releases/tag/v0.1.0
