/**
 * @file tests/components/content/contentDate.test.ts
 * @desc Unit tests for formatContentDate: a real ISO day formats in UTC regardless of the process
 *       time zone, and anything else (impossible days, non-ISO strings, a datetime, empty) prints
 *       as given.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { formatContentDate } from "../../../src/components/content/contentDate.js";

describe("formatContentDate", () => {
  it("formats an ISO day in UTC whatever the process time zone", () => {
    const tz = process.env.TZ;
    process.env.TZ = "Pacific/Honolulu";
    try {
      expect(formatContentDate("2026-10-04")).toBe("Oct 4, 2026");
      expect(formatContentDate("2026-01-01")).toBe("Jan 1, 2026");
    } finally {
      process.env.TZ = tz;
    }
  });

  it.each(["2026-02-30", "2026-13-01", "October 2026", "2026-10-04T10:00:00Z", ""])(
    "prints %j as given",
    (value) => {
      expect(formatContentDate(value)).toBe(value);
    },
  );
});
