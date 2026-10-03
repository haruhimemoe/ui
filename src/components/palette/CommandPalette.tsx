/**
 * @file src/components/palette/CommandPalette.tsx
 * @desc The command palette: a native <dialog> opened by mod+k, `openCommandPalette()` or a
 *       command shortcut, with a combobox over the rows the store and row builder produce.
 *       Enter runs a command, pushes its page, or starts collecting its args; Escape and
 *       Backspace on an empty input go back a level, then close. Providers search as you type.
 *       Recents are read on open and written on every run. The calculator row copies its result.
 *       Mount once, inside a client component, since commands carry functions.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { usePathname, useRouter } from "next/navigation.js";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { cx } from "../../utils/cx.js";
import { useLatestStatus } from "../actions/useLatestStatus.js";
import { isEditableTarget, matchesCombo, parseShortcut } from "./hotkeys.js";
import { PaletteFooter } from "./PaletteFooter.js";
import { PaletteInput } from "./PaletteInput.js";
import { PaletteList } from "./PaletteList.js";
import { PALETTE_EVENT, type PaletteEventDetail } from "./paletteEvents.js";
import { isMac } from "./platform.js";
import { boostFrom, type Recents, readRecents, recentIds, recordRecent } from "./recents.js";
import { buildRows, CALC_ID, optionAt, optionCount } from "./rows.js";
import { initialState, reduce, topFrame } from "./store.js";
import type { Command, CommandPaletteProps, Page, PaletteContext, Provider } from "./types.js";
import { useProviderSearch } from "./useProviderSearch.js";

export type { CommandPaletteProps } from "./types.js";

const NONE: readonly Provider[] = [];
const CHORD_MS = 800;

const DIALOG =
  "m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-c1 backdrop:bg-b6/70 backdrop:backdrop-blur-sm sm:h-auto sm:pt-[12vh]";
const PANEL =
  "mx-auto flex h-full max-h-dvh w-full flex-col overflow-hidden border-b3 bg-b6 shadow-2xl sm:h-auto sm:max-h-[70vh] sm:max-w-xl sm:rounded-xl sm:border";

/**
 * @function CommandPalette
 * @param props {CommandPaletteProps} commands, root providers, storage key, hotkey, placeholder,
 *        label, calculator and recents switches, panel classes
 * @returns {JSX.Element} the dialog, empty until opened
 */
