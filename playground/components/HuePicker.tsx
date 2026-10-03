"use client";

import { useEffect, useState } from "react";

export function HuePicker() {
  const [hue, setHue] = useState(333);
  useEffect(() => {
    document.documentElement.style.setProperty("--hue", String(hue));
  }, [hue]);
  return (
    <label className="flex items-center gap-3 text-c3 text-sm">
      Hue {hue}
      <input
        type="range"
        min={0}
        max={360}
        value={hue}
        onChange={(e) => setHue(Number(e.target.value))}
      />
    </label>
  );
}
