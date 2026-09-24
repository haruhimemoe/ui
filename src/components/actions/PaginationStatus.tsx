/**
 * @file src/components/actions/PaginationStatus.tsx
 * @desc Pagination's "Page X of Y" text (internal). It also keeps keyboard focus in place: when
 *       the link that had focus goes away (Next on the last page, Previous on the first), focus
 *       moves here instead of falling back to the page body.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * @function PaginationStatus
 * @param props {{ children: ReactNode }} the status text
 * @returns {JSX.Element} a `<span aria-current="page">` that script can focus (tabIndex -1), so
 *          it stays out of the tab order
 */
export function PaginationStatus({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const lastFocused = useRef<Element | null>(null);

  // Remember what last had focus inside the nav.
  useEffect(() => {
    const nav = ref.current?.parentElement;
    if (!nav) return;
    const onFocusIn = (event: FocusEvent) => {
      lastFocused.current = event.target as Element;
    };
    nav.addEventListener("focusin", onFocusIn);
    return () => nav.removeEventListener("focusin", onFocusIn);
  }, []);

  // After each render: if that element left the page and focus fell to the body, take it here.
  useEffect(() => {
    const last = lastFocused.current;
    if (last === null || last.isConnected) return;
    lastFocused.current = null;
    const active = document.activeElement;
    if (active === null || active === document.body) ref.current?.focus();
  });

  return (
    <span ref={ref} tabIndex={-1} aria-current="page" className="text-c4">
      {children}
    </span>
  );
}
