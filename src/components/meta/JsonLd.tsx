/**
 * @file src/components/meta/JsonLd.tsx
 * @desc schema.org structured data as a JSON-LD script tag. "<", ">", "&" and the line and
 *       paragraph separators (U+2028, U+2029) are written as JSON escapes, so no string in the
 *       data (a user-supplied name, say) can close the tag, open a comment or break the script.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps } from "react";

/** Native `<script>` props (like `id` or `nonce`), plus the schema.org data. */
export type JsonLdProps = Omit<
  ComponentProps<"script">,
  "children" | "dangerouslySetInnerHTML" | "type" | "src"
> & {
  /** A schema.org object. `@context` defaults to https://schema.org; set it here to override. */
  data: Record<string, unknown>;
};

/** Characters written as JSON unicode escapes inside the script tag. */
const UNSAFE = /[<>&\u2028\u2029]/g;

/**
 * @function jsonLdString
 * @param data {Record<string, unknown>} a schema.org object
 * @returns {string} JSON with `@context` added and "<", ">", "&", U+2028 and U+2029 written as
 *          `\uXXXX` escapes (still the same JSON once parsed)
 */
const jsonLdString = (data: Record<string, unknown>): string =>
  JSON.stringify({ "@context": "https://schema.org", ...data }).replace(
    UNSAFE,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );

/**
 * @function JsonLd
 * @param props {JsonLdProps} the schema.org data, plus native script props
 * @returns {JSX.Element} a `<script type="application/ld+json">` tag with the escaped data
 */
export function JsonLd({ data, ...props }: JsonLdProps) {
  return (
    <script
      {...props}
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON; jsonLdString escapes the unsafe characters.
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
