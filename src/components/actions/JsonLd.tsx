/**
 * @file src/components/actions/JsonLd.tsx
 * @desc schema.org structured data as a JSON-LD script tag. Every "<" is escaped, so no string
 *       in the data (a user-supplied name, say) can close the tag or open a comment.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
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

/**
 * @function jsonLdString
 * @param data {Record<string, unknown>} a schema.org object
 * @returns {string} JSON with `@context` added and every "<" written as the escape `\u003c`
 */
const jsonLdString = (data: Record<string, unknown>): string =>
  JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");

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
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON; jsonLdString escapes "<".
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
