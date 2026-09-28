"use client";

import { NavLinks } from "@haruhimemoe/ui";
import { useState } from "react";

export function ClientNav() {
  const [open, setOpen] = useState(true);
  return (
    <nav aria-label="Main">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        Menu
      </button>
      {open ? <NavLinks links={[{ label: "Client nav", href: "/client-nav" }]} /> : null}
    </nav>
  );
}
