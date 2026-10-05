/**
 * @file src/components/mdx/MdxLinkCard.tsx
 * @desc An MDX-authored link card: one link named by the title, an optional description, and a
 *       source line (the hostname for an `http(s)` href, or whatever `source` names, never
 *       hardcoded). An off-site link opens in a new tab with an accessible "opens in a new tab"
 *       suffix; a same-app path opens in place. No heading: the title is the link itself, not a
 *       landmark. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { CardLink } from "../basics/CardLink.js";
import { LinkCard, type LinkCardProps } from "../basics/LinkCard.js";

/** LinkCard's own div props (minus its title/href/children/media shorthand), plus the card's own. */
export type MdxLinkCardProps = Omit<LinkCardProps, "title" | "href" | "children" | "media"> & {
  /** The link's href. */
  href: string;
  /** The link's name, rendered as the card's one link (no heading). */
  title: ReactNode;
  /** A one-line summary under the title. */
  description?: ReactNode | undefined;
  /** The source line. Default: the hostname for an `http(s)` href, nothing for an internal path. */
  source?: string | undefined;
};

/**
 * @function hostOf
 * @param href {string} a URL
 * @returns {string | undefined} the URL's hostname, or undefined if href doesn't parse as a URL
 */
const hostOf = (href: string): string | undefined => {
  try {
    return new URL(href, "https://localhost").hostname;
  } catch {
    return undefined;
  }
};

/**
 * @function MdxLinkCard
 * @param props {MdxLinkCardProps} the href, title, an optional description and source, plus
 *        LinkCard's own div props
 * @returns {JSX.Element} a LinkCard whose body is one CardLink (the title), an optional
 *          description and a source line
 */
export function MdxLinkCard({
  href,
  title,
  description,
  source,
  className,
  ...props
}: MdxLinkCardProps) {
  // Protocol-relative URLs leave the site, so they count as external. Any other scheme
  // (javascript:, data:, vbscript: ...) is never linked: the title renders as plain text.
  const external = /^(https?:)?\/\//i.test(href);
  const unsafe = !external && /^[a-z][a-z0-9+.-]*:/i.test(href.trim());
  const from = source ?? (external ? hostOf(href) : undefined);
  return (
    // [&_p]:mt-0! beats Prose's [&_p]:mt-3; the card's gap spaces the lines.
    <LinkCard className={cx("mt-4 gap-1 [&_p]:mt-0!", className)} {...props}>
      <p>
        {unsafe ? (
          <span className="font-bold text-c1">{title}</span>
        ) : (
          <CardLink
            href={href}
            className="no-underline! text-c1!"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {title}
            {external ? (
              <>
                <span aria-hidden="true"> ↗</span>
                <span className="sr-only">, opens in a new tab</span>
              </>
            ) : null}
          </CardLink>
        )}
      </p>
      {description ? <p className="text-c3 text-sm">{description}</p> : null}
      {from ? <p className="text-c4 text-xs">{from}</p> : null}
    </LinkCard>
  );
}
