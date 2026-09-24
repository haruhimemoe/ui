# @haruhimemoe/ui

React components for the haruhime.moe osu! tools on Next.js. It ships the osu!-web-style palette as a Tailwind 4 theme, plus buttons, cards, form fields, filter controls (toggle chips, a two-thumb range slider, a filter panel) and the site header, footer and page frame. Most components are Server Components. The few that need the browser carry `"use client"` in their own files, so you import everything from one place.

## Requirements

- Next.js 16 (app router)
- React 19
- Tailwind CSS 4

These are peer dependencies. The package is ESM only.

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

**1. Import the theme after Tailwind** in the app's global stylesheet:

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

**2. Load Nunito** with `next/font` as the `--font-nunito` variable on `<html>`. The theme's `font-sans` uses it, and falls back to the system font without it.

```tsx
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

// <html lang="en" className={nunito.variable}>
```

**3. Pick a hue (optional).** Every color comes from one `--hue` (default 333, pink). Set it on `:root` after the imports to recolor the whole app:

```css
:root {
  --hue: 200; /* blue */
  --h2-l: 42%; /* keeps white text on primary buttons at 4.5:1 */
}
```

At some hues the defaults drop below 4.5:1 contrast, so check yours. Two variables fix it:

- `--h2-l` sets the lightness of `h2` (default `45%`). White text on `h2` (primary buttons, the skip link) is under 4.5:1 for hues from about 23 to 205. Use `42%` at hue 200, `35%` at hue 150, or `31%` for any hue.
- `--h1-l` sets the lightness of `h1` (default `70%`). `h1` text on `b4` (card links, "Clear filters") is under 4.5:1 for hues from about 222 to 283. Use `77%` there.

The theme is dark only (`color-scheme: dark`).

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

- **Client components:** `CopyButton`, `Chip`, `ChipGroup`, `RangeSlider`, `FilterPanel` and `NavLinks` (which `SiteHeader` renders for you). Each file starts with `"use client"`.
- **Everything else is server-safe:** no state, no effects, no browser APIs.

A Server Component can't pass a function to a Client Component. So callback props (`onChange`, `onPressedChange`, `onClear`) have to come from your own `"use client"` file, like the filters example below. Props that are plain data (`CopyButton`'s `text`, `Chip`'s `pressed`) work from a Server Component. `Pagination` takes a function (`hrefFor`), but it is a Server Component itself, so that is fine anywhere.

## Props, classes and refs

