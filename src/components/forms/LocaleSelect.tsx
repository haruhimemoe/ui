/**
 * @file src/components/forms/LocaleSelect.tsx
 * @desc A language picker for prefix-less apps: a Select of the app's locales, each named in its
 *       own language (Intl.DisplayNames), that writes the NEXT_LOCALE cookie (on `cookieDomain`
 *       when set, so every haruhime app follows) and refreshes the page. One locale renders
 *       nothing.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

"use client";

import { useRouter } from "next/navigation.js";
import { useId } from "react";
import { Select } from "./Select.js";

/** LocaleSelect's props. */
export type LocaleSelectProps = {
  /** The app's locales, like ["en", "ja"]. */
  locales: readonly string[];
  /** The page's current locale. */
  value: string;
  /** The field's label (default "Language"). */
  label?: string | undefined;
  /** Hide the label visually (it stays the accessible name). Default true. */
  hideLabel?: boolean | undefined;
  /** The cookie's domain, like ".haruhime.moe". Host-only when unset. */
  cookieDomain?: string | undefined;
  /** Runs after the cookie is written, before the refresh (save it to the account, say). */
  onChange?: ((locale: string) => void) | undefined;
  /** Classes for the field's wrapper. */
  className?: string | undefined;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * @function localeName
 * @param locale {string} a BCP 47 tag
 * @returns {string} the language's name in itself ("日本語" for ja), or the tag when unknown
 */
export const localeName = (locale: string): string => {
  try {
    const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
    return name ? name.charAt(0).toLocaleUpperCase(locale) + name.slice(1) : locale;
  } catch {
    return locale;
  }
};

/**
 * @function writeLocaleCookie
 * @param locale {string} the picked locale
 * @param domain {string | undefined} the cookie's domain
 */
export const writeLocaleCookie = (locale: string, domain?: string): void => {
  const parts = [
    `NEXT_LOCALE=${encodeURIComponent(locale)}`,
    "path=/",
    `max-age=${ONE_YEAR}`,
    "samesite=lax",
  ];
  if (domain) parts.push(`domain=${domain}`);
  if (location.protocol === "https:") parts.push("secure");
  // biome-ignore lint/suspicious/noDocumentCookie: one plain cookie, no store API in every browser
  document.cookie = parts.join("; ");
};

/**
 * @function LocaleSelect
 * @param props {LocaleSelectProps} the locales, the current one, label, cookie domain, onChange
 * @returns {JSX.Element | null} the select, or nothing with fewer than two locales
 */
export function LocaleSelect({
  locales,
  value,
  label = "Language",
  hideLabel = true,
  cookieDomain,
  onChange,
  className,
}: LocaleSelectProps) {
  const router = useRouter();
  const id = useId();
  if (locales.length < 2) return null;
  return (
    <Select
      id={id}
      label={label}
      hideLabel={hideLabel}
      value={value}
      wrapperClassName={className}
      onChange={(event) => {
        const next = event.currentTarget.value;
        writeLocaleCookie(next, cookieDomain);
        onChange?.(next);
        router.refresh();
      }}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale} lang={locale}>
          {localeName(locale)}
        </option>
      ))}
    </Select>
  );
}
