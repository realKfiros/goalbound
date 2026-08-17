import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const moduleCache = new Map();

function loadTypeScriptModule(relativePath) {
  const filePath = resolve(projectRoot, relativePath);
  if (moduleCache.has(filePath)) return moduleCache.get(filePath);
  const output = ts.transpileModule(readFileSync(filePath, "utf8"), {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filePath,
  }).outputText;
  const moduleRecord = { exports: {} };
  moduleCache.set(filePath, moduleRecord.exports);
  const localRequire = (specifier) => {
    if (!specifier.startsWith(".")) return require(specifier);
    const base = resolve(dirname(filePath), specifier);
    const target = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
    if (!target) throw new Error(`Cannot resolve ${specifier} from ${filePath}`);
    return loadTypeScriptModule(target);
  };
  new Function("require", "module", "exports", output)(localRequire, moduleRecord, moduleRecord.exports);
  moduleCache.set(filePath, moduleRecord.exports);
  return moduleRecord.exports;
}

const player = {
  name: "Test Legend", nation: "ISR", position: "RW", number: 11,
  age: 35, rating: 76, potential: 90, value: 2_000_000,
  currentClub: "Maccabi Haifa", parentClub: null,
  totalApps: 510, totalGoals: 148, totalAssists: 119, trophies: 9, caps: 82, nationalGoals: 19,
  morale: 90, fitness: 70, reputation: 94, agent: "International agent", roleBoost: 0,
  origin: "academy", squad: "senior", contractYears: 0, clubSeasons: 2,
  lastRole: "Star", seenScenarios: [],
  history: [
    {
      fromAge: 33, toAge: 35, club: "Maccabi Haifa", country: "ISR", league: "Israeli Premier League",
      role: "Star", kind: "permanent", apps: 58, goals: 22, assists: 18, before: 79, after: 76,
      trophies: 2, event: "Homecoming",
      honours: [{
        season: "2042/43", league: "Israeli Premier League", champion: "Maccabi Haifa",
        topScorer: { name: "Test Legend", club: "Maccabi Haifa", isPlayer: true },
        playerOfSeason: { name: "Test Legend", club: "Maccabi Haifa", isPlayer: true },
        cup: { name: "State Cup", winner: "Maccabi Haifa" },
        ballonDor: { name: "Someone Else", club: "Real Madrid", isPlayer: false },
        playerHonours: [{ id: "title-2043", kind: "league-title", category: "team", name: "Israeli Premier League", season: "2042/43", club: "Maccabi Haifa", country: "ISR", icon: "🏆" }],
      }],
    },
    {
      fromAge: 24, toAge: 33, club: "Liverpool", country: "ENG", league: "Premier League",
      role: "Star", kind: "permanent", apps: 330, goals: 112, assists: 89, before: 84, after: 79,
      trophies: 6, event: "Elite years", breakout: true,
    },
    {
      fromAge: 18, toAge: 24, club: "Maccabi Haifa", country: "ISR", league: "Israeli Premier League",
      role: "Starter", kind: "stay", apps: 122, goals: 14, assists: 12, before: 61, after: 84,
      trophies: 1, event: "Breakthrough", breakout: true,
    },
  ],
};

test("career summary keeps a return to a former club as its own spell", () => {
  const { careerSummary } = loadTypeScriptModule("features/career/careerShare.ts");
  const summary = careerSummary(player);
  assert.deepEqual(summary.spells.map((spell) => spell.club), ["Maccabi Haifa", "Liverpool", "Maccabi Haifa"]);
  assert.equal(summary.uniqueClubs, 2);
  assert.equal(summary.countriesPlayed, 2);
  assert.equal(summary.seasons, 17);
  assert.equal(summary.debutAge, 18);
});

test("career summary uses the actual peak and named honours", () => {
  const { careerSummary } = loadTypeScriptModule("features/career/careerShare.ts");
  const summary = careerSummary(player);
  assert.equal(summary.peakRating, 84);
  assert.equal(summary.honours.length, 1);
  assert.equal(summary.honours[0].name, "Israeli Premier League");
  assert.equal(summary.bestSeason.club, "Liverpool");
  assert.equal(summary.biggestRise.club, "Maccabi Haifa");
  assert.equal(summary.breakouts, 2);
});
