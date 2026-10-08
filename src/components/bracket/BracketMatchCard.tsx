/**
 * @file src/components/bracket/BracketMatchCard.tsx
 * @desc One match in a BracketView: its code, both sides (a name, "bye", or where the side comes
 *       from) with scores, the winner in c1 and bold. Names truncate and keep their full text in a
 *       title. With `href` the whole card is a link. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

import { cx } from "../../utils/cx.js";
import { AutoLink } from "../basics/AutoLink.js";
import { type BracketMatchLike, type BracketSideLike, sideLabel } from "./layout.js";

/** BracketMatchCard's props: the match, entrant names, an optional link and highlighted entrant. */
export type BracketMatchCardProps = {
  match: BracketMatchLike;
  names: Readonly<Record<string, string>>;
  href?: string | undefined;
  highlight?: string | undefined;
};

/**
 * @function Side
 * @param props the side, its score, whether it won, the names and the highlighted entrant
 * @returns {JSX.Element} one row of the card
 */
function Side({
  side,
  score,
  won,
  names,
  highlight,
}: {
  side: BracketSideLike;
  score: number | null;
  won: boolean;
  names: Readonly<Record<string, string>>;
  highlight?: string | undefined;
}) {
  const known = side.entrant !== null;
  const label = known
    ? (names[side.entrant as string] ?? side.entrant)
    : side.settled
      ? "bye"
      : sideLabel(side.source);
  const lit = known && side.entrant === highlight;
  return (
    <span
      data-winner={won ? "true" : undefined}
      data-highlight={lit ? "true" : undefined}
      className={cx(
        "flex items-center justify-between gap-2 px-2 py-1",
        lit && "bg-h1/20",
        won ? "font-bold text-c1" : known ? "text-c2" : "text-c4 italic",
      )}
    >
      <span className="min-w-0 truncate" title={label as string}>
        {label}
      </span>
      <span className="tabular-nums">{score ?? ""}</span>
    </span>
  );
}

/**
 * @function BracketMatchCard
 * @param props {BracketMatchCardProps} the match and how to show it
 * @returns {JSX.Element} the card, a link when `href` is given
 */
export function BracketMatchCard({ match, names, href, highlight }: BracketMatchCardProps) {
  const body = (
    <>
      <span className="block px-2 pt-1 text-c4 text-xs">{match.code}</span>
      <Side
        side={match.a}
        score={match.scoreA}
        won={match.winner === "a"}
        names={names}
        highlight={highlight}
      />
      <Side
        side={match.b}
        score={match.scoreB}
        won={match.winner === "b"}
        names={names}
        highlight={highlight}
      />
    </>
  );
  const box =
    "block w-48 max-w-[70vw] overflow-hidden rounded-[10px] border border-b4 bg-b3 text-sm";
  return href ? (
    <AutoLink
      href={href}
      data-match={match.code}
      className={cx(box, "hover:border-h1 focus-visible:border-h1")}
    >
      {body}
    </AutoLink>
  ) : (
    <div data-match={match.code} className={box}>
      {body}
    </div>
  );
}
