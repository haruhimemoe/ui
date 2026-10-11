"use client";

import { LocaleSelect, localeName, writeLocaleCookie } from "@haruhimemoe/ui";

// The 0.27.0 language picker, from a client file.
export function ClientLocale27() {
  return (
    <div>
      <LocaleSelect locales={["en", "ja"]} value="en" onChange={(l) => writeLocaleCookie(l)} />
      <p>{localeName("ja")}</p>
    </div>
  );
}
