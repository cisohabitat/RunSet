import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
import { translator } from "./translate";
import messages from "./zh-CN";
const t = translator(messages);
describe("Simplified Chinese presentation", () => {
  it("translates compact hint counts without losing the physical tile count", () => {
    for (const n of [1, 10, 106]) {
      const text = t(`Possible move: ${n} highlighted tiles.`);
      expect(text).not.toMatch(/[a-z]/i);
      expect(text).toContain(String(n));
    }
  });
  it("translates every static text passed to t, including accessibility labels", () => {
    const files = [
      "src/App.tsx",
      ...readdirSync("src/ui")
        .filter((f) => f.endsWith(".tsx"))
        .map((f) => `src/ui/${f}`),
    ];
    const missing: string[] = [];
    for (const file of files) {
      const source = ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && node.expression.getText(source) === "t" && node.arguments.length === 1) {
          function options(value: ts.Node): string[] {
            if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return [value.text];
            if (ts.isConditionalExpression(value)) return [...options(value.whenTrue), ...options(value.whenFalse)];
            if (ts.isParenthesizedExpression(value)) return options(value.expression);
            return [];
          }
          for (const text of options(node.arguments[0])) {
            if (/[A-Za-z]/.test(text) && !/^(runset\.?|r)$/.test(text) && t(text) === text) missing.push(`${file}: ${text}`);
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
    expect(missing).toEqual([]);
  });
  it("keeps dictionary placeholders complete and keys unambiguous", () => {
    for (const [key, value] of Object.entries(messages)) {
      expect(key).toBe(key.trim());
      const names = new Set(
        Array.from(key.matchAll(/\{(\w+)\}/g), (m) => m[1]),
      );
      const translatedNames = new Set(Array.from(value.matchAll(/\{(\w+)\}/g), (m) => m[1]));
      // English plural suffix {s} has no Chinese equivalent; retain every value/name.
      expect([...translatedNames].filter(name => name !== "s").sort(), key).toEqual([...names].filter(name => name !== "s").sort());
      for (const name of translatedNames) expect(names.has(name), key).toBe(true);
    }
  });
  it("translates dynamic hints, both pool states and planner fallbacks", () => {
    for (const message of [
      "No legal addition was found in this search. You can draw; unfinished edits will be reset.",
      "No legal addition was found in this search. The pool is empty; you can pass; unfinished edits will be reset.",
      "No opening reaching 30 points was found. You can draw and try on your next turn. Your current opening is worth 6 points.",
      "No opening reaching 30 points was found. The pool is empty; you can pass. Your current opening is worth 0 points.",
      "Possible move: play 3 highlighted tiles for an opening worth 30 points. Review it, then choose Place hint if you want to use it. Your turn will not end automatically.",
      "Possible move: play 1 highlighted tile. Review it, then choose Place hint if you want to use it. Your turn will not end automatically.",
      "Fix the incomplete table first. Add 2 more tiles: a group or run needs at least three. Your edits are unchanged.",
      "Group: 3 tiles showing 10, each with a different colour.",
      "Run: red 1–2–3, consecutive without gaps.",
      ...["draw a tile", "pass"].flatMap((action) => [
        `The planner could not finish. Try again or ${action}.`,
        `The planner could not start. Try again or ${action}.`,
        `Planning is unavailable. You can still ${action}.`,
        `Planning took too long. Try again or ${action}.`,
      ]),
    ])
      expect(t(message), message).not.toMatch(/[A-Za-z]/);
    expect(
      t(
        "No opening reaching 30 points was found. The pool is empty; you can pass. Your current opening is worth 0 points.",
      ),
    ).toContain("跳过");
  });
  it("translates rule feedback, list colours, penalties and nested narration", () => {
    for (const message of [
      "For this step, select red 1, blue 2, the joker. Other tiles can wait.",
      "This group repeats blue. Use one tile of each colour, up to four.",
      "First finish this step: Choose End turn. You played tiles from your rack and left every group and run valid. No turn or penalty was applied.",
      "Time’s up. 阿明 drew a tile.",
      "阿明: invalid turn — Every meld needs a valid group or run. Drew penalty tiles.",
      "阿明 played 4 tiles. They made a matching-number group (7, 7, 7); added to a same-colour run (1, 2, 3, 4).",
      "Joker representing orange 10",
    ])
      expect(t(message), message).not.toMatch(/[A-Za-z]/);
  });
  it("preserves player names, including names that look like interface terms", () => {
    expect(t("Pass played 3 tiles.")).toBe("Pass 出了 3 张牌。");
    expect(t("red 7’s turn")).toBe("轮到 red 7");
    expect(t("Hint wins the match!")).toBe("Hint 赢得整场比赛！");
    expect(t("Pass’s saved game")).toBe("Pass 保存的游戏");
    expect(t("Deal round 2 →")).toBe("发牌，开始第 2 局 →");
    expect(t("constructor")).toBe("constructor");
    expect(t(" <script>alert(1)</script> drew a tile.")).toContain(
      "<script>alert(1)</script>",
    );
  });
});

it("translates observed placement counts and destinations without losing numbers", () => {
  expect(t("Tile position 2 of 50.")).toBe("第 2 张，共 50 张。");
  expect(t("Affected group/run 7")).toBe("需要处理的第 7 组牌");
  expect(t("Find group/run 16")).toBe("找到第 16 组牌");
  expect(t("6 pts")).toBe("6 分");
  expect(t("run")).toBe("顺子");
  expect(t("group")).toBe("同数组");
  expect(t("Add red 6 from your rack to group/run 7.")).toBe(
    "把手牌区的红色 6 放到第 7 组中。",
  );
  expect(
    t("Add at least 24 more opening points using tiles from your rack."),
  ).toBe("请再用自己的手牌增加至少 24 分，达到开局要求。");
  expect(t("1 tile")).toBe("1张牌");
  expect(t("3 tiles")).toBe("3张牌");
  expect(t("Placed 2")).toBe("已放置 2 张");
  expect(t("Placed 2 in group/run 7.")).toBe("已将 2 张牌放到第 7 组。");
  expect(t("Returned 3 to rack.")).toBe("已将 3 张牌放回手牌。");
});
