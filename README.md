<p align="center"><a href="https://github.com/haruhimemoe/ui"><picture><source media="(prefers-color-scheme: light)" srcset="https://www.haruhime.moe/brand/repos/ui-banner-on-light.svg"><img alt="@haruhimemoe/ui" src="https://www.haruhime.moe/brand/repos/ui-banner.svg" width="640"></picture></a></p>

# @haruhimemoe/ui

React components for the haruhime.moe osu! tools on Next.js. It ships the osu!-web-style palette as a Tailwind 4 theme, plus buttons, links, badges, form fields and confirms, filter controls (toggle and choice chips, a two-thumb range slider, a filter panel), a `SegmentedControl` view switch and a `CopyField` copy row, list and page layout pieces (`Surface`, `LinkCard`, `CardGrid`, `StatList`, `LinkRow`, `SectionHeading`, `EmptyState`, `Progress`, `PrevNext`, `CodeChip`), tables, osu! beatmap display pieces and player cards, a command palette (mod+k, with the defaults every tool shares), content section tooling (nav, search, index and page), brand pages and the site header, footer, tabs, account menu and page frame. Most components are Server Components. The few that need the browser carry `"use client"` in their own files, so you import everything from one place.

See every component in its states at [haruhime.moe/ui](https://www.haruhime.moe/ui). The page names the version it runs.

This README describes version 0.13.0. Anything marked "since 0.13.0" is not in 0.12.x, anything marked "since 0.12.0" is not in 0.11.x, anything marked "since 0.11.0" is not in 0.10.0, anything marked "since 0.10.0" is not in 0.9.0, anything marked "since 0.9.0" is not in 0.8.0, anything marked "since 0.8.0" is not in 0.7.0, anything marked "since 0.7.0" is not in 0.6.0, anything marked "since 0.6.0" is not in 0.5.0, anything marked "since 0.5.0" is not in 0.4.0, anything marked "since 0.4.0" is not in 0.3.0, anything marked "since 0.3.0" is not in 0.2.0, and anything marked "since 0.2.0" is not in 0.1.0. [CHANGELOG.md](./CHANGELOG.md) lists what changed in each version.

## Requirements

- Next.js 16 (app router)
- React 19
- Tailwind CSS 4.1 or later, below 5

These are peer dependencies. The package is ESM only, and its `engines` field asks for Node.js 22.12 or later.

## Install

```sh
bun add @haruhimemoe/ui
```

If the app doesn't have the peers yet:

```sh
bun add next react react-dom
bun add -d tailwindcss @tailwindcss/postcss
```

## Setup

**1. Load Tailwind through PostCSS** (skip this if the app already uses Tailwind 4). Without this file Next generates no utilities, and the components render unstyled with no build error.

```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

**2. Import the theme after Tailwind** in the app's global stylesheet:

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "@haruhimemoe/ui/theme.css";
```

The theme does three things:

- Adds the palette as Tailwind colors, so `bg-b4`, `text-c1`, `border-h1` and the rest work in your own markup too.
- Adds a visible focus ring (`h1`, 2px) to everything on `:focus-visible`.
- Points Tailwind at the package's files with `@source`, so the classes the components use get generated. Without it the components render unstyled.

| Token | Use |
| --- | --- |
| `b1` to `b6` | Backgrounds, lightest (`b1`) to darkest (`b6`) |
| `c1` to `c4` | Text, brightest (`c1`) to most muted (`c4`) |
| `h1`, `h2` | Highlights: `h1` is the bright accent, `h2` the deeper one (primary buttons) |

**3. Load Nunito** with `next/font` as the `--font-nunito` variable on `<html>`. The theme's `font-sans` uses it, and falls back to the system font without it.

```tsx
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

// <html lang="en" className={nunito.variable}>
```

**4. Pick a hue (optional).** Every color comes from one `--hue` (default 333, pink). Set it on `:root` after the imports to recolor the whole app:

```css
:root {
  --hue: 200; /* blue */
  --h2-l: 42%; /* keeps white text on primary buttons at 4.5:1 */
}
```

At some hues the defaults drop below 4.5:1 contrast, so check yours. Two variables fix it (and `--c2-l`, `--c3-l`, `--c4-l` set the content steps' lightness, default `90%`, `80%`, `70%`):

- `--h2-l` sets the lightness of `h2` (default `45%`). White text on `h2` (primary buttons, the skip link) is under 4.5:1 for hues from about 23 to 205. Use `42%` at hue 200, `35%` at hue 150, or `31%` for any hue.
- `--h1-l` sets the lightness of `h1` (default `76%` since 0.7.0, `70%` before). At `76%`, `h1` text on `b5` (links in cards and prose) is at or above 4.5:1 at every hue. On `b4` ("Clear filters" in a filter panel) it dips under for hues from about 238 to 248. Use `77%` there.

The theme is dark by default (`color-scheme: dark`).

**Light scheme (since 0.20.0).** Import `theme-light.css` after `theme.css` for a white page:

```css
@import "tailwindcss";
@import "@haruhimemoe/ui/theme.css";
@import "@haruhimemoe/ui/theme-light.css";
```

Same components, same class names. It sets the lightness variables the palette reads (`--b1-l` to `--b6-l`, `--c1-l` to `--c4-l`): `b5` is the page, `b4` white cards, `b6` code and wells, and `c1` to `c4` are tinted ink, `c1` darkest. The highlights swap jobs: `h1` (36%) is the dark accent for links, rings and filled chips, and `h2` (85%) the pale fill under `c1` text on primary buttons and selected tabs. Code tokens get dark values. The wordmark's white turns to `c1` ink through `--wordmark-ink`. Every ink step stays at 4.5:1 on every surface at every hue. `h1` does at the default hue; for hues from about 30 to 200 set `--h1-l: 21%`. Under `prefers-contrast: more` the lift is `-8%`, so ink and `h1` get darker and `h2` lighter.

**5. Motion, contrast and touch (since 0.12.0).** The theme follows three browser settings. There is no in-app toggle.

- **Reduced motion.** When the visitor asks for reduced motion (`prefers-reduced-motion: reduce`), every animation and transition finishes in 0.01ms and smooth scrolling turns off, in the kit and in your own markup. Put `data-motion="essential"` on an element whose movement is the message (a progress indicator): it and its children keep their motion. Tokens: `duration-short` (150ms: hovers, presses, color changes, and the default for every `transition-*`), `duration-medium` (250ms: panels, dialogs), `duration-long` (400ms: large surfaces), with `ease-standard` (the default), `ease-enter` and `ease-exit`. For motion JavaScript drives (an autoplay video, a canvas), read `useMotionAllowed()`.
- **More contrast.** Under `prefers-contrast: more`, `c2`, `c3`, `c4` and `h1` get 8 points lighter and `h2` 4 points darker. Cards, chips, secondary and ghost buttons, neutral badges and the tabs track get a `c4` edge; fields, code blocks and menus swap their `b3` border for `c4`. The lift adds to your `--h1-l` and `--h2-l`. Set `--contrast-lift: 0%` on `:root` to opt out.
- **Touch.** `coarse:` is a variant for a touchscreen as the main pointer (`@media (pointer: coarse)`, the same query as Tailwind's `pointer-coarse:`). Buttons at `md`, chips, checkbox and radio rows, tabs, menu items, palette rows and fields grow to 44px there, and fields use 16px text so iOS Safari doesn't zoom in. Undo it for one control with a class like `coarse:h-9`. A touchscreen laptop driven by its trackpad keeps the dense layout.

## Example

```tsx
// src/app/layout.tsx
import { PageShell, SiteFooter, SiteHeader } from "@haruhimemoe/ui";
import { Nunito } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="bg-b5 font-sans text-c2 antialiased">
        <PageShell
          header={
            <SiteHeader
              brand={
                <Link href="/" className="font-extrabold text-c1 text-lg">
                  packs
                </Link>
              }
              links={[
                { label: "Public packs", href: "/packs" },
                { label: "Docs", href: "/docs" },
              ]}
            />
          }
          footer={
            <SiteFooter
              columns={[{ title: "Help", items: [{ label: "Docs", href: "/docs" }] }]}
              finePrint="Not affiliated with osu! or ppy Pty Ltd."
            />
          }
        >
          {children}
        </PageShell>
      </body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
import { ButtonLink, Card, PageHeader } from "@haruhimemoe/ui";

export default function Home() {
  return (
    <>
      <PageHeader
        title="Beatmap packs"
        lead="Pick maps, name the pack, share the link."
        actions={<ButtonLink href="/new">New pack</ButtonLink>}
      />
      <Card title="Recent packs" className="mt-8">
        Nothing here yet.
      </Card>
    </>
  );
}
```

## Server and client components

Import every component from `@haruhimemoe/ui`, in Server and Client Components alike.

- **Client components:** `CopyButton`, `Chip`, `ChipGroup`, `RangeSlider` and `FilterPanel`, and since 0.4.0 `AsyncButton`, `InlineConfirm`, `Disclosure`, `ChoiceChips`, `RadioGroup`, `TypeToConfirm` and `HeaderMenu`, and since 0.5.0 `Tabs`, `VisibilitySelect` and `ReportDisclosure`, and since 0.8.0 `CommandPalette` and `CommandPaletteButton`, and since 0.14.0 `Dialog` and `ConfirmDialog`, and since 0.16.0 `MapPreviewButton` and `MapCopyScope` (and the `stopMapPreview()` function). Each file starts with `"use client"`. They merge their classes with tailwind-merge in the browser, so a page that renders any of them loads tailwind-merge (about 9 KB gzipped), however its header renders.
- **`SiteHeader` and `NavLinks`** are Server Components with a small client part (since 0.2.0; in 0.1.0 `NavLinks` is a client component). When a nav link can be the current page (a path such as `/packs`), a client list reads the path to set `aria-current`. With only external or text-only links, the nav renders on the server alone and nothing in it hydrates. Relative hrefs (`#main`) skip the client list too, but they render `next/link`, which hydrates.
- **`ContentNav`** (since 0.11.0) reads the path to mark the current page, like `NavLinks`, but it always hydrates: its class strings are finished (no `cx`), so it ships no tailwind-merge to the browser. `CopyMarkdownButton` (since 0.11.0) is the same: finished classes, no tailwind-merge, even though `ContentPage` (a Server Component) renders it. `ContentLayout` and `ContentPage` are Server Components. `BrandSwatch` (since 0.11.0) is the same again: `BrandPage` is a Server Component and only its swatches hydrate, with no tailwind-merge.
- **`CopyField` and `SegmentedControl`** (since 0.13.0) are client components you render from your own `"use client"` file (a form, a toolbar), not ones a server component renders for you: they merge classes with `cx` like the other client components above.
- **`MapCard`, `MapSetCard`, `MapGroup` and `MapCover`** (since 0.16.0) are Server Components; with `copyId` they render the kit's own internal Copy ID button, a small client file with finished classes (no tailwind-merge), the same pattern as `CopyMarkdownButton` and `BrandSwatch`. `MapPreviewButton` and `MapCopyScope` are the map display's own client files, for a page that renders them directly.
- **Everything else is server-safe:** no state, no effects, no browser APIs.

A Server Component can't pass a function to a Client Component. So callback props (`onChange`, `onPressedChange`, `onClear`) have to come from your own `"use client"` file, like the filters example below. Props that are plain data (`CopyButton`'s `text`, `Chip`'s `pressed`) work from a Server Component. `Pagination` takes a function (`hrefFor`), but it is a Server Component itself, so that is fine anywhere. Its button mode (`onPageChange`) is a callback, so render that from a `"use client"` file.

## Props, classes and refs

- Every component takes its element's native props and passes them through (`id`, `aria-*`, `data-*`, event handlers). Each section below names that element. The tables list only the extra props.
- `ref` is a normal prop (React 19). It goes where the native props go: the outer element for most components, the control (`<input>`, `<select>`, `<textarea>`) for the form fields, and the `<button>` for `CopyButton`. On `PageShell` that is the wrapper `<div>`, not `<main>`.
- `className` is added after the built-in classes and wins on conflict: a class that sets the same property as a built-in one replaces it (merged with [tailwind-merge](https://github.com/dcastil/tailwind-merge)). `<Select className="w-auto">` drops the built-in `w-full`. On `DiscordIcon`, `GitHubIcon` and `HaruhimeWordmark`, `className` replaces the default size instead.

## Components

### Basics

#### `Button`

A pill button. Every native `<button>` prop. Variants: `primary` (default), `secondary`, `ghost`, and since 0.14.0 `danger` (white on rose-700, rose-800 on hover) for a confirm that deletes.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | `primary` is the `h2` pill that lights up to `h1` on hover, `secondary` is `b3`, `ghost` is transparent, `danger` is rose-700 (rose-800 on hover). |
| `size` | `"md" \| "lg"` | `"md"` | Height, padding and text size. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Never submits a form unless you ask for `"submit"`. |

Since 0.12.0 a button sits at its content width (`w-fit`), also in a flex column or a grid cell; pass `className="w-full"` for a full-width one. At `md` it is 44px tall on a coarse pointer.

#### `ButtonLink`

A link that looks like `Button`. Every `next/link` prop (`href`, `prefetch`, `replace`, `scroll`, `target`, `rel`...), plus `variant` and `size` as on `Button`.

- A string `href` with a scheme (`https:`, `mailto:`) or starting with `//` renders a plain `<a>`, and `next/link`'s own props are dropped. The href is read the way the browser reads it: leading spaces don't count and a backslash counts as a slash, so `/\host` and `\\host` are off-site too (since 0.4.0).
- That plain `<a>` with `target="_blank"` and no `rel` gets `rel="noreferrer"`. A `rel` you pass always wins. Internal links get only the `rel` you pass.

Since 0.12.0, `download` (any value but `false`) renders a plain `<a download>`: no prefetch of an API route or a large file, no client routing. An external href also renders a plain `<a>`, with `rel="noreferrer"` in a new tab.

```tsx
<ButtonLink href="/api/me/export" download variant="secondary">Download my data</ButtonLink>
<ButtonLink href="https://osu.ppy.sh" target="_blank">osu!</ButtonLink>
```

#### `buttonClasses`

`buttonClasses({ variant?, size?, className? }): string` returns the `Button` classes, for elements the components don't cover. Types: `ButtonVariant`, `ButtonSize`, `ButtonClassOptions`.

```tsx
<summary className={buttonClasses({ variant: "secondary" })}>More</summary>
```

#### `Card`

The osu!-web panel: rounded, `b4` background, `p-5`. Every native `<section>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none | Rendered as a heading at the top (`<h2>` by default). It also names the section (`aria-labelledby`), which makes the card a region landmark. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | The title's heading level (type `HeadingLevel`). Use `3` or lower for a card that sits under another heading, such as a card inside a titled card. Since 0.2.0; `5` and `6` since 0.4.0. |

#### `PageHeader`

The page's one `<h1>`, with room for a lead line, a meta line and actions. Every native `<div>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The `<h1>`. |
| `lead` | `ReactNode` | none | A sentence under the title (`text-c3`). Rendered in a `<p>`, so inline content only. |
| `meta` | `ReactNode` | none | A small muted line (`text-c4`) for dates, counts or owners. Also a `<p>`. |
| `actions` | `ReactNode` | none | Buttons or links on the right. They wrap under the title on narrow screens. |

#### `Notice`

Short status text in one of three tones. Every native `<p>` prop. Type: `NoticeTone`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `tone` | `"info" \| "warning" \| "error"` | `"info"` | `text-c3`, `text-amber-300` or `text-rose-300`, at `text-sm`. |
| `live` | `boolean` | `false` | Make it a live region: `role="alert"` for errors, `role="status"` for the others. A `role` you pass wins. See below. |
| `as` | `"p" \| "div"` | `"p"` | Use `"div"` for block content such as a list of errors. |

A `status` region is only reliably announced when its content changes while it is on the page. A `live` info or warning notice that mounts with its text already inside (`{saved && <Notice live>Saved.</Notice>}`) can go unannounced. Keep it mounted and change its children, empty while there is nothing to say:

```tsx
<Notice live>{saved ? "Saved." : ""}</Notice>
```

An error notice (`role="alert"`) is announced either way.

#### `Text` and `textClasses` (since 0.12.0)

A line of text in a tone and a size, instead of hand-written color classes. Every native `<p>` prop. Types: `TextTone`, `TextSize`, `TextClassOptions`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `tone` | `"default" \| "muted" \| "subtle" \| "error" \| "warning" \| "success"` | `"default"` | `c2`, `c3`, `c4`, rose, amber or emerald. The status tones get one step lighter under more contrast. |
| `size` | `"xs" \| "sm" \| "base"` | `"sm"` | The text size. |
| `bold` | `boolean` | `false` | `font-bold`. |
| `as` | `"p" \| "span" \| "div"` | `"p"` | The element. |

`textClasses({ tone, size, bold, className })` returns the same classes for an element `Text` can't be (an `<output>`, a `<time>`, a class map). `Text` is styling only, not a live region: a message that appears after an action still goes in `Notice live` or a mounted `role="status"`. Error and warning text must say what is wrong in words.

```tsx
<Text tone="muted">Last updated Oct 4.</Text>
<Text role="alert" tone="error" bold>That pack key is not valid.</Text>
<output className={textClasses({ tone: "success" })}>Saved.</output>
```

#### `Prose`

Long-form typography for MDX, docs and legal pages. A `max-w-3xl` `<div>` that styles the `h2`, `h3`, `h4`, `p`, `a`, `strong`, `ul`, `ol`, `li`, `dl`, `code`, `pre`, `hr`, `table`, figures, task lists, footnotes and `details` elements inside it (`h4`, `dl`, figures, task lists, footnotes and `details` since 0.17.0). Every native `<div>` prop. A `pre` scrolls sideways, so give it `tabIndex={0}` (through your Markdown renderer's `components` map) so keyboard users can reach the scroll; CSS can't add that.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `size` | `"base" \| "sm"` | `"base"` | Since 0.17.0. `sm` is a denser scale for legal pages and other dense docs; pass it straight through to `ContentPage`'s own `proseSize`. |

The first element inside gets no top margin (`[&>:first-child]:mt-0`, since 0.2.0), so a heading that opens the block sits flush with what's above it instead of taking the `h2` or `h3` gap. The rule reaches direct children only. If you wrap the content in `<section>`s, the heading at the top of the first section keeps its margin. Reach one level deeper for that:

```tsx
<Prose className="[&>:first-child>:first-child]:mt-0">
  <section>
    <h2>What we store</h2>
    <p>Your osu! id and your packs.</p>
  </section>
  <section>
    <h2>How long we keep it</h2>
    <p>Until you delete your account.</p>
  </section>
</Prose>
```

Later sections keep their heading margin, which spaces them apart.

#### `Kbd` and `kbdClasses`

Since 0.17.0. A keyboard key: `<kbd>` with a small bordered look (`rounded border border-b3 bg-b5 font-sans text-c3`), shared with the command palette's own shortcut hints. Every native `<kbd>` prop. `kbdClasses` is the same classes as a plain string, for a `<kbd>` (or any element) you build yourself.

```tsx
<p>Press <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> to open the palette.</p>
<span className={kbdClasses}>Esc</span>
```

It also renders for Markdown's `kbd` element through `mdxComponents`, and is exported from `@haruhimemoe/ui/mdx` for `<Kbd>Ctrl</Kbd>` directly in `.mdx` source.

#### `Disclosure` (client)

Since 0.4.0. A button (at least 24px tall) that shows and hides a panel below it, with `aria-expanded` and `aria-controls` and a ▾ / ▴ arrow. The closed panel stays in the page, hidden, so fields inside keep their values. Every native `<div>` prop except `children`, for the wrapper.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `summary` | `ReactNode` | required | The button's text. It can change with the state. |
| `children` | `ReactNode` | required | The panel. |
| `defaultOpen` | `boolean` | `false` | Whether it starts open. |
| `open`, `onOpenChange` | `boolean`, `(open: boolean) => void` | none | Control the state from outside. |
| `buttonClassName`, `panelClassName` | `string` | none | Classes for the button and the panel, merged last. |

#### `TextLink`

Since 0.4.0. A text link: `next/link` inside the app, a plain `<a>` off-site (with `rel="noreferrer"` in a new tab), like `ButtonLink`. Every `next/link` prop. Type: `TextLinkVariant`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `"accent" \| "plain"` | `"accent"` | `accent` is `h1` and underlined, for links in running text (it doesn't rely on color alone). `plain` is bold `c1`, underlined on hover, for a name or title in a list or table. |

```tsx
<p>
  Scripts can read public packs. <TextLink href="/docs/api">Read the API docs</TextLink>.
</p>
<TextLink href={`/packs/${pack.id}`} variant="plain">{pack.name}</TextLink>
```

`download` works the same way (since 0.12.0): `<TextLink href="/brand/haruhime-palette.json" download>Download palette (JSON)</TextLink>`.

#### `linkClasses`

Since 0.4.0. `linkClasses({ variant?, className? }): string` returns the `TextLink` classes, for an element that should look like one (a `<button>` that reads as a link, say). Type: `LinkClassOptions`. Downloads use `TextLink download` since 0.12.0.

#### `Badge`

Since 0.4.0. A small pill for a status or tag ("Unranked", "beta", a count). A `<span>` with no role, so screen readers read it in line with the text around it. Every native `<span>` prop. Type: `BadgeTone`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `tone` | `"neutral" \| "accent" \| "warning" \| "muted"` | `"neutral"` | `neutral` is `b3` with `c2` text, `accent` is `h1` with dark bold text, `warning` is a faint amber with bold amber text, `muted` is an outlined pill in small bold capitals (a "beta" tag). |

#### `Tabs` (client)

Since 0.5.0. A tab list for panels on the same page (use `LinkTabs` when each tab is its own URL): pill buttons with `role="tab"` in a `role="tablist"` named by `label`. The chosen tab is `aria-selected` and the only one in the Tab order (the first one when none is chosen). Left and Right move and wrap, Home and End jump to the ends; each picks the tab and focuses it. Controlled. Every native `<div>` prop except `onChange` and `children`, for the tablist. Types: `TabItem<T>`, `TabsProps<T>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | The tablist's accessible name. |
| `idPrefix` | `string` | required | Prefix for the tabs' and panels' ids. |
| `tabs` | `readonly { id: T; label: ReactNode }[]` | required | The tabs, left to right. |
| `value` | `T` | required | The chosen tab's id. |
| `onChange` | `(id: T) => void` | required | Gets the picked tab's id. |

The panels are yours. `tabId(prefix, tab)` and `tabPanelId(prefix, tab)` (server-safe) give the ids that tie them together (`<prefix>-tab-<tab>`, `<prefix>-panel-<tab>`):

```tsx
<Tabs label="Editor view" idPrefix="ed" tabs={TABS} value={tab} onChange={setTab} />
<div role="tabpanel" id={tabPanelId("ed", tab)} aria-labelledby={tabId("ed", tab)}>...</div>
```

#### `useMotionAllowed` (client, since 0.12.0)

`useMotionAllowed()` is `true` when the visitor allows motion. It is `false` on the server, during hydration, without `matchMedia`, and while the visitor asks for reduced motion, and it follows the setting live. Use it for motion JavaScript drives (an autoplay video, a canvas, `element.animate()`). CSS transitions and animations already stop through the theme, so components don't need it for those.

```tsx
"use client";

import { useMotionAllowed } from "@haruhimemoe/ui";

export function Hero() {
  const motion = useMotionAllowed();
  return motion ? <video autoPlay loop muted playsInline src="/loop.webm" /> : null;
}
```

### Layout

The list and page layout pieces apps used to build by hand (since 0.13.0). All are Server Components except `CopyField` and `SegmentedControl`, which are under Forms.

#### `Surface`

The list-item box: Card's color and radius at p-3, no heading and no landmark. `as` picks `div` (default), `li`, `section`, `article`, `form` or `p`; `padding` is `sm` (p-3), `md` (p-4) or `lg` (p-5). It adds no layout: pass `flex flex-col gap-2`. A `p-0` in `className` replaces the padding.

```tsx
<ul className="flex flex-col gap-3">
  <Surface as="li" padding="md" className="flex flex-col gap-1">…</Surface>
</ul>
```

#### `surfaceClasses`

Surface's classes for an element it doesn't render, such as a next/link tile: `surfaceClasses({ padding, className })`.

#### `LinkCard` and `CardLink`

A card that is one click target. `CardLink` is the link: its `after:` box covers the nearest positioned ancestor, and its name is only its own text. `LinkCard` is the surface (p-5, `relative`, b3 on hover and focus-within) that the cover fills; every other link, button, field and summary inside is lifted above the cover, so they stay clickable without `relative z-10`. `title` plus `href` renders `<h3><CardLink /></h3>` first (`headingLevel` changes the level); without them, put a `CardLink` in your own heading. `media` renders first, full-bleed, above the padded body.

```tsx
<LinkCard media={<img src="/brand/repos/ui-banner.svg" alt="" />}>
  <h2 className="font-extrabold text-xl"><CardLink href="/libraries/ui">@haruhimemoe/ui</CardLink></h2>
  <LinkRow items={links} />
</LinkCard>
```

- One `CardLink` per card: two would stack two covers.
- The lift sets `position: relative` on those elements. Something that must overlay another element inside the card stacks by grid area (`[grid-area:1/1]`), not `absolute`.
- `CardLink` works in any `relative` box outside `LinkCard` too; pass `after:rounded-[10px]` when the box is rounded and doesn't clip.
- Use `Card` for a labelled region and `LinkCard` for a card that goes somewhere.

#### `CardGrid`

A grid of cards as a list: one column on phones, `columns` 2 (default) or 3 from `sm`/`lg`, `gap` `md` (default, 16px then 20px) or `sm` (10px), `as` `ul` or `ol`. It wraps each child in a flex `<li>`, so cards in a row match height: cards render no `<li>` of their own.

```tsx
<CardGrid columns={3}>{templates.map((t) => <TemplateCard key={t.id} template={t} />)}</CardGrid>
```

#### `StatList`

Label and value pairs as a `<dl>`: `variant` `inline` (default, a wrapping row), `tiles` (b4 boxes; on a b4 parent pass `className="[&>div]:bg-b3"`) or `grid` (2 columns on phones, `columns` 2, 3 or 4 from `sm`). Labels are c4 at `text-xs`, values bold c1 with tabular numbers. Values take any node.

```tsx
<StatList variant="tiles" items={[{ label: "Maps", value: "12" }, { label: "Avg ★", value: "5.2" }]} />
```

#### `EmptyState`

The "nothing here yet" box: `variant` `dashed` (default) or `filled`, `size` `md` (default, centered, p-6) or `sm` (left, tight), optional `title` and `action`. It has no role; announce it with your own live region when it appears after a search.

```tsx
<EmptyState className="min-h-48">Drop an image here to start.</EmptyState>
```

#### `Progress`

A native `<progress>` with a name and a status line: `label` (shown unless `hideLabel`), `value` (left out for indeterminate) and `max` (default 1), `status` in an `<output>` under the bar that the bar's `aria-describedby` points at. The output is always mounted, so a status set later is announced.

```tsx
<Progress label="Download progress" hideLabel value={ready} max={total} status={`${ready} of ${total} sets ready`} />
```

#### `LinkRow`

A wrapping row of text links (a card's GitHub / npm / Changelog, a page's filters): plain without a `label`, a named `<nav>` with one. `variant` `accent` (default, bold accent links) or `quiet` (c2, turns c1 on hover). Mark the current item with `current`: it gets `aria-current="page"` and an underline, not color alone. Use `LinkTabs` for pill links that switch a view of the same page family, `ContentNav` for a section's vertical nav.

```tsx
<LinkRow label="Changelog filter" items={[{ href: "/changelog", label: "All" }, { href: "/changelog/kind/packages", label: "Packages", current: true }]} />
```

#### `SectionHeading`

The h2 under a page's h1: bold c1 at text-xl, `scroll-mt-20` for a sticky header. `level` changes the tag (default 2). `detail` ("(12)") sits inside the heading's accessible name; `actions` sit to its right; `anchor` (needs `id`) adds a `#` link named after the heading's text.

```tsx
<SectionHeading id="recent-packs" anchor detail="(12)" actions={<a href="/packs">See all</a>}>Recent public packs</SectionHeading>
```

#### `PrevNext`

Previous and next links at the end of a page in a series (docs tags, guides): a named nav over a b3 rule. Each link reads "Previous: <title>" or "Next: <title>" to a screen reader; a lone `next` link sits at the end on its own. Renders nothing with neither link.

```tsx
<PrevNext label="More tags" prev={{ href: "/docs/tags/b", title: "[b] Bold" }} next={{ href: "/docs/tags/i", title: "[i] Italic" }} />
```

#### `CodeChip`

Inline code with a copy button: `copy={false}` for the code alone; the button's name is `Copy <code>` unless `copyLabel`.

```tsx
<CodeChip code="bun add @haruhimemoe/ui" />
```

### Forms

The fields render a label, the control, an optional hint and an optional error, wired together for screen readers. They are Server Components: you pass the `id`, so they need no generated ids.

Shared props (type `FieldProps`), taken by `TextInput`, `Textarea`, `Select` and `Checkbox`:

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | required | The control's id. The label points at it. The hint gets `<id>-hint` and the error `<id>-error`. |
| `label` | `ReactNode` | required | The visible label. |
| `hideLabel` | `boolean` | `false` | Since 0.12.0. Hides the label visually; it still names the control. No gap is left above the control. |
| `hint` | `ReactNode` | none | Help text in a `<div>`, linked with `aria-describedby`. On `Checkbox` the hint sits inline inside the label, so keep it to text there. |
| `error` | `ReactNode` | none | Error text in a `role="status"` `<div>` (`text-rose-300`; `role="alert"` before 0.7.0), so a list of errors is fine. Sets `aria-invalid` and links the text with `aria-describedby`. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the label, control, hint and error, for layout (`min-w-48 flex-1`). |

`className` goes on the control itself. Your own `aria-describedby` is kept after the hint and error ids. Fields are 44px tall with 16px text on a coarse pointer (since 0.12.0).

#### `TextInput`

Every native `<input>` prop (`type`, `name`, `value`, `onChange`, `placeholder`, `required`...), plus the field props.

```tsx
<TextInput id="pack-name" label="Name" hint="Shown on the pack page." required />
```

#### `Textarea`

Every native `<textarea>` prop, plus the field props. At least `min-h-24` tall, resizes vertically.

#### `Select`

Every native `<select>` prop, plus the field props. Pass `<option>` elements as children.

#### `Checkbox`

Every native `<input>` prop except `type` (`checked`, `defaultChecked`, `onChange`, `name`, `disabled`...), plus the field props. The box is 24px (since 0.8.0; it was the browser's 13px), the label is bold `text-c1` and the hint follows it inline after a dot. Clicking anywhere on the row toggles it. The label alone is the accessible name; the hint is the description. An `aria-labelledby` you pass is added after the label (since 0.4.0; 0.3.0 dropped it).

#### `RadioGroup` (client)

Since 0.4.0. A native radio group on the `Checkbox` look: a `<fieldset>` named by its `<legend>`, one 24px radio per option with a bold label and an inline hint, then the group's hint and error. Each option's label is its accessible name and its hint its description. Arrow keys move and pick, as native radios do. Every native `<fieldset>` prop except `onChange`, `children` and `defaultValue`; `disabled` turns off every radio. Types: `RadioOption`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The legend. |
| `hideLabel` | `boolean` | `false` | Since 0.12.0. Hides the legend visually; it still names the group. |
| `options` | `readonly RadioOption[]` | required | `{ value: string; label: ReactNode; hint?: ReactNode; disabled?: boolean }` for each radio. |
| `value` / `defaultValue` | `string` | none | The picked value, held by you (`value`, with `onChange`) or by the group (`defaultValue`). |
| `onChange` | `(value: string) => void` | none | Gets the picked option's value. |
| `name` | `string` | generated | The radios' name, for a form. |
| `hint`, `error` | `ReactNode` | none | Under the options, linked to the group with `aria-describedby`. An error is a `role="status"` line (since 0.7.0; before, `role="alert"` and `aria-invalid` on each radio). |
| `required` | `boolean` | `false` | Every radio gets `required`. |

#### `TypeToConfirm` (client)

Since 0.4.0. A confirm for something that can't be undone: a `<form>` whose submit button stays off until the expected text is typed exactly (spaces around it don't count). The field has no autocomplete, autocapitalize or spellcheck. Enter submits once it matches. Children show above the field, to say what the action does. Every native `<form>` prop except `onSubmit`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | required | The text field's id, as on `TextInput`. |
| `expected` | `string` | required | What has to be typed. |
| `label` | `ReactNode` | `"Type <expected> to confirm"` | The field's label. |
| `hint`, `error` | `ReactNode` | none | As on `TextInput`. Pass `error` when the action fails. |
| `submitLabel` | `ReactNode` | required | The button's text. |
| `pendingLabel` | `ReactNode` | `submitLabel` | The button's text while `onConfirm` runs. It runs once at a time. |
| `onConfirm` | `() => void \| Promise<void>` | required | Runs on submit once the text matches. If it throws or rejects, the form stays as typed. |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | The button's look. |

```tsx
<TypeToConfirm id="delete-pool" expected={pool.name} submitLabel="Delete this pool" onConfirm={remove} error={error}>
  <p>This deletes the pool for everyone who edits it. It can't be undone.</p>
</TypeToConfirm>
```

In a dialog, use `ConfirmDialog`'s `typeToConfirm` (see Which confirm).

#### `CharCounter`

Since 0.5.0. How much of a length limit a text uses: "1,234 / 60,000 characters" in `c3`, then bold rose with ": 1,500 over the limit" once past it (at the limit is not over). You count, so any rule works (a string's length, a BBCode counter). Every native `<p>` prop except `children`.

With `live` (since 0.7.0) an `<output>` live region inside it announces "1,500 over the limit" when the count goes over and nothing while under, so typing isn't read out number by number.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `count` | `number` | required | How many are used. |
| `limit` | `number` | required | The most allowed. |
| `unit` | `string` | `"characters"` | What is counted. |
| `live` | `boolean` | `false` | Announce the over-limit text to screen readers (since 0.7.0). |

#### `VisibilitySelect` (client)

Since 0.5.0. Who can see something: private, unlisted or public, each with a line that says who that is. As radios (a `RadioGroup`, every line shown as its option's description) or as a native select (a `Select`, the picked option's line as the hint). Controlled. Also exported: `VISIBILITIES` (`["private", "unlisted", "public"]`), the `Visibility` type, `VisibilityText` (`{ label: string; hint?: ReactNode }`) and `VISIBILITY_TEXT`, the default words ("Only you can see it.", "Anyone with the link can see it. It isn't listed.", "Anyone can see it, and it's listed.").

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `value` | `Visibility` | required | The picked visibility. |
| `onChange` | `(value: Visibility) => void` | required | Gets the new one. |
| `label` | `ReactNode` | `"Who can see it"` | The legend, or the select's label. |
| `as` | `"radio" \| "select"` | `"radio"` | Radios, or a dropdown. |
| `text` | `Partial<Record<Visibility, Partial<VisibilityText>>>` | none | Your words, merged over `VISIBILITY_TEXT` per visibility. |
| `id` | `string` | generated | The select's id, or the radios' name. |
| `hint` | `ReactNode` | none | Under the radios. On a select it replaces the picked option's line. |
| `error` | `ReactNode` | none | As on the fields. |
| `disabled` | `boolean` | `false` | Turns it off. |
| `className` | `string` | none | Classes for the fieldset, or the select's wrapper. |

```tsx
<VisibilitySelect
  label="Who can see this pool"
  value={visibility}
  onChange={setVisibility}
  text={{ private: { hint: "Only you and your editors." } }}
/>
```

#### `ReportDisclosure` (client)

Since 0.5.0. "Report this": a `Disclosure` holding a reason `Textarea` (required) and a submit button. `onSubmit` gets the trimmed reason and says how it went: `{ ok: true, message? }` replaces the form with a `role="status"` line (your message, like "You already reported it.", or `sentMessage`), which takes focus, since the button that had it is gone (since 0.7.0; the line is mounted empty from the start, so it is announced); `{ ok: false, message }` shows the message as the field's error and keeps what was typed for a retry. A throw reads as `failedMessage`. One send at a time. Type: `ReportResult`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `onSubmit` | `(reason: string) => Promise<ReportResult>` | required | Sends the report. |
| `summary` | `ReactNode` | `"Report"` | The disclosure button's text. |
| `label` | `ReactNode` | `"What's wrong with it?"` | The reason field's label. |
| `hint` | `ReactNode` | none | Help under the field. |
| `submitLabel`, `pendingLabel` | `ReactNode` | `"Send report"`, `"Sending…"` | The button's text, and while sending. |
| `sentMessage` | `ReactNode` | `"Thanks. Your report was sent."` | Said when the result has no message. |
| `failedMessage` | `ReactNode` | `"Couldn't send the report. Try again."` | Said when `onSubmit` throws. |
| `minLength`, `maxLength` | `number` | `3`, none | The reason's length limits. |
| `rows` | `number` | `3` | The field's height. |
| `className` | `string` | none | Classes for the wrapper around the disclosure and the status line. |

```tsx
<ReportDisclosure
  summary="Report this template"
  maxLength={500}
  onSubmit={async (reason) => {
    const response = await fetch(`/api/templates/${id}/report`, { method: "POST", body: JSON.stringify({ reason }) });
    return response.ok ? { ok: true } : { ok: false, message: "Reporting failed." };
  }}
/>
```

#### `fieldClasses`

`fieldClasses(className?: string): string` returns the field look (`b6` background, `b3` border, `h1` border plus the theme's 2px `h1` outline on focus, rose border when `aria-invalid`, and the `h1` border back when an invalid field has focus; before 0.7.0 the outline was hidden and only the border changed). Use it on a bare control that labels itself:

```tsx
<select aria-label="Move to" className={fieldClasses("w-auto")}>...</select>
```

#### `CopyField` (client)

A read-only field to copy from: the value in mono (`mono={false}` to turn it off), focus selects all of it, then a row with a Copy button and your `actions`. The label to input gap is 8px. `ref`, `hint`, `error` and `hideLabel` reach the input; `wrapperClassName` places the whole field. The Copy button is described by the label, so two fields read "Copy, Pack key" and "Copy, Short link". A copy that depends on something only the browser knows (a share link with `window.location.origin`) goes in `actions` as its own `CopyButton`.

```tsx
<CopyField label="Pack key" value={packKey} copyLabel="Copy key" copyVariant="primary" copiedMessage="Key copied."
  actions={<CopyButton text={shareLink} disabled={!origin} label="Copy share link" />} />
```

#### `SegmentedControl` (client)

A two to four way view switch drawn like a pill track, built on native radios: Tab lands on the checked one, arrows move and pick. Radios, not links: use `LinkTabs` when each choice is its own URL, `ChoiceChips` for a filter among other chips. `hideLabel` keeps the group named through an sr-only legend; `size` is `sm` (24px) or `md` (default, 32px).

```tsx
<SegmentedControl label="Preview size" hideLabel size="sm" options={[{ value: "fit", label: "Fit" }, { value: "actual", label: "Actual size" }]} value={scale} onChange={setScale} />
```

### Actions

#### `CopyButton` (client)

A button that copies text, with the result in an `<output>` beside it that screen readers announce. Each press clears the message first, so a second copy is announced too. Only the latest press reports: an earlier copy that settles later (behind a permission prompt, say) doesn't overwrite it (since 0.4.0). If the clipboard is missing or refuses (an insecure page, say), it shows the failure message. Every `Button` prop except `onClick` and `children`; `className` and the native props go on the button.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `text` | `string` | required | The text to copy. |
| `label` | `ReactNode` | `"Copy"` | The button's text. |
| `copiedMessage` | `ReactNode` | `"Copied."` | Shown after a copy works. |
| `failedMessage` | `ReactNode` | `"Couldn't copy. Select the text and copy it by hand."` | Shown when it doesn't. |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"secondary"` | As on `Button`. |
| `size` | `"md" \| "lg"` | `"md"` | As on `Button`. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the button and the message. |
| `statusPosition` | `"end" \| "start"` | `"end"` | Since 0.16.0. `"start"` puts the status before the button instead of after it. |
| `reserveStatus` | `boolean` | `false` | Since 0.16.0. Keeps the status's width (as wide as "Copied.") so a press never moves the button. |

#### `Pagination`

Previous and next pills around "Page X of Y": links (`hrefFor`), or since 0.4.0 buttons (`onPageChange`). Renders nothing when there is one page or none. Every native `<nav>` prop except `children`; `aria-label` defaults to `"Pages"`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `page` | `number` | required | The current page, starting at 1. |
| `pageCount` | `number` | required | How many pages there are. |
| `hrefFor` | `(page: number) => string` | one of the two | Link mode: builds a page's URL, e.g. `` (p) => `/packs?page=${p}` ``. |
| `onPageChange` | `(page: number) => void` | one of the two | Button mode (since 0.4.0): called with the page to show, for results fetched in place. `pageCount` may be `null` there. |
| `hasNext` | `boolean` | `false` | Button mode with `pageCount={null}`: whether a page comes after this one. |
| `previousLabel` | `ReactNode` | `"Previous"` | Text of the link to the page before. |
| `nextLabel` | `ReactNode` | `"Next"` | Text of the link to the page after. |
| `formatStatus` | `(page: number, pageCount: number) => ReactNode` | `"Page X of Y"` | The text in the middle. In button mode `pageCount` can be `null`, and the default reads "Page X". |

A `page` or `pageCount` straight from a URL is safe to pass (since 0.4.0): `NaN` reads as page 1 (and a `NaN` count as one page), a page past either end is pulled back inside, and fractions are dropped. `Number("abc")` shows page 1 with a Next link, and page 99 of 5 shows page 5.

The links use `next/link` with `rel="prev"` and `rel="next"`. On the first and last page one link goes away. If it had keyboard focus (Next pressed on page 4 of 5), focus moves to the "Page X of Y" text instead of falling back to the top of the page. `Pagination` stays a Server Component; that text is a small client component inside it.

In button mode, Previous and Next are `<button>`s. At the first or last page they stay in place, dimmed, with `aria-disabled="true"`: they keep focus and ignore presses. The status is a polite live region there, so each new page is announced.

```tsx
<Pagination page={page} pageCount={null} hasNext={data.hasMore} onPageChange={setPage} />
```

#### `AsyncButton` (client)

Since 0.4.0. A button that runs an async action and reports how it went in an `<output>` beside it that screen readers announce, like `CopyButton`. While it runs, the button keeps focus but ignores presses (`aria-disabled`). Every `Button` prop except `onClick`; the children are its text.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `action` | `() => ReactNode \| Promise<ReactNode>` | required | Runs on press. What it returns is the message ("Done."). |
| `pendingLabel` | `ReactNode` | the children | The button's text while the action runs. |
| `failedMessage` | `ReactNode \| ((error: unknown) => ReactNode)` | `"Something went wrong. Try again."` | Shown in `text-rose-300` when the action throws or rejects. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the button and the message. |

#### `InlineConfirm` (client)

Since 0.4.0. A two-step confirm in the page, no dialog: a trigger button, then the question with a cancel and a confirm button in its place. Opening moves focus to cancel, the safe choice. Cancel or Escape closes it and puts focus back on the trigger, and so does a confirm that resolves. The open confirm is a `<fieldset>` (a group) named by the question, so screen readers hear the question when focus arrives. Every native `<div>` prop except `children`, for the wrapper.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `trigger` | `ReactNode` | required | The first button's text. |
| `question` | `ReactNode` | required | Shown once the trigger is pressed. |
| `onConfirm` | `() => void \| Promise<void>` | required | Runs on confirm. While it runs, both buttons keep focus but ignore presses. If it throws or rejects, the confirm stays open: show the error yourself. |
| `confirmLabel`, `cancelLabel` | `ReactNode` | `"Confirm"`, `"Cancel"` | The two buttons' text. |
| `pendingLabel` | `ReactNode` | `confirmLabel` | The confirm button's text while `onConfirm` runs. |
| `onCancel` | `() => void` | none | Called when it closes without confirming. |
| `triggerProps` | `ButtonProps` | none | Props for the trigger (`aria-label`, `variant`, `disabled`). It is `secondary` by default. |
| `confirmVariant` | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"secondary"` | The confirm button's look. Cancel is always `ghost`. |

If a confirm removes the item (and the `InlineConfirm` with it), move focus somewhere sensible yourself, such as the list's heading. For a delete that affects other people or sits in a table cell, use `ConfirmDialog` (see Which confirm).

### Dialogs

Since 0.14.0. A modal base and a confirm built on it. Both are client components: their callbacks come from your own `"use client"` file.

#### `Dialog` (client)

The bare modal: a native `<dialog>` that follows `open`. Opening records what had focus, runs `showModal()` (the rest of the page goes inert), focuses `initialFocus` and locks the page's scroll. Closing puts focus back on what opened it, or on `returnFocus()` when that has left the page, and puts the page's own inline `overflow` back. Unmounting while open does the same and asks no one. Nothing closes by itself: Escape and a backdrop press call `onDismiss`, and you set `open` to false. A backdrop press counts only when it starts and ends on the backdrop, so a text selection dragged out of the dialog never closes it. When the browser closes it itself (a back gesture), `onDismiss("browser")` tells you to follow. A dialog opened from inside one that closes at the same time (a palette command) sends focus back to that one's opener. It fades in (`motion`); close is instant, and reduced motion shows it at once. Every native `<dialog>` prop except `open`, `onCancel` and `onClose`. Name it with `aria-label` or `aria-labelledby`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `open` | `boolean` | required | Controlled. `true` runs `showModal()`, `false` runs `close()`. |
| `onDismiss` | `(reason: "escape" \| "backdrop" \| "browser") => void` | required | The person or the browser asked to close. On `"browser"` it is already closed: set `open` to false. |
| `initialFocus` | `RefObject<HTMLElement \| null>` | the browser's rule | Focused after opening. |
| `returnFocus` | `() => HTMLElement \| null` | none | Where focus goes on close when the opener is gone (a deleted row). |
| `dismissible` | `boolean` | `true` | `false` ignores Escape and the backdrop, for while an action runs. |
| `motion` | `boolean` | `true` | The open fade. |
| `lockScroll` | `boolean` | `true` | Lock the page's scroll while open. Locks are counted, so stacked dialogs share one. |

The `<dialog>` is the backdrop's hit area: make it cover the viewport and put your panel inside it, or a press on the panel's own padding counts as a backdrop press.

```tsx
"use client";

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Preview</Button>
<Dialog
  open={open}
  onDismiss={() => setOpen(false)}
  aria-labelledby="preview-title"
  className="m-0 h-dvh max-h-none w-full max-w-none open:flex"
>
  <div className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-b3 bg-b6 p-5">
    <h2 id="preview-title" className="font-bold text-lg">Template preview</h2>
    <Button onClick={() => setOpen(false)}>Close</Button>
  </div>
</Dialog>
```

#### `ConfirmDialog` (client)

A confirm in a modal `alertdialog`, on `Dialog`. The title names it and the description describes it. Cancel (ghost) and Confirm sit in a form, so Enter submits. Below `sm` the buttons go full width with Confirm on top. Focus starts on Cancel, the safe choice, or on the type field with `typeToConfirm`. While `onConfirm` runs (once at a time), both buttons keep focus but ignore presses, Confirm shows `pendingLabel`, and Escape and the backdrop do nothing. When it resolves the dialog closes and focus goes back to the trigger, or to `returnFocus()` if the trigger is gone. When it throws or rejects the dialog stays open, keeps what was typed, and says `failedMessage` in an alert. Content renders only while open, so each open starts fresh.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The heading. Names the dialog. |
| `description` | `ReactNode` | none | What happens, under the title. Describes the dialog. |
| `children` | `ReactNode` | none | Extra content above the buttons (a list of what goes). |
| `onConfirm` | `() => void \| Promise<void>` | required | Resolve closes it. Throw to keep it open: `throw new Error(answer.message)`. |
| `failedMessage` | `ReactNode \| ((error: unknown) => ReactNode)` | `"Something went wrong. Try again."` | Shown in an alert on failure. `(e) => (e as Error).message` shows what you threw. |
| `tone` | `"default" \| "destructive"` | `"default"` | `"destructive"` makes Confirm the `danger` button. |
| `typeToConfirm` | `string \| { expected, label?, hint? }` | none | Confirm stays `aria-disabled` until this is typed: exact, case-sensitive, spaces around it ignored (`TypeToConfirm`'s rule). The label defaults to `"Type <expected> to confirm"`. |
| `confirmLabel`, `cancelLabel` | `ReactNode` | `"Confirm"`, `"Cancel"` | The two buttons' text. |
| `pendingLabel` | `ReactNode` | `confirmLabel` | Confirm's text while `onConfirm` runs. |
| `onCancel` | `() => void` | none | Called when it closes without confirming. |
| `returnFocus` | `() => HTMLElement \| null` | none | Where focus goes when the trigger is gone after a confirm. |
| `trigger`, `triggerProps` | `ReactNode`, `ButtonProps` | none | Uncontrolled: a `secondary` Button that opens it. |
| `open`, `onOpenChange` | `boolean`, `(open: boolean) => void` | none | Controlled, instead of `trigger`: for palette commands and rows that own the state. |

```tsx
<ConfirmDialog
  trigger="Delete this pool"
  triggerProps={{ variant: "danger" }}
  title={`Delete ${pool.name}?`}
  description="This deletes the pool for you and everyone who edits it. It can't be undone."
  tone="destructive"
  typeToConfirm={pool.name}
  confirmLabel="Delete for good"
  pendingLabel="Deleting…"
  failedMessage={(error) => (error as Error).message}
  onConfirm={async () => {
    const answer = await deletePool(pool.id);
    if (!answer.ok) throw new Error(answer.message);
  }}
/>
```

#### Which confirm

Pick by what is lost and who loses it, then by where the trigger sits.

1. **No confirm.** The change can be undone in place (an Undo, Ctrl+Z), it only touches an unsaved form, or redoing it costs a click. Never confirm something that has an Undo.
2. **`InlineConfirm`.** It can't be undone, touches only your own things, and the consequence fits one short sentence. The trigger sits in a row or toolbar with room to grow.
3. **`ConfirmDialog`.** It can't be undone, and it affects other people (shared links, editors, someone else's content), or the consequence needs more than one sentence, or the trigger sits where inline growth breaks the layout (a table cell, a header menu, a palette command).
4. **`ConfirmDialog` with `typeToConfirm`.** It can't be undone and it deletes an account, deletes a thing other people edit, or gives ownership away. Type the account's or the thing's name.
5. **`TypeToConfirm`.** Only when the confirm is the whole page, or a step in a flow with nothing else on screen.

Never `window.confirm()`, and never a hand-built modal: build on `Dialog`.

### Icons

#### `DiscordIcon`

Since 0.3.0. The Discord logo as an inline SVG in the current text color. Hidden from screen readers by default (`aria-hidden="true"`), so put a label on the link around it. Every native `<svg>` prop except `children` and `viewBox`.

The path is Simple Icons' `discord.svg` at tag 16.32.0 ([simple-icons/simple-icons](https://github.com/simple-icons/simple-icons), CC0 1.0). Discord is a trademark of Discord Inc. Its [brand guidelines](https://discord.com/branding) ask for the logo in color, black or white, and not recolored. The icon takes the current text color, so give the element around it one of those (`SiteFooter` uses white).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | `"size-5"` | Replaces the default size. |

#### `GitHubIcon`

The GitHub mark as an inline SVG in the current text color. Hidden from screen readers by default (`aria-hidden="true"`), so put a label on the link around it. Every native `<svg>` prop except `children` and `viewBox`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | `"size-5"` | Replaces the default size. |

#### `HaruhimeWordmark`

The haruhime.moe wordmark as an inline SVG. It keeps the brand's own white and pink whatever `--hue` is; under `theme-light.css` the white becomes `c1` ink (`--wordmark-ink`, since 0.20.0). Every native `<svg>` prop except `children` and `viewBox`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | `"haruhime.moe"` | The accessible name (`role="img"` with a `<title>`). |
| `decorative` | `boolean` | `false` | Hide it from screen readers, for use inside a labelled link. |
| `className` | `string` | `"h-6 w-auto"` | Replaces the default size. The width follows the height. |

#### `HaruhimeWordmarkLink`

A plain `<a>` around a decorative `HaruhimeWordmark`, dimmed until hovered. Every native `<a>` prop except `children`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `href` | `string` | `"https://www.haruhime.moe"` | Where it links. |
| `aria-label` | `string` | `"haruhime.moe"` | The link's accessible name. |
| `wordmarkClassName` | `string` | `"h-6 w-auto"` | Replaces the wordmark's size. |

### Filters

The osu! beatmap listing layout: a panel of rows, each with a label on the left and controls on the right. The interactive pieces take callbacks, so render them from a `"use client"` file:

```tsx
"use client";

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

export function PackFilters({ count }: { count: number }) {
  const [mods, setMods] = useState<string[]>([]);
  const [stars, setStars] = useState<RangeSliderValue>([0, null]);
  const active = mods.length > 0 || stars[0] > 0 || stars[1] !== null;

  return (
    <FilterPanel
      title="Filters"
      resultCount={`${count} packs`}
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
```

Give the `ChipGroup` or `RangeSlider` inside a `FilterRow` `hideLabel`. The row's label then shows once, and screen readers hear the row's name once instead of two nested groups with the same name.

#### `Chip` (client)

A toggle pill: a `<button>` with `aria-pressed`, `h1` when on. Every native `<button>` prop except `aria-pressed`, which `pressed` sets.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `pressed` | `boolean` | required | Whether it is on. |
| `onPressedChange` | `(pressed: boolean) => void` | none | Called with the new state on click, Enter or Space. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Never submits a form by default. |
| `unavailableReason` | `ReactNode` | none | Since 0.4.0. Why the chip can't be pressed right now (EZ with HR picked). The chip is dimmed and never toggles, but stays in the tab order (`aria-disabled="true"`, not `disabled`), so keyboard and screen reader users find it and hear the reason as its description. A string reason is also its `title`. |

Your own `onClick` runs first. Call `event.preventDefault()` in it to skip the toggle.

#### `ChipGroup` (client)

A labelled row of chips for picking several values (mods, game modes). A `<fieldset>`; every native `<fieldset>` prop except `onChange` and `children`. `disabled` turns off every chip.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | Names the group. |
| `hideLabel` | `boolean` | `false` | For use inside a `FilterRow`, which names the row: the label doesn't render and the fieldset isn't a group of its own (`role="none"`). `disabled` still reaches every chip. |
| `options` | `readonly ChipOption[]` | required | `{ value: string; label: ReactNode; disabled?: boolean; unavailableReason?: ReactNode }` for each chip (`unavailableReason` since 0.4.0, as on `Chip`). |
| `value` | `readonly string[]` | required | The picked values. |
| `onChange` | `(value: string[]) => void` | required | Gets the new picked values, in the options' order, without duplicates. |

#### `ChoiceChips` (client)

Since 0.4.0. One choice from a few, as a real radio group drawn as chips (a status or type filter): native radios under one name, so Tab reaches the checked chip and the arrow keys move and pick. Same look as `Chip`, with the focus ring on the chip. A `<fieldset>` like `ChipGroup`, with the same `label` and `hideLabel`; every native `<fieldset>` prop except `onChange`, `children` and `defaultValue`. Type: `ChoiceChipOption`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | Names the group. |
| `hideLabel` | `boolean` | `false` | As on `ChipGroup`, inside a `FilterRow`. |
| `options` | `readonly ChoiceChipOption<T>[]` | required | `{ value: T; label: ReactNode; disabled?: boolean }` for each chip. |
| `value` | `T` | required | The picked value. |
| `onChange` | `(value: T) => void` | required | Gets the picked value. |
| `name` | `string` | generated | The radios' name, for a form. |

For a two to four way view switch drawn as a pill track, use `SegmentedControl`.

#### `RangeSlider` (client)

Two thumbs on one track with an editable box at each end, for star rating, length or BPM. A `<fieldset>`; every native `<fieldset>` prop except `onChange`, `children` and `inputMode`. Type: `RangeSliderValue` (`[number, number | null]`), so `useState<RangeSliderValue>` can pass its setter straight in.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | Names the group, and the ends as "Minimum *label*" and "Maximum *label*". |
| `hideLabel` | `boolean` | `false` | For use inside a `FilterRow`, which names the row: the label doesn't show and the fieldset isn't a group of its own (`role="none"`). The ends keep their "Minimum *label*" and "Maximum *label*" names. |
| `min`, `max` | `number` | required | The bounds. Given the wrong way round (`max` below `min`), they swap (since 0.4.0). |
| `step` | `number` | `1` | Step between values. Typed values snap to it. A step of `0`, below `0` or not finite counts as `1` (since 0.4.0), so `onChange` never gets `NaN`. |
| `value` | `readonly [number, number \| null]` | required | The range. A `null` top means no upper limit. |
| `onChange` | `(value: [number, number \| null]) => void` | required | Gets the new range. |
| `openEnded` | `boolean` | `false` | The top end at `max` means "no upper limit": it shows `max+` (like `10+`) and reports `null`. |
| `format` | `(n: number) => string` | `String` | Display text for the boxes and screen readers. |
| `parse` | `(text: string) => number \| null` | plain number | Reads a typed value back (without a trailing `+`). The default takes a comma as the decimal point (`5,5`). Pair it with `format` for `m:ss` lengths. |
| `inputMode` | `"decimal" \| "text" \| "numeric" \| ...` | `"decimal"`, or `"text"` with a custom `parse` | The on-screen keyboard for the two boxes. Phone decimal keypads have no `:`, so a custom `parse` gets the full keyboard. |
| `minLabel`, `maxLabel` | `string` | "Minimum *label*", "Maximum *label*" | The accessible names of the two ends. |
| `disabled` | `boolean` | `false` | Turns off both thumbs and both boxes. |

The thumbs can't cross. Arrow keys move one step, Page Up and Page Down ten, Home and End as far as the thumb can go. A box commits on blur or Enter, and Escape undoes the typing. An empty low box means `min`; an empty top box means open (with `openEnded`) or `max`. Values that come in out of range or crossed (from a URL, say) are shown clamped, and a `NaN` or infinite end counts as no limit on that end. When both thumbs sit on one value, dragging moves whichever end can go that way.

#### `FilterRow`

One labelled row: the label above the controls on phones, in a `w-28` column on the left from `sm` up. A `<fieldset>`; every native `<fieldset>` prop. Server-safe.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The row's label. Also names the group. |

Not the same as the fields' `hideLabel`: inside a `FilterRow`, a `ChipGroup`, `ChoiceChips` or `RangeSlider`'s own `hideLabel` drops its label entirely, because the row names it instead.

#### `FilterPanel` (client)

A titled panel of `FilterRow`s with a live result count and a "Clear filters" button. On phones the rows fold behind a button next to the title; from `sm` up they always show. Every native `<section>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The heading. It also names the panel and the phone toggle. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | The heading's level (type `HeadingLevel`). |
| `resultCount` | `ReactNode` | none | Shown in a polite live region, so each new count is announced. |
| `active` | `boolean` | `false` | Whether any filter is set. |
| `onClear` | `() => void` | none | The clear button's action. The button shows only when `active` is true and this is set. |
| `clearLabel` | `ReactNode` | `"Clear filters"` | The clear button's text. |
| `defaultOpen` | `boolean` | `false` | Whether the rows start open on phones. |

### Meta

#### `JsonLd`

schema.org structured data in a `<script type="application/ld+json">`. Every `<` in the output is escaped, so a string in the data can't close the tag. Every native `<script>` prop except `children`, `dangerouslySetInnerHTML`, `type` and `src` (`id` and `nonce` pass through).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `data` | `Record<string, unknown>` | required | The schema.org object. `@context` defaults to `https://schema.org`; set it in `data` to change it. |

### Content

Since 0.11.0. A content section's side navigation, page grid and search, ports of bb's docs sidebar, layout grid and search. `ui` has no next-kit or brand dependency: resolve your section's entries (a docs registry, a future blog) into these plain, structural types yourself.

```ts
type ContentNavItem = { href: string; title: string; navTitle?: string; badge?: string };
type ContentNavGroup = { heading?: string; items: readonly ContentNavItem[] };
```

`ContentSearchItem` (`ContentNavItem & { description: string; keywords?: readonly string[] }`) is exported too, for `searchContent`, `ContentSearch` and `ContentIndex` below.

#### `ContentNav` (client)

The index link, then each group of links, the current page marked. A column from `lg` up; a "Contents" disclosure above it on phones. Finished class strings (no `cx`).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | The nav landmark's accessible name, on both the column and the phone disclosure. |
| `indexHref` | `string` | required | Where the index link (the section's overview page) points. |
| `indexLabel` | `string` | `"Overview"` | The index link's label. |
| `groups` | `readonly ContentNavGroup[]` | required | Each group's heading (left out when `heading` is unset) and links. |

A link's label is `navTitle ?? title`, in a `line-clamp-2` span so a long title wraps to two lines instead of overflowing the 14rem column; the link's `title` attribute always holds the full `title`. The current page's link gets `aria-current="page"`. A `badge` (e.g. a count) shows beside the label, in `font-mono`.

For a page's own vertical nav use `ContentNav`; for a wrapping row of links (a card's GitHub / npm / Changelog, a page's filters) use `LinkRow`.

#### `ContentLayout`

The grid: `nav` in a 14rem column from `lg` up, the page beside it; one column on phones. A Server Component. `nav` takes an already-rendered node (usually a `<ContentNav>`), so this stays section-agnostic. Every native `<div>` prop; `className` merges last.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `nav` | `ReactNode` | required | The section's navigation, already rendered. |
| `children` | `ReactNode` | required | The page, inside a `min-w-0` wrapper (so a long line inside it can still shrink and wrap). |

#### `searchContent`

`searchContent(items: readonly ContentSearchItem[], query: string): ContentSearchItem[]`. Pure and server-safe. A blank (or whitespace-only) query returns every item, in input order. Otherwise `query` is lowercased and split on spaces; an item matches when every word appears somewhere in its `title`, `navTitle`, `description`, `badge` or any `keywords`. Matching items whose `title` starts with the trimmed query come first; the rest keep their input order.

#### `ContentSearch` (client)

Port of bb's docs search. A `TextInput` (id `content-search`, `type="search"`), a polite live region with the result count, then `ContentIndex` over what `searchContent` found.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `items` | `readonly ContentSearchItem[]` | required | The section's entries. |
| `label` | `string` | required | The field's label. |
| `placeholder` | `string` | none | The field's placeholder. |
| `countNoun` | `readonly [string, string]` | `["page", "pages"]` | Singular and plural noun for the unfiltered count ("12 pages."). A filtered count always reads "1 match." or "N matches." |

#### `ContentIndex`

The same card grid as `ContentSearch` (one link per item: title, badge, description), with no search field, for a section with too few entries to bother searching (`/legal`, a handful of guides). A Server Component. Its tiles use `CardGrid gap="sm"` and `surfaceClasses` (since 0.13.0).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `items` | `readonly ContentSearchItem[]` | required | The entries to list. |

#### `Toc`

Since 0.17.0. An article's table of contents, built from `articleData`'s (or MDX's `mdxExports`') flat `toc: TocItem[]`: a sticky column from `xl` up beside the page, and a phone disclosure above it, both labelled "On this page" (the same column and link classes as `ContentNav`, through `contentNavStyles.ts`). A Server Component; every native `<nav>` prop goes on the wide-screen column (the phone disclosure carries its own `nav`, so the same props on both would duplicate an id).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `items` | `readonly TocItem[]` | required | The flat TOC, in document order. |
| `maxDepth` | `2 \| 3 \| 4` | `3` | The deepest heading level kept; deeper headings are dropped, not nested. |
| `label` | `string` | `"On this page"` | The nav landmark's accessible name, on both the column and the phone disclosure. |

Renders nothing when fewer than two items survive `maxDepth` (a one-heading page needs no toc). A heading whose level jumps more than one step still nests one level at a time (2 then 4 nests once, not twice), and repeated ids keep distinct React keys.

```tsx
const page = await import(`./posts/${slug}.mdx`); // mdxExports: true
<ContentPage title={meta.title} toc={<Toc items={page.toc} />} /* ... */>
  <page.default />
</ContentPage>
```

#### `ContentPage`

Since 0.11.0. A content section's page: `PageHeader` (the title and the description as its lead), a meta row (byline, published/updated dates, reading time) with a "Copy as Markdown" button, then the body in `Prose`, with an optional toc beside it and a footer after it. Optional JSON-LD. A Server Component.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The page's `<h1>`, passed to `PageHeader`. |
| `description` | `ReactNode` | none | Passed to `PageHeader` as `lead`. |
| `authors` | `readonly ContentAuthor[]` | none | Since 0.17.0. Shown first in the meta row, through `ContentByline` (see below). |
| `published` | `string` | none | Since 0.17.0. A `<time dateTime>`-ready string (an ISO date, say). Formatted "Oct 4, 2026"; anything that isn't a real ISO day (an impossible date, a bare year) prints as given. |
| `lastUpdated` | `string` | none | A `<time dateTime>`-ready string, shown as "Updated \<date\>" next to `published` when the two differ, or alone (as `lastUpdatedLabel`) when `published` is unset. |
| `lastUpdatedLabel` | `ReactNode` | `"Last updated"` | The label before the time, when `published` is unset. |
| `readingMinutes` | `number` | none | Since 0.17.0. Shown as "{n} min read" in the meta row (`articleData`'s or `mdxExports`' `readingMinutes`). |
| `markdownHref` | `string` | none | The page's raw Markdown source. When set, shows a `CopyMarkdownButton` for it. |
| `jsonLd` | `Record<string, unknown>` | none | One schema.org object, passed to `JsonLd`. Use `ld.graph(...)` yourself for several nodes. |
| `actions` | `ReactNode` | none | Extra buttons or links, shown alongside the meta row and the copy button. |
| `toc` | `ReactNode` | none | Since 0.17.0. A table of contents (usually `<Toc items={page.toc} />`), rendered before the body in a two-column layout from `xl` up. |
| `footer` | `ReactNode` | none | Since 0.17.0. Rendered after the body, outside `Prose` (a `PrevNext`, related links). |
| `proseSize` | `"base" \| "sm"` | `"base"` | Since 0.17.0. Passed straight to `Prose`'s own `size`; `"sm"` for dense docs and legal pages. |
| `children` | `ReactNode` | required | The page body, rendered inside `Prose`. |

`ContentAuthor` (`{ name: string; userId?: number; href?: string | null; avatarUrl?: string }`) names an author; `userId` links an osu! profile and draws its avatar unless `href`/`avatarUrl` say otherwise. Several authors join "A, B and C".

#### `CopyMarkdownButton` (client)

Since 0.11.0. A button that fetches `href` and copies the response body to the clipboard, reporting the result in an `<output>` beside it, like `CopyButton`. Any failure (the fetch rejects, the response isn't ok, or the clipboard refuses) shows the same failure message; it never throws. Its own client file with finished class strings (no `cx`): `ContentPage` is a Server Component, and this keeps tailwind-merge out of the browser bundle it ships.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `href` | `string` | required | Fetched on click; the response's text is copied. |
| `label` | `ReactNode` | `"Copy as Markdown"` | The button's text. |
| `copiedLabel` | `ReactNode` | `"Copied"` | Shown after a copy works. |
| `failedLabel` | `ReactNode` | `"Couldn't copy"` | Shown when the fetch, the response, or the clipboard fails. |

### Brand

#### `BrandPage`

Since 0.11.0. A product's `/brand` page body. Pass it `@haruhimemoe/brand`'s data as is:

```tsx
import { brandPageData } from "@haruhimemoe/brand/products";
import { BrandPage } from "@haruhimemoe/ui";

<BrandPage {...brandPageData("pools")} />;
```

The props are typed structurally, so ui doesn't depend on brand. Sections, in order, each a `Card` with an `<h2>`: Name (name, tagline, how to write it, the site), Logo (each file previewed on a dark `b6` or light tile by `dark`, with a `download` link; non-image files get the link only), `slots.afterLogo`, Colors (a `BrandSwatch` per palette token), `slots.afterColors`, Type, Do's and don'ts, osu! ("Not affiliated with osu! or ppy. osu! is a trademark of ppy Pty Ltd."), Family ("Part of the haruhime.moe family.", linking `familyHref`; hidden when it's null, as on haruhime.moe itself), Contact (a `mailto:` link), `slots.end`. The headings and the osu! and family lines are the same on every haruhime brand page. A Server Component.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `string` | required | The name as the wordmark reads it. |
| `mark` | `string` | required | The icon's letters (part of the data shape; not shown). |
| `tagline` | `string` | required | The product's one-line description. |
| `url` | `string` | required | The product's site, linked under Name. |
| `writing` | `string` | required | How to write the name in running text. |
| `dos`, `donts` | `readonly string[]` | required | The two lists. |
| `palette` | `Record<string, string>` | required | Token to `"#rrggbb"`, one swatch each. |
| `assets` | `readonly BrandPageAsset[]` | required | `{ label, href, dark }`: `dark: false` is an on-light variant, shown on a light tile. |
| `contact` | `string` | required | The contact address. |
| `familyHref` | `string \| null` | required | The family brand page, or null to hide the Family section. |
| `fonts` | `readonly BrandPageFont[]` | Nunito, "Wordmarks and headings" | `{ name, usage }` under Type. |
| `slots` | `{ afterLogo?, afterColors?, end?: ReactNode }` | none | Extra sections, for haruhime.moe's own page. |

#### `BrandSwatch` (client)

Since 0.11.0. One palette token: a button showing the color, the token and its hex. Clicking copies the hex and reports the result in an `<output>` beside it, like `CopyButton`. The color is set inline from the data (`style={{ backgroundColor }}`), so it doesn't follow `--hue`. Finished class strings, no tailwind-merge.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `token` | `string` | required | The token's name. |
| `hex` | `string` | required | The color, shown and copied. |
| `copiedLabel` | `ReactNode` | `"Copied"` | Shown after a copy works. |
| `failedLabel` | `ReactNode` | `"Couldn't copy"` | Shown when the clipboard refuses. |

### Shell

Links in the header and footer are data (type `SiteLinkItem`):

```ts
type SiteLinkItem = { label: string; href?: string; note?: string };
```

Paths use `next/link`; anything with a scheme (`https:`, `mailto:`) or starting with `//` is a plain `<a>` (and, since 0.4.0, `/\host`, `\\host` or a URL behind leading spaces, which browsers also read as off-site). An item without `href` shows as plain text. `note` adds a word beside it in small uppercase letters (`{ label: "Sheets", note: "soon" }`). The header dims text-only items and shows the note only on them. The footer shows a note beside a link too.

#### `SiteHeader`

The dark top bar: brand on the left, the nav, and an actions slot on the right. Every native `<header>` prop except `children`. A Server Component; the nav list inside is `NavLinks`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | required | The left side, usually a home link with the site's name or wordmark. |
| `links` | `readonly SiteLinkItem[]` | `[]` | The nav entries. No nav renders when empty. |
| `navLabel` | `string` | `"Main"` | The nav landmark's accessible name. |
| `navAlign` | `"start" \| "center"` | `"start"` | `"start"` puts small `text-c3` links right after the brand. `"center"` centers larger `text-c2` links in the free space. |
| `actions` | `ReactNode` | none | The right side, e.g. an account menu. Laid out as one centered flex row (`gap-3`), so a palette button and a text link share a center line. Under `sm`, the nav moves to its own full-width row below so the actions stay beside the brand. |

The link for the current page gets `aria-current="page"` and lights up. A section link gets `aria-current="true"` on pages under it (`/packs` while on `/packs/123`). `/` only matches itself.

Only a path inside the app can be the current page. External URLs, relative hrefs (`#main`, `?page=2`) and text-only entries never are. Since 0.2.0, when no link can be, the nav skips the client list. With only external and text-only entries, it renders on the server alone and nothing in it hydrates. A relative href still renders `next/link`, which hydrates. When a link can be the current page, a small client list marks it. In 0.1.0 the whole nav is a client component, so it always hydrates.

Rendered from a Server Component, `SiteHeader` and `NavLinks` merge the nav's classes on the server, so tailwind-merge stays out of the browser (since 0.2.0; in 0.1.0 the nav always brings tailwind-merge to the browser). Rendered inside a Client Component, they merge them in the browser and bring tailwind-merge with them.

Next bundles every client component a route imports, rendered or not. So a page with `SiteHeader` still downloads the client list's small chunk (mostly `next/link`), even when the nav rendered on the server alone.

#### `NavLinks`

The `<ul>` of links `SiteHeader` uses, for building your own header. Put it inside a `<nav>`. Every native `<ul>` prop except `children`. Type: `SiteNavAlign`. It works in Server and Client Components. Since 0.2.0 it is a Server Component with a small client part (in 0.1.0 it is a client component). From a Server Component it behaves like `SiteHeader`'s nav. Inside a Client Component (a header with a menu toggle, say), it renders in the browser with the rest of that component: it merges its classes there, so tailwind-merge ships in that page's bundle.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `links` | `readonly SiteLinkItem[]` | required | The entries. An entry without an `href` renders as dimmed text with its `note` (no `aria-disabled` since 0.7.0: it isn't a control). |
| `align` | `"start" \| "center"` | `"start"` | As `navAlign` on `SiteHeader`. |

#### `SiteFooter`

Link columns, an extra slot, fine print, the haruhime.moe wordmark, a GitHub icon link and an optional Discord icon link. Every native `<footer>` prop except `children`. Type: `SiteFooterColumn` (`{ title: string; items: readonly SiteLinkItem[] }`).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `columns` | `readonly SiteFooterColumn[]` | `[]` | The columns sit in one `<nav>` (`navLabel`); each is a `<section>` headed by its title. Up to four columns side by side from `sm` up. Before 0.7.0 each column was its own `<nav>`. |
| `navLabel` | `string` | `"Footer"` | The nav landmark's name. Keep it different from `SiteHeader`'s `navLabel`, so the two landmarks tell apart (since 0.7.0). |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | The column titles' heading level (since 0.7.0). |
| `tools` | `HaruhimeToolsOptions` | none | Adds a "haruhime tools" column: the other live haruhime.moe tools as "name: blurb" links, then "All tools" on www. Options: `current` (the tool this footer is on, left out), `title` (`"haruhime tools"`), `allLabel` (`"All tools"`, `false` drops it), `allHref` (`"https://www.haruhime.moe"`), `position` (where among `columns`, default `1`, clamped). Since 0.6.0. |
| `extra` | `ReactNode` | none | Shown above the fine print, e.g. a "clear local data" button. |
| `finePrint` | `ReactNode` | none | One line of small print, in a `<p>`. |
| `parentLink` | `boolean` | `true` | Show the haruhime.moe wordmark linking the parent site. With it, the last row holds the wordmark and the icons, and the fine print sits above. Without it, the fine print shares the row with the icons. |
| `parentHref` | `string` | `"https://www.haruhime.moe"` | Where the wordmark links. |
| `githubHref` | `string \| false` | `"https://github.com/haruhimemoe"` | Where the GitHub icon links. `false` leaves it out. |
| `githubLabel` | `string` | `"haruhimemoe on GitHub"` | The GitHub link's accessible name. |
| `discordHref` | `string` | none | Where the Discord icon links, such as your server's invite (`https://discord.gg/...`). Without it there is no Discord icon. The icon sits before the GitHub icon at the same size. It stays white (`text-c1`) and dims on hover instead of changing color, since Discord's brand guidelines ask that the logo not be recolored. Since 0.3.0. |
| `discordLabel` | `string` | `"Discord"` | The Discord link's accessible name. Since 0.4.0. |

`HARUHIME_TOOLS` (each `{ id, name, href, blurb }`, type `HaruhimeTool`, ids `HaruhimeToolId`: `"packs" | "pools" | "bb"`) and `haruhimeToolsColumn(options)` (the same column as plain data, for a footer you lay out yourself) are exported too. Since 0.6.0. They are the one place outside the wordmark that names the haruhime.moe tools: a tool joins the list when it goes live.

#### `LinkTabs`

Since 0.4.0. A row of link tabs (Pools / Maps, All / Hidden): a named `<nav>` with a list of pill links. The current one gets `aria-current="page"` and a `b3` pill (underlined in forced colors mode). These are links, not ARIA tabs, since each loads its own URL. A Server Component: you say which is current. Every native `<nav>` prop except `children`. Type: `LinkTabItem`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | The nav landmark's accessible name. |
| `items` | `readonly LinkTabItem[]` | required | `{ href: string; label: ReactNode; current?: boolean }` for each tab, each with its own href. |

For a plain wrapping row of links instead of pills, use `LinkRow`. For a view switch with no URL of its own, use `SegmentedControl`.

#### `HeaderMenu` (client)

Since 0.4.0. The header's account menu: a button (an avatar and a name, say; at least 24px tall) that shows a small panel of links and extra controls such as a sign-out button. It is a disclosure, not an ARIA menu: the button has `aria-expanded` and `aria-controls`, and Tab moves through the panel. Escape closes it and puts focus back on the button; a click outside it, a click on one of its links, or focus leaving it closes it too. Every native `<div>` prop except `children`, for the wrapper. Type: `HeaderMenuItem`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The button's content. |
| `items` | `readonly HeaderMenuItem[]` | `[]` | `{ href: string; label: ReactNode }` links, top to bottom. |
| `children` | `ReactNode` | none | Shown after the links, such as a sign-out button. |
| `align` | `"start" \| "end"` | `"end"` | Which edge of the button the panel lines up with. |
| `buttonLabel` | `string` | none | The button's accessible name, when its content is only an image. |
| `buttonClassName` | `string` | none | Classes for the button, merged last. |

#### `PageShell`

The page frame: a skip link, the header, `<main>` and the footer, with the footer held to the bottom on short pages. Every native `<div>` prop; they and `ref` go on the outer wrapper `<div>`. Use `mainId` and `mainClassName` for `<main>`, and `document.getElementById(mainId)` to reach it from script.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | none | The page, inside `<main>` (`max-w-5xl`, centered, `px-4 py-10`). |
| `header` | `ReactNode` | none | Above `<main>`, usually a `SiteHeader`. |
| `footer` | `ReactNode` | none | Below `<main>`, usually a `SiteFooter`. |
| `skipLabel` | `string` | `"Skip to content"` | The skip link's text. It is the first thing Tab reaches and shows only when focused. |
| `mainId` | `string` | `"main"` | `<main>`'s id, which the skip link targets. |
| `mainClassName` | `string` | none | Extra classes for `<main>`, e.g. `"max-w-7xl"`. |

### osu!

Since 0.4.0. Display pieces for beatmaps, mod pools, map lists and (since 0.10.0) players. They take plain values (no osu! API types) and are Server Components.

#### `StarRating`

A star-rating pill colored on osu!'s difficulty spectrum: "★ 5.23" on the rating's color, dark text up to 6.5 and osu!'s pale yellow above, except where neither clears 4.5:1 on the pill (the violet band around 6.5 to 7 stars), which gets white (since 0.7.0). The spectrum is osu!'s own, the same at every `--hue`, so the pill sets its colors inline. Screen readers hear "5.23 stars" and the `label` after it. Every native `<span>` prop except `children`; a `style` you pass merges over the colors.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `value` | `number` | required | The rating, shown with two decimals. `NaN` shows as "–" on grey. |
| `label` | `ReactNode` | none | Read after the rating by screen readers, e.g. "with HR" (what a `title` tells mouse users). |
| `unit` | `string` | `"stars"` | The word read after the number. |

#### `BeatmapStats`

A beatmap's CS, AR, OD, HP, BPM and length as a compact `<dl>`, in that order. Stats you leave out (or that aren't finite) don't show. CS, AR, OD, HP and BPM are `<abbr>`s titled with their full names; screen readers get the full name instead of the letters (since 0.7.0). Every native `<dl>` prop except `children`. Type: `BeatmapStatKey`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `cs`, `ar`, `od`, `hp` | `number \| null` | none | Shown with at most one decimal. |
| `bpm` | `number \| null` | none | Shown whole. |
| `lengthSeconds` | `number \| null` | none | Shown as `m:ss`, or `h:mm:ss` from an hour. |
| `labels` | `Partial<Record<BeatmapStatKey, ReactNode>>` | none | Replaces a label (`{ length: "Länge" }`). |

#### `ModBadge`

A mod pool slot's pill (`NM1`, `HD2`, `TB`), colored by the first two letters: NM sky, HD amber, HR rose, DT and NC violet, FM emerald, TB orange, with dark text. Anything else is a `b3` pill. Every native `<span>` prop; `children` replace the text. A custom bucket picks its color with `color`: `<ModBadge mod={code} color={PALETTE[entry.color].toLowerCase() as ModBadgeColor} />`. `className` still recolors it (`bg-pink-300`) when `color`'s fixed list doesn't fit.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `mod` | `string` | required | The mod or slot label. |
| `color` | `ModBadgeColor` | from `mod` | Since 0.12.0. Overrides the bucket color: `sky`, `amber`, `rose`, `violet`, `emerald`, `orange` (the buckets), `green`, `teal`, `pink`, `lime`, `cyan`, `fuchsia`, `yellow`, `red`, `indigo`, `stone` (@haruhimemoe/pool's PALETTE, lowercased), or `neutral`. |

#### `PlayerCard`

Since 0.10.0. osu!-web's user card (the 120px card from the friends list and user tooltips): the profile cover under a dark overlay, the 60px avatar, the country flag, the team flag and the supporter heart, the username, and an optional status row. The whole card links to the osu! profile. Every native `<div>` prop except `children`.

It never fetches. Pass a snapshot you keep yourself (from one osu! API lookup, or typed by hand), so a page of cards costs no API calls and hits no rate limits. Leave `status` out for static data: the card draws no online or offline ring unless told to. Images are plain `<img>` tags (lazy; the avatar and flags are sized), so the app needs no `images.remotePatterns` for osu!'s hosts. A cover ending in `.gif` is hidden when the visitor asks for reduced motion.

```tsx
<PlayerCard
  username="peppy"
  userId={2}
  countryCode="AU"
  coverUrl="https://assets.ppy.sh/user-profile-covers/2/….jpeg"
  team={{ name: "mom?", flagUrl: "https://assets.ppy.sh/teams/flag/1/….png" }}
  supporter
  statusText="osu!"
/>
```

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `username` | `string` | required | The name on the card. |
| `userId` | `number` | none | The osu! id: the avatar comes from `https://a.ppy.sh/<id>` and the card links to `https://osu.ppy.sh/users/<id>`. |
| `href` | `string \| null` | the profile | Replaces the link; `null` draws none. Without a link the name is plain text. A linked card outlines on hover and on keyboard focus. |
| `avatarUrl` | `string` | from `userId` | Replaces the avatar. With neither, the name's first letter stands in. |
| `coverUrl` | `string` | none | The cover behind the card. None leaves it plain `b4`. |
| `countryCode` | `string` | none | ISO 3166-1 alpha-2. Draws osu!'s own flag (`osu.ppy.sh/assets/images/flags/<code points>.svg`); anything but two letters draws none. |
| `countryName` | `string` | English name from `Intl` | The flag's alt text. |
| `team` | `{ name, flagUrl }` | none | The team flag beside the country's, its alt text the team's name. |
| `supporter` | `boolean` | `false` | Draws the supporter heart. |
| `supporterLabel` | `string` | `"osu! supporter"` | What screen readers hear for the heart. |
| `status` | `"online" \| "offline"` | none | Draws the status ring (lime online, dark offline). |
| `statusText` | `ReactNode` | `"Online"`/`"Offline"` with a status | The bottom row's main line: a status, or anything short (a role). |
| `statusNote` | `ReactNode` | none | A small line above it ("Last seen 29 days ago", "formerly RMarc"). |

The bottom row is left out when there is no status, text or note; the card keeps its 120px height so cards line up in a grid. A card with a cover gets a `b5` overlay at 80%, enough for `c2` text at 12px to keep 4.5:1 over a white cover (axe can't check text over an image).

#### Map display (since 0.16.0)

`MapCard`, `MapSetCard`, `MapGroup`, `MapCover`, `MapPreviewButton` and `MapCopyScope` draw one map, a set, a bucket of maps and their covers and preview clips from plain props. None of them fetch. `MapCard`'s `map` prop takes `@haruhimemoe/osu`'s `BeatmapMeta` as-is: `<MapCard beatmapId={meta.beatmapId} map={meta} />` needs no adapter, since `MapData`'s field names match `BeatmapMeta`'s. An app with different field names writes one small mapping function instead (pools' `BuiltMap`, say): `{ beatmapsetId: m.setId, starRating: m.stars, lengthSeconds: m.length, creator: m.setHost, ... }`.

```tsx
<MapCard
  beatmapId={meta.beatmapId}
  map={meta}
  slot={{ label: "NM1" }}
  copyId
/>
```

**`MapCard`**

One map as a `row` (packs' slot row, the default) or a `card` (osu-web's beatmapset panel). Every native `<div>` prop except `children`, `title` and `slot` (the DOM attribute; `slot` here is the pool slot pill).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `beatmapId` | `number` | required | The difficulty. Links to its osu! page unless overridden. |
| `map` | `MapData \| null` | none | The map's data (`BeatmapMeta`-shaped). None draws `labels.fallbackTitle(beatmapId)`. |
| `state` | `"ready" \| "loading" \| "missing" \| "error"` | `"ready"` | `loading` shows skeleton bars and `aria-busy`; `missing`/`error` show a message instead of the map, with no cover, stats or background. |
| `message` | `ReactNode` | `labels.missing(id)` | The `error` state's message. |
| `layout` | `"row" \| "card"` | `"row"` | The row (compact list) or the card (osu-web panel) layout. |
| `background` | `"none" \| "cover" \| "blur"` | `"none"` | Draws the set's wide cover (or a blurred one) behind the card under a `b5/80` overlay. Ignored for `missing`/`error`. |
| `density` | `"comfortable" \| "compact"` | `"comfortable"` | `compact` tightens padding, shrinks the cover square and puts the byline on the title's line. |
| `coverUrl` | `string \| null` | derived from `map.beatmapsetId` | Replaces both the square and background cover URLs. `null` draws neither (no `♪` placeholder either). |
| `slot` | `{ label, mod?, color?, title? }` | none | A `ModBadge` pill (a pool slot like `NM1`). |
| `stars` | `number \| null` | `map.starRating` | Overrides the star pill's value. Non-finite numbers draw no pill. |
| `starsLabel` | `ReactNode` | none | Read after the rating by screen readers (`StarRating`'s `label`). |
| `starsNote` | `ReactNode` | none | A small note beside the star pill ("with HR"). |
| `starsTitle` | `string` | none | The star pill's hover `title` (packs' "rating with mods loading/failed" note). |
| `stats` | `Partial<Pick<MapData, "cs" \| "ar" \| "od" \| "hp" \| "bpm" \| "lengthSeconds">>` | from `map` | Overrides stats key by key; a key present (even `null`) wins over `map`'s. |
| `showStatus` | `boolean` | `true` for `card`, `false` for `row` | Shows the osu! status pill. |
| `statusLabel` | `string` | `MAP_STATUS_LABELS[status]` | Replaces the status pill's words. |
| `href` | `string \| null` | the osu! beatmap page | Replaces the title's link; `null` draws plain text. |
| `newTab` | `boolean` | `false` | Opens the link in a new tab (`rel="noopener noreferrer"`, and an `aria-label` carrying "(opens in a new tab)"). |
| `wholeCardLink` | `boolean` | `true` for `card`, `false` for `row` | Makes the whole card one click target (a `CardLink`) instead of linking only the title. |
| `copyId` | `boolean` | `false` | Shows a Copy ID button for `beatmapId`. |
| `titleAs` | `"p" \| "h2" \| "h3" \| "h4"` | `"p"` | The title's element, for a page that needs it in the heading outline. |
| `leading` | `ReactNode` | none | Before everything (a drag handle). |
| `preview` | `ReactNode` | none | Stacked on the cover square by grid (a `MapPreviewButton`), not `absolute`, so a whole-card link's lift can't move it. |
| `badges` | `ReactNode` | none | Beside the status pill. |
| `details` | `ReactNode` | none | A line under the stats (a row layout) or in the always-visible footer (a card layout). |
| `actions` | `ReactNode` | none | Buttons beside (row, below the 2xl container width) or in the footer (card). |
| `labels` | `Partial<MapCardLabels>` | `DEFAULT_MAP_LABELS` | Replaces any word MapCard shows or announces. |

Both layouts sit inside a `@container`, so a row's actions wrap under the text below a 42rem (`@2xl`) container width and sit inline from there; a long "Artist - Title" truncates with the full text in the title element's `title`. `MapCover`'s pixel sizes set each cover's aspect: 400x140 (`aspect-[20/7]`) for the card background and panel's wide spot, 900x250 (`aspect-[18/5]`) for a standalone wide cover, square (`aspect-square`) for the list/cover squares. `coverUrl={null}` draws no cover square at all (rows line up anyway); leaving it unset with no usable `beatmapsetId` draws the `♪` placeholder.

**`MapSetCard`**

A beatmapset and its difficulties: a header (cover, "Artist - Title" linked to the set, status, badges, mapper, note) over a list of `MapDifficultyRow`s in the order given. Backgrounds apply to the header only.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `beatmapsetId` | `number` | required | Links to the osu! beatmapset page unless overridden. |
| `artist`, `title` | `string` | required | The set's "Artist - Title". |
| `creator` | `string \| null` | none | Shown as `labels.setMappedBy(creator)` ("Mapped by \<creator\>"). |
| `status`, `statusLabel` | `string \| null`, `string` | none | The status pill, same words as `MapCard`'s. |
| `badges` | `ReactNode` | none | Beside the status pill. |
| `note` | `ReactNode` | none | A warning-toned line (a loud section, a removed difficulty). |
| `href`, `newTab` | `string \| null`, `boolean` | the set's osu! page | Same as `MapCard`'s. |
| `background`, `coverUrl` | `"none" \| "cover" \| "blur"`, `string \| null` | `"none"`, derived | Same as `MapCard`'s, applied to the header. |
| `preview` | `ReactNode` | none | Stacked on the header's cover. |
| `difficulties` | `readonly MapSetDifficulty[]` | required | Each: `beatmapId`, `version`, `stars?`, `starsNote?`, `starsLabel?`, `starsTitle?`, `stats?`, `href?` (`null` = plain text), `badges?`, `details?`, `actions?`. Each `<li>` carries `data-beatmap-id`. |
| `copyId` | `boolean` | `false` | A Copy ID button per difficulty, named with its version; the whole set is its own `MapCopyScope` (or joins the one it sits in). |
| `density` | `"comfortable" \| "compact"` | `"comfortable"` | Tightens padding and the cover square. |
| `emptyText` | `ReactNode` | `"No difficulties."` | Shown when `difficulties` is empty. |
| `labels` | `Partial<MapCardLabels>` | `DEFAULT_MAP_LABELS` | Same as `MapCard`'s. |

**`MapGroup`**

A bucket of maps: a labelled `<section>` with a heading (title, optional mod pill, a count or "count of target", a detail), actions beside it, the maps as list items, and empty-slot rows or a summary row. Every native `<section>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The heading's text. |
| `badge` | `{ mod, color? }` | none | An `aria-hidden` `ModBadge` pill before the title (kept out of the heading's accessible name). |
| `detail` | `ReactNode` | none | Words after the count ("Nomod"). |
| `count`, `target` | `number` | none | "(4)" or, with `target`, "(4 of 5)". Leaving `count` out and passing children with no count draws neither the count nor "No maps yet.". |
| `headingLevel` | `2 \| 3 \| 4` | `3` | The heading element. |
| `headingProps` | `ComponentProps<"h3">` | none | Extra heading props; its `id` wins over the generated one. |
| `actions` | `ReactNode` | none | Beside the heading (a "Find maps" button). |
| `list` | `"ol" \| "ul"` | `"ol"` | The list element. |
| `empty` | `ReactNode` | `"No maps yet."` | Shown when there is nothing to list. |
| `emptySlots` | `number` | `0` | Extra dashed `<li data-empty-slot>` rows (or one summary row with `emptySlotsAs="summary"`). |
| `emptySlotText` | `(n: number) => ReactNode` | `"Empty slot"` / `"N empty slots"` | Replaces an empty-slot row's text. |
| `emptySlotsAs` | `"rows" \| "summary"` | `"rows"` | One row per empty slot, or one row naming how many. |
| `copyScope` | `boolean` | `true` | Wraps the list in its own `MapCopyScope` (or joins the one it sits in). |

**`MapCover`**

A beatmapset's cover as a plain lazy `<img>` (no `next/image`, so an app needs no `images.remotePatterns` for `assets.ppy.sh`), sized from osu!'s own cover files so nothing shifts while it loads. With no usable set id and no `src`, it draws a `b5` box with a `♪` glyph instead.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `beatmapsetId` | `number \| null` | none | The set whose cover loads. |
| `src` | `string` | derived | Replaces the `assets.ppy.sh` URL (self-hosted covers, tests). |
| `size` | `"card" \| "card@2x" \| "list" \| "list@2x" \| "cover" \| "cover@2x"` | `"list@2x"` | osu!'s cover file: 400x140/800x280 (card), 150x150/300x300 (list, square), 900x250/1800x500 (cover). |
| `alt` | `string` | `""` | Decorative by default (a title sits beside it); pass one for a standalone banner. |
| `shape` | `"square" \| "wide"` | square for `list*`, wide otherwise | Overrides the aspect ratio. |

**`MapPreviewButton`**

A play/stop button for a set's preview clip from `b.ppy.sh`, filling its parent (`MapCard` stacks it on the cover square by grid, not `absolute`). One clip plays per page, at half volume (`PREVIEW_VOLUME`); a clip stops once no button for its set is mounted, or when ending on its own. `stopMapPreview()` stops whatever is playing (call it on a route change). Renders nothing for a set id that isn't a positive whole number. Client.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `beatmapsetId` | `number` | required | The set whose clip plays. |
| `song` | `string` | required | "Artist - Title", named in the button ("Play preview of \<song\>"). |
| `src` | `string` | derived | Replaces the `b.ppy.sh` clip. |
| `labels` | `{ play?, stop? }` | "Play/Stop preview of \<song\>" | Replaces the button's names. |

`mapCoverUrl(beatmapsetId, size?)` and `MAP_STATUS_LABELS` (`ranked`, `approved`, `loved`, `qualified`, `pending`, `wip`, `graveyard`, frozen) are the plain helpers `MapCard` and `MapSetCard` build on, exported for an app that draws its own covers or status words.

CSP: an app using the map display needs `img-src https://assets.ppy.sh` and, if it plays previews, `media-src https://b.ppy.sh`.

Accessibility: every control names its own map (Copy ID is "Copy ID \<id\>", the preview button is "Play/Stop preview of \<song\>"); an app adding its own slot actions should name them with the map the same way. Covers are decorative (`alt=""`); a loading `MapCard` is `aria-busy` with visible skeleton bars plus an sr-only "Loading beatmap \<id\>". Inside a `MapCopyScope`, only the Copy ID pressed last keeps "Copied."; a nested scope joins its outer one, so a page can wrap one scope around several `MapGroup`s (each already scoped) and still get one "Copied." at a time.

### MDX (server)

Since 0.9.0. Three subpaths, so an app that never renders Markdown loads none of this: `@haruhimemoe/ui/mdx` (the React pieces: `mdxComponents`, `CodeBlock`, `Callout`, and since 0.17.0 the article pieces `Figure`, `Steps`, `Embed`, `MdxLinkCard`, `Schedule`, `Glossary`, `Term`, `Kbd`), `@haruhimemoe/ui/remark` (plain functions, no React, for `@next/mdx` and `react-markdown`'s `remarkPlugins`), and `@haruhimemoe/ui/shiki` (opt-in code highlighting). The root `@haruhimemoe/ui` export adds `Toc` and `Kbd`/`kbdClasses` (0.17.0; see "Basics" and "Content" above).

**With `@next/mdx`:**

```ts
// next.config.ts
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  // Turbopack only takes MDX plugins as module names, not imported functions.
  options: { remarkPlugins: ["remark-gfm", "@haruhimemoe/ui/remark"] },
});

export default withMDX({ pageExtensions: ["ts", "tsx", "md", "mdx"] });
```

```tsx
// mdx-components.tsx
import { mdxComponents } from "@haruhimemoe/ui/mdx";
import "@haruhimemoe/ui/shiki"; // optional: see "Code highlighting" below

export function useMDXComponents(components) {
  return { ...mdxComponents, ...components };
}
```

`remark-gfm` isn't ui's dependency (pin it yourself); without it `@next/mdx` has no pipe tables, and a table with no GFM stays a paragraph.

**With `react-markdown`:**

```tsx
import { mdxComponents } from "@haruhimemoe/ui/mdx";
import remarkHaruhime from "@haruhimemoe/ui/remark";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";

<Markdown components={mdxComponents} remarkPlugins={[remarkGfm, remarkHaruhime]}>
  {body}
</Markdown>;
```

`mdxComponents` must render in a Server Component: `CodeBlock` (its `pre` override hands off to) is async, and a client component can't render an async one. A client-side renderer, like a live editor preview, can't use `pre` from this map; pass your own synchronous override for that case.

If you sanitize the output (`rehype-sanitize` or your own schema), allow `className` on `code` matching `/^language-/`, `dataMeta` on `code`, `dataCallout` on `blockquote`, and `id` on `h2`/`h3`: the remark plugin writes these, and `mdxComponents` reads them back. rehype-sanitize's default `clobberPrefix` renames those heading ids to `user-content-…`; pass `clobberPrefix: ""` (what haruhime.moe uses) to keep the plain id, or live with the prefix and update any hand-written anchor links to match.

#### `mdxComponents`

The element overrides apps pass to `@next/mdx`'s `useMDXComponents` or `react-markdown`'s `components`: `{ a, blockquote, details, div, h2, h3, h4, img, input, kbd, pre, table }` (`details`, `div`, `h4`, `img`, `input`, `kbd` since 0.17.0). Spread it and add your own (`{ ...mdxComponents, Example: LiveExample }`); your own key of the same name always wins.

| Element | Renders |
| --- | --- |
| `a` | `https://` opens in a new tab (`rel="noopener noreferrer"`); a same-page `#hash` is a plain anchor; everything else goes through `AutoLink` (`next/link`, or a plain `<a>` off-site). |
| `h2`, `h3`, `h4` | The heading with its id (from the remark plugin, or a `slugify` of its own text) and, beside it, a `#` anchor link (`aria-label="Link to section: …"`, always visible in `c4`, turning `h1` on hover, never only on hover). The GFM footnote label (`<h2 class="sr-only" id="footnote-label">`) renders bare, with no wrapper and no anchor. |
| `pre` | Reads its single `code` child (text, `language-x` class, the fence's meta) and renders `CodeBlock`. Anything else (a `pre` with no single `code` child) renders as a plain, focusable `<pre>`. |
| `table` | The table wrapped in a focusable, named scroll region: `<div role="group" tabIndex={0} aria-label="…">`, labelled by the table's `<caption>` text, or `"Table"` without one. |
| `blockquote` | A blockquote the remark plugin marked `data-callout` renders as `Callout` of that type; any other blockquote renders plainly. |
| `img` | A plain, lazy, async-decoded `<img>` (never `next/image`, so apps need no `remotePatterns` for Markdown images). |
| `input` | A GFM task-list checkbox becomes a named, disabled checkbox ("Done" / "Not done"); any other input passes through. |
| `details` | A native `<details>`/`<summary>` pair, the summary styled like `Disclosure`'s toggle button with a ▾/▴ arrow, server-only (works with no JS). |
| `kbd` | `Kbd`'s look. |
| `div` | A `remarkEmbeds` `data-embed` div renders `Embed`; any other div (MDX never routes a hand-written `<div>` here) passes through plainly. |

#### `CodeBlock`

An async Server Component: a header bar (the fence's `title`, or the language name, or `"Code"`) with a copy button, over a `<pre role="group" tabIndex={0}>` of lines. Every native `<div>` prop goes on the wrapper except `code`, `lang`, `title` and `highlight`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `code` | `string` | required | The text. Any line endings (`\r\n`, a trailing newline) are normalized; a lone trailing newline doesn't add a phantom last line. |
| `lang` | `string` | none | A Shiki language id or alias (`ts`, `tsx`, `js`, `json`, `bash`/`sh`/`shell`, `css`, `html`, `md`/`markdown`, `diff`, `yaml`/`yml`). Unknown languages render plain. |
| `title` | `string` | none | Shown in the header instead of the language; also names the `<pre>` and the copy button ("Copy x.ts"). |
| `highlight` | `readonly number[]` | `[]` | 1-based line numbers to mark: an `h1` left border and a `b4` tint (`forced-colors:border-[Highlight]` keeps the mark visible under Windows high contrast). |

In MDX, pass these through the fence's meta string instead of writing `CodeBlock` by hand: ` ```ts title="pool.ts" {2,4-5}`. `parseCodeMeta` reads `title="…"` or `title='…'` and `{1,3-5}` ranges (anything else is ignored, and it never throws); the language comes from the fence's own tag.

#### Code highlighting

`shiki` is an optional peer dependency: apps that never render code don't install it, and ui's only runtime dependency stays `tailwind-merge`. An app that renders code:

```sh
bun add shiki
```

```ts
// in the module that renders code: mdx-components.tsx, or next to your react-markdown call
import "@haruhimemoe/ui/shiki";
```

That import is a side effect: it registers a Shiki core highlighter (`shiki/core` with the no-WASM JS regex engine, loaded through dynamic `import()`) under `@haruhimemoe/ui/mdx`'s `CodeBlock`. The registration lives on `globalThis` for the whole process, not per module graph, but it only exists once the import has actually run: put it in the module that renders code (`mdx-components.tsx`, which reaches every MDX page, or directly beside your `react-markdown` renderer) so it runs before `CodeBlock` does. `package.json`'s `sideEffects` lists `./dist/shiki.js`, so bundlers don't drop the bare import; Turbopack resolves even a dynamic `import("shiki/core")` at build time, which is why highlighting is a separate subpath instead of `CodeBlock` importing it unconditionally.

Without the import, `CodeBlock` renders plain, unstyled lines, and in development it logs one `console.warn` per process ("code blocks aren't highlighted…"). A highlighter that fails to load (a missing package, a broken build) falls back the same way, warned once.

Tokens render as `<span style={{ color: "var(--shiki-token-…)" }}>`, no injected Shiki HTML, through `--shiki-*` custom properties in `theme.css` (see "Setup" above for loading it). They follow `--hue` like the rest of the palette: `--shiki-foreground` and `--shiki-background` are `c2`/`b6`; `-punctuation` is `c3` and `-comment` is `c4`, the palette tokens as-is; `-keyword` and `-link` are `hsl(var(--hue) 100% 78%)`, the palette's own hue with no offset; `-string`, `-string-expression`, `-constant`, `-function` and `-parameter` are each `calc(var(--hue) + N)`, a hue-offset HSL value. Every one stays at or above 4.5:1 against both `b6` (the block's background) and `b4` (a highlighted line's tint) at every integer hue. `keyword` and `link` get their own fixed lightness instead of reusing `h1`: `h1`'s default (76%) drops to 4.33:1 against `b4` at hue 240, and a `--h1-l` override written for other text shouldn't silently recolor code too.

#### `Callout`

A labelled aside: a left-border panel (`role="note"`) with an icon and a bold label, usable directly in MDX or rendered by `mdxComponents`' `blockquote` override.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `type` | `"note" \| "tip" \| "warning"` | `"note"` | The border color, icon and default label (`h1` / `c2` / `h2` border; "Note" / "Tip" / "Warning"). The type is in the text, never color alone. |
| `title` | `ReactNode` | the type's label | Replaces the default label. |
| `children` | `ReactNode` | required | The body. |

GitHub-style callout syntax works through the remark plugin: a blockquote whose first paragraph starts with `[!NOTE]`, `[!TIP]`, `[!WARNING]` (case-insensitive; GitHub's `[!IMPORTANT]` maps to `tip`, `[!CAUTION]` to `warning`) becomes a `Callout` of that type, the marker stripped:

```md
> [!NOTE]
> Packs are deleted after 90 days of no edits.
```

Or write `<Callout type="tip">` directly in an `.mdx` file.

#### `@haruhimemoe/ui/remark`

Plain functions (no React), for `remarkPlugins`. Default export `remarkHaruhime(options?)` runs all three transforms below in order and is what Turbopack needs by module name: `remarkPlugins: ["@haruhimemoe/ui/remark"]`. Named exports `remarkCodeMeta`, `remarkCallouts` and `remarkHeadingIds` run one each, for `react-markdown`'s array form or a custom pipeline.

| Option | Default | Turns off |
| --- | --- | --- |
| `codeMeta` | `true` | Copying a fenced code block's meta string onto `data-meta`, which `CodeBlock`'s fence syntax (`title=`, `{…}`) reads. |
| `callouts` | `true` | The `[!NOTE]` / `[!TIP]` / `[!WARNING]` blockquote markers. |
| `headingIds` | `true` | Slugged, deduplicated ids on `h2`-`h4` (since 0.17.0; was `h2`/`h3`). A heading that already has one keeps it. |
| `figures` | `true` | Since 0.17.0. A paragraph holding only an image becoming a `<figure>` with a trailing `<figcaption>` from its title. |
| `embeds` | `true` | Since 0.17.0. A paragraph holding only a bare YouTube/Twitch URL becoming a click-to-load player (see "Embeds" below). |
| `mdxExports` | `false` | Since 0.17.0. **On** adds `export const toc`, `readingMinutes` and `words` to the MDX module (off by default: react-markdown would try to render the ESM nodes). An export you already wrote under the same name wins. |
| `wordsPerMinute` | `200` | The rate `mdxExports`'/`articleData`'s reading time divides by. |
| `collect` | none | A function called with the same `{ toc, words, readingMinutes }` `mdxExports` would export; for react-markdown, which can't pass a function through Turbopack's serializable plugin options. |

`slugify(text)` and `createSlugger()` are also exported: lowercase, Unicode-aware (letters, marks, digits and underscores from any script survive; everything else but whitespace and hyphens is dropped), spaces to hyphens, repeats suffixed `-1`, `-2` like GitHub's own heading anchors. `@haruhimemoe/ui/mdx` re-exports `slugify` for apps that build their own heading links.

#### Articles

Since 0.17.0. `ContentPage` grew `authors`, `published`, `readingMinutes`, `toc` and `footer` for a blog post or a long guide, on top of the docs/legal page props it already had:

```tsx
// next.config.ts: Turbopack only takes MDX plugins by module name, and `mdxExports`
// (a boolean) is the one option that's safe to pass as a [name, options] tuple.
options: { remarkPlugins: ["remark-gfm", ["@haruhimemoe/ui/remark", { mdxExports: true }]] }
```

```tsx
const page = await import(`./posts/${slug}.mdx`) as MdxArticleModule;
<ContentPage
  title={meta.title}
  authors={[{ name: "David", userId: 2 }]}
  published={meta.published}
  readingMinutes={page.readingMinutes}
  toc={<Toc items={page.toc} />}
  footer={<PrevNext label="More posts" prev={prev} next={next} />}
  proseSize="sm" // dense docs and legal pages only; a blog post leaves it unset
>
  <page.default />
</ContentPage>
```

`MdxArticleModule` (from `@haruhimemoe/ui/mdx`) types that import: `{ default: (props) => ReactNode; toc: TocItem[]; readingMinutes: number; words: number }`, structural (no `@types/mdx` needed in a consuming app) so it's a plain type assertion (`as unknown as MdxArticleModule`) over whatever your MDX loader's types say.

#### New elements

Since 0.17.0, on top of `h2`/`h3`, code, tables and callouts:

| Element | Renders |
| --- | --- |
| `h4` | Same anchor-link treatment as `h2`/`h3` (id from the remark plugin, hover-revealed `#` link). |
| A lone image (`![alt](src "caption")`) | A `<figure>`; the title becomes a trailing `<figcaption>`. An image inside running text is untouched. Turn off with `{ figures: false }`. In MDX, `Figure` (below) adds sizes, a credit line and eager loading. |
| A task list (`- [ ] ...`) | `ul.contains-task-list` of `li.task-list-item`, each checkbox a named, disabled `MdxTaskCheckbox` ("Done" / "Not done": the list item's own text sits next to, not inside, the input). |
| A footnote (`[^1]`) | Standard GFM footnotes; the footnote section's label `h2` (`id="footnote-label"`) renders bare and `sr-only`, with no anchor link (it was a visible anchor beside invisible text). |
| `<details>`/`<summary>` | A native `details`/`summary` pair (works with no JS; browser find-in-page opens it), the summary styled like `Disclosure`'s toggle with a ▾/▴ arrow. |
| `` `kbd` `` / `<kbd>` | `Kbd`'s look (see "Basics" above). |
| A bare video URL on its own line | A click-to-load player; see "Embeds" below. Turn off with `{ embeds: false }`. |

#### Embeds

Since 0.17.0. A line holding only a YouTube or Twitch URL (`https://youtu.be/...`, `https://www.twitch.tv/videos/...`, a clip or a channel) becomes `Embed`: a 16:9 box that loads nothing from the provider until the reader clicks. Before a click it's a plain link to the watch page (works with JS off) over a poster image (YouTube's own thumbnail by default; Twitch has none). A URL `parseEmbedUrl` doesn't recognize renders as a plain link, never an iframe.

```tsx
<Embed url="https://youtu.be/dQw4w9WgXcQ" />
<Embed url="https://www.twitch.tv/videos/2245123456" poster={false} />
```

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `url` | `string` | required | A YouTube or Twitch URL, read by `parseEmbedUrl`. |
| `title` | `string` | `"YouTube video"` / `"Twitch video"` | The iframe's title and the play link's accessible name ("Play video: …"). |
| `poster` | `string \| false` | YouTube's thumbnail, none for Twitch | A poster image URL; `false` draws none. |

A modified click (Ctrl, Cmd, Shift, Alt, or a non-primary button) on the play link follows it to the provider's own page instead of swapping in the iframe, so "open in new tab" still works. If you set a Content-Security-Policy, the facade needs `frame-src www.youtube-nocookie.com player.twitch.tv clips.twitch.tv` and, for the YouTube poster, `img-src i.ytimg.com`.

#### Tournament posts

Since 0.17.0, for pool and bracket write-ups:

- `Schedule`: an ordered list of rows, each a `when` (plain text, or a `<time dateTime>` when you pass one), a bold label and an optional note.
- `Glossary` / `Term`: `Glossary` is a `<dl>` of entries (`{ term, definition, aliases? }`), each `dt` anchored at `#term-<slug>` (and at each alias's slug too); `Term` is a dotted-underline link to that anchor, from the link's own text or an explicit `term`.
- Task-list checklists (seeding steps, staffing checklists) work as plain Markdown task lists (see "New elements" above).
- `MapCard` / `MapGroup` (0.16.0) in MDX: add them to your `useMDXComponents` alongside `mdxComponents` (they aren't in `mdxComponents` itself, since most apps that render Markdown never show maps):

```tsx
import { MapCard, MapGroup } from "@haruhimemoe/ui";
import { mdxComponents } from "@haruhimemoe/ui/mdx";

export function useMDXComponents() {
  return { ...mdxComponents, MapCard, MapGroup };
}
```

#### Markdown mirrors

Since 0.17.0. An app that serves a page's raw Markdown alongside its rendered MDX (next-kit's `mdxToMarkdown`, for an LLM reader or `ContentPage`'s `markdownHref`) passes `mdxMarkdownTransforms` as `transforms`:

```ts
import { mdxMarkdownTransforms } from "@haruhimemoe/ui/remark";
mdxToMarkdown(source, { transforms: mdxMarkdownTransforms });
```

| Component | Becomes |
| --- | --- |
| `<Figure src alt caption />` | `![alt](src "caption")` |
| `<Embed url />` | The bare URL |
| `<MdxLinkCard href title description />` | `[title](href): description` |

Fenced code is left alone (the transforms run on the whole raw source, before next-kit's own fence split, so an example showing `<Figure ... />` in a code fence keeps it literal). `Schedule`, `Glossary`, `MapCard` and `MapGroup` have no Markdown shape to degrade to and are left as JSX, invisible to an `.md` mirror: write what an LLM reader needs as plain Markdown text beside them, not only inside their props.

#### Sanitizing Markdown

Since 0.17.0. `haruhimeSanitizeSchema(base, options?)` extends an `hast-util-sanitize` schema (usually `rehype-sanitize`'s `defaultSchema`) with the tags and attributes this kit's plugins write and `mdxComponents` reads (`figure`/`figcaption`/`picture`/`source`, `h2`-`h4` ids, code language and fence meta, callout markers, embed divs). `base` is never mutated. `trusted: true` drops the id prefix (`clobberPrefix: ""`), for content from your own repos only (its own READMEs, changelogs); untrusted content (the default) keeps ids prefixed `user-content-`, so a raw `<img name="getElementById">` or `<a id="location">` can't clobber a global.

`rehypeLocalHrefs(options?)` runs after the sanitizer: an in-page `#x` link whose target only exists as `user-content-x` (the sanitizer prefixed the id but not the href) is rewritten to match. Full react-markdown recipe:

```tsx
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkHaruhime, { haruhimeSanitizeSchema, rehypeLocalHrefs } from "@haruhimemoe/ui/remark";
import { mdxComponents } from "@haruhimemoe/ui/mdx";

let data: ArticleData = { toc: [], words: 0, readingMinutes: 1 };
const body = Markdown({
  children: source,
  components: mdxComponents,
  remarkPlugins: [remarkGfm, [remarkHaruhime, { collect: (d) => { data = d; } }]],
  remarkRehypeOptions: { clobberPrefix: "" },
  rehypePlugins: [rehypeRaw, [rehypeSanitize, haruhimeSanitizeSchema(defaultSchema)], rehypeLocalHrefs],
});
```

With `trusted: false` (the default), a `Toc` built from `data.toc` points at ids the sanitizer never prefixed (the TOC is built before sanitizing runs), so map each item's `href` to `user-content-<id>` yourself before passing it to `Toc`:

```tsx
<Toc items={data.toc.map((item) => ({ ...item, id: `user-content-${item.id}` }))} />
```

With `trusted: true` (haruhime.moe's own READMEs and changelogs), ids keep no prefix and `Toc` needs no mapping.

#### Accessibility

- The `<pre>` `CodeBlock` renders and the `<div>` `mdxComponents`' `table` wraps a table in are both `role="group"` with `tabIndex={0}` and an `aria-label` (`pre` may not be named on its own): keyboard users can reach a sideways scroll that a mouse would otherwise require. Do the same for any `pre` you render yourself inside `Prose`.
- Heading anchor links are always visible (`c4`, turning `h1` on hover), never hover-only, and at least 24px; their `aria-label` ("Link to section: …") keeps the heading's own accessible name as its own text.
- `CodeCopyButton` reports "Copied" or "Copy failed" through a live region mounted before use, like `CopyButton`.
- `Callout` is `role="note"` with the type in text, not color alone; highlighted code lines keep a `forced-colors` border so Windows high contrast mode still shows them.
- Since 0.17.0: `Embed`'s play link is named "Play video: …" and reachable by keyboard; `Toc`'s phone disclosure and wide-screen column share one accessible name ("On this page") without duplicating an id; `MdxDetails` works with no JS at all (native `details`/`summary`, so browser find-in-page can open it).

`Prose` (in "Basics" above) styles a direct-child `pre` with its own fence look, so `CodeBlock` (which isn't a direct child; `mdxComponents`' `pre` override renders it) is untouched when both are in play. `Prose` also styles `blockquote`.

### Palette (client)

Since 0.8.0. A command palette: press Ctrl K (⌘K on a Mac) anywhere on the page and a dialog opens with a search box over everything the app can do. It is one component for every haruhime tool: `CommandPalette` is the engine, `siteCommands` the defaults every site shares, and each app plugs in its own commands, pages and search providers through the same `Command` and `Provider` types. No new dependency.

Mount it once, from a client file, since commands carry functions. The button goes in `SiteHeader`'s `actions`:

```tsx
// src/components/Palette.tsx
"use client";

import { type Command, CommandPalette, siteCommands } from "@haruhimemoe/ui";
import { HEADER_LINKS } from "@/constants/nav";

const COMMANDS: Command[] = [
  ...siteCommands({ pages: HEADER_LINKS, tools: "packs", repo: "https://github.com/haruhimemoe/packs.haruhime.moe" }),
  { id: "pack.new", title: "New pack", group: "Packs", shortcut: "g n", run: (ctx) => ctx.navigate("/new") },
];

export function Palette() {
  return <CommandPalette storageKey="packs" commands={COMMANDS} />;
}
```

```tsx
// app/layout.tsx
<SiteHeader brand={...} links={HEADER_LINKS} actions={<CommandPaletteButton>Search</CommandPaletteButton>} />
<Palette />
```

#### `CommandPalette`

The dialog. Renders nothing until opened, then a native `<dialog>` (modal, backdrop, scroll locked) with a combobox over a listbox. Mount one per app. Built on `Dialog` since 0.14.0: closing puts back the page's own inline overflow, and a drag that ends on the backdrop doesn't close it.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `commands` | `readonly Command[]` | required | The root rows. Read on every open, so a command's `when` and titles can change. |
| `providers` | `readonly Provider[]` | none | Searched at the root as you type, once the query reaches each one's `minLength`. |
| `storageKey` | `string` | `"default"` | Namespaces the recents in `localStorage` (`haruhime:palette:<key>`). |
| `hotkey` | `string` | `"mod+k"` | The toggle, in shortcut syntax. `mod` is ⌘ on a Mac and Ctrl elsewhere. |
| `placeholder` | `string` | `"Search commands…"` | The root input's placeholder. |
| `label` | `string` | `"Command palette"` | The dialog's and the input's accessible name. |
| `calculator` | `boolean` | `true` | A `= 42` row for a query that computes (`2*21`), first in the list; Enter copies the result. |
| `recents` | `boolean` | `true` | A Recent group of the last five commands run, and a ranking boost by how often each ran. |
| `className` | `string` | none | Classes for the panel. |

Keys: ↑ ↓ move (wrapping), Home and End jump, Enter runs the active row, Escape goes back a level and then closes, Backspace on an empty input goes back a level, Tab stays put (focus never leaves the input), and the hotkey (a combo, not a chord) toggles the palette from anywhere, a field included, without typing into it. A click on the backdrop closes it, and so does the browser (a back gesture on Android). Focus returns to whatever had it. The footer reads the result count, or the copy outcome until the query changes.

Typing filters the rows with a fuzzy match: a letter or digit must start a word or follow the previous match ("cpu" finds "Copy page URL", "go" doesn't find "Sign out"), except in scripts without case or spaces (kanji, kana), which match anywhere; the title weighs most, then `keywords`, `subtitle` and `group`. Matched letters are marked. With an empty query every command is listed under its group, in order, after the Recent group.

#### `Command`

| Field | Type | What it does |
| --- | --- | --- |
| `id` | `string` | Unique in the app. Recents are stored by it, so keep it stable when a title changes. |
| `title` | `string` | The row. |
| `subtitle?` | `string` | A smaller second line. |
| `icon?` | `ReactNode` | A 20px slot before the title. |
| `keywords?` | `string[]` | Matched at a lower weight than the title. |
| `group?` | `string` | The heading the row sits under. Default `"Commands"`. |
| `shortcut?` | `string` | Shown as keys on the row, and active while the palette is mounted and closed: a combo (`"mod+shift+c"`, `"?"`) or a chord of two bare keys (`"g p"`, within 800 ms). Never fires from a field. |
| `when?` | `(ctx) => boolean` | Hidden when false. Read on every render of the list. |
| `run?` | `(ctx, args) => void \| Promise<void>` | What it does. A rejection is logged; the palette stays usable. |
| `page?` | `Page` | Instead of `run`: Enter pushes this page (its `commands` and `providers`), with the page's title as a crumb. |
| `args?` | `ArgSpec[]` | Prompts collected before `run`, one at a time: `{ name, label, type: "text" \| "number" \| "choice", choices?, validate? }`. A `choice` lists its `choices` as rows (fuzzy-filtered); `text` and `number` take the input on Enter; `validate` returns a message to block it. `run` gets them as `args[name]`. |
| `closeOnRun?` | `boolean` | Default `true`. |

`PaletteContext` (the `ctx` a command runs with): `navigate(href)` (`router.push`), `close()`, `push(page)` (opens the palette first when closed), `copy(text)` (clipboard, announcing "Copied" or the failure), `pathname`, and `commands` (every root command, so a page can list them).

#### `Provider`

`{ id, group?, minLength? = 2, debounceMs? = 200, search(query, signal) }`. `search` returns `Command[]` for the query and must honor the `AbortSignal`: a newer query aborts the older search, and a late result is dropped. Its rows sit under `group` (default "Results") after the static matches; while it runs the list is `aria-busy`, says "Searching…" and keeps the last rows in place, so nothing flashes per keystroke; an error says "Couldn't search, try again". `fuzzyScore(query, text)` is exported so a provider can rank its rows the way the palette does.

#### `openCommandPalette(page?)`

Opens the mounted palette from anywhere (a button, a tour), onto `page` when given. It dispatches a `window` event, so it works from a Server Component's client child without a ref.

#### `CommandPaletteButton` (client)

A ghost `Button` with a magnifier, your `children` beside it and the hotkey hint (`Ctrl K`, or `⌘K` once a Mac is detected after mount; decorative, so it isn't part of the name; hidden under `sm`, leaving just the magnifier). With `children`, that text is the button's name; without, `label` is (default "Open command palette"). Every `Button` prop except `onClick`.

#### `siteCommands(options)`

The defaults every tool gets, in order: Navigate, Page, Account, Help. Pass only what the app has.

| Option | Type | What it builds |
| --- | --- | --- |
| `pages` | `SiteLinkItem[]` | "Go to <label>" per linked nav item (`site.go.<slug>`). |
| `tools` | `HaruhimeToolId \| false` | "Open <tool>" for every other tool in `HARUHIME_TOOLS` plus "Open haruhime.moe" (`site.tool.<id>`, `site.tool.home`). `false` leaves them out. |
| `repo` | `string` | "Open on GitHub" (`site.github`) and "Report a bug" (`site.report`, the repo's new-issue page). |
| `account` | `{ signedIn, signInHref, accountHref?, signOutHref? }` | "Sign in" (`site.sign-in`) while signed out; "My account" (`site.account`) and "Sign out" (`site.sign-out`, navigated, as next-kit's route expects) while signed in. |
| `include` | `("navigate" \| "page" \| "account" \| "help")[]` | Which groups. Default all. |

Always there: "Copy page URL" (`site.copy-url`, mod+shift+c), "Go back" (`site.back`), "Scroll to top" (`site.top`, instant under reduced motion), "Reload page" (`site.reload`) and "Keyboard shortcuts" (`site.shortcuts`, `?`), a page listing every command that has a shortcut, the app's included.

#### Calculator

`evaluate(expression)` and `formatResult(value)` are exported. The grammar: `+ - * / % ^`, unary minus, parentheses, `k` and `m` suffixes (`1.5k`), `pi` and `e`, and `sqrt`, `abs`, `round`, `floor`, `ceil`, `min` and `max`. Anything else, and a result that isn't finite, is `null`. In the palette a bare number or word is a search, not a sum.

#### Accessibility

The input is a `combobox` over a `listbox`; the active row is named by `aria-activedescendant`, so focus never leaves the input. The active row shows an `h1` left edge as well as a tint, the input row's bottom border turns `h1` while it has focus, hint rows ("Searching…", "No matching commands") are disabled options, an argument's error is an always-mounted `role="status"`, group headings aren't uppercase, rows are 36px, and the footer's `<output>` reads the result count and the copy outcome. `bun run play:axe` runs axe-core in Chromium over the open palette's states with contrast on.

### Sortable lists (client)

Since 0.15.0. Reorder rows by mouse, touch or pen, by keyboard, and with Up and Down buttons, every move announced. Pointer events only (no HTML5 drag and drop), no dependencies. Your app owns the data: the kit reports a `SortableMove` and you apply it, change it or refuse it.

#### One list

```tsx
"use client";

import { SortableList, moveItem } from "@haruhimemoe/ui";
import { useState } from "react";

function Slots() {
  const [slots, setSlots] = useState(["NM1", "NM2", "HD1"]);
  return (
    <SortableList
      items={slots}
      getId={(slot) => slot}
      getLabel={(slot) => slot}
      label="Slots"
      className="gap-2 [--sortable-gap:0.5rem]"
      itemClassName="flex items-center gap-2 rounded bg-b3 px-2 py-1"
      onMove={({ from, to }) => setSlots((was) => moveItem(was, from.index, to.index))}
    >
      {(slot, { handle, moveButtons, lifted }) => (
        <>
          {handle}
          <span>{lifted ? `${slot} (moving)` : slot}</span>
          {moveButtons}
        </>
      )}
    </SortableList>
  );
}
```

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `items` | `readonly T[]` | | The rows, in order. |
| `getId` | `(item: T) => string` | | A stable id per row. |
| `getLabel` | `(item: T) => string` | | The name spoken in announcements and on the handle and buttons. |
| `label` | `string` | | The container's own name (used once several lists share a hook). |
| `sortable?` | `Sortable` | | Join a shared `useSortable()` hook instead of making its own; see "Several lists with the hook". |
| `id?` | `string` | `useId()` | The container's id. Required (and must be stable) when passing `sortable`. |
| `onMove?` | `UseSortableOptions["onMove"]` | | Required unless `sortable` is given (the shared hook's `onMove` runs instead). |
| `canDrop?` | `UseSortableOptions["canDrop"]` | | |
| `announcements?` | `Partial<SortableAnnouncements>` | | |
| `disabled?` | `boolean` | `false` | |
| `mode?` | `"between" \| "onto"` | `"between"` | |
| `axis?` | `"vertical" \| "horizontal"` | `"vertical"` | |
| `as?` | `"ol" \| "ul"` | `"ol"` | |
| `moveButtons?` | `boolean` | `true` | Render `SortableMoveButtons` in the row context. Keep this on; see "Keep the buttons". |
| `itemClassName?` | `string` | | Added to every `<li>`, after `SORTABLE_ITEM`. |
| `itemProps?` | `(item: T, index: number) => Omit<ComponentProps<"li">, "children" \| "ref">` | | Per-row `<li>` attributes (a name, a selected border, a focus handler). The sortable data attributes always win over anything returned here. |
| `children` | `(item: T, ctx: SortableRowContext) => ReactNode` | | The row. `ctx` is `{ index, handle, moveButtons, lifted }`: a ready `SortableHandle` and `SortableMoveButtons` (or `null` with `moveButtons={false}`) to place where the row's layout wants them, and whether this row is the one being dragged. |

#### Several lists with the hook

For more control than `SortableList` gives (custom row markup entirely, several containers with different shapes, a list that isn't a `<ol>`), call `useSortable` directly:

```tsx
"use client";

import {
  SortableHandle,
  SortableLayer,
  SortableMoveButtons,
  SORTABLE_CONTAINER,
  SORTABLE_ITEM,
  useSortable,
} from "@haruhimemoe/ui";

function Board({ nm, hd, onMove }) {
  const sortable = useSortable({
    onMove,
    canDrop: (move) => (move.to.container === "hd" && hd.length >= 8 ? "HD is full." : true),
  });
  return (
    <>
      <SortableLayer sortable={sortable} />
      <ol {...sortable.container("nm", { label: "NM", mode: "between" })} className={SORTABLE_CONTAINER}>
        {nm.map((map, index) => (
          <li
            key={map.id}
            {...sortable.item(map.id, { container: "nm", index, label: map.name })}
            className={SORTABLE_ITEM}
          >
            <SortableHandle sortable={sortable} id={map.id} />
            <span>{map.name}</span>
            <SortableMoveButtons sortable={sortable} id={map.id} label={map.name} />
          </li>
        ))}
      </ol>
    </>
  );
}
```

`mode: "between"` shows an insertion line and reports where the item lands; `to.index` is the item's final index in `to.container`, the same meaning as `@haruhimemoe/pool`'s `moveBucket`. `mode: "onto"` drops on an item or on the container's own empty space; `onto` is then the item's id it landed on, or `null` for the container. Containers can nest (a candidate list inside a bucket); the deepest one under the pointer wins the hit test. An item with `draggable: false` is a drop target only, never lifted (an empty slot row). `SortableList`'s `sortable` and `id` props join a list onto a hook made this way, so several `SortableList`s can share one live region and one `canDrop`.

#### Keyboard

| Key | What it does |
| --- | --- |
| Space, Enter | Pick up the focused handle; drop the lifted item. |
| Arrow keys | Move to the next target along the axis (or across to the next "onto" item). |
| Home, End | Jump to the first or last target in the current container. |
| PageUp, PageDown | Jump to the previous or next container. |
| Escape | Cancel, back to where it started. |
| Tab | Cancels too, and still moves focus on. |

A click with `detail === 0` (how screen readers in browse mode deliver Space and Enter) lifts and drops exactly like a key press; a real mouse click on the handle does nothing. Focus never leaves the handle mid-drag.

#### Keep the buttons

`moveButtons` defaults to on, and should stay on: WCAG 2.2 2.5.7 (Dragging Movements) wants a way to do what a drag does with a single pointer, and screen readers in browse mode and VoiceOver on iOS don't forward arrow keys to the page. Cross-container moves from a button (or from your own code) go through `sortable.moveTo(id, { container, index })`, which clamps the index into the destination's range.

#### Refusing moves

`canDrop` is checked on every hover and keyboard step: return `true` to allow, `false` to refuse with no reason, or a string to refuse with a reason (the target looks refused, and the chip and the announcement say why). `onMove` itself can return `false`, a reason string, or a `Promise` of either; while it is pending every handle in the hook gets `aria-disabled` and new lifts or moves are ignored until it settles. A rejected promise counts as a plain refusal (no reason is read from the error).

#### Focus and announcements

After an accepted move, the handle keeps focus, even when its row remounts in a different container on the next render. If the item itself is gone (the app removed it), the destination container gets focus instead. A move button keeps focus after moving its item, or focus goes to the other button when this one reached an end (Up disables at the top, so focus lands on Down). Every announcement is overridable per key:

```tsx
useSortable({
  onMove,
  announcements: {
    handle: (label) => `Drag ${label}`,
  },
});
```

Defaults: `"Press Space or Enter to pick up. Use the arrow keys to move, Space or Enter to drop, Escape to cancel."`, `handle: (label) => \`Reorder ${label}\``, and position-based sentences for lifted, over, dropped, refused and cancelled (`"Picked up A. Position 1 of 3 in NM."`, `"A: position 2 of 3 in NM."`, `"Dropped A. Position 1 of 3 in HD."`, `"A can't go there: HD is full. Back at position 1 of 3 in NM."`, `"Cancelled. A is back at position 2 of 3 in NM."`).

#### Look

Data attributes, for your own CSS or for reading in tests: `data-sortable-state="lifted"` on the item being dragged, `data-sortable-drop` (`"before" | "after" | "onto"` on an item, `"inside"` on a container) and `data-sortable-line` (`"top" | "bottom" | "left" | "right"`) on the element showing where a drop lands, and `data-sortable-refused` when that target is refused. `SORTABLE_ITEM` draws the insertion line as a 2px `h1` border (`c4` when refused) in a `before:` pseudo-element, centred in the container's `--sortable-gap` custom property (default `0`; set it to your list's actual row gap), plus a dashed outline for an "onto" target and for the lifted item itself. `SORTABLE_CONTAINER` draws the same dashed outline when the container itself is the target. No opacity is used anywhere (the house rule against opacity on text); the line fades in on the motion tokens, and forced colors (Windows high contrast) keep a solid border. The handle is a 24px target, 44px on coarse pointers (`coarse:size-11`), with `touch-action: none` so a finger on the handle drags while the rest of the row still scrolls normally.

#### Server and client

The barrel stays importable from a Server Component. `moveItem`, `SORTABLE_ITEM` and `SORTABLE_CONTAINER` are plain values and work anywhere. `useSortable` and `SortableList` are client-only. `SortableHandle`, `SortableMoveButtons` and `SortableLayer` carry no directive of their own, but each takes a `Sortable`, so only a client component (one that already called `useSortable` or holds one from `SortableList`) can render them.

#### Not included

Grids (two-dimensional reordering), dragging between separate windows or apps, live sibling reflow or drop animations while dragging, and multi-select drags.

### Tables

Since 0.4.0. `Table`, `THead`, `TBody`, `Th` and `Td` give a data table the apps' look: full width, small left-aligned text, muted capitals in the head and a rule above each body row. They are Server Components, and each takes its element's native props, `className` (merged last) and `ref`. Use plain `<tr>` for rows.

```tsx
<Table caption="The pool's maps" hideCaption>
  <THead>
    <tr>
      <Th>Slot</Th>
      <Th numeric>Stars</Th>
    </tr>
  </THead>
  <TBody>
    {slots.map((slot) => (
      <tr key={slot.label}>
        <Th scope="row">{slot.label}</Th>
        <Td numeric>{slot.stars}</Td>
      </tr>
    ))}
  </TBody>
</Table>
```

| Component | Extra props | What it renders |
| --- | --- | --- |
| `Table` | `caption?: ReactNode`, `hideCaption?: boolean` (default `false`), `wrapperClassName?: string`, `scrollLabel?: string` (default `"Table"`) | A `<section>` that scrolls sideways on phones, around the `<table>`. It takes keyboard focus (`tabindex="0"`) so the scroll is reachable without a mouse, and is named by the caption, or by `scrollLabel` without one (since 0.7.0; a plain `<div>` before). `className` and `ref` go on the `<table>`. The caption names the table; `hideCaption` keeps it for screen readers only, when a heading already shows. |
| `THead` | none | A `<thead>` in `c3`, `text-xs`, uppercase. |
| `TBody` | none | A `<tbody>` whose rows get a `b4` top border. Add `[&>tr]:align-top` for rows of mixed height. |
| `Th` | `numeric?: boolean` | A `<th>` with `scope="col"` by default. With `scope="row"` it is a row's heading, in bold `c1`. |
| `Td` | `numeric?: boolean` | A `<td>`. `numeric` lines up digits (`tabular-nums`). |

Cells get `py-2 pr-3`, and the last cell of a row no right padding.

### Utilities

#### `cx`

Since 0.4.0. `cx(...classes: ClassValue[]): string` is the class merger every component uses: it skips falsy values and resolves Tailwind conflicts with tailwind-merge, so a later class wins (`cx("w-full", cond && "w-auto")`). Type: `ClassValue` (`string | false | null | undefined | 0`). It imports tailwind-merge, so a client file that uses it sends tailwind-merge to the browser.

## Accessibility

The target is WCAG 2.2 AA. House rules, which every component follows and your own code around them should too:

- **Focus is always visible, and always the same.** The theme draws a 2px `h1` outline, offset 2px, on `:focus-visible`. Fields keep it (since 0.7.0; before, they swapped it for a 1px border change) and add an `h1` border. `RangeSlider` thumbs show a solid `h1` ring instead and keep a transparent outline, so Windows high contrast mode (forced colors) still paints one. Never `outline: none`.
- **Targets are 24px or more, 44px on coarse pointers** (WCAG 2.2 2.5.8, and 2.5.5 on touch): buttons are `h-9` (`h-11` on a touchscreen since 0.12.0), chips and tabs 24px tall, slider thumbs 24px (since 0.7.0), checkboxes and radios 24px and the `Disclosure` and `HeaderMenu` buttons at least 24px tall (since 0.8.0). On a coarse pointer (since 0.12.0) buttons, chips, checkbox and radio rows, tabs, menu items, palette rows, the filter panel's toggle, code copy buttons, content nav links and fields grow to 44px. Text links in running text stay as they are (2.5.8 exempts inline targets).
- **Contrast is computed, not eyeballed.** The test suite checks `c1` on `h2`, `h1` on `b4` and `b5`, and the hue overrides under Setup; `StarRating` picks its text color by contrast. Text is never dimmed with `opacity` (a `text-c4` line at 70% opacity drops under 4.5:1): use a lighter palette step instead.
- **Motion follows the browser.** Under `prefers-reduced-motion: reduce` every transition and animation finishes in 0.01ms (since 0.12.0); `data-motion="essential"` is the one way out. `useMotionAllowed` covers motion JavaScript drives.
- **High contrast.** Under `prefers-contrast: more` the text steps lighten, `h2` darkens and shapes that rely on a background shade get a `c4` edge (since 0.12.0). Forced colors (Windows high contrast) keep a 1px border on buttons, cards, chips and badges.
- **Color never carries meaning alone.** Accent links are underlined, a pressed `Chip` is `aria-pressed`, the current nav link is `aria-current`, `CharCounter` says "over the limit" in words, errors are text.
- **Live regions exist before they speak.** `CopyButton`, `AsyncButton`, `CharCounter live`, `FilterPanel`'s count and `ReportDisclosure`'s outcome render their `<output>` or `role="status"` node up front, empty, and swap the text in. Field errors are `role="status"` (polite); `Notice live tone="error"` is the one `role="alert"`.
- **Focus never falls to the body.** When the control you pressed goes away, focus moves somewhere sensible: `FilterPanel` to its heading, `Pagination` to "Page X of Y", `InlineConfirm` back to its trigger, `Dialog` and `ConfirmDialog` back to what opened them, or to `returnFocus`, `ReportDisclosure` to its outcome line. Pending buttons use `aria-disabled`, not `disabled`, so focus stays.
- **The palette is a combobox.** `CommandPalette` keeps focus on its input and names the active row with `aria-activedescendant`; the row shows its state with an `h1` edge, the input row shows focus, and `bun run play:axe` checks its open states in a real browser (since 0.8.0).
- **Landmarks are few and named.** `PageShell` gives a skip link and `<main>`; `SiteHeader` one `<nav>` (`navLabel`, default "Main"); `SiteFooter` one `<nav>` (`navLabel`, default "Footer") with a headed `<section>` per column; `Pagination` and `LinkTabs` are labelled `<nav>`s. Give two of a kind different labels.
- **Scrollable regions take focus.** `Table`'s wrapper is a focusable named section. Do the same for a `pre` inside `Prose`.
- **Native first.** Fields are native inputs, selects and textareas; radios and checkboxes are native with a visible label; `RangeSlider`'s thumbs are native range inputs with `aria-valuetext` ("10+" reads as it shows); `Disclosure` and `HeaderMenu` are buttons with `aria-expanded` and `aria-controls`; `Tabs` follows the ARIA tabs pattern (one tab in the Tab order, arrows, Home and End, `aria-controls`). ARIA only where HTML has no element.
- **Every drag has a keyboard and a button path.** Sortable lists lift with Space or Enter, move with the arrows and keep Up and Down buttons (WCAG 2.2 2.5.7); every move is announced in an assertive live region that exists before it speaks (since 0.15.0).
- **Groups are named.** `ChipGroup`, `RangeSlider`, `RadioGroup`, `FilterRow` and `SegmentedControl` (since 0.13.0) are fieldsets named by their label. Inside a `FilterRow`, `hideLabel` leaves the naming to the row, so each row is announced once.
- **One link per card.** `LinkCard` (since 0.13.0) covers itself with one `CardLink`, named by its own text, and lifts every other link, button and field inside above that cover, so they stay reachable and don't stack a second click target.
- **Radios, not links, switch a view with no URL.** `SegmentedControl` (since 0.13.0) is native radios: Tab lands on the checked one, arrows move and pick, and a stale value checks none of them without breaking the Tab stop.
- **Icons are decorative; links and buttons have names.** `DiscordIcon` and `GitHubIcon` are hidden from screen readers; give the link around each one an `aria-label`, as `SiteFooter` does. Give icon-only buttons an `aria-label`, and keep `label` props meaningful. `BeatmapStats` reads "Circle size" where it shows "CS".
- **Tested.** Every component is checked with axe-core's WCAG 2.0, 2.1 and 2.2 A and AA rules in the test suite (color contrast excepted: that needs a real browser). The consumer check then renders every component in a real Next.js app and runs axe in headless Chromium with contrast and target-size checks on, at a desktop and a phone width; the sites run the same pass over their pages. Interactive ones also have keyboard tests.

## Compatibility

| Requirement | Supported |
| --- | --- |
| Next.js | 16 (app router). Components use `next/link` and `next/navigation`. |
| React | 19 |
| Tailwind CSS | 4.1 or later (4.x), through `@tailwindcss/postcss` |
| Node.js | 22.12 or later (`engines`) |
| Module format | ESM only. Plain Node and Vitest can import it (for component tests in your app). |
| Theme | Dark only |

## Changelog and contributing

See [CHANGELOG.md](./CHANGELOG.md) for what changed in each version and [CONTRIBUTING.md](./CONTRIBUTING.md) to work on the package. `bun run play` serves `playground/`, a small Next.js app in the repo that renders the components straight from `src/`, for trying a change by hand. Report security issues as described in [SECURITY.md](./SECURITY.md). Bring questions and feedback to the haruhime.moe [Discord server](https://haruhime.moe/discord).

## License

[MIT](./LICENSE)
