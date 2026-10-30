import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve, extname, sep} from "node:path";

/** One isolated same-origin deployment per test; never rewrites shared dist. */
export async function upgradeServer(oldDir: string, candidateDir: string) {
  let root = resolve(oldDir, "dist");
  let failedAsset = "";
  let failures = 0;
  const mime: Record<string, string> = {".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".webmanifest":"application/manifest+json", ".svg":"image/svg+xml", ".png":"image/png", ".mp3":"audio/mpeg"};
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url!, "http://localhost").pathname);
      if (path === failedAsset) { failures++; res.writeHead(503); res.end("Test-only interrupted asset download"); return; }
      const target = resolve(root, "." + (path === "/" ? "/index.html" : path));
      if (!target.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
      const body = await readFile(target);
      res.writeHead(200, {"Content-Type": mime[extname(target)] ?? "application/octet-stream", "Cache-Control":"no-store"});
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("No upgrade test origin");
  return {
    origin: `http://127.0.0.1:${address.port}`,
    publish(entry: string, interrupt: boolean) { root = resolve(candidateDir, "dist"); failedAsset = interrupt ? entry : ""; },
    repair() { failedAsset = ""; },
    failures: () => failures,
    close: () => new Promise<void>((done, reject) => { server.closeAllConnections(); server.close(error => error ? reject(error) : done()); }),
  };
}
