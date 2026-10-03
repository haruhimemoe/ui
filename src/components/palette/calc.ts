/**
 * @file src/components/palette/calc.ts
 * @desc The palette's calculator, pure and without eval: a tokenizer and the shunting-yard
 *       algorithm over + - * / % ^, unary minus, parentheses, k and m number suffixes, pi and e,
 *       and sqrt, abs, round, floor, ceil, min and max. Anything it can't parse, and any result
 *       that isn't finite (division by zero), is null.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

type Token =
  | { kind: "num"; value: number }
  | { kind: "op"; value: "+" | "-" | "*" | "/" | "%" | "^" | "neg" }
  | { kind: "fn"; value: string }
  | { kind: "("; fn?: string | undefined }
  | { kind: ")" }
  | { kind: "," };

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

const FUNCTIONS: Record<string, (args: number[]) => number | undefined> = {
  sqrt: ([x]) => (x === undefined ? undefined : Math.sqrt(x)),
  abs: ([x]) => (x === undefined ? undefined : Math.abs(x)),
  round: ([x]) => (x === undefined ? undefined : Math.round(x)),
  floor: ([x]) => (x === undefined ? undefined : Math.floor(x)),
  ceil: ([x]) => (x === undefined ? undefined : Math.ceil(x)),
  min: (args) => (args.length === 0 ? undefined : Math.min(...args)),
  max: (args) => (args.length === 0 ? undefined : Math.max(...args)),
};

const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6 };

const NUMBER = /^(\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?([km])?/i;
const IDENT = /^[a-z]+/i;

const tokenize = (expression: string): Token[] | null => {
  const tokens: Token[] = [];
  let rest = expression.trim();
  while (rest.length > 0) {
    const space = /^\s+/.exec(rest);
    if (space) {
      rest = rest.slice(space[0].length);
      continue;
    }
    const num = NUMBER.exec(rest);
    const ident = num ? null : IDENT.exec(rest);
    if (num) {
      const value =
        Number(num[0].replace(/[km]$/i, "")) * (SUFFIX[(num[2] ?? "").toLowerCase()] ?? 1);
      tokens.push({ kind: "num", value });
      rest = rest.slice(num[0].length);
    } else if (ident) {
      const name = ident[0].toLowerCase();
      rest = rest.slice(ident[0].length);
      if (name in CONSTANTS) tokens.push({ kind: "num", value: CONSTANTS[name] as number });
      else if (name in FUNCTIONS) tokens.push({ kind: "fn", value: name });
      else return null;
    } else {
      const ch = rest[0] as string;
      rest = rest.slice(1);
      if (ch === "(" || ch === ")" || ch === ",") tokens.push({ kind: ch });
      else if ("+-*/%^".includes(ch)) {
        const previous = tokens[tokens.length - 1];
        const unary =
          ch === "-" &&
          (!previous || previous.kind === "op" || previous.kind === "(" || previous.kind === ",");
        tokens.push({
          kind: "op",
          value: unary ? "neg" : (ch as "+" | "-" | "*" | "/" | "%" | "^"),
        });
      } else return null;
    }
  }
  return tokens;
};

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
  "^": 4,
  neg: 3,
};
const RIGHT = new Set(["^", "neg"]);

const apply = (op: string, values: number[]): boolean => {
  if (op === "neg") {
    const x = values.pop();
    if (x === undefined) return false;
    values.push(-x);
    return true;
  }
  const b = values.pop();
  const a = values.pop();
  if (a === undefined || b === undefined) return false;
  const result =
    op === "+"
      ? a + b
      : op === "-"
        ? a - b
        : op === "*"
          ? a * b
          : op === "/"
            ? a / b
            : op === "%"
              ? a % b
              : a ** b;
  values.push(result);
  return true;
};

/**
 * @function evaluate
 * @param expression {string} what was typed, e.g. "1.5k * (2 + sqrt(9))"
 * @returns {number | null} the value, or null when it doesn't parse or isn't finite
 */
export function evaluate(expression: string): number | null {
  const tokens = tokenize(expression);
  if (!tokens || tokens.length === 0) return null;
  const values: number[] = [];
  const ops: Token[] = [];
  const argc: number[] = [];
  let expectValue = true;
  const popOps = (until: (top: Token) => boolean): boolean => {
    while (ops.length > 0) {
      const top = ops[ops.length - 1] as Token;
      if (until(top)) return true;
      ops.pop();
      if (top.kind !== "op" || !apply(top.value, values)) return false;
    }
    return false;
  };
  for (const [i, token] of tokens.entries()) {
    const next = tokens[i + 1];
    if (token.kind === "num") {
      if (!expectValue) return null;
      values.push(token.value);
      expectValue = false;
    } else if (token.kind === "fn") {
      if (!expectValue || next?.kind !== "(") return null;
      ops.push({ kind: "(", fn: token.value });
      argc.push(next === undefined ? 0 : tokens[i + 2]?.kind === ")" ? 0 : 1);
      tokens.splice(i + 1, 1);
    } else if (token.kind === "(") {
      if (!expectValue) return null;
      ops.push(token);
      argc.push(0);
      expectValue = true;
    } else if (token.kind === ",") {
      if (expectValue) return null;
      if (!popOps((top) => top.kind === "(")) return null;
      const top = ops[ops.length - 1];
      if (top?.kind !== "(" || !top.fn) return null;
      argc[argc.length - 1] = (argc[argc.length - 1] ?? 0) + 1;
      expectValue = true;
    } else if (token.kind === ")") {
      if (expectValue && ops[ops.length - 1]?.kind !== "(") return null;
      if (!popOps((top) => top.kind === "(")) return null;
      const open = ops.pop();
      const count = argc.pop() ?? 0;
      if (open?.kind === "(" && open.fn) {
        const n = expectValue ? count : count;
        const args = values.splice(values.length - n, n);
        if (args.length !== n) return null;
        const result = FUNCTIONS[open.fn]?.(args);
        if (result === undefined) return null;
        values.push(result);
      } else if (expectValue) return null;
      expectValue = false;
    } else {
      const op = token.value;
      if (op === "neg") {
        if (!expectValue) return null;
        ops.push(token);
        continue;
      }
      if (expectValue) return null;
      const p = PRECEDENCE[op] as number;
      popOps((top) => {
        if (top.kind !== "op") return true;
        const topP = PRECEDENCE[top.value] as number;
        return topP < p || (topP === p && RIGHT.has(op));
      });
      ops.push(token);
      expectValue = true;
    }
  }
  if (expectValue) return null;
  if (popOps((top) => top.kind === "(")) return null;
  const result = values.length === 1 ? values[0] : undefined;
  return result !== undefined && Number.isFinite(result) ? result : null;
}

/**
 * @function formatResult
 * @param value {number} a result
 * @returns {string} up to 10 significant digits, trailing zeros dropped, "-0" as "0"
 */
export function formatResult(value: number): string {
  const text = String(Number(value.toPrecision(10)));
  return text === "-0" ? "0" : text;
}

/**
 * @function isBareNumber
 * @param expression {string} what was typed
 * @returns {boolean} true for just a number ("2", " -2.5 "), when the palette shows no "= 2" row
 */
export const isBareNumber = (expression: string): boolean =>
  /^\s*-?(\d+\.?\d*|\.\d+)\s*$/.test(expression);
