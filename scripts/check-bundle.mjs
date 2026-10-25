import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const html = await readFile("dist/index.html", "utf8");
const files = new Set([
  "dist/index.html",
  ...Array.from(
    html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g),
    (match) => "dist" + match[1],
  ),
]);
let total = 0;
for (const file of files) total += gzipSync(await readFile(file)).byteLength;
console.log(
  `Initial HTML + referenced CSS/JS: ${total} bytes gzipped (budget 100000). Optional practice/worker assets are loaded separately.`,
);
if (total > 100000)
  throw Error("Initial download exceeds the 100 kB gzip budget.");
