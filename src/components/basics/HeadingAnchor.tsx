/**
 * @file src/components/basics/HeadingAnchor.tsx
 * @desc Internal: the `#` link beside a section heading, MdxHeading's anchor without the `!`
 *       overrides that only exist to beat Prose. Named "Link to section: <text>". Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Sun Oct 4, 2026
 */

const ANCHOR =
  "inline-flex min-h-6 min-w-6 items-center justify-center rounded text-c4 no-underline hover:text-h1";

/**
 * @function HeadingAnchor
 * @param props {{ id: string; text: string; className?: string | undefined }} the heading's id
 *        and its plain text, plus optional classes appended after the base look (handy for the
 *        `!` overrides MdxHeading needs to beat Prose)
 * @returns {JSX.Element} a `#` link to `#id`
 */
export function HeadingAnchor({
  id,
  text,
  className,
}: {
  id: string;
  text: string;
  className?: string | undefined;
}) {
  return (
    <a
      href={`#${id}`}
      aria-label={`Link to section: ${text}`}
      className={className ? `${ANCHOR} ${className}` : ANCHOR}
    >
      #
    </a>
  );
}
