import {expect, type Page, type BrowserContext} from "@playwright/test";
const previous = "runset-cache-priority-fixture";

/** Seed on the real origin before registration, without routing any requests. */
export async function seedPreviousManifest(page: Page) {
  await page.addInitScript(key => {
    if (sessionStorage.getItem("cache-priority-seeded")) return;
    const native = ServiceWorkerContainer.prototype.register;
    const seeded = (async () => {
      const cache = await caches.open(key);
      await cache.put("/index.html", new Response("TEST-ONLY previous cache sentinel", {headers:{"Content-Type":"text/html"}}));
      await cache.put("/manifest.webmanifest", new Response(JSON.stringify({name:"TEST-ONLY previous manifest"}), {headers:{"Content-Type":"application/manifest+json"}}));
      sessionStorage.setItem("cache-priority-seeded", "1");
    })();
    ServiceWorkerContainer.prototype.register = function(scriptURL, options) {
      return seeded.then(() => {
        ServiceWorkerContainer.prototype.register = native;
        return native.call(this, scriptURL, options);
      });
    };
  }, previous);
}

export async function verifyCurrentManifest(page: Page, context: BrowserContext) {
  const before = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))));
  await page.waitForFunction(() => navigator.serviceWorker.controller?.state === "activated");
  await context.setOffline(true);
  try {
    // Use the normal asset path; Firefox no-store can reject before cache delivery offline.
    expect(await page.evaluate(async () => (await fetch("/manifest.webmanifest")).json())).toMatchObject({name:"RunSet · Tile-rummy",short_name:"RunSet"});
    expect(await page.evaluate(key => caches.has(key), previous)).toBe(true);
    expect(await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))))).toBe(before);
  } catch (error) {
    console.log("CACHE_VERSION_DIAGNOSTIC " + JSON.stringify(await page.evaluate(async key => ({
      origin:location.origin,
      controller:navigator.serviceWorker.controller?.state,
      previous:key,
      caches:await Promise.all((await caches.keys()).map(async name => {
        const cache=await caches.open(name);
        return {name,index:!!await cache.match("/index.html"),manifest:!!await cache.match("/manifest.webmanifest")};
      })),
    }), previous)));
    throw error;
  } finally { await context.setOffline(false); }
}
