// Independently reconcile count-only Easy traces with complete review reports.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const paths = process.argv.slice(2);
assert(paths.length, "Provide one or more complete draw-review reports");
const hash = data => createHash("sha256").update(data).digest("hex");
const evaluator = hash(await readFile("scripts/review-difficulty.mjs"));
const sum = values => values.reduce((a,b)=>a+b,0);
const percentile = (values,p) => values.length ? [...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))] : null;
for (const path of paths) {
  const report = JSON.parse(await readFile(path,"utf8"));
  assert.equal(report.complete,true,"Incomplete report");
  assert.equal(report.method.drawReview,true,"Missing draw review");
  assert.equal(report.method.evaluatorFingerprint,evaluator,"Stale evaluator");
  for (const [name,fingerprint] of Object.entries(report.environment.engineFingerprint))
    assert.equal(hash(await readFile(`src/engine/${name}.ts`)),fingerprint,`Stale engine: ${name}`);
  assert.equal(report.games.length,report.method.seeds*report.method.assignments.length);
  assert.equal(report.checks.completedRounds,report.games.length);
  const keys=report.games.map(game=>`${game.seed}:${game.seating.join("/")}`);
  assert.equal(new Set(keys).size,keys.length,"Duplicate round");
  for(let seed=report.method.firstSeed;seed<report.method.firstSeed+report.method.seeds;seed++)
    for(const seats of report.method.assignments) assert(keys.includes(`${seed}:${seats.join("/")}`),"Missing seed/seating");
  const comparison = {compared:0,moreTiles:0,sameTiles:0,fewerTiles:0,drawsWithKnownNormalPlay:0,extensionOnlyDraws:0,newMeldDraws:0,baselineCouldEmptyRack:0,missedBaselineFinishes:0};
  const all = Object.fromEntries(["easy","normal","hard"].map(level=>[level,{moves:0,plays:0,draws:0,passes:0,tilesPlayed:0,before:0,after:0,streaks:[]}]));
  for (const game of report.games) {
    assert.equal(sum(Object.values(game.actualActions).map(actions=>actions.plays+actions.draws+actions.passes)),game.moves);
    for (const [level,actions] of Object.entries(game.actualActions)) {
      const total = all[level];
      const personalTurns = actions.plays+actions.draws+actions.passes;
      assert.equal(14+actions.draws-actions.tilesPlayed,game.remainingTiles[level]);
      assert.equal(sum(actions.drawStreaks),actions.draws,"Streak draw accounting");
      assert(actions.drawStreaks.every(n=>Number.isInteger(n)&&n>0));
      assert.equal(actions.drawsBeforeOpening+actions.drawsAfterOpening,actions.draws);
      total.moves+=personalTurns;
      for (const key of ["plays","draws","passes","tilesPlayed"]) total[key]+=actions[key];
      total.before+=actions.drawsBeforeOpening; total.after+=actions.drawsAfterOpening;
      total.streaks.push(...actions.drawStreaks);
    }
    if (!game.seating.includes("easy")) { assert.deepEqual(game.easyTrace,[]); continue; }
    const trace = game.easyTrace, actual = game.actualActions.easy;
    assert.equal(trace.length,actual.plays+actual.draws+actual.passes);
    const streaks=[]; let streak=0, previousTurn=0;
    for (const turn of trace) {
      assert(turn.turn>previousTurn); previousTurn=turn.turn;
      assert(Number.isInteger(turn.played)&&turn.played>=0&&turn.played<=turn.rackBefore);
      assert(Number.isInteger(turn.normalUsed)&&turn.normalUsed>=0&&turn.normalUsed<=turn.rackBefore);
      assert.equal(turn.action,turn.played>0?"play":turn.poolBefore>0?"draw":"pass");
      if (turn.action==="draw") streak++;
      else if (streak) { streaks.push(streak); streak=0; }
      if (!turn.opened) continue;
      comparison.compared++;
      comparison[turn.played>turn.normalUsed?"moreTiles":turn.played<turn.normalUsed?"fewerTiles":"sameTiles"]++;
      if (turn.normalUsed>0&&turn.normalUsed===turn.rackBefore) {
        comparison.baselineCouldEmptyRack++;
        if (turn.played<turn.rackBefore) comparison.missedBaselineFinishes++;
      }
      if (turn.action==="draw"&&turn.normalUsed>0) {
        comparison.drawsWithKnownNormalPlay++;
        comparison[turn.normalExtensionOnly?"extensionOnlyDraws":"newMeldDraws"]++;
      }
    }
    if (streak) streaks.push(streak);
    assert.deepEqual(streaks,actual.drawStreaks,"Easy trace streak order");
    assert.equal(trace.filter(t=>t.action==="draw"&&!t.opened).length,actual.drawsBeforeOpening);
    assert.equal(trace.filter(t=>t.action==="draw"&&t.opened).length,actual.drawsAfterOpening);
    for (const [action,key] of [["play","plays"],["draw","draws"],["pass","passes"]])
      assert.equal(trace.filter(t=>t.action===action).length,actual[key]);
    assert.equal(sum(trace.map(t=>t.played)),actual.tilesPlayed);
  }
  assert.deepEqual(comparison,report.easyVsNormal);
  for (const [level,total] of Object.entries(all)) {
    const actual=report.summary[level];
    for (const key of ["moves","plays","draws","passes","tilesPlayed"]) assert.equal(actual[key],total[key]);
    assert.deepEqual(actual.drawReview,{drawsBeforeOpening:total.before,drawsAfterOpening:total.after,streaks:{count:total.streaks.length,p50:percentile(total.streaks,0.5),p95:percentile(total.streaks,0.95),max:total.streaks.reduce((a,b)=>Math.max(a,b),0)}});
  }
  for (const value of Object.values(report.checks)) assert(value===true||Number.isInteger(value));
  console.log(JSON.stringify({path,rounds:report.games.length,easyTurns:all.easy.moves,draws:all.easy.draws,easyVsNormal:comparison,verified:true}));
}
