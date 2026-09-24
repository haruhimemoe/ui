/**
 * @file src/index.ts
 * @desc @haruhimemoe/ui: React components for the haruhime.moe osu! tools on Next.js. Pair with
 *       the theme: `@import "@haruhimemoe/ui/theme.css";` after Tailwind. Client components carry
 *       their own "use client" directive, so this barrel is safe to import from Server Components.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

// Actions
export { CopyButton, type CopyButtonProps } from "./components/actions/CopyButton.js";
export { JsonLd, type JsonLdProps } from "./components/actions/JsonLd.js";
export { Pagination, type PaginationProps } from "./components/actions/Pagination.js";

// Basics
export { Button, type ButtonProps } from "./components/basics/Button.js";
export { ButtonLink, type ButtonLinkProps } from "./components/basics/ButtonLink.js";
export {
  type ButtonClassOptions,
  type ButtonSize,
  type ButtonVariant,
  buttonClasses,
} from "./components/basics/buttonStyles.js";
export { Card, type CardProps } from "./components/basics/Card.js";
export { Notice, type NoticeProps, type NoticeTone } from "./components/basics/Notice.js";
export { PageHeader, type PageHeaderProps } from "./components/basics/PageHeader.js";
export { Prose, type ProseProps } from "./components/basics/Prose.js";

// Filters
export { Chip, type ChipProps } from "./components/filters/Chip.js";
export { ChipGroup, type ChipGroupProps, type ChipOption } from "./components/filters/ChipGroup.js";
export { FilterPanel, type FilterPanelProps } from "./components/filters/FilterPanel.js";
export { FilterRow, type FilterRowProps } from "./components/filters/FilterRow.js";
export {
  RangeSlider,
  type RangeSliderProps,
  type RangeSliderValue,
} from "./components/filters/RangeSlider.js";

// Forms
export { Checkbox, type CheckboxProps } from "./components/forms/Checkbox.js";
export type { FieldProps } from "./components/forms/FieldFrame.js";
export { fieldClasses } from "./components/forms/fieldStyles.js";
export { Select, type SelectProps } from "./components/forms/Select.js";
export { Textarea, type TextareaProps } from "./components/forms/Textarea.js";
export { TextInput, type TextInputProps } from "./components/forms/TextInput.js";

// Icons
export { GitHubIcon, type GitHubIconProps } from "./components/icons/GitHubIcon.js";
export {
  HaruhimeWordmark,
  type HaruhimeWordmarkProps,
} from "./components/icons/HaruhimeWordmark.js";
export {
  HaruhimeWordmarkLink,
  type HaruhimeWordmarkLinkProps,
} from "./components/icons/HaruhimeWordmarkLink.js";

// Shell
export type { SiteLinkItem } from "./components/shell/links.js";
export { NavLinks, type NavLinksProps, type SiteNavAlign } from "./components/shell/NavLinks.js";
export { PageShell, type PageShellProps } from "./components/shell/PageShell.js";
export {
  SiteFooter,
  type SiteFooterColumn,
  type SiteFooterProps,
} from "./components/shell/SiteFooter.js";
export { SiteHeader, type SiteHeaderProps } from "./components/shell/SiteHeader.js";
