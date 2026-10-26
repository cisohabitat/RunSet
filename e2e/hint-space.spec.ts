import { expect, test } from "@playwright/test";
import { practiceGame } from "../src/engine/practice";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";

const table = [
  { id: "hint-a", tiles: [9, 35, 61] },
  { id: "hint-b", tiles: [0, 1, 2] },
  { id: "hint-c", tiles: [12, 51, 77, 103] },
];
const message =
  "Possible move: play 10 highlighted tiles for an opening worth 88 points. Review it, then choose Place hint if you want to use it. Your turn will not end automatically.";
test.use({ hasTouch: true });
for (const width of [360, 375])
  for (const locale of ["en", "zh-CN"] as const)
    for (const theme of ["light", "dark"] as const)
      test(`${width} ${locale} ${theme}: long ten-tile hint keeps placement reachable`, async ({
        page,
      }) => {
        const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
        await page.setViewportSize({
          width,
          height: width === 360 ? 640 : 667,
        });
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        await page.route("**/src/workers/planner.ts*", (route) =>
          route.fulfill({
            contentType: "application/javascript",
            body: `self.postMessage({ready:true});self.onmessage=()=>self.postMessage({result:${JSON.stringify({ table, used: table.flatMap((m) => m.tiles), message, explanations: ["Opening total: 88 points, meeting the 30-point requirement."] })}});`,
          }),
        );
        await page.goto("/");
        await page.evaluate(
          ({ game, locale }) => {
            localStorage.setItem("runset.save.v1", JSON.stringify(game));
            localStorage.setItem("runset.language", locale);
          },
          { game: practiceGame(), locale },
        );
        await page.reload();
        await page
          .getByRole("button", { name: t("Continue game →"), exact: true })
          .click();
        await page
          .getByRole("button", { name: t("Show a possible move"), exact: true })
          .click();
        const place = page.getByRole("button", {
          name: t("Place hint"),
          exact: true,
        });
        await expect(place).toBeVisible();
        const reachable = async () =>
          expect(
            await place.evaluate((el) => {
              const r = el.getBoundingClientRect(),
                context = el.closest(".game-context")!.getBoundingClientRect();
              return (
                r.height >= 44 &&
                r.top >= context.top &&
                r.bottom <= context.bottom &&
                el.contains(
                  document.elementFromPoint(
                    r.x + r.width / 2,
                    r.y + r.height / 2,
                  ),
                )
              );
            }),
          ).toBe(true);
        await reachable();
        expect(
          await page
            .locator(".table-tools")
            .evaluate((el) => el.getBoundingClientRect().height),
        ).toBeLessThanOrEqual(50);
        expect(
          await page
            .locator(".table")
            .evaluate((el) => el.getBoundingClientRect().height),
        ).toBeGreaterThanOrEqual(180);
        await page.locator(".hint-reasons > summary").click();
        await expect(page.locator(".hint-reasons > p")).toHaveText(t(message));
        await page.locator(".hint-reasons li").last().scrollIntoViewIfNeeded();
        await reachable();
        await place.click();
        await expect(page.locator(".table .tile")).toHaveCount(10);
        await expect
          .poll(() =>
            page.evaluate(() => {
              const s = JSON.parse(localStorage.getItem("runset.save.v1")!);
              return [s.turn, s.current, s.players[0].rack.length];
            }),
          )
          .toEqual([1, 0, 4]);
      });
