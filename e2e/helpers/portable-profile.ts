import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { practiceGame } from "../../src/engine/practice";
import { reducer } from "../../src/engine/game";
import { exerciseGame } from "../../src/engine/exercises";
import {
  freshTurnPractice,
  replayTurnPractice,
} from "../../src/lib/turnPractice";
import { turnLayoutId } from "../../src/lib/turnLayouts";
import { importProfile, profileKeys } from "../../src/lib/profile";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyPortableProfile(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    source = landscapePosition(),
    recipient = practiceGame("rearrange");
  delete source.turnSeconds;
  delete source.deadline;
  delete source.match;
  const whole = freshTurnPractice("quiet", "你", "joker", 2).record;
  whole.actions = [
    { type: "move", ids: [turnLayoutId(4, 2)], target: "practice-wild" },
  ];
  const values: Record<string, string> = {
    "runset.language": locale,
    "runset.reading": "true",
    "runset.contrast": "true",
    "runset.muted": "true",
    "runset.pace": "5000",
    "runset.audioVoice": "device",
    "runset.simpleHome": "false",
    "runset.turnPractice.v1": JSON.stringify(whole),
    "runset.practice.v1": JSON.stringify({
      lesson: "basics",
      step: 1,
      game: reducer(practiceGame(), {
        type: "move",
        ids: [9, 35, 61],
        target: "new",
      }),
    }),
    "runset.exercises.v1": JSON.stringify({
      version: 1,
      kind: "opening",
      checked: false,
      game: exerciseGame("opening"),
    }),
    "runset.solo.v1": JSON.stringify({
      version: 1,
      completed: ["opening:4321"],
      kinds: ["opening"],
    }),
    "runset.rackOrder.v1": JSON.stringify({
      seed: source.seed,
      mode: "manual",
      ids: [...source.players[0].rack].reverse(),
    }),
  };
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ source, values }) => {
      if (sessionStorage.getItem("profile-seeded")) return;
      sessionStorage.setItem("profile-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(source));
      for (const [key, value] of Object.entries(values))
        localStorage.setItem(key, value);
    },
    { source, values },
  );
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(
      await el.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    ).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const button = (label: string) =>
    page.getByRole("button", { name: t(label), exact: true });
  const saved = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const snapshot = () =>
    page.evaluate(
      (keys) =>
        Object.fromEntries(
          [...keys, "runset.save.v1", "runset.backup.v1"].map((key) => [
            key,
            localStorage.getItem(key),
          ]),
        ),
      [...profileKeys],
    );
  const open = async () => {
    await activate(button("Portable progress"));
    await expect(
      page.getByRole("dialog", { name: t("Portable progress"), exact: true }),
    ).toBeVisible();
  };
  const panel = page.getByRole("dialog", {
    name: t("Portable progress"),
    exact: true,
  });
  const input = panel.getByLabel(t("Open portable profile"), { exact: true });
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: t("Ready offline") }),
  ).toBeVisible();
  await context.setOffline(true);
  await open();
  const downloadPromise = page.waitForEvent("download");
  await activate(
    panel.getByRole("button", {
      name: t("Export portable profile"),
      exact: true,
    }),
  );
  const download = await downloadPromise,
    raw = await readFile((await download.path())!, "utf8"),
    profile = importProfile(raw);
  expect(profile.game).toEqual(source);
  for (const [key, value] of Object.entries(values))
    expect(profile.values[key]).toBe(value);
  const beforeBad = await snapshot();
  await input.setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });
  await expect(panel.getByRole("status")).toHaveText(
    t(
      "This is not a supported, complete RunSet profile. Nothing has been imported.",
    ),
  );
  expect(await snapshot()).toEqual(beforeBad);
  await activate(panel.getByRole("button", { name: t("Done"), exact: true }));
  await expect(button("Portable progress")).toBeFocused();
  // Prepare a different receiving-device state; session seeding stays disabled across reloads.
  await page.evaluate(
    ({ recipient, locale, keys }) => {
      for (const key of keys) localStorage.removeItem(key);
      localStorage.removeItem("runset.backup.v1");
      localStorage.setItem("runset.save.v1", JSON.stringify(recipient));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", "false");
      localStorage.setItem("runset.contrast", "false");
      localStorage.setItem("runset.muted", "true");
    },
    { recipient, locale, keys: [...profileKeys] },
  );
  await page.reload();
  await open();
  const loadFile = () =>
    input.setInputFiles({
      name: "profile.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
  await loadFile();
  const incoming = await snapshot();
  expect(JSON.parse((await saved())!)).toEqual(recipient);
  await expect(
    panel.getByRole("region", { name: t("Profile review"), exact: true }),
  ).toBeVisible();
  for (const label of ["Done", "Restore profile and reload"]) {
    const control = panel.getByRole("button", { name: t(label), exact: true });
    expect(
      await control.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.height >= 48 &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-profile-${info.project.name}-${locale}.png`,
  });
  await page.evaluate(() => {
    const target = window as unknown as {
      profileSetItem: typeof Storage.prototype.setItem;
    };
    target.profileSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "runset.reading" && value === "true")
        throw new DOMException("quota", "QuotaExceededError");
      target.profileSetItem.call(this, key, value);
    };
  });
  await activate(
    panel.getByRole("button", {
      name: t("Restore profile and reload"),
      exact: true,
    }),
  );
  await expect(panel.getByRole("status")).toHaveText(
    t(
      "The profile could not be fully restored. The page was not reloaded. Check your saved progress before trying again.",
    ),
  );
  await expect(panel.getByRole("status")).toBeFocused();
  expect(
    await panel.getByRole("status").evaluate((el) => {
      const r = el.getBoundingClientRect(),
        body = el.closest(".hint-preview-body")!.getBoundingClientRect();
      return (
        r.top >= Math.max(0, body.top) &&
        r.bottom <= Math.min(innerHeight, body.bottom)
      );
    }),
  ).toBe(true);
  expect(await snapshot()).toEqual(incoming);
  await page.evaluate(() => {
    Storage.prototype.setItem = (
      window as unknown as { profileSetItem: typeof Storage.prototype.setItem }
    ).profileSetItem;
  });
  await panel
    .getByLabel(t("Also restore the game from this file"), { exact: true })
    .uncheck();
  await activate(
    panel.getByRole("button", {
      name: t("Restore profile and reload"),
      exact: true,
    }),
  );
  await expect(button("Portable progress")).toBeVisible();
  await expect(panel).not.toBeVisible();
  expect(JSON.parse((await saved())!)).toEqual(recipient);
  for (const [key, value] of Object.entries(profile.values))
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
      value,
    );
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  await open();
  await loadFile();
  await activate(
    panel.getByRole("button", {
      name: t("Restore profile and reload"),
      exact: true,
    }),
  );
  await expect(button("Portable progress")).toBeVisible();
  await expect(panel).not.toBeVisible();
  expect(JSON.parse((await saved())!)).toEqual(source);
  const imported = await page.evaluate(() =>
    localStorage.getItem("runset.turnPractice.v1"),
  );
  expect(imported).toBe(values["runset.turnPractice.v1"]);
  expect(replayTurnPractice(JSON.parse(imported!))!.record.layout).toBe(2);
  await activate(
    page.getByRole("button", { name: new RegExp(t("Learn to play")) }),
  );
  await activate(button("Practise a whole turn"));
  await expect(
    page.getByText(t("Practice layout 3 of 4"), { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".whole-turn-prompt")).toHaveCount(0);
  await expect(
    page.locator(`.table [data-tile-id="${turnLayoutId(4, 2)}"]`),
  ).toBeVisible();
  for (const id of [104, 30, 56])
    await activate(
      page.locator(`.game [data-tile-id="${turnLayoutId(id, 2)}"]`),
    );
  await activate(page.locator(".new-meld"));
  await activate(button("End turn →"));
  await expect(
    page.getByRole("heading", {
      name: t("Whole-turn practice complete"),
      exact: true,
    }),
  ).toBeVisible();
  expect(JSON.parse((await saved())!)).toEqual(source);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
}
