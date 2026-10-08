/**
 * @file src/components/bracket/BracketView.tsx
 * @desc A bracket drawn as columns of match cards: one block per side (winners, losers, grand
 *       final, third place), one column per round, connectors as CSS borders. Scrolls sideways
 *       inside its own container so a phone page never does. Takes a @haruhimemoe/tourney Bracket
 *       as is, names for its entrant ids, an optional match link and an entrant to highlight.
 *       Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { BracketMatchCard } from "./BracketMatchCard.js";
import { type BracketLike, bracketColumns } from "./layout.js";

/** Every native `<div>` prop, plus the bracket and how to show it. */
export type BracketViewProps = Omit<ComponentProps<"div">, "children"> & {
  bracket: BracketLike;
  /** Entrant id to display name. An id with no name shows the id. */
  names: Readonly<Record<string, string>>;
  /** A match code's link; without it the cards are plain. */
  href?: ((code: string) => string) | undefined;
  /** An entrant id to mark wherever it appears. */
  highlight?: string | undefined;
};

const BLOCK_TITLE = {
  winners: "Winners",
  losers: "Losers",
  grand: "Grand final",
  third: "Third place",
} as const;

/**
 * @function BracketView
 * @param props {BracketViewProps} the bracket, names, links, highlight, plus native div props
 * @returns {JSX.Element} the scrolling bracket
 */
export function BracketView({
  bracket,
  names,
  href,
  highlight,
  className,
  ...props
}: BracketViewProps) {
  const blocks = bracketColumns(bracket);
  const many = blocks.length > 1;
  return (
    <div className={cx("overflow-x-auto pb-2", className)} {...props}>
      <div className="flex w-max flex-col gap-8">
        {blocks.map((block) => (
          <section
            key={block.side}
            aria-label={BLOCK_TITLE[block.side]}
            className="flex flex-col gap-2"
          >
            {many ? <p className="font-bold text-c3 text-sm">{BLOCK_TITLE[block.side]}</p> : null}
            <div className="flex gap-8">
              {block.rounds.map((round, i) => (
                <div key={round.code} className="flex flex-col gap-3">
                  <h3 className="text-c3 text-xs" title={round.code}>
                    {round.name}
                  </h3>
                  <ul className="flex flex-1 flex-col justify-around gap-3">
                    {round.matches.map((m) => (
                      <li
                        key={m.code}
                        className={cx(
                          "relative",
                          i < block.rounds.length - 1 &&
                            "after:absolute after:top-1/2 after:-right-8 after:w-8 after:border-b4 after:border-t",
                        )}
                      >
                        <BracketMatchCard
                          match={m}
                          names={names}
                          href={href?.(m.code)}
                          highlight={highlight}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
