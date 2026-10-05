/**
 * @file src/index.ts
 * @desc @haruhimemoe/ui: React components for the haruhime.moe osu! tools on Next.js. Pair with
 *       the theme: `@import "@haruhimemoe/ui/theme.css";` after Tailwind. Client components carry
 *       their own "use client" directive, so this barrel is safe to import from Server Components.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sun Oct 4, 2026
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
export { CardGrid, type CardGridProps } from "./components/basics/CardGrid.js";
export { CardLink, type CardLinkProps } from "./components/basics/CardLink.js";
export { CodeChip, type CodeChipProps } from "./components/basics/CodeChip.js";
export type { HeadingLevel } from "./components/basics/cardStyles.js";
export { Disclosure, type DisclosureProps } from "./components/basics/Disclosure.js";
export { EmptyState, type EmptyStateProps } from "./components/basics/EmptyState.js";
export { Kbd, type KbdProps } from "./components/basics/Kbd.js";
export { kbdClasses } from "./components/basics/kbdStyles.js";
export { LinkCard, type LinkCardProps } from "./components/basics/LinkCard.js";
export { LinkRow, type LinkRowItem, type LinkRowProps } from "./components/basics/LinkRow.js";
export {
  type LinkClassOptions,
  linkClasses,
  type TextLinkVariant,
} from "./components/basics/linkStyles.js";
export { Notice, type NoticeProps, type NoticeTone } from "./components/basics/Notice.js";
export { PageHeader, type PageHeaderProps } from "./components/basics/PageHeader.js";
export { PrevNext, type PrevNextLink, type PrevNextProps } from "./components/basics/PrevNext.js";
export { Progress, type ProgressProps } from "./components/basics/Progress.js";
export { Prose, type ProseProps } from "./components/basics/Prose.js";
export { SectionHeading, type SectionHeadingProps } from "./components/basics/SectionHeading.js";
export {
  type StatItem,
  StatList,
  type StatListProps,
  type StatListVariant,
} from "./components/basics/StatList.js";
export {
  Surface,
  type SurfaceElement,
  type SurfaceProps,
} from "./components/basics/Surface.js";
export {
  type SurfaceClassOptions,
  type SurfacePadding,
  surfaceClasses,
} from "./components/basics/surfaceStyles.js";
export { type TabItem, Tabs, type TabsProps } from "./components/basics/Tabs.js";
export { Text, type TextProps } from "./components/basics/Text.js";
export { TextLink, type TextLinkProps } from "./components/basics/TextLink.js";
export { tabId, tabPanelId } from "./components/basics/tabIds.js";
export {
  type TextClassOptions,
  type TextSize,
  type TextTone,
  textClasses,
} from "./components/basics/textStyles.js";
export { useMotionAllowed } from "./components/basics/useMotionAllowed.js";
// Brand
export {
  BrandPage,
  type BrandPageAsset,
  type BrandPageFont,
  type BrandPageProps,
} from "./components/brand/BrandPage.js";
export { BrandSwatch, type BrandSwatchProps } from "./components/brand/BrandSwatch.js";
// Content
export { ContentIndex, type ContentIndexProps } from "./components/content/ContentIndex.js";
export { ContentLayout, type ContentLayoutProps } from "./components/content/ContentLayout.js";
export { ContentNav, type ContentNavProps } from "./components/content/ContentNav.js";
export { ContentPage, type ContentPageProps } from "./components/content/ContentPage.js";
export { ContentSearch, type ContentSearchProps } from "./components/content/ContentSearch.js";
export {
  CopyMarkdownButton,
  type CopyMarkdownButtonProps,
} from "./components/content/CopyMarkdownButton.js";
export { searchContent } from "./components/content/searchContent.js";
export { Toc, type TocProps } from "./components/content/Toc.js";
export type {
  ContentNavGroup,
  ContentNavItem,
  ContentSearchItem,
} from "./components/content/types.js";
// Dialogs
export {
  ConfirmDialog,
  type ConfirmDialogProps,
  type ConfirmTone,
} from "./components/dialogs/ConfirmDialog.js";
export {
  Dialog,
  type DialogDismissReason,
  type DialogProps,
} from "./components/dialogs/Dialog.js";
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
export { CopyField, type CopyFieldProps } from "./components/forms/CopyField.js";
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
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
} from "./components/forms/SegmentedControl.js";
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
export { MapCard, type MapCardProps } from "./components/osu/MapCard.js";
export { MapCopyScope } from "./components/osu/MapCopyScope.js";
export { MapCover, type MapCoverProps } from "./components/osu/MapCover.js";
export { MapGroup, type MapGroupProps } from "./components/osu/MapGroup.js";
export {
  MapPreviewButton,
  type MapPreviewButtonProps,
} from "./components/osu/MapPreviewButton.js";
export {
  MapSetCard,
  type MapSetCardProps,
  type MapSetDifficulty,
} from "./components/osu/MapSetCard.js";
export {
  ModBadge,
  type ModBadgeColor,
  type ModBadgeProps,
} from "./components/osu/ModBadge.js";
export type { MapCardLabels, MapData } from "./components/osu/mapData.js";
export { MAP_STATUS_LABELS, type MapCoverSize, mapCoverUrl } from "./components/osu/mapLinks.js";
export {
  PlayerCard,
  type PlayerCardProps,
  type PlayerTeam,
} from "./components/osu/PlayerCard.js";
export { stopMapPreview } from "./components/osu/previewPlayer.js";
export { StarRating, type StarRatingProps } from "./components/osu/StarRating.js";
// Palette
export { CommandPalette } from "./components/palette/CommandPalette.js";
export {
  CommandPaletteButton,
  type CommandPaletteButtonProps,
} from "./components/palette/CommandPaletteButton.js";
export { evaluate, formatResult } from "./components/palette/calc.js";
export { type FuzzyMatch, fuzzyScore } from "./components/palette/fuzzy.js";
export { openCommandPalette } from "./components/palette/paletteEvents.js";
export { type SiteCommandsOptions, siteCommands } from "./components/palette/siteCommands.js";
export type {
  ArgChoice,
  ArgSpec,
  Command,
  CommandPaletteProps,
  Page,
  PaletteContext,
  Provider,
} from "./components/palette/types.js";
// Shell
export {
  HeaderMenu,
  type HeaderMenuItem,
  type HeaderMenuProps,
} from "./components/shell/HeaderMenu.js";
export {
  HARUHIME_TOOLS,
  type HaruhimeTool,
  type HaruhimeToolId,
  type HaruhimeToolsOptions,
  haruhimeToolsColumn,
} from "./components/shell/haruhimeTools.js";
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
// Sortable
export type {
  SortableAnnouncementInfo,
  SortableAnnouncements,
} from "./components/sortable/announcements.js";
export { SortableHandle, type SortableHandleProps } from "./components/sortable/SortableHandle.js";
export { SortableLayer, type SortableLayerProps } from "./components/sortable/SortableLayer.js";
export {
  SortableList,
  type SortableListProps,
  type SortableRowContext,
} from "./components/sortable/SortableList.js";
export {
  SortableMoveButtons,
  type SortableMoveButtonsProps,
} from "./components/sortable/SortableMoveButtons.js";
export { moveItem } from "./components/sortable/sortableMath.js";
export { SORTABLE_CONTAINER, SORTABLE_ITEM } from "./components/sortable/sortableStyles.js";
export type {
  Sortable,
  SortableContainerOptions,
  SortableContainerProps,
  SortableHandleBindings,
  SortableItemOptions,
  SortableItemProps,
  SortableMove,
  SortablePlace,
  SortableResult,
  SortableState,
  UseSortableOptions,
} from "./components/sortable/sortableTypes.js";
export { useSortable } from "./components/sortable/useSortable.js";
// Tables
export { Table, type TableProps } from "./components/tables/Table.js";
export { TBody, type TBodyProps } from "./components/tables/TBody.js";
export { Td, type TdProps } from "./components/tables/Td.js";
export { THead, type THeadProps } from "./components/tables/THead.js";
export { Th, type ThProps } from "./components/tables/Th.js";
export type { TocItem } from "./remark/articleData.js";

// Utilities
export { type ClassValue, cx } from "./utils/cx.js";
