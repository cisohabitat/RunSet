// Build immutable historical sources with their identical locked dependencies.
// Fixtures stay outside dist/public: they are never shipped to players.
import {readFile, writeFile, mkdir, rm, cp, symlink} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {build} from 'vite';
const root = resolve('.');
const output = join(root, 'test-results/upgrade-fixtures');
const releases = JSON.parse(await readFile('e2e-upgrade/releases.json', 'utf8'));
const lock = await readFile('package-lock.json');
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
const run = (file, args, cwd) => execFileSync(file, args, {cwd, stdio: 'pipe', maxBuffer: 32 * 1024 * 1024});
const fixtures = [];
async function workerInfo(dir) {
  const body = await readFile(join(dir, 'dist/sw.js'));
  const cache = body.toString().match(/CACHE=("[^"]+")/)?.[1];
  if (!cache) throw Error('Missing worker cache identity');
  return {workerSha256: createHash('sha256').update(body).digest('hex'), cache: JSON.parse(cache)};
}
for (const release of releases) {
  if (!/^[a-z-]+$/.test(release.id) || !/^[a-f0-9]{40}$/.test(release.sha)) throw Error('Invalid pinned release');
  const source = join(output, release.id);
  await mkdir(source);
  try {
    // CI checks out full history. Do not fetch arbitrary refs or substitute HEAD.
    const archive = run('git', ['archive', release.sha], root);
    execFileSync('tar', ['-xf', '-', '-C', source], {input: archive});
    if (!(await readFile(join(source, 'package-lock.json'))).equals(lock)) throw Error(`${release.id}: historical lock differs; use a separate locked install`);
    await symlink(join(root, 'node_modules'), join(source, 'node_modules'), 'dir');
    run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build'], source);
    await writeFile(join(source, 'dist/upgrade-probe.json'), JSON.stringify({release: release.sha, testOnly: true}));
    // The one labelled probe is the only addition to each historical app/worker.
    run(process.execPath, ['scripts/build-offline.mjs'], source);
    await writeFile(join(source, 'upgrade-entry.ts'), `
      import {practiceGame} from './src/engine/practice';
      import {validSave} from './src/lib/storage';
      const game = practiceGame('rearrange');
      game.coach = false; game.notice = ''; game.log = [];
      game.players[0].name = '阿明';
      if (!validSave(game)) throw Error('Historical fixture invalid');
      export {game};
    `);
    await build({root: source, configFile: false, logLevel: 'error', build: {ssr: 'upgrade-entry.ts', outDir: 'upgrade-engine', emptyOutDir: true, minify: false, rollupOptions: {output: {entryFileNames: 'fixture.mjs'}}}});
    const {game} = await import(pathToFileURL(join(source, 'upgrade-engine/fixture.mjs')).href);
    const app = join(output, 'apps', release.id);
    await mkdir(app, {recursive: true});
    await cp(join(source, 'dist'), join(app, 'dist'), {recursive: true});
    fixtures.push({...release, dir: app, game, ...await workerInfo(app)});
    // Avoid rediscovering historical *.spec.ts files in broad compatibility globs.
    // Removing this tree unlinks node_modules; it never traverses the symlink.
    console.log(`Historical upgrade fixture built: ${release.id} ${release.sha}`);
  } finally {
    await rm(source, {recursive: true, force: true});
  }
}
const candidate = join(output, 'candidate');
await mkdir(candidate);
await cp(join(root, 'dist'), join(candidate, 'dist'), {recursive: true});
await writeFile(join(candidate, 'dist/upgrade-probe.json'), JSON.stringify({release: 'candidate', testOnly: true}));
run(process.execPath, [join(root, 'scripts/build-offline.mjs')], candidate);
const index = await readFile(join(candidate, 'dist/index.html'), 'utf8');
const entry = index.match(/<script[^>]+src="([^"]+)"/)?.[1];
if (!entry) throw Error('Candidate entry unavailable');
const recent = fixtures.find(f => f.id === 'refined-release');
const workerOnly = join(output, 'worker-only');
await mkdir(workerOnly);
await cp(join(recent.dir, 'dist'), join(workerOnly, 'dist'), {recursive: true});
run(process.execPath, [join(root, 'scripts/build-offline.mjs')], workerOnly);
const workerOnlyInfo = await workerInfo(workerOnly);
if (workerOnlyInfo.cache !== recent.cache || workerOnlyInfo.workerSha256 === recent.workerSha256) throw Error('Worker-only fixture must change code, not cache identity');
const workerOnlyHtml = await readFile(join(workerOnly, 'dist/index.html'), 'utf8');
const workerOnlyEntry = workerOnlyHtml.match(/<script[^>]+src="([^"]+)"/)?.[1];
if (!workerOnlyEntry) throw Error('Worker-only entry unavailable');
await writeFile(join(output, 'manifest.json'), JSON.stringify({
  sourceCommit: run('git', ['rev-parse', 'HEAD'], root).toString().trim(),
  lockSha256: createHash('sha256').update(lock).digest('hex'),
  candidate, entry, fixtures, ...await workerInfo(candidate),
  workerOnly: {candidate:workerOnly, entry:workerOnlyEntry, ...workerOnlyInfo},
}, null, 2));
console.log(`Upgrade fixtures ready: ${fixtures.length} pinned clients, current candidate ${entry}`);
