# Changelog

All notable changes to `@haruhimemoe/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While on 0.x, a change to how a component looks is a minor version.

## [Unreleased]

### Changed

- CI runs CodeQL and a gitleaks scan of the full git history, and Dependabot covers dependencies and pinned actions. Dependencies are on their latest versions.

## [0.24.1] - 2026-10-10

### Fixed

- `BracketView`'s sideways scroll takes keyboard focus (`tabIndex={0}`; pass an `aria-label`), and match codes and unknown sides use `c3` instead of `c4`, which failed contrast on a card.

## [0.24.0] - 2026-10-09

### Changed

- `SiteFooter` on a touchscreen: the GitHub and Discord icons get a 44px touch area (same size on screen), and column links get 8px of padding above and below in place of the list gap.

### Fixed

- A page no longer opens zoomed out or scrolls sideways on a phone because of screen-reader-only text. `Table`, `MdxTable`, `CodeBlock`, `BracketView`, Prose code blocks and `MapCard`'s compact stats clip their content with `overflow`, but they weren't positioned, so a `.sr-only` span inside them (absolute) escaped the clip and widened the page. Each of them is now `relative`.
- `Prose` wraps long inline code and long link text instead of running them past the screen edge.

## [0.23.0] - 2026-10-09

### Added

- tourney joins `HARUHIME_TOOLS` ("osu! tournament runner"), so every tool's footer and command palette link it, and `HaruhimeToolId` takes `"tourney"`.
- `SiteFooter`'s `sortLinks` (default true).

### Changed

- `SiteFooter` shows each column's entries longest label first, ties in their given order. Pass `sortLinks={false}` for the old order.

## [0.22.0] - 2026-10-08

### Added

- `BracketView`: a bracket as columns of match cards, one block per side (winners, losers, grand final, third place) and one column per round, connectors drawn with CSS borders. It scrolls sideways inside its own container. It takes a `@haruhimemoe/tourney` `Bracket` as is (typed structurally, so ui has no tourney dependency), names for entrant ids, an optional `href` per match code and an entrant to `highlight`. Unknown sides read "Seed 3", "Winner of M5" or "Loser of M2"; an empty settled side reads "bye". Names truncate and keep their full text in a `title`.
- `BracketMatchCard`, `bracketColumns` and `sideLabel`, the pieces `BracketView` is built from.

## [0.21.0] - 2026-10-07

### Added

- harumin joins `HARUHIME_TOOLS` ("osu! Discord bot"), so every tool's footer and command palette link it, and `HaruhimeToolId` takes `"harumin"`.

## [0.20.0] - 2026-10-06

### Added

- `@haruhimemoe/ui/theme-light.css`, a light scheme: import it after `theme.css`. Light surfaces, tinted ink, `h1` as the dark accent and `h2` as the pale one, dark code tokens, and a negative contrast lift. Every ink step keeps 4.5:1 on every surface at every hue; the README gives the `--h1-l` for hues 30 to 200. For harumin.haruhime.moe's white site.
- Lightness variables for every background and content step: `--b1-l` to `--b6-l` and `--c1-l` (`--c2-l` to `--c4-l` already existed). Unset, the dark palette is unchanged.
- `--wordmark-ink`: `HaruhimeWordmark`'s white parts read it (default `#ffffff`), so the light scheme can ink them.

## [0.19.0] - 2026-10-06

### Fixed

