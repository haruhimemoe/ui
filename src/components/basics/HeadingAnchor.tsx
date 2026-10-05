/**
 * @file src/components/basics/HeadingAnchor.tsx
 * @desc Internal: the `#` link beside a section heading, MdxHeading's anchor without the `!`
 *       overrides that only exist to beat Prose. Named "Link to section: <text>". Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

const ANCHOR =
  "inline-flex min-h-6 min-w-6 items-center justify-center rounded text-c4 no-underline hover:text-h1";

/**
 * @function HeadingAnchor
 * @param props {{ id: string; text: string }} the heading's id and its plain text
 * @returns {JSX.Element} a `#` link to `#id`
 */
export function HeadingAnchor({ id, text }: { id: string; text: string }) {
  return (
    <a href={`#${id}`} aria-label={`Link to section: ${text}`} className={ANCHOR}>
      #
    </a>
  );
}
