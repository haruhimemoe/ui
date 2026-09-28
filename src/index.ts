/**
 * @file src/index.ts
 * @desc @haruhimemoe/ui: React components for the haruhime.moe osu! tools on Next.js. Pair with
 *       the theme: `@import "@haruhimemoe/ui/theme.css";` after Tailwind. Client components carry
 *       their own "use client" directive, so this barrel is safe to import from Server Components.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

// Actions
export { AsyncButton, type AsyncButtonProps } from "./components/actions/AsyncButton.js";
export { CopyButton, type CopyButtonProps } from "./components/actions/CopyButton.js";
export { InlineConfirm, type InlineConfirmProps } from "./components/actions/InlineConfirm.js";
export { Pagination, type PaginationProps } from "./components/actions/Pagination.js";

// Basics
export { Badge, type BadgeProps, type BadgeTone } from "./components/basics/Badge.js";
export { Button, type ButtonProps } from "./components/basics/Button.js";
export { ButtonLink, type ButtonLinkProps } from "./components/basics/ButtonLink.js";
export {
  type ButtonClassOptions,
  type ButtonSize,
  type ButtonVariant,
  buttonClasses,
} from "./components/basics/buttonStyles.js";
export { Card, type CardProps } from "./components/basics/Card.js";
export type { HeadingLevel } from "./components/basics/cardStyles.js";
export { Disclosure, type DisclosureProps } from "./components/basics/Disclosure.js";
export {
  type LinkClassOptions,
  linkClasses,
  type TextLinkVariant,
} from "./components/basics/linkStyles.js";
export { Notice, type NoticeProps, type NoticeTone } from "./components/basics/Notice.js";
export { PageHeader, type PageHeaderProps } from "./components/basics/PageHeader.js";
export { Prose, type ProseProps } from "./components/basics/Prose.js";
export { type TabItem, Tabs, type TabsProps } from "./components/basics/Tabs.js";
export { TextLink, type TextLinkProps } from "./components/basics/TextLink.js";
export { tabId, tabPanelId } from "./components/basics/tabIds.js";

// Filters
export { Chip, type ChipProps } from "./components/filters/Chip.js";
export { ChipGroup, type ChipGroupProps, type ChipOption } from "./components/filters/ChipGroup.js";
export {
  type ChoiceChipOption,
  ChoiceChips,
  type ChoiceChipsProps,
} from "./components/filters/ChoiceChips.js";
export { FilterPanel, type FilterPanelProps } from "./components/filters/FilterPanel.js";
export { FilterRow, type FilterRowProps } from "./components/filters/FilterRow.js";
export {
  RangeSlider,
  type RangeSliderProps,
  type RangeSliderValue,
} from "./components/filters/RangeSlider.js";

// Forms
export { CharCounter, type CharCounterProps } from "./components/forms/CharCounter.js";
export { Checkbox, type CheckboxProps } from "./components/forms/Checkbox.js";
export type { FieldProps } from "./components/forms/FieldFrame.js";
export { fieldClasses } from "./components/forms/fieldStyles.js";
export {
  RadioGroup,
  type RadioGroupProps,
  type RadioOption,
} from "./components/forms/RadioGroup.js";
export {
  ReportDisclosure,
  type ReportDisclosureProps,
  type ReportResult,
} from "./components/forms/ReportDisclosure.js";
export { Select, type SelectProps } from "./components/forms/Select.js";
export { Textarea, type TextareaProps } from "./components/forms/Textarea.js";
export { TextInput, type TextInputProps } from "./components/forms/TextInput.js";
export { TypeToConfirm, type TypeToConfirmProps } from "./components/forms/TypeToConfirm.js";
export {
  VISIBILITIES,
  VISIBILITY_TEXT,
  type Visibility,
  VisibilitySelect,
  type VisibilitySelectProps,
  type VisibilityText,
} from "./components/forms/VisibilitySelect.js";

// Icons
export { DiscordIcon, type DiscordIconProps } from "./components/icons/DiscordIcon.js";
export { GitHubIcon, type GitHubIconProps } from "./components/icons/GitHubIcon.js";
export {
  HaruhimeWordmark,
  type HaruhimeWordmarkProps,
} from "./components/icons/HaruhimeWordmark.js";
export {
  HaruhimeWordmarkLink,
  type HaruhimeWordmarkLinkProps,
} from "./components/icons/HaruhimeWordmarkLink.js";

// Meta
export { JsonLd, type JsonLdProps } from "./components/meta/JsonLd.js";

// osu!
export {
  type BeatmapStatKey,
  BeatmapStats,
  type BeatmapStatsProps,
} from "./components/osu/BeatmapStats.js";
export { ModBadge, type ModBadgeProps } from "./components/osu/ModBadge.js";
export { StarRating, type StarRatingProps } from "./components/osu/StarRating.js";

// Shell
export {
  HeaderMenu,
  type HeaderMenuItem,
  type HeaderMenuProps,
} from "./components/shell/HeaderMenu.js";
export { type LinkTabItem, LinkTabs, type LinkTabsProps } from "./components/shell/LinkTabs.js";
export type { SiteLinkItem } from "./components/shell/links.js";
export { NavLinks, type NavLinksProps, type SiteNavAlign } from "./components/shell/NavLinks.js";
export { PageShell, type PageShellProps } from "./components/shell/PageShell.js";
export {
  SiteFooter,
  type SiteFooterColumn,
  type SiteFooterProps,
} from "./components/shell/SiteFooter.js";
export { SiteHeader, type SiteHeaderProps } from "./components/shell/SiteHeader.js";

// Tables
export { Table, type TableProps } from "./components/tables/Table.js";
export { TBody, type TBodyProps } from "./components/tables/TBody.js";
export { Td, type TdProps } from "./components/tables/Td.js";
export { THead, type THeadProps } from "./components/tables/THead.js";
export { Th, type ThProps } from "./components/tables/Th.js";

// Utilities
export { type ClassValue, cx } from "./utils/cx.js";
