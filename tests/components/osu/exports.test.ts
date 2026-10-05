/**
 * @file tests/components/osu/exports.test.ts
 * @desc The map display's root exports: every runtime name the spec lists, and none of the
 *       internal helpers.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { describe, expect, it } from "vitest";
import * as ui from "../../../src/index.js";

describe("map display exports", () => {
  it("exports the map pieces from the root", () => {
    for (const name of [
      "MapCard",
      "MapSetCard",
      "MapGroup",
      "MapCover",
      "mapCoverUrl",
      "MAP_STATUS_LABELS",
      "MapPreviewButton",
      "stopMapPreview",
      "MapCopyScope",
    ]) {
      expect(ui, name).toHaveProperty(name);
    }
  });

  it("keeps the internals internal", () => {
    for (const name of [
      "mapCardView",
      "MapCopyIdButton",
      "MAP_COPY_BUTTON",
      "useMapCopyKey",
      "isOsuId",
      "previewClipUrl",
      "beatmapPageUrl",
      "toggleMapPreview",
      "DEFAULT_MAP_LABELS",
    ]) {
      expect(ui, name).not.toHaveProperty(name);
    }
  });
});
