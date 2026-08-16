import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), "..");
const moduleCache = new Map();

function loadTypeScriptModule(relativePath) {
  const filePath = resolve(projectRoot, relativePath);
  if (moduleCache.has(filePath)) return moduleCache.get(filePath);

  const source = readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
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

function seededRandom(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function eliteEnglishProspect(nation = "ENG") {
  return {
    name: "Regression Prospect", nation, position: "CM", number: 18,
    age: 24, rating: 67, potential: 83, value: 8_000_000,
    currentClub: "Manchester City", parentClub: null,
    totalApps: 42, totalGoals: 4, totalAssists: 7, trophies: 1, caps: 0, nationalGoals: 0,
    morale: 70, fitness: 92, reputation: 100, agent: "International agent", roleBoost: 0,
    origin: "academy", squad: "senior", contractYears: 3, clubSeasons: 4,
    lastRole: "Rotation", seenScenarios: [], history: [],
  };
}

function sampledOffers(nation = "ENG") {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const offers = [];
  for (let seed = 1; seed <= 1_000; seed += 1) {
    const engine = createCareerEngine(seededRandom(seed));
    const player = eliteEnglishProspect(nation);
    const bids = engine.ordinaryDecision(player);
    offers.push(...bids.offers.filter((offer) => offer.name !== "Manchester City"));

    const expiredPlayer = { ...player, contractYears: 0 };
    const latestSeason = {
      fromAge: 23, toAge: 24, club: "Manchester City", country: "ENG",
      league: "Premier League", role: "Rotation", kind: "stay",
      apps: 24, goals: 2, assists: 5, before: 65, after: 67, trophies: 0, event: "Useful season",
    };
    const contractDecision = engine.nextBeat(expiredPlayer, latestSeason);
    if (contractDecision.type === "decision") {
      offers.push(...contractDecision.offers.filter((offer) => offer.name !== "Manchester City"));
    }
  }
  return offers;
}

test("an elite English club does not receive foreign second-division bids", () => {
  const invalid = sampledOffers().find((offer) =>
    (offer.division ?? 1) > 1 && offer.country !== "ENG",
  );
  assert.equal(invalid, undefined, invalid
    ? `Received ${invalid.label} from ${invalid.name} in ${invalid.league}`
    : undefined);
});

test("a move down from England is not described as a bridge to a bigger league", () => {
  const invalid = sampledOffers().find((offer) => offer.reason.includes("proven bridge to a bigger league"));
  assert.equal(invalid, undefined, invalid
    ? `${invalid.name} was described as: ${invalid.reason}`
    : undefined);
});

test("a foreign second-division homecoming remains possible", () => {
  const homecoming = sampledOffers("NED").find((offer) =>
    offer.country === "NED" && (offer.division ?? 1) > 1,
  );
  assert.ok(homecoming, "Expected a Dutch lower-division homecoming to remain in the market");
});
