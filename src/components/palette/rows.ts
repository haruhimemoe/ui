/**
 * @file src/components/palette/rows.ts
 * @desc What the list shows for a state, pure: option rows (a command under a group heading,
 *       with the title's matched spans) and hint rows (not selectable: provider states, no
 *       matches). Empty query: Recent, then every group in declaration order. A query: the
 *       calculator row at the root, the ranked static matches, then each provider's rows or its
 *       state. In a choice prompt: the choices, fuzzy-filtered.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { evaluate, formatResult, isBareNumber } from "./calc.js";
import { type FuzzyMatch, rankResults } from "./fuzzy.js";
import type { ArgState, ProviderResult } from "./store.js";
import type { Command, PaletteContext, Provider } from "./types.js";

/** One list entry. Options are selectable; hints are text. */
export type Row =
  | { kind: "option"; id: string; command: Command; ranges: FuzzyMatch["ranges"]; group: string }
  | { kind: "hint"; id: string; text: string };

/** What buildRows needs from the palette. */
export type RowsInput = {
  query: string;
  commands: readonly Command[];
  providers: readonly Provider[];
  providerResults: Record<string, ProviderResult>;
  recentIds: readonly string[];
  boost: (id: string) => number;
  isRoot: boolean;
  calculator: boolean;
  arg: ArgState | null;
  ctx: PaletteContext;
};

/** The id of the calculator's row and command. */
export const CALC_ID = "calc";
const DEFAULT_GROUP = "Commands";
const DEFAULT_MIN = 2;

const option = (
  command: Command,
  group: string,
  ranges: FuzzyMatch["ranges"] = [],
  prefix = "",
): Row => ({
  kind: "option",
  id: `${prefix}${group}/${command.id}`,
  command,
  ranges,
  group,
});

const hint = (text: string): Row => ({ kind: "hint", id: `hint:${text}`, text });

const visible = (commands: readonly Command[], ctx: PaletteContext): Command[] =>
  commands.filter((command) => {
    if (!command.when) return true;
    try {
      return command.when(ctx);
    } catch (error) {
      console.error(`CommandPalette: "${command.id}" when() threw`, error);
      return false;
    }
  });

const choiceRows = (arg: ArgState): Row[] => {
  const spec = arg.command.args?.[arg.index];
  if (spec?.type !== "choice") return [];
  const group = spec.label;
  const rows = (spec.choices ?? []).map(
    (choice): Command => ({
      id: choice.value,
      title: choice.label,
      subtitle: choice.subtitle,
    }),
  );
  if (arg.query.trim() === "") return rows.map((row) => option(row, group));
  return rankResults(arg.query, rows, () => 0).map((scored) =>
    option(scored.command, group, scored.ranges),
  );
};

const calcRow = (query: string): Row | null => {
  if (isBareNumber(query)) return null;
  const value = evaluate(query);
  if (value === null) return null;
  const text = formatResult(value);
  const command: Command = {
    id: CALC_ID,
    title: `= ${text}`,
    subtitle: "Enter to copy",
    closeOnRun: false,
    run: (ctx) => ctx.copy(text),
  };
  return option(command, "Calculator");
};

const providerRows = (input: RowsInput): Row[] =>
  input.providers.flatMap((provider) => {
    const group = provider.group ?? "Results";
    const min = provider.minLength ?? DEFAULT_MIN;
    if (input.query.trim().length < min) return [hint(`Type ${min} characters to search`)];
    const result = input.providerResults[provider.id];
    if (!result || result.state === "loading") return [hint("Searching…")];
    if (result.state === "error") return [hint("Couldn't search, try again")];
    if (result.rows.length === 0) return [hint(`No results for “${input.query.trim()}”`)];
    return result.rows.map((command) => option(command, group, [], `${provider.id}:`));
  });

/**
 * @function buildRows
 * @param input {RowsInput} the query, commands, providers and their results, recents, and the
 *        argument prompt in progress
 * @returns {Row[]} the list, top to bottom
 */
export function buildRows(input: RowsInput): Row[] {
  if (input.arg) return choiceRows(input.arg);
  const commands = visible(input.commands, input.ctx);
  const query = input.query.trim();
  if (query === "") {
    const recent = input.recentIds
      .map((id) => commands.find((command) => command.id === id))
      .filter((command): command is Command => command !== undefined)
      .map((command) => option(command, "Recent", [], "recent:"));
    return [
      ...recent,
      ...commands.map((command) => option(command, command.group ?? DEFAULT_GROUP)),
    ];
  }
  const rows: Row[] = [];
  const calc = input.isRoot && input.calculator ? calcRow(query) : null;
  if (calc) rows.push(calc);
  for (const scored of rankResults(query, commands, input.boost)) {
    rows.push(option(scored.command, scored.command.group ?? DEFAULT_GROUP, scored.ranges));
  }
  rows.push(...providerRows(input));
  if (!rows.some((row) => row.kind === "option") && input.providers.length === 0) {
    rows.push(hint("No matching commands"));
  }
  return rows;
}

/**
 * @function optionCount
 * @param rows {readonly Row[]} the list
 * @returns {number} how many rows can be selected
 */
export const optionCount = (rows: readonly Row[]): number =>
  rows.filter((row) => row.kind === "option").length;

/**
 * @function optionAt
 * @param rows {readonly Row[]} the list
 * @param index {number} the active index, counting options only
 * @returns {Extract<Row, { kind: "option" }> | undefined} that option
 */
export const optionAt = (
  rows: readonly Row[],
  index: number,
): Extract<Row, { kind: "option" }> | undefined =>
  rows.filter((row): row is Extract<Row, { kind: "option" }> => row.kind === "option")[index];
