import { test, expect, type Locator, type Page } from "@playwright/test";
async function hit(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  expect(
    await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        )
      );
    }),
  ).toBe(true);
  await locator.click();
}
for (const [device, width, height, dark] of [
  ["phone", 375, 667, false],
  ["iPad", 820, 1180, true],
  ["desktop", 1180, 757, false],
] as const) {
  test(`${device}: Chinese lessons, language switching, layout and progress`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ colorScheme: dark ? "dark" : "light" });
    await page.goto("/");
    await page.getByLabel("语言 / Language").selectOption("zh-CN");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("button", { name: /学习玩法/ })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/runset-chinese-${device}-home.png`,
      fullPage: true,
      animations: "disabled",
    });
    await hit(page, page.getByRole("button", { name: /学习玩法/ }));
    const instructions = page.locator("#practice-instructions");
    await expect(
      page.getByRole("heading", { name: "组成同数组", exact: true }),
    ).toBeVisible();
    for (const name of ["红 10", "蓝 10", "橙 10"])
      await hit(page, page.getByRole("button", { name, exact: true }));
    await hit(page, page.getByRole("button", { name: /新建同数组或顺子/ }));
    await expect(
      page.getByRole("heading", { name: "组成顺子", exact: true }),
    ).toBeVisible();
    // Switching is presentation-only: no lesson or tile-selection reset.
    await hit(page, page.getByRole("button", { name: "红 1", exact: true }));
    const before = await page.evaluate(() =>
      localStorage.getItem("runset.practice.v1"),
    );
    await page.getByLabel("语言 / Language").selectOption("en");
    await expect(
      page.getByRole("heading", { name: "Make a run", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "red 1", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      await page.evaluate(() => localStorage.getItem("runset.practice.v1")),
    ).toBe(before);
    await page.getByLabel("语言 / Language").selectOption("zh-CN");
    for (const name of ["红 2", "红 3"])
      await hit(page, page.getByRole("button", { name, exact: true }));
    await hit(page, page.getByRole("button", { name: /新建同数组或顺子/ }));
    await hit(page, page.getByRole("button", { name: /明白了：30/ }));
    await hit(
      page,
      page.getByRole("button", { name: "结束回合 →", exact: true }),
    );
    await hit(page, page.getByRole("button", { name: /看 Juniper 摸牌/ }));
    await hit(page, page.getByRole("button", { name: /摸一张牌/ }));
    await hit(page, page.locator('button[data-tile-id="12"]'));
    await hit(page, page.getByRole("button", { name: /新建同数组或顺子/ }));
    await hit(
      page,
      page.getByRole("button", { name: "重置本回合", exact: true }),
    );
    await expect(
      page.getByRole("heading", { name: "你已学会基础玩法" }),
    ).toBeVisible();
    await hit(page, page.getByRole("button", { name: "万能牌", exact: true }));
    await hit(page, page.getByRole("button", { name: "红 5", exact: true }));
    await hit(
      page,
      page.getByRole("button", {
        name: "将选中的牌加入第 1 个牌组",
        exact: true,
      }),
    );
    await expect(instructions).toContainText("现在显示为红 7");
    await page.screenshot({
      path: `/tmp/runset-chinese-${device}-joker.png`,
      fullPage: true,
      animations: "disabled",
    });
    for (const name of ["万能牌，代替红 7", "蓝 5", "橙 5"])
      await hit(page, page.getByRole("button", { name, exact: true }));
    await hit(page, page.getByRole("button", { name: /新建同数组或顺子/ }));
    await expect(
      page.getByRole("heading", { name: "万能牌练习完成", exact: true }),
    ).toBeVisible();
    await hit(
      page,
      page.getByRole("button", { name: "重新组牌", exact: true }),
    );
    for (const name of ["红 4", "红 5", "红 6", "红 7"])
      await hit(page, page.getByRole("button", { name, exact: true }));
    await hit(page, page.getByRole("button", { name: /新建同数组或顺子/ }));
    await expect(
      page.getByRole("heading", { name: "拆分顺子练习完成", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `/tmp/runset-chinese-${device}-complete.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.reload();
    await expect(page.getByLabel("语言 / Language")).toHaveValue("zh-CN");
    await page.getByRole("button", { name: /学习玩法/ }).click();
    await expect(
      page.getByRole("heading", { name: "拆分顺子练习完成", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBeNull();
    expect(errors).toEqual([]);
  });
}

test("Chinese regular game keeps names and save across switches, backup errors and deletion", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("语言 / Language").selectOption("zh-CN");
  await page.getByRole("button", { name: /开始新游戏/ }).click();
  await page.getByLabel("你的名字或昵称").fill("Pass");
  await page.getByRole("button", { name: /发牌，开始游戏/ }).click();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByText("已保存", { exact: true })).toBeVisible();
  const saved = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await page.getByLabel("语言 / Language").selectOption("en");
  await expect(page.locator(".save-summary")).toContainText("Pass");
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(saved);
  await page.getByLabel("语言 / Language").selectOption("zh-CN");
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("not-json"),
    });
  await expect(
    page.getByRole("status").filter({ hasText: "无法读取这个 JSON 文件" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(saved);
  await page
    .getByRole("button", { name: "删除已保存的游戏", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("确定删除这个游戏吗");
  await page.getByRole("button", { name: "保留游戏", exact: true }).click();
  await page
    .getByRole("button", { name: "删除已保存的游戏", exact: true })
    .click();
  await page.getByRole("button", { name: "删除游戏", exact: true }).click();
  await expect(page.getByRole("button", { name: /继续游戏/ })).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("runset.language")),
  ).toBe("zh-CN");
});

test("Chinese browser defaults to Chinese and respects a saved English preference", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "zh-CN" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("button", { name: /学习玩法/ })).toBeVisible();
  await page.getByLabel("语言 / Language").selectOption("en");
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Learn to play/ }),
  ).toBeVisible();
  await context.close();
});

test("Chinese empty-pool hint, timer, menu and results work on a narrow phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.players[0].rack = [12];
    s.players[0].melded = true;
    s.players[1].rack = Array.from({ length: 106 }, (_, i) => i).filter(
      (id) => id !== 12,
    );
    s.pool = [];
    s.turnStart = { table: [], rack: [12] };
    s.coach = true;
    s.turnSeconds = 120;
    s.deadline = Date.now() + 120000;
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
    localStorage.setItem("runset.language", "zh-CN");
  });
  await page.reload();
  await page.getByRole("button", { name: /继续游戏/ }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("timer")).toContainText("跳过");
  await page.getByRole("button", { name: "查看出牌提示", exact: true }).click();
  const hint = page.getByLabel("出牌提示", { exact: true });
  await expect(hint).toContainText("已经没有牌可摸");
  await expect(hint).toContainText("跳过");
  await expect(hint).not.toContainText(/[A-Za-z]/);
  const pass = page.getByRole("button", { name: /^跳过/ });
  expect(
    await pass.evaluate(
      (el) => el.getBoundingClientRect().bottom <= innerHeight,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/runset-chinese-phone-game.png",
    animations: "disabled",
  });
  await page.getByLabel("游戏菜单", { exact: true }).click();
  await expect(page.getByText("游戏设置", { exact: true })).toBeVisible();
  await page.getByLabel("游戏菜单", { exact: true }).click();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("runset.save.v1")!);
    s.phase = "over";
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: /查看结果/ }).click();
  await expect(
    page.getByRole("heading", { name: "你赢了！", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".scoreboard")).toContainText("获胜者");
  await page.screenshot({
    path: "/tmp/runset-chinese-phone-results.png",
    fullPage: true,
    animations: "disabled",
  });
});
