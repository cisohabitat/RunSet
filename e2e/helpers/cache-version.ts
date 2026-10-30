import {expect, type Page, type BrowserContext} from "@playwright/test";
const previous = "runset-cache-priority-fixture";

/** A labelled prior cache in this test context, never server-side/user storage. */
export async function seedPreviousManifest(page: Page) {
  // An inert same-origin document avoids JSON-download differences across engines.
  await page.route("**/runset-test-cache-setup", route => route.fulfill({contentType:"text/html",body:"<!doctype html><title>Test-only cache setup</title>"}), {times:1});
  await page.goto("/runset-test-cache-setup");
  await page.evaluate(async key => {
    const cache = await caches.open(key);
    await cache.put("/index.html", new Response("TEST-ONLY previous cache sentinel", {headers:{"Content-Type":"text/html"}}));
    await cache.put("/manifest.webmanifest", new Response(JSON.stringify({name:"TEST-ONLY previous manifest"}), {headers:{"Content-Type":"application/manifest+json"}}));
  }, previous);
}

export async function verifyCurrentManifest(page: Page, context: BrowserContext) {
  const before = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))));
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  try {
    expect(await page.evaluate(async () => (await fetch("/manifest.webmanifest", {cache:"no-store"})).json())).toMatchObject({name:"RunSet · Tile-rummy",short_name:"RunSet"});
    expect(await page.evaluate(key => caches.has(key), previous)).toBe(true);
    expect(await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))))).toBe(before);
  } finally { await context.setOffline(false); }
}
