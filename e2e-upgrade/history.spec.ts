import {test, expect, type Page, type Locator} from "@playwright/test";
import {readFile} from "node:fs/promises";
import {upgradeServer} from "./server";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
type Release = {id:string;sha:string;profile:boolean;legacyOpening:boolean};
const releases: Release[] = JSON.parse(readFileSync(new URL("./releases.json", import.meta.url), "utf8"));
import {validSave} from "../src/lib/storage";
import {reducer, type GameState} from "../src/engine/game";
import {importProfile} from "../src/lib/profile";
import {replayTurnPractice} from "../src/lib/turnPractice";
import {translator} from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";

type Fixture = typeof releases[number] & {dir: string; game: GameState};
type Candidate = {candidate:string;entry:string;cache:string};
type Manifest = Candidate & {fixtures:Fixture[];workerOnly:Candidate};
const readManifest = async (): Promise<Manifest> => JSON.parse(await readFile("test-results/upgrade-fixtures/manifest.json", "utf8"));
const snapshot = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith("runset.")).sort().map(k => [k, localStorage.getItem(k)!])));
const newDefaults: Record<string, string> = {
  "runset.theme": "system",
  "runset.tableOrder.v1": "placed",
  "runset.roundHistory.v1": JSON.stringify({version: 1, rounds: []}),
};
function retained(before: Record<string, string>, after: Record<string, string>) {
  for (const [key, value] of Object.entries(before)) expect(after[key], key).toBe(value);
  for (const [key, value] of Object.entries(after)) {
    if (!(key in before)) expect(value, `Unexpected added preference ${key}`).toBe(newDefaults[key]);
  }
}

