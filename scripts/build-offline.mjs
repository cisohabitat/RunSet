import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const files = [];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await scan(path);
    else if (entry.name !== "sw.js") files.push(path);
  }
}
await scan("dist");
files.sort();
const hash = createHash("sha256");
for (const file of files) hash.update(await readFile(file));
const version = `runset-${hash.digest("hex").slice(0, 16)}`;
const urls = files.map((path) => "/" + path.slice(5));
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(version)},FILES=${JSON.stringify(urls)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const existed=await caches.has(CACHE);try{await(await caches.open(CACHE)).addAll(FILES);}catch(error){if(!existed)await caches.delete(CACHE);throw error;}})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();if(event.data?.type==='CHECK_CACHE'&&event.ports[0])event.waitUntil((async()=>{try{const cache=await caches.open(CACHE),results=await Promise.all(FILES.map(url=>cache.match(url,{ignoreVary:true})));event.ports[0].postMessage({ready:results.every(Boolean)});}catch{event.ports[0].postMessage({ready:false});}})());});
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=(await caches.keys()).filter(key=>key.startsWith('runset-'));let previous;for(const key of keys.filter(key=>key!==CACHE).reverse()){if(await(await caches.open(key)).match('/index.html',{ignoreVary:true})){previous=key;break;}}const keep=new Set([CACHE,...(previous?[previous]:[])]);await Promise.allSettled(keys.filter(key=>!keep.has(key)).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/index.html',{ignoreVary:true}))));return;}
if(FILES.includes(url.pathname)||url.pathname.startsWith('/assets/'))event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreVary:true})).then(cached=>cached||caches.match(event.request,{ignoreVary:true})).then(cached=>cached||fetch(event.request)));
});
`,
);
console.log(`Offline cache ${version}: ${files.length} files`);
