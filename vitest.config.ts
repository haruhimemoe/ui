/**
 * @file vitest.config.ts
 * @desc Vitest config: every test under tests/ in jsdom with jest-dom matchers, v8 coverage with
 *       a 90% floor on src/ (the barrel file only re-exports).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup/dom.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/index.ts"],
      reporter: ["text", "html"],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
