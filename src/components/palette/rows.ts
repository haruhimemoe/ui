/**
 * @file src/components/palette/rows.ts
 * @desc What the list shows for a state, pure: option rows (a command under a group heading,
 *       with the title's matched spans) and hint rows (not selectable: provider states, no
 *       matches). Empty query: Recent, then every group in declaration order. A query: the
 *       calculator row at the root, the ranked static matches, then each provider's rows or its
 *       state. In a choice prompt: the choices, fuzzy-filtered.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 11, 2026
 */

import { evaluate, formatResult, isBareNumber } from "./calc.js";
import { type FuzzyMatch, rankResults } from "./fuzzy.js";
import { PALETTE_LABELS, type PaletteLabels } from "./labels.js";
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
  /** Built-in text. Default PALETTE_LABELS. */
  labels?: PaletteLabels | undefined;
};

/** The id of the calculator's row and command. */
export const CALC_ID = "calc";
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

const hint = (text: string, scope = ""): Row => ({
  kind: "hint",
  id: `hint:${scope}${text}`,
  text,
});

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

// A bare word ("e", "pi") is a search, not a sum, even though the calculator knows it.
const BARE_WORD = /^[a-z]+$/i;

const calcRow = (query: string, labels: PaletteLabels): Row | null => {
  if (isBareNumber(query) || BARE_WORD.test(query)) return null;
  const value = evaluate(query);
  if (value === null) return null;
  const text = formatResult(value);
  const command: Command = {
    id: CALC_ID,
    title: `= ${text}`,
    subtitle: labels.enterToCopy,
    closeOnRun: false,
    run: (ctx) => ctx.copy(text),
  };
  return option(command, labels.calculator);
};

const providerRows = (input: RowsInput, labels: PaletteLabels): Row[] =>
  input.providers.flatMap((provider) => {
    const group = provider.group ?? labels.providerResults;
    const min = provider.minLength ?? DEFAULT_MIN;
    const scope = `${provider.id}:`;
    if (input.query.trim().length < min) return [hint(labels.typeToSearch(min), scope)];
    const result = input.providerResults[provider.id];
    const rows = (result?.rows ?? []).map((command) => option(command, group, [], scope));
    // Searching: the last rows stay under the hint, so the list doesn't flash per keystroke.
    if (!result || result.state === "loading") return [hint(labels.searching, scope), ...rows];
    if (result.state === "error") return [hint(labels.searchFailed, scope)];
    if (rows.length === 0) return [hint(labels.noResults(input.query.trim()), scope)];
    return rows;
  });

/**
 * @function buildRows
 * @param input {RowsInput} the query, commands, providers and their results, recents, and the
 *        argument prompt in progress
 * @returns {Row[]} the list, top to bottom
 */
export function buildRows(input: RowsInput): Row[] {
  if (input.arg) return choiceRows(input.arg);
  const labels = input.labels ?? PALETTE_LABELS;
  const commands = visible(input.commands, input.ctx);
  const query = input.query.trim();
  if (query === "") {
    const recent = input.recentIds
      .map((id) => commands.find((command) => command.id === id))
      .filter((command): command is Command => command !== undefined)
      .map((command) => option(command, labels.recent, [], "recent:"));
    return [
      ...recent,
      ...commands.map((command) => option(command, command.group ?? labels.commands)),
    ];
  }
  const rows: Row[] = [];
  const calc = input.isRoot && input.calculator ? calcRow(query, labels) : null;
  if (calc) rows.push(calc);
  for (const scored of rankResults(query, commands, input.boost)) {
    rows.push(option(scored.command, scored.command.group ?? labels.commands, scored.ranges));
  }
  rows.push(...providerRows(input, labels));
  if (!rows.some((row) => row.kind === "option") && input.providers.length === 0) {
    rows.push(hint(labels.noMatches));
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