- `CodeBlock` (and so `MdxPre`'s fenced blocks) no longer shows a blank line between every line. Each line was a `display:block` span with a `"\n"` text node between them, and inside the `<pre>` that text node rendered as an extra empty line. The text node is gone; the copy button still copies the source text with its real newlines. The `<code>` element's `textContent` no longer contains newlines.
- `ContentPage`'s header has a bottom margin (`mb-8`), so the meta row and "Copy as Markdown" button no longer touch the body.
- `SiteHeader`'s actions slot is a centered flex row (`flex items-center gap-3`), so `CommandPaletteButton` and an account link like "Sign in" share a center line instead of sitting about 4px apart on their text baselines.

### Changed

- `CopyMarkdownButton` is a compact 28px pill (`h-7 px-3`, still 44px on a coarse pointer) to sit level with the byline's small text. Button `size="sm"` is a 28px icon square, too narrow for a label, so this is the secondary button with a smaller height and padding.
- `SiteHeader` under `sm`, when it has actions: the nav moves to its own full-width row below, so the actions stay on the brand's row instead of wrapping under the nav. The DOM order (brand, nav, actions) and so the tab order is unchanged.
- `CommandPaletteButton` hides its `Ctrl K`/`⌘K` hint under `sm`, leaving the magnifier (and any `children`).
- `ContentPage` with a `toc`: the toc/body grid gap is `gap-6`, `xl:gap-10` (was `gap-8` at every width), matching `ContentLayout`'s nav/body gap (`gap-6`, `lg:gap-10`). On phones the "On this page" disclosure now sits the same 24px above the body as the "Contents" disclosure.
- README and SECURITY.md: the Discord invite is now `https://haruhime.moe/discord` and the security contact email is `haruhime@haruhime.moe`.

## [0.18.0] - 2026-10-05

### Added

- Button new `size="sm"`: a 28px icon-only square (still over the 24px WCAG 2.5.8 target); `md` and `lg` unchanged.
- `ChevronUpIcon` and `ChevronDownIcon`: plain chevrons as static inline SVGs, matching `DiscordIcon`/`GitHubIcon`'s shape (default `size-5`, `aria-hidden`, a `className` replaces the size).

### Changed

- `SortableMoveButtons` default content is now the two chevron icons (`aria-hidden`; the accessible name stays on the button), sized `"sm"`; `upText`/`downText` still swap in words and size back to `"md"` by default. New `size` prop overrides either default. New `orientation` prop (`"horizontal"` default, `"vertical"` stacks the buttons in a column). Each button's `title` now mirrors its `aria-label`. Accessible names ("Move {label} up"/"down") are unchanged.

## [0.17.0] - 2026-10-05

### Added

- `@haruhimemoe/ui/remark`: `remarkFigures` (a paragraph holding only an image becomes a `<figure>`, its title moving into a trailing `<figcaption>`), `remarkEmbeds` (a paragraph holding only a bare YouTube/Twitch URL becomes a click-to-load player), `parseEmbedUrl` and `type EmbedTarget` (every YouTube URL form with start times, Twitch videos, clips and channels). `articleData`, `type ArticleData` and `type TocItem`: a flat table of contents (h2 to h4), a word count (`Intl.Segmenter`, Japanese-safe) and a reading time from a document's heading ids. `remarkHaruhime` options `figures`, `embeds` (default `true`), `wordsPerMinute` (default 200), `mdxExports` (default `false`: adds `export const toc`/`readingMinutes`/`words` to a compiled MDX module, an author's own export of the same name kept) and `collect` (hands the same data to a function, for react-markdown, whose plugin options don't have to cross Turbopack's serializable boundary). `haruhimeSanitizeSchema` and `type SanitizeSchema`: extends an `hast-util-sanitize` schema (usually rehype-sanitize's `defaultSchema`) with the tags and attributes this kit's plugins write; `trusted: true` drops the `user-content-` id prefix for an app's own READMEs and changelogs. `rehypeLocalHrefs` and `type HastLike`: rewrites an in-page `#x` link to `#user-content-x` when the sanitizer prefixed the id but not the href. `mdxMarkdownTransforms` (plus `figureMarkdown`, `embedMarkdown`, `linkCardMarkdown`): turns `<Figure>`, `<Embed>` and `<MdxLinkCard>` into their Markdown line for an app's `.md` mirror, skipping fenced code. `remarkHeadingIds` now ids `h2` through `h4` (was `h2`/`h3`).
- `@haruhimemoe/ui/mdx` new element overrides, through `mdxComponents`: `h4` (same anchor treatment as `h2`/`h3`), `img` (a plain, lazy, async-decoded `<img>`), `input` (a GFM task-list checkbox becomes a named, disabled checkbox), `details` (a native `<details>`/`<summary>` pair styled like `Disclosure`'s toggle, works with no JS), `kbd` (`Kbd`'s look) and `div` (a `remarkEmbeds` `data-embed` div renders `Embed`). The GFM footnote label `h2` now renders bare, `sr-only`, with no anchor.
- `@haruhimemoe/ui/mdx` new article components: `Figure` (a sized `MdxImg` with an optional caption, credit and eager/priority loading), `Steps` (a numbered-rail wrapper for an ordered list), `Embed` (a click-to-load YouTube/Twitch player in a 16:9 box, with a poster image and a plain-link fallback for an unrecognized URL; `poster={false}` or a local poster replaces YouTube's own thumbnail), `MdxLinkCard` (one link named by its title, a description and a source line), `Schedule` (an ordered list of `when`/label/note rows, `when` a `<time dateTime>` or plain text), `Glossary`/`Term` (a `<dl>` of entries anchored at `#term-<slug>`, with alias anchors, and a dotted-underline link to one), `Kbd`/`kbdClasses` (re-exported from the root), and `type MdxArticleModule` (the structural shape of a compiled MDX module with `mdxExports: true`, for `await import(...)`), `type ArticleData` and `type TocItem` (re-exported from `./remark`).
- Root `@haruhimemoe/ui`: `Toc`, `type TocProps`, `type TocItem`: an article's table of contents, a sticky column from `xl` up plus a phone disclosure, both labelled "On this page", nesting a flat TOC by heading depth. `Kbd`, `type KbdProps`, `kbdClasses`: a keyboard key, shared with the command palette's own shortcut hints. `ContentPage` grows `authors` (`type ContentAuthor`, through the new `ContentByline`), `published`, `lastUpdated` now formatted "Oct 4, 2026" (see Changed), `readingMinutes`, `toc` (rendered beside the body from `xl` up) and `footer` (rendered after the body, outside `Prose`), plus `proseSize` passed straight to `Prose`.
- `Prose` new `size` prop (`"base" | "sm"`, same as `ContentPage`'s `proseSize`) and new element styles: `h4`, `dl`, figures, task lists, footnotes and `details`.

### Changed

- h4 headings in existing Markdown and MDX now get an id and a hover-revealed `#` anchor, through `remarkHeadingIds`' new depth-4 support.
- A paragraph holding only an image now renders as a `<figure>`; one holding only a bare YouTube/Twitch URL now renders a click-to-load player. Turn either off per document with `{ figures: false }` / `{ embeds: false }` passed to `remarkHaruhime`.
- `Prose` now styles `h4`, `dl`, figures, task lists, footnotes and `details` wherever they appear in its content.
- `mdxComponents` has six more keys (`h4`, `img`, `input`, `details`, `kbd`, `div`). An app's own key of the same name still wins.
- The GFM footnotes label `h2` loses its `#` anchor (it was a visible anchor beside invisible text).
- `ContentPage` prints ISO dates as "Oct 4, 2026" instead of "2026-10-04" on every docs, guides and legal page. `ContentNav`'s classes move to `contentNavStyles.ts`, shared with `Toc`, with no visual change.

## [0.16.0] - 2026-10-05

### Added

- `MapCard`, `MapSetCard`, `MapGroup`, `MapCover`, `MapPreviewButton` and `MapCopyScope`: map display from plain props. `MapCard` draws one map as a row (packs' slot row) or a card (osu-web's beatmapset panel), with no background, the set's cover or a blurred cover behind a b5 overlay, comfortable or compact density, loading/missing/error states, an optional slot pill, status, stars and stats (overridable per key), an optional Copy ID, and `leading`, `preview`, `badges`, `details` and `actions` slots. Its `map` prop takes `@haruhimemoe/osu`'s `BeatmapMeta` as-is. `MapSetCard` is a set with its difficulties, `MapGroup` a bucket with its heading, count, empty slots and one shared Copy ID scope. `MapPreviewButton` plays a set's preview clip from b.ppy.sh (one clip per page), `stopMapPreview()` stops it. Also `mapCoverUrl`, `MAP_STATUS_LABELS` and the types `MapCardProps`, `MapCardLabels`, `MapData`, `MapSetCardProps`, `MapSetDifficulty`, `MapGroupProps`, `MapCoverProps`, `MapCoverSize`, `MapPreviewButtonProps`.
- `CopyButton` `statusPosition` (`"end"` by default, `"start"` puts the status before the button) and `reserveStatus` (keeps the status's width so a press never moves the button).

## [0.15.0] - 2026-10-05

### Added

- Sortable lists: `useSortable`, `SortableList`, `SortableHandle`, `SortableMoveButtons`, `SortableLayer`, `moveItem`, `SORTABLE_ITEM` and `SORTABLE_CONTAINER`, with their types. Drag by mouse, touch or pen (pointer events only, no HTML5 drag and drop) or by keyboard (Space or Enter to pick up, the arrows, Home, End, PageUp and PageDown to move, Space or Enter to drop, Escape to cancel); a click with `detail` 0 lifts and drops for screen readers in browse mode. Up and Down buttons run on the same path. "between" and "onto" containers, nested containers, `canDrop` refusals with a reason, async `onMove` with a pending state, auto-scroll near edges, an assertive live region with overridable text, a pointer chip that shows the label and why a drop won't take, and focus that stays on the moved item's handle or button. The app owns the data. No new dependencies.

## [0.14.0] - 2026-10-05

### Added

- `Dialog` (client): the modal base, a native `<dialog>` that follows a controlled `open`. It focuses `initialFocus`, locks the page's scroll (counted, restoring the page's own inline overflow), and hands focus back on close or on unmount to the opener, else to `returnFocus()`. Escape and a backdrop press call `onDismiss` instead of closing; a press only counts as a backdrop press when it starts and ends there; a close the browser makes is reported as `"browser"`. A dialog opened from inside one that closes at the same time returns focus to that one's opener. Fades in on the motion tokens (`motion`), closes at once. New types: `DialogProps`, `DialogDismissReason`.
- `ConfirmDialog` (client): a confirm in a modal `alertdialog` on `Dialog`, opened from its own trigger or a controlled `open`/`onOpenChange`. Focus starts on Cancel; Enter submits; one run at a time with `pendingLabel`, busy buttons that keep focus, and Escape and backdrop ignored while pending; a throw keeps it open with `failedMessage` in an alert; `tone="destructive"` uses the `danger` button; `typeToConfirm` adds a field (no autocomplete, autocapitalize or spellcheck) and keeps Confirm `aria-disabled` until the text matches; `returnFocus` for a confirm that removed its own row. New types: `ConfirmDialogProps`, `ConfirmTone`.
- `danger` Button variant: white on rose-700, rose-800 on hover. `InlineConfirm`'s `confirmVariant` and `TypeToConfirm`'s `variant` take it too.
- README: "Which confirm", the rule for no confirm, `InlineConfirm`, `ConfirmDialog`, `ConfirmDialog` with `typeToConfirm`, and `TypeToConfirm`.

### Fixed

- `CommandPalette` is built on `Dialog`: closing it puts back the page's own inline `overflow` instead of clearing it, a text selection dragged from the input onto the backdrop no longer closes it, and a command that opens another dialog sends focus back to whatever opened the palette once that dialog closes.

## [0.13.0] - 2026-10-05

### Added

- `Surface` and `surfaceClasses`: the list-item box (Card's b4 and 10px radius at p-3, `md` p-4, `lg` p-5, `as` div, li, section, article, form or p), and its classes for other elements.
- `LinkCard` and `CardLink`: a card that is one link. `CardLink`'s cover fills the card, its name stays its own text, and LinkCard lifts every other control above the cover. `media` for a full-bleed banner. No landmark.
- `CardGrid`: a list of cards, one column on phones, `columns` 2 or 3 from sm/lg, `gap` sm or md, wrapping each child in its own flex `<li>` so cards in a row match height.
- `StatList`: label/value pairs as a `<dl>`, `inline`, `tiles` or `grid`.
- `EmptyState`: the "nothing here yet" box, `dashed` or `filled`, `sm` or `md`, with an optional title and action.
- `Progress`: a native `<progress>` named by its label, described by an always-mounted `<output>` status line.
- `LinkRow`: a wrapping row of text links, plain or in a named nav, `accent` or `quiet`, with a `current` item marked by weight and an underline.
- `SectionHeading`: the h2 under a page's h1, with an optional `detail`, `actions` and a `#` anchor.
- `PrevNext`: previous/next links at the end of a page in a series, each named "Previous: <title>" or "Next: <title>".
- `CodeChip`: inline code with a copy button, its name `Copy <code>` unless `copyLabel`.
- `CopyField` (client): a read-only field in mono with focus-selects-all and a Copy row, described by the field's label.
- `SegmentedControl` (client): a two to four way view switch on native radios, drawn like a pill track.

### Changed

- `Card` takes its classes from `surfaceClasses`. No visual change.
- `ContentIndex` lays its cards out on `CardGrid` and `surfaceClasses`: the tiles get Card's 10px radius (from 6px) and a 10px gap (from 8px).

## [0.12.0] - 2026-10-04

### Added

- Motion tokens in `theme.css`: `duration-short` (150ms), `duration-medium` (250ms), `duration-long` (400ms), `ease-standard`, `ease-enter` and `ease-exit`. Every `transition-*` now reads `duration-short` and `ease-standard`, the values it had.
- One reduced-motion rule: under `prefers-reduced-motion: reduce` every animation and transition finishes in 0.01ms and smooth scrolling turns off, in the kit and in the app's own markup. `data-motion="essential"` keeps an element's motion.
- High contrast: under `prefers-contrast: more`, `c2`, `c3`, `c4` and `h1` get 8 points lighter and `h2` 4 points darker, through `--contrast-lift` (`0%` opts out).
- The `coarse:` variant (`@media (pointer: coarse)`), for a touchscreen as the main pointer.
- `useMotionAllowed()` (client): true when the visitor allows motion, false on the server, during hydration and under reduced motion, live. Lifted from haruhime.moe's homepage banner.
- `Text` and `textClasses`: a line of text in six tones (`default` c2, `muted` c3, `subtle` c4, `error`, `warning` amber-300, `success`) and three sizes, for the error, warning and muted text apps wrote by hand.
- `download` on `ButtonLink` and `TextLink` renders a plain `<a download>` (no prefetch, no client routing), for any value but `false`.
- `hideLabel` on `TextInput`, `Select`, `Textarea`, `Checkbox` and `RadioGroup`: the label (legend for RadioGroup) is hidden visually but still names the control, with no gap left above it.
- `ModBadge` `color` (`ModBadgeColor`): any of the six bucket colors, the ten @haruhimemoe/pool palette colors or `neutral`, overriding the color the mod's letters pick. A value outside the list falls back to the bucket.
- 44px touch targets on a coarse pointer: chips and choice chips, checkbox and radio rows, Disclosure and HeaderMenu buttons and menu items, Tabs and LinkTabs, palette rows, FilterPanel's toggle, code copy buttons and ContentNav links.
- Under more contrast, cards, chips, neutral badges and the tabs track get a `c4` edge, and code blocks, menus, the palette and its key hints a `c4` border. In forced colors, cards, chips, badges, mod badges and the tabs track keep a 1px border; an unavailable chip is GrayText.

### Changed

- `c2`, `c3`, `c4`, `h1` and `h2` are defined through lightness variables (`--c2-l`, `--c3-l` and `--c4-l` join `--h1-l` and `--h2-l`) plus the contrast lift. The default colors are unchanged.
- `Notice`, field errors, `CharCounter`, `AsyncButton`'s failure text and the palette's input error use Text's tones, so they get one step lighter under more contrast.
- **Button no longer stretches** in a flex column or a grid cell: `buttonClasses()` adds `w-fit` (Button, ButtonLink, AsyncButton, CopyButton, Pagination). Pass `className="w-full"` where a full-width button is wanted. `self-start` on buttons is now a no-op.
- Buttons at `md` are 44px tall on touch screens (`coarse:h-11`). Secondary and ghost buttons get a `c4` edge under more contrast; every button keeps a 1px border in forced colors, and a disabled one uses the system's GrayText there.
- `CopyMarkdownButton` follows Button's classes again (a test now pins its copy).
- `BrandPage`'s file links are `TextLink download`.
- Fields are 44px tall with 16px text on touch screens (no iOS zoom), checkbox and radio rows 44px tall, and a field's border is `c4` under more contrast.
- `RangeSlider`'s value boxes also become 44px tall with 16px text on touch screens: they use `fieldClasses`, the same field look.

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

[unreleased]: https://github.com/haruhimemoe/ui/compare/v0.24.1...HEAD
[0.24.1]: https://github.com/haruhimemoe/ui/compare/v0.24.0...v0.24.1
[0.24.0]: https://github.com/haruhimemoe/ui/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/haruhimemoe/ui/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/haruhimemoe/ui/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/haruhimemoe/ui/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/haruhimemoe/ui/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/haruhimemoe/ui/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/haruhimemoe/ui/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/haruhimemoe/ui/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/haruhimemoe/ui/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/haruhimemoe/ui/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/haruhimemoe/ui/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/haruhimemoe/ui/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/haruhimemoe/ui/compare/v0.11.2...v0.12.0
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
