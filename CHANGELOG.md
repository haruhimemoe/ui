# Changelog

All notable changes to `@haruhimemoe/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While on 0.x, a change to how a component looks is a minor version.

## [Unreleased]

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

[unreleased]: https://github.com/haruhimemoe/ui/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/haruhimemoe/ui/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/haruhimemoe/ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/haruhimemoe/ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/haruhimemoe/ui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/haruhimemoe/ui/releases/tag/v0.1.0
