// Extract exact visible lesson captions. Changed copy falls back to device voice.
import ts from "typescript";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "vite";
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
});
try {
  const { translateChinese: t } =
    await server.ssrLoadModule("/src/i18n/zh-CN.ts");
  const { exerciseCopy } = await server.ssrLoadModule(
    "/src/engine/exercises.ts",
  );
  const source = ts.createSourceFile(
    "Tutorial.tsx",
    await readFile("src/ui/Tutorial.tsx", "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const clips = [];
  function visit(n) {
    if (
      ts.isArrayLiteralExpression(n) &&
      n.elements.length === 2 &&
      n.elements.every(ts.isStringLiteral) &&
      n.elements[1].text.length > 40
    ) {
      const [title, body] = n.elements.map((e) => e.text);
      clips.push({
        id: `lesson-${clips.length}`,
        en: `${title}。${body}`,
        "zh-CN": `${t(title)}。${t(body)}`,
      });
    }
    ts.forEachChild(n, visit);
  }
  visit(source);
  for (const [kind, copy] of Object.entries(exerciseCopy))
    clips.push({
      id: `exercise-${kind}`,
      en: copy.goal,
      "zh-CN": t(copy.goal),
    });
  if (clips.length !== 17)
    throw Error(
      `Expected 17 captions, got ${clips.length}; review scripts before regenerating.`,
    );
  await mkdir("public/audio", { recursive: true });
  await writeFile(
    "src/lib/narration.json",
    JSON.stringify(clips, null, 2) + "\n",
  );
  console.log(`${clips.length} bilingual captions prepared.`);
} finally {
  await server.close();
}
