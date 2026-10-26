import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import clips from "./narration.json";
import { narrationFor } from "./narration";
it("ships an exact-caption audio asset for every lesson and exercise in both languages", () => {
  expect(clips).toHaveLength(17);
  for (const clip of clips)
    for (const locale of ["en", "zh-CN"] as const) {
      const path = narrationFor(clip[locale], locale)!;
      expect(path).toBe(`/audio/${clip.id}-${locale}.mp3`);
      const bytes = readFileSync(`public${path}`);
      expect(bytes.length).toBeGreaterThan(1000);
      expect(
        bytes[0] === 0xff || bytes.subarray(0, 3).toString() === "ID3",
      ).toBe(true);
      expect(narrationFor(`${clip[locale]} changed`, locale)).toBeUndefined();
    }
});