export function CommandPalette({
  commands,
  providers = NONE,
  storageKey = "default",
  hotkey = "mod+k",
  placeholder = "Search commands…",
  label = "Command palette",
  calculator = true,
  recents: recentsOn = true,
  className,
}: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [state, dispatch] = useReducer(reduce, undefined, initialState);
  const [recents, setRecents] = useState<Recents>({});
  const [mac, setMac] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<Element | null>(null);
  const chord = useRef<{ key: string; at: number } | null>(null);
  const { status, start, settle } = useLatestStatus<string>();
  // The copy status reads until the query changes or the palette reopens, then the count again.
  const [statusShown, setStatusShown] = useState(false);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = useCallback((index: number) => `${baseId}-option-${index}`, [baseId]);

  useEffect(() => setMac(isMac()), []);

  const root = useMemo<Page>(
    () => ({ title: label, placeholder, commands, providers }),
    [label, placeholder, commands, providers],
  );

  const open = useCallback(
    (page?: Page) => {
      // Opening onto a page while already open keeps the original opener.
      if (!state.open) opener.current = document.activeElement;
      if (recentsOn) setRecents(readRecents(storageKey));
      setStatusShown(false);
      dispatch({ type: "open", root, page });
    },
    [root, recentsOn, storageKey, state.open],
  );
  const close = useCallback(() => dispatch({ type: "close" }), []);

  const ctx = useMemo<PaletteContext>(
    () => ({
      navigate: (href) => router.push(href),
      close,
      push: (page) => (state.open ? dispatch({ type: "push", page }) : open(page)),
      copy: async (text) => {
        const run = start();
        setStatusShown(true);
        try {
          await navigator.clipboard.writeText(text);
          settle(run, "Copied");
        } catch {
          settle(run, "Couldn't copy");
        }
      },
      pathname,
      commands,
    }),
    [router, close, state.open, open, start, settle, pathname, commands],
  );

  const frame = topFrame(state);
  const depth = state.stack.length - 1;
  const isRoot = depth === 0;
  const query = state.arg ? state.arg.query : (frame?.query ?? "");

  const rows = useMemo(
    () =>
      frame
        ? buildRows({
            query: frame.query,
            commands: frame.page.commands ?? [],
            providers: frame.page.providers ?? NONE,
            providerResults: frame.providers,
            recentIds: isRoot && recentsOn ? recentIds(recents) : [],
            boost: boostFrom(recents),
            isRoot,
            calculator,
            arg: state.arg,
            ctx,
          })
        : [],
    [frame, isRoot, recentsOn, recents, calculator, state.arg, ctx],
  );
  const count = optionCount(rows);
  const active = state.arg ? state.arg.active : (frame?.active ?? 0);

  useProviderSearch({
    providers: frame?.page.providers ?? NONE,
    query: frame?.query ?? "",
    depth,
    dispatch,
    enabled: state.open && state.arg === null && frame !== undefined,
  });

  // The dialog follows `open`: show it modally, focus the input, lock the page's scroll; on
  // close, hand focus back to whatever had it.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (state.open) {
      if (!element.open) element.showModal();
      input.current?.focus();
      document.documentElement.style.overflow = "hidden";
      return;
    }
    if (element.open) element.close();
    document.documentElement.style.overflow = "";
    if (opener.current instanceof HTMLElement) opener.current.focus();
    opener.current = null;
  }, [state.open]);
  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  const remember = (id: string) => {
    if (recentsOn && id !== CALC_ID) setRecents(recordRecent(storageKey, id));
  };

  const runCommand = (command: Command, args: Record<string, string> = {}) => {
    remember(command.id);
    try {
      const result = command.run?.(ctx, args);
      if (result instanceof Promise)
        result.catch((error: unknown) =>
          console.error(`CommandPalette: "${command.id}" failed`, error),
        );
    } catch (error) {
      console.error(`CommandPalette: "${command.id}" failed`, error);
    }
    if (command.closeOnRun !== false) close();
  };

  const acceptArg = (value: string) => {
    const arg = state.arg;
    const spec = arg?.command.args?.[arg.index];
    if (!arg || !spec) return;
    const trimmed = value.trim();
    if (spec.type !== "choice" && trimmed === "")
      return dispatch({ type: "argError", message: "Required" });
    if (spec.type === "number" && Number.isNaN(Number(trimmed)))
      return dispatch({ type: "argError", message: "Enter a number" });
    const message = spec.validate?.(trimmed);
    if (message) return dispatch({ type: "argError", message });
    dispatch({ type: "argAccept", value: trimmed });
    if (arg.index + 1 >= (arg.command.args?.length ?? 0))
      runCommand(arg.command, { ...arg.values, [spec.name]: trimmed });
  };

  const select = (command: Command) => {
    if (state.arg) return acceptArg(command.id);
    if (command.page) {
      remember(command.id);
      return dispatch({ type: "push", page: command.page });
    }
    if (command.args && command.args.length > 0) return dispatch({ type: "beginArgs", command });
    runCommand(command);
  };

  const fire = (command: Command) => {
    try {
      if (command.when && !command.when(ctx)) return;
    } catch {
      return;
    }
    if (command.page) return open(command.page);
    if (command.args && command.args.length > 0) {
      open();
      return dispatch({ type: "beginArgs", command });
    }
    runCommand(command);
  };

  const back = () => {
    if (state.arg || depth > 0) dispatch({ type: "pop" });
    else close();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const spec = state.arg?.command.args?.[state.arg.index];
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        return dispatch({ type: "move", delta: event.key === "ArrowDown" ? 1 : -1, count });
      case "Home":
      case "End":
        if (count === 0) return;
        event.preventDefault();
        return dispatch({ type: "move", delta: event.key === "Home" ? "home" : "end", count });
      case "Enter": {
        event.preventDefault();
        if (state.arg && spec && spec.type !== "choice") return acceptArg(state.arg.query);
        const option = optionAt(rows, active);
        return option ? select(option.command) : undefined;
      }
      case "Escape":
        event.preventDefault();
        return back();
      case "Backspace":
        if (query !== "" || (!state.arg && depth === 0)) return;
        event.preventDefault();
        return dispatch({ type: "pop" });
      case "Tab":
        return event.preventDefault();
      default:
        return;
    }
  };

  // Global keys: the opening hotkey anywhere; command shortcuts (combos and chords) only while
  // closed and outside editable targets.
  useEffect(() => {
    const toggle = parseShortcut(hotkey);
    const shortcuts = commands.flatMap((command) => {
      const shortcut = command.shortcut ? parseShortcut(command.shortcut) : null;
      return shortcut ? [{ command, shortcut }] : [];
    });
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (toggle?.kind === "combo" && matchesCombo(event, toggle.combo, mac)) {
        event.preventDefault();
        return state.open ? close() : open();
      }
      if (state.open || isEditableTarget(event.target)) return;
      const bare = !event.metaKey && !event.ctrlKey && !event.altKey && event.key.length === 1;
      const key = event.key.toLowerCase();
      const pending = chord.current;
      chord.current = null;
      for (const { command, shortcut } of shortcuts) {
        if (shortcut.kind === "combo") {
          if (!matchesCombo(event, shortcut.combo, mac)) continue;
          event.preventDefault();
          return fire(command);
        }
        if (!bare) continue;
        if (
          pending &&
          pending.key === shortcut.keys[0] &&
          key === shortcut.keys[1] &&
          Date.now() - pending.at < CHORD_MS
        ) {
          event.preventDefault();
          return fire(command);
        }
      }
      if (
        bare &&
        shortcuts.some((entry) => entry.shortcut.kind === "chord" && entry.shortcut.keys[0] === key)
      ) {
        chord.current = { key, at: Date.now() };
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const onOpen = (event: Event) => open((event as CustomEvent<PaletteEventDetail>).detail?.page);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => window.removeEventListener(PALETTE_EVENT, onOpen);
  }, [open]);

  const argSpec = state.arg?.command.args?.[state.arg.index];
  const crumbs = state.arg
    ? [
        state.arg.command.title,
        ...(state.arg.command.args ?? [])
          .slice(0, state.arg.index)
          .map((a) => state.arg?.values[a.name] ?? ""),
      ]
    : state.stack.slice(1).map((f) => f.page.title);

  return (
    <dialog
      ref={dialog}
      data-palette=""
      aria-label={label}
      className={DIALOG}
      onCancel={(event) => {
        event.preventDefault();
        back();
      }}
      onKeyDown={onKeyDown}
      // The browser can close the dialog itself (a back gesture, a close watcher): follow it.
      onClose={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      {state.open && frame ? (
        <div className={cx(PANEL, className)}>
          <PaletteInput
            ref={input}
            value={query}
            placeholder={argSpec ? argSpec.label : (frame.page.placeholder ?? "Search…")}
            label={label}
            crumbs={crumbs}
            listId={listId}
            activeId={count > 0 ? optionId(active) : undefined}
            error={state.arg?.error}
            onChange={(value) => {
              setStatusShown(false);
              dispatch({ type: "query", value });
            }}
          />
          <PaletteList
            id={listId}
            rows={rows}
            active={active}
            mac={mac}
            optionId={optionId}
            busy={Object.values(frame.providers).some((result) => result.state === "loading")}
            onActivate={(index) => dispatch({ type: "active", index, count })}
            onSelect={select}
          />
          <PaletteFooter
            count={count}
            nested={depth > 0 || state.arg !== null}
            status={statusShown ? (status?.result ?? null) : null}
            statusRun={statusShown ? (status?.run ?? null) : null}
          />
        </div>
      ) : null}
    </dialog>
  );
}
