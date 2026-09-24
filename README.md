# @haruhimemoe/ui

React components for the haruhime.moe osu! tools on Next.js: the osu!-web-style palette as a Tailwind theme, plus buttons, cards, form fields, filter controls and the site header and footer.

Work in progress: the full component list and props land before 0.1.0.

## Requirements

Next.js 16, React 19 and Tailwind CSS 4.

## Install

```sh
bun add @haruhimemoe/ui
```

## Setup

Import the theme after Tailwind in your global stylesheet:

```css
@import "tailwindcss";
@import "@haruhimemoe/ui/theme.css";
```

The theme adds the palette (`b1` to `b6` backgrounds, `c1` to `c4` text, `h1` and `h2` highlights), a visible focus ring, and tells Tailwind to generate the classes the components use. Set `--hue` on `:root` to recolor it (the default is 333). Load Nunito with `next/font` as the `--font-nunito` variable.

```tsx
import { Button } from "@haruhimemoe/ui";

<Button variant="secondary">Save</Button>;
```

## License

[MIT](./LICENSE)
