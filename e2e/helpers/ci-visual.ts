import type { Page, TestInfo } from "@playwright/test";
/** Fixture-only JPEGs for review when the local execution workspace is unavailable. */
export async function emitVisual(page: Page, info: TestInfo, locale: "en" | "zh-CN", stage: string, include = false) {
  if (!process.env.CI || !(include ||
    (info.project.name === "webkit-phone" && locale === "zh-CN") ||
    (info.project.name === "webkit-ipad")
  )) return;
  const id = stage + "-" + info.project.name + "-" + locale;
  const data = (await page.screenshot({ type: "jpeg", quality: 60 })).toString("base64");
  const count = Math.ceil(data.length / 12000);
  for (let index = 0; index < count; index++)
    console.log("RUNSET_VISUAL|" + id + "|" + index + "|" + data.slice(index * 12000, (index + 1) * 12000));
  console.log("RUNSET_VISUAL_END|" + id + "|" + count);
}