for (const release of releases) for (const locale of ["en", "zh-CN"] as const) {
  const scenarios = [{interrupted:false,workerOnly:false}, ...(release.id === "refined-release" ? [{interrupted:true,workerOnly:false},{interrupted:true,workerOnly:true}] : [])];
  for (const {interrupted,workerOnly} of scenarios) {
    test(`${release.id}: ${locale}: ${workerOnly ? "worker-only update with an interrupted install" : interrupted ? "interrupted download and offline recovery" : "explicit historical upgrade"}`, async ({page, context}, info) => {
      const manifest = await readManifest();
      const source = manifest.fixtures.find(f => f.id === release.id)!;
      const candidate = workerOnly ? manifest.workerOnly : manifest;
      const server = await upgradeServer(source.dir, candidate.candidate);
      const oldHtml = await readFile(`${source.dir}/dist/index.html`, "utf8");
      const oldEntry = oldHtml.match(/<script[^>]+src="([^"]+)"/)![1];
      const oldEntryHash = createHash("sha256").update(await readFile(`${source.dir}/dist${oldEntry}`)).digest("hex");
      const t = locale === "en" ? (s: string) => s : translator(messages);
      const now = Date.now();
      const original = structuredClone(source.game);
      original.turnSeconds = 120;
      original.deadline = now + 120000;
      expect(validSave(original)).toBe(true);
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.clock.install({time: now});
      await page.clock.setFixedTime(now);
      await page.emulateMedia({reducedMotion:"reduce", colorScheme:locale === "en" ? "light" : "dark"});
      await page.addInitScript(({original, locale}) => {
        if (sessionStorage.getItem("historical-upgrade-seeded")) return;
        sessionStorage.setItem("historical-upgrade-seeded", "1");
        localStorage.setItem("runset.save.v1", JSON.stringify(original));
        localStorage.setItem("runset.language", locale);
        localStorage.setItem("runset.muted", "true");
        localStorage.setItem("runset.simpleHome", "false");
        localStorage.setItem("runset.reading", String(locale === "zh-CN"));
        localStorage.setItem("runset.tableExpanded", "false");
      }, {original, locale});
      const b = (name: string, scope = page.locator("body")) => scope.getByRole("button", {name:t(name), exact:true});
      const activate = async (target: Locator) => {
        await target.scrollIntoViewIfNeeded();
        if (info.project.name === "firefox-desktop") await target.click(); else await target.tap();
      };
      const ready = async (target = page) => {
        const online = await target.evaluate(() => navigator.onLine);
        await expect(target.getByRole("status").filter({hasText:t(online ? "Ready offline" : "Offline · game, lessons and bots are ready.")})).toBeVisible();
        await target.waitForFunction(() => !!navigator.serviceWorker.controller);
      };
      const play = async (ids: number[], target = ".new-meld") => {
        for (const id of ids) await activate(page.locator(`.game [data-tile-id="${id}"]`));
        await activate(page.locator(target));
      };
      const learn = () => activate(page.locator(".hero-actions").getByRole("button", {name: new RegExp(t("Learn to play").trim())}));
      const state = async () => JSON.parse((await snapshot(page))["runset.save.v1"]) as GameState;
      const discover = () => page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) throw Error("Missing historical worker");
        const track = () => { if (registration.installing) (window as any).__upgradeInstalling = registration.installing; };
        registration.addEventListener("updatefound", track, {once:true});
        await registration.update();
        track();
      });
      try {
        await page.goto(server.origin);
        await ready();
        expect(await page.evaluate(async () => (await fetch("/upgrade-probe.json")).json())).toEqual({release:release.sha, testOnly:true});
        // Use the historical Settings UI to choose pace; language/display persist too.
        await activate(page.locator(".site-header").getByRole("button", {name:t("Settings"), exact:true}));
        const settings = page.getByRole("dialog", {name:t("Settings"), exact:true});
        await settings.getByLabel(t("Opponent pace"), {exact:true}).selectOption("5000");
        await activate(b("Done", settings).first());
        await activate(page.locator(".hero-actions").getByRole("button", {name:new RegExp(t("Quick exercises"))}));
        await activate(page.getByRole("button", {name:t("Extend a run") + " →",exact:true}));
        await play([3], ".meld-target");
        await activate(b("Check move"));
        await expect(page.getByRole("heading", {name:t("Well done! Goal complete."),exact:true})).toBeVisible();
        await activate(b("← Home"));
        await learn();
        await play([9,35,61]);
        await expect(page.locator(".practice-panel h1")).toHaveText(t("Make a run"));
        await activate(b("Exit practice"));
        await learn();
        await activate(b("Practise a whole turn"));
        await play([9,35,61]);
        await activate(b("Hide practice steps"));
        await activate(b("Exit practice"));
        await activate(b("Continue game →"));
        await play([3,4]);
        const draft = reducer(original, {type:"move",ids:[3,4],target:"new"});
        await expect.poll(state).toEqual(draft);
        await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
        await activate(page.locator(".site-header").getByRole("button", {name:t("Home"),exact:true}));
        let portable: string | undefined;
        if (release.profile) {
          await activate(b("Portable progress"));
          const dialog = page.getByRole("dialog", {name:t("Portable progress"),exact:true});
          const download = page.waitForEvent("download");
          await activate(b("Export portable profile", dialog));
          const file = await (await download).path();
          if (!file) throw Error("Historical profile download unavailable");
          portable = await readFile(file, "utf8");
          expect(importProfile(portable).game).toEqual(draft);
          await activate(b("Done", dialog));
        }
        const other = await context.newPage();
        other.on("pageerror", e => errors.push(e.message));
        await other.goto(server.origin);
        await ready(other);
        const before = await snapshot(page);
        const oldCaches = await page.evaluate(() => caches.keys());
        await other.evaluate(() => { (window as any).__originalController = navigator.serviceWorker.controller; });
        expect(JSON.parse(before["runset.practice.v1"]).step).toBe(1);
        expect(JSON.parse(before["runset.exercises.v1"])).toMatchObject({version:1,kind:"extend",checked:true});
        expect(JSON.parse(before["runset.solo.v1"]).completed).toContain("extend:4321");
        const whole = JSON.parse(before["runset.turnPractice.v1"]);
        expect(whole.actions).toHaveLength(1);
        expect(whole.showSteps).toBe(false);
        expect(whole.lesson === undefined && whole.layout === undefined).toBe(release.legacyOpening);
        expect(replayTurnPractice(whole)).not.toBeNull();
        let navigations = 0, otherNavigations = 0;
        page.on("framenavigated", frame => { if(frame === page.mainFrame()) navigations++; });
        other.on("framenavigated", frame => { if(frame === other.mainFrame()) otherNavigations++; });
        server.publish(candidate.entry, interrupted);
        await discover();
        if (interrupted) {
          await page.waitForFunction(() => (window as any).__upgradeInstalling?.state === "redundant");
          expect(server.failures()).toBeGreaterThan(0);
          expect(await page.evaluate(() => caches.keys())).toEqual(oldCaches);
          expect(navigations).toBe(0);
          retained(before, await snapshot(page));
          await context.setOffline(true);
          await page.reload();
          await ready();
          expect(await page.evaluate(async () => (await fetch("/upgrade-probe.json")).json())).toEqual({release:release.sha,testOnly:true});
          retained(before, await snapshot(page));
          await context.setOffline(false);
          server.repair();
          navigations = 0;
          await discover();
        }
        await expect(b("Save and update")).toBeVisible();
        expect(navigations).toBe(0);
        expect(otherNavigations).toBe(0);
        retained(before, await snapshot(page));
        await context.setOffline(true);
        await Promise.all([
          page.waitForEvent("framenavigated", f => f === page.mainFrame()),
          activate(b("Save and update")),
        ]);
        await expect(page.locator(".home")).toBeVisible();
        await ready();
        expect(await page.locator('script[type="module"][src]').getAttribute("src")).toBe(candidate.entry);
        retained(before, await snapshot(page));
        // Stable URL must come from the active cache, not the retained old cache.
        expect(await page.evaluate(async () => (await fetch("/upgrade-probe.json")).json())).toEqual({release:workerOnly ? release.sha : "candidate",testOnly:true});
        await expect.poll(() => other.evaluate(() => navigator.serviceWorker.controller !== (window as any).__originalController)).toBe(true);
        expect(otherNavigations).toBe(0);
        // Old hashed modules still come from the retained cache, not the new server.
        if (oldEntry !== candidate.entry) {
          expect(await other.evaluate(async path => {
            const response = await fetch(path);
            if (!response.ok) return `HTTP ${response.status}`;
            const hash = await crypto.subtle.digest("SHA-256", await response.arrayBuffer());
            return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, "0")).join("");
          }, oldEntry)).toBe(oldEntryHash);
        }
        // A still-open old client can lazily fetch its old lesson chunk offline.
        await other.locator(".hero-actions").getByRole("button", {name:new RegExp(t("Learn to play").trim())}).click();
        await expect(other.locator(".practice-panel h1")).toHaveText(t("Make a run"));
        expect(otherNavigations).toBe(0);
        await other.close();
        await activate(b("Continue game →"));
        await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
        expect(await state()).toEqual(draft);
        await activate(b("Undo move"));
        const undone = reducer(draft, {type:"undo"});
        await expect.poll(state).toEqual(undone);
        expect(validSave(await state())).toBe(true);
        expect((await state()).deadline).toBe(original.deadline);
        await activate(page.locator(".site-header").getByRole("button", {name:t("Home"),exact:true}));
        if (portable) {
          await activate(b("Portable progress"));
          const dialog = page.getByRole("dialog", {name:t("Portable progress"),exact:true});
          await dialog.getByLabel(t("Open portable profile"), {exact:true}).setInputFiles({name:"historical-profile.json",mimeType:"application/json",buffer:Buffer.from(portable)});
          await expect(dialog.getByLabel(t("Also restore the game from this file"), {exact:true})).not.toBeChecked();
          await Promise.all([page.waitForEvent("framenavigated", f => f === page.mainFrame()), activate(b("Restore profile and reload", dialog))]);
          await expect(page.locator(".home")).toBeVisible();
          expect(await state()).toEqual(undone);
        }
        await activate(page.locator(".hero-actions").getByRole("button", {name:new RegExp(t("Quick exercises"))}));
        await expect(page.getByRole("heading", {name:t("Well done! Goal complete."),exact:true})).toBeVisible();
        expect((await snapshot(page))["runset.exercises.v1"]).toBe(before["runset.exercises.v1"]);
        expect((await snapshot(page))["runset.solo.v1"]).toBe(before["runset.solo.v1"]);
        await activate(b("← Home"));
        await learn();
        await expect(page.locator(".practice-panel h1")).toHaveText(t("Make a run"));
        await play([0,1,2]);
        await expect(page.locator(".practice-panel h1")).toHaveText(t("Your first 30 points"));
        await activate(b("Exit practice"));
        await learn();
        await activate(b("Practise a whole turn"));
        await expect(b("Show practice steps")).toBeVisible();
        await expect(page.locator('.table [data-tile-id="9"]')).toBeVisible();
        await activate(b("End turn →"));
        await expect(page.locator(".practice-panel h1")).toHaveText(t("Opening turn complete"));
        expect(await state()).toEqual(undone);
        expect(errors).toEqual([]);
        await page.screenshot({path:`/tmp/runset-upgrade-${release.id}-${locale}-${info.project.name}.png`});
        console.log("HISTORICAL_UPGRADE "+JSON.stringify({from:release.sha,locale,project:info.project.name,interrupted,workerOnly,legacyOpening:release.legacyOpening,portable:!!portable,regularUndo:true,shortLessonContinued:true,wholeTurnCompleted:true,completedExerciseRetained:true,physicalDevice:false}));
      } finally { await server.close(); }
    });
  }
}
