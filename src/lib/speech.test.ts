import { expect, it } from "vitest";
import { readingVoice } from "./speech";
const voice = (lang: string, localService = true) =>
  ({ lang, localService }) as SpeechSynthesisVoice;

it("selects Mandarin without falling back to Cantonese or English", () => {
  const cn = voice("zh_CN");
  expect(
    readingVoice([voice("en-US"), voice("zh-HK"), cn], "zh-CN", false),
  ).toBe(cn);
  expect(
    readingVoice(
      [voice("yue-HK"), voice("zh-HK"), voice("en-US")],
      "zh-CN",
      false,
    ),
  ).toBeUndefined();
  expect(readingVoice([voice("cmn-CN")], "zh-CN", false)?.lang).toBe("cmn-CN");
  expect(readingVoice([voice("zh-TW")], "zh-CN", false)?.lang).toBe("zh-TW");
});

it("prefers installed matching voices and excludes network voices offline", () => {
  const remote = voice("zh-CN", false),
    local = voice("zh-SG");
  expect(readingVoice([remote, local], "zh-CN", false)).toBe(local);
  expect(readingVoice([remote], "zh-CN", true)).toBeUndefined();
  expect(readingVoice([remote, local], "zh-CN", true)).toBe(local);
  expect(readingVoice([local, voice("en-GB")], "en", true)?.lang).toBe("en-GB");
});