- Every component takes its element's native props and passes them through (`id`, `aria-*`, `data-*`, event handlers). The tables below list only the extra props.
- `ref` is a normal prop (React 19). It reaches the main element.
- `className` is added after the built-in classes and wins on conflict: a class that sets the same property as a built-in one replaces it (merged with [tailwind-merge](https://github.com/dcastil/tailwind-merge)). `<Select className="w-auto">` drops the built-in `w-full`.

## Components

### Basics

#### `Button`

A pill button. Every native `<button>` prop.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` | `primary` is the `h2` pill that lights up to `h1` on hover, `secondary` is `b3`, `ghost` is transparent. |
| `size` | `"md" \| "lg"` | `"md"` | Height, padding and text size. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Never submits a form unless you ask for `"submit"`. |

#### `ButtonLink`

A link that looks like `Button`. Every `next/link` prop (`href`, `prefetch`, `replace`, `scroll`, `target`, `rel`...), plus `variant` and `size` as on `Button`.

- An `href` with a scheme (`https:`, `mailto:`) or starting with `//` renders a plain `<a>`, and `next/link`'s own props are dropped.
- With `target="_blank"` and no `rel`, it adds `rel="noreferrer"`. A `rel` you pass always wins.

#### `buttonClasses`

`buttonClasses({ variant?, size?, className? }): string` returns the `Button` classes, for elements the components don't cover. Types: `ButtonVariant`, `ButtonSize`, `ButtonClassOptions`.

```tsx
<summary className={buttonClasses({ variant: "secondary" })}>More</summary>
```

#### `Card`

The osu!-web panel: rounded, `b4` background, `p-5`. Every native `<section>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none | Rendered as an `<h2>` at the top. It also names the section (`aria-labelledby`), which makes the card a region landmark. |

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
| `live` | `boolean` | `false` | Announce it when it appears: `role="alert"` for errors, `role="status"` for the others. A `role` you pass wins. |
| `as` | `"p" \| "div"` | `"p"` | Use `"div"` for block content such as a list of errors. |

#### `Prose`

Long-form typography for MDX, docs and legal pages. A `max-w-3xl` `<div>` that styles the `h2`, `h3`, `p`, `a`, `strong`, `ul`, `ol`, `li`, `code`, `pre`, `hr` and `table` elements inside it. Every native `<div>` prop.

### Forms

The fields render a label, the control, an optional hint and an optional error, wired together for screen readers. They are Server Components: you pass the `id`, so they need no generated ids.

Shared props (type `FieldProps`), taken by `TextInput`, `Textarea`, `Select` and `Checkbox`:

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | required | The control's id. The label points at it. The hint gets `<id>-hint` and the error `<id>-error`. |
| `label` | `ReactNode` | required | The visible label. |
| `hint` | `ReactNode` | none | Help text, linked with `aria-describedby`. |
| `error` | `ReactNode` | none | Error text in a `role="alert"` paragraph (`text-rose-300`). Sets `aria-invalid` and links the text with `aria-describedby`. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the label, control, hint and error, for layout (`min-w-48 flex-1`). |

`className` goes on the control itself. Your own `aria-describedby` is kept after the hint and error ids.

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

Every native `<input>` prop except `type` (`checked`, `defaultChecked`, `onChange`, `name`, `disabled`...), plus the field props. The label is bold `text-c1` and the hint follows it inline after a dot. Clicking anywhere on the row toggles it. The label alone is the accessible name; the hint is the description.

#### `fieldClasses`

`fieldClasses(className?: string): string` returns the field look (`b6` background, `b3` border, `h1` border on focus, rose border when `aria-invalid`, and an `h1` border and ring when an invalid field has focus). Use it on a bare control that labels itself:

```tsx
<select aria-label="Move to" className={fieldClasses("w-auto")}>...</select>
```

### Actions

#### `CopyButton` (client)

A button that copies text, with the result in an `<output>` beside it that screen readers announce. If the clipboard is missing or refuses (an insecure page, say), it shows the failure message. Every `Button` prop except `onClick` and `children`; `className` and the native props go on the button.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `text` | `string` | required | The text to copy. |
| `label` | `ReactNode` | `"Copy"` | The button's text. |
| `copiedMessage` | `ReactNode` | `"Copied."` | Shown after a copy works. |
| `failedMessage` | `ReactNode` | `"Couldn't copy. Select the text and copy it by hand."` | Shown when it doesn't. |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"secondary"` | As on `Button`. |
| `size` | `"md" \| "lg"` | `"md"` | As on `Button`. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the button and the message. |

#### `Pagination`

Previous and next pill links around "Page X of Y". Renders nothing when there is one page or none. Every native `<nav>` prop; `aria-label` defaults to `"Pages"`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `page` | `number` | required | The current page, starting at 1. |
| `pageCount` | `number` | required | How many pages there are. |
| `hrefFor` | `(page: number) => string` | required | Builds a page's URL, e.g. `` (p) => `/packs?page=${p}` ``. |
| `previousLabel` | `ReactNode` | `"Previous"` | Text of the link to the page before. |
| `nextLabel` | `ReactNode` | `"Next"` | Text of the link to the page after. |
| `formatStatus` | `(page: number, pageCount: number) => ReactNode` | `"Page X of Y"` | The text in the middle. |

The links use `next/link` with `rel="prev"` and `rel="next"`.

#### `JsonLd`

schema.org structured data in a `<script type="application/ld+json">`. Every `<` in the output is escaped, so a string in the data can't close the tag. Native `<script>` props such as `id` and `nonce` pass through.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `data` | `Record<string, unknown>` | required | The schema.org object. `@context` defaults to `https://schema.org`; set it in `data` to change it. |

### Icons

#### `GitHubIcon`

The GitHub mark as an inline SVG in the current text color. Always hidden from screen readers, so put a label on the link around it. Every native `<svg>` prop.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | `"size-5"` | Replaces the default size. |

#### `HaruhimeWordmark`

The haruhime.moe wordmark as an inline SVG. It keeps the brand's own white and pink whatever `--hue` is. Every native `<svg>` prop.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | `"haruhime.moe"` | The accessible name (`role="img"` with a `<title>`). |
| `decorative` | `boolean` | `false` | Hide it from screen readers, for use inside a labelled link. |
| `className` | `string` | `"h-6 w-auto"` | Replaces the default size. The width follows the height. |

#### `HaruhimeWordmarkLink`

A plain `<a>` around a decorative `HaruhimeWordmark`, dimmed until hovered. Every native `<a>` prop.

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

A toggle pill: a `<button>` with `aria-pressed`, `h1` when on. Every native `<button>` prop.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `pressed` | `boolean` | required | Whether it is on. |
| `onPressedChange` | `(pressed: boolean) => void` | none | Called with the new state on click, Enter or Space. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Never submits a form by default. |

Your own `onClick` runs first. Call `event.preventDefault()` in it to skip the toggle.

#### `ChipGroup` (client)

A labelled row of chips for picking several values (mods, game modes). A `<fieldset>`; every native `<fieldset>` prop except `onChange` and `children`. `disabled` turns off every chip.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | Names the group. |
| `hideLabel` | `boolean` | `false` | For use inside a `FilterRow`, which names the row: the label doesn't render and the fieldset isn't a group of its own (`role="none"`). `disabled` still reaches every chip. |
| `options` | `readonly ChipOption[]` | required | `{ value: string; label: ReactNode; disabled?: boolean }` for each chip. |
| `value` | `readonly string[]` | required | The picked values. |
| `onChange` | `(value: string[]) => void` | required | Gets the new picked values, in the options' order, without duplicates. |

#### `RangeSlider` (client)

Two thumbs on one track with an editable box at each end, for star rating, length or BPM. A `<fieldset>`; every native `<fieldset>` prop except `onChange` and `children`. Type: `RangeSliderValue` (`[number, number | null]`), so `useState<RangeSliderValue>` can pass its setter straight in.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | Names the group, and the ends as "Minimum *label*" and "Maximum *label*". |
| `hideLabel` | `boolean` | `false` | For use inside a `FilterRow`, which names the row: the label doesn't show and the fieldset isn't a group of its own (`role="none"`). The ends keep their "Minimum *label*" and "Maximum *label*" names. |
| `min`, `max` | `number` | required | The bounds. |
| `step` | `number` | `1` | Step between values. Typed values snap to it. |
| `value` | `readonly [number, number \| null]` | required | The range. A `null` top means no upper limit. |
| `onChange` | `(value: [number, number \| null]) => void` | required | Gets the new range. |
| `openEnded` | `boolean` | `false` | The top end at `max` means "no upper limit": it shows `max+` (like `10+`) and reports `null`. |
| `format` | `(n: number) => string` | `String` | Display text for the boxes and screen readers. |
| `parse` | `(text: string) => number \| null` | plain number | Reads a typed value back (without a trailing `+`). Pair it with `format` for `m:ss` lengths. |
| `minLabel`, `maxLabel` | `string` | "Minimum *label*", "Maximum *label*" | The accessible names of the two ends. |
| `disabled` | `boolean` | `false` | Turns off both thumbs and both boxes. |

The thumbs can't cross. Arrow keys move one step, Page Up and Page Down ten, Home and End as far as the thumb can go. A box commits on blur or Enter, and Escape undoes the typing. An empty low box means `min`; an empty top box means open (with `openEnded`) or `max`. Values that come in out of range or crossed (from a URL, say) are shown clamped.

#### `FilterRow`

One labelled row: the label above the controls on phones, in a `w-28` column on the left from `sm` up. A `<fieldset>`; every native `<fieldset>` prop. Server-safe.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The row's label. Also names the group. |

#### `FilterPanel` (client)

A titled panel of `FilterRow`s with a live result count and a "Clear filters" button. On phones the rows fold behind a button next to the title; from `sm` up they always show. Every native `<section>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The heading. It also names the panel and the phone toggle. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | The heading's level. |
| `resultCount` | `ReactNode` | none | Shown in a polite live region, so each new count is announced. |
| `active` | `boolean` | `false` | Whether any filter is set. |
| `onClear` | `() => void` | none | The clear button's action. The button shows only when `active` is true and this is set. |
| `clearLabel` | `ReactNode` | `"Clear filters"` | The clear button's text. |
| `defaultOpen` | `boolean` | `false` | Whether the rows start open on phones. |

### Shell

Links in the header and footer are data (type `SiteLinkItem`):

```ts
type SiteLinkItem = { label: string; href?: string; note?: string };
```

Paths use `next/link`; anything with a scheme (`https:`, `mailto:`) or starting with `//` is a plain `<a>`. An item without `href` shows as muted text with its `note` beside it in small uppercase letters (`{ label: "Pools", note: "soon" }`).

#### `SiteHeader`

The dark top bar: brand on the left, the nav, and an actions slot on the right. Every native `<header>` prop. A Server Component; the nav list inside is `NavLinks`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | required | The left side, usually a home link with the site's name or wordmark. |
| `links` | `readonly SiteLinkItem[]` | `[]` | The nav entries. No nav renders when empty. |
| `navLabel` | `string` | `"Main"` | The nav landmark's accessible name. |
| `navAlign` | `"start" \| "center"` | `"start"` | `"start"` puts small `text-c3` links right after the brand. `"center"` centers larger `text-c2` links in the free space. |
| `actions` | `ReactNode` | none | The right side, e.g. an account menu. |

The link for the current page gets `aria-current="page"` and lights up. A section link gets `aria-current="true"` on pages under it (`/packs` while on `/packs/123`). `/` only matches itself.

#### `NavLinks` (client)

The `<ul>` of links `SiteHeader` uses, for building your own header. Put it inside a `<nav>`. Every native `<ul>` prop. Type: `SiteNavAlign`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `links` | `readonly SiteLinkItem[]` | required | The entries. |
| `align` | `"start" \| "center"` | `"start"` | As `navAlign` on `SiteHeader`. |

#### `SiteFooter`

Link columns, an extra slot, fine print, the haruhime.moe wordmark and a GitHub icon link. Every native `<footer>` prop. Type: `SiteFooterColumn` (`{ title: string; items: readonly SiteLinkItem[] }`).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `columns` | `readonly SiteFooterColumn[]` | `[]` | Each column is a `<nav>` named by its title, which shows above the list. Up to four columns side by side from `sm` up. |
| `extra` | `ReactNode` | none | Shown above the fine print, e.g. a "clear local data" button. |
| `finePrint` | `ReactNode` | none | One line of small print, in a `<p>`. |
| `parentLink` | `boolean` | `true` | Show the haruhime.moe wordmark linking the parent site. With it, the last row holds the wordmark and the GitHub icon, and the fine print sits above. Without it, the fine print shares the row with the icon. |
| `parentHref` | `string` | `"https://www.haruhime.moe"` | Where the wordmark links. |
| `githubHref` | `string \| false` | `"https://github.com/haruhimemoe"` | Where the GitHub icon links. `false` leaves it out. |
| `githubLabel` | `string` | `"haruhimemoe on GitHub"` | The GitHub link's accessible name. |

#### `PageShell`

The page frame: a skip link, the header, `<main>` and the footer, with the footer held to the bottom on short pages. Every native `<div>` prop.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | none | The page, inside `<main>` (`max-w-5xl`, centered, `px-4 py-10`). |
| `header` | `ReactNode` | none | Above `<main>`, usually a `SiteHeader`. |
| `footer` | `ReactNode` | none | Below `<main>`, usually a `SiteFooter`. |
| `skipLabel` | `string` | `"Skip to content"` | The skip link's text. It is the first thing Tab reaches and shows only when focused. |
| `mainId` | `string` | `"main"` | `<main>`'s id, which the skip link targets. |
| `mainClassName` | `string` | none | Extra classes for `<main>`, e.g. `"max-w-7xl"`. |

## Accessibility

- Every component is checked with axe against the WCAG 2.2 A and AA rules in the test suite (all but color contrast, which needs a real browser). Interactive ones also have keyboard tests.
- Focus is always visible: the theme draws an `h1` outline on `:focus-visible`. Fields show focus with an `h1` border instead (plus an `h1` ring when invalid), and `RangeSlider` thumbs with a solid `h1` ring. Those keep a transparent outline, so Windows high contrast mode (forced colors) still shows focus.
- In forced colors mode, a pressed `Chip` takes the system highlight colors, so on and off still look different.
- Form fields link their label, hint and error. An error sets `aria-invalid` and is announced.
- `Chip` uses `aria-pressed`. `ChipGroup`, `RangeSlider` and `FilterRow` are fieldsets named by their label. Inside a `FilterRow`, `hideLabel` leaves the naming to the row, so each row is announced once. `RangeSlider`'s thumbs are native range inputs with `aria-valuetext`, so "10+" reads as it shows.
- `FilterPanel`'s phone toggle carries `aria-expanded` and `aria-controls`. The result count is a live region. When "Clear filters" disappears after use, focus moves to the panel's heading instead of getting lost.
- `CopyButton` announces "Copied." (or the failure) through an `<output>`.
- `SiteHeader` marks the current page with `aria-current`. `PageShell` starts with a skip link to `<main>`.
- `GitHubIcon` is always hidden from screen readers: give the link around it an `aria-label`, as `SiteFooter` does.
- You supply the text, so you also supply labels: give icon-only buttons an `aria-label`, and keep `label` props meaningful.

## Compatibility

| | Supported |
| --- | --- |
| Next.js | 16 (app router). Components use `next/link` and `next/navigation`. |
| React | 19 |
| Tailwind CSS | 4, through `@tailwindcss/postcss` |
| Module format | ESM only |
| Theme | Dark only |

## Changelog and contributing

See [CHANGELOG.md](./CHANGELOG.md) for what changed in each version and [CONTRIBUTING.md](./CONTRIBUTING.md) to work on the package. Report security issues as described in [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)
