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
  const source = readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
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

function player(overrides = {}) {
  return {
    name: "Oliver Bennett", nation: "ENG", position: "ST", number: 9,
    age: 25, rating: 94, potential: 96, value: 150_000_000,
    currentClub: "Manchester City", parentClub: null,
    totalApps: 180, totalGoals: 120, totalAssists: 45, trophies: 0,
    caps: 40, nationalGoals: 25, morale: 90, fitness: 94, reputation: 95,
    agent: "International agent", roleBoost: 0, origin: "gem", squad: "senior",
    contractYears: 4, clubSeasons: 5, lastRole: "Star", seenScenarios: [], history: [],
    ...overrides,
  };
}

function cityOffer(kind = "stay") {
  const { clubByName } = loadTypeScriptModule("features/career/catalog.ts");
  return { ...clubByName("Manchester City"), kind, role: "Star", label: "Stay", reason: "Test" };
}

test("each simulated year has a complete named honours board", () => {
  const { simulateHonours } = loadTypeScriptModule("features/career/honours.ts");
  const [annual] = simulateHonours({
    player: player(), offer: cityOffer(), years: 1, apps: 48, goals: 42,
    assists: 18, rating: 94, reputation: 95,
  }, () => 0);

  assert.equal(annual.league, "Premier League");
  assert.ok(annual.champion);
  assert.equal(annual.cup.name, "FA Cup");
  assert.ok(annual.cup.winner);
  assert.ok(annual.topScorer.name);
  assert.ok(annual.playerOfSeason.name);
  assert.ok(annual.ballonDor.name);
  const { CLUBS } = loadTypeScriptModule("features/career/catalog.ts");
  const { clubDivision } = loadTypeScriptModule("features/career/finances.ts");
  const expectedDivisions = new Set(CLUBS.map((club) => `${club.country}:${clubDivision(club)}`));
  const expectedCountries = new Set(CLUBS.map((club) => club.country));
  assert.equal(annual.divisionRoll.length, expectedDivisions.size);
  assert.equal(annual.cupRoll.length, expectedCountries.size);
  assert.ok(annual.divisionRoll.every((division) => division.champion && division.topScorer.name && division.playerOfSeason.name));
  assert.ok(annual.cupRoll.every((cup) => cup.name && cup.winner));
  assert.equal(annual.standingGroups.length, 1);
  assert.equal(annual.standingGroups[0].clubs.length, 20);
  assert.equal(annual.standingGroups[0].clubs[0], annual.champion);
  assert.ok(annual.playoffBrackets.some((bracket) => bracket.name.includes("Promotion Playoff")));
  assert.deepEqual(
    annual.playerHonours.map((honour) => honour.kind).sort(),
    ["ballon-dor", "golden-boot", "league-title", "national-cup", "player-of-season"],
  );
});

test("multi-year simulations produce one honours board per year", () => {
  const { simulateHonours } = loadTypeScriptModule("features/career/honours.ts");
  const annual = simulateHonours({
    player: player({ age: 22 }), offer: cityOffer(), years: 3, apps: 120, goals: 72,
    assists: 36, rating: 90, reputation: 85,
  }, () => .4);
  assert.equal(annual.length, 3);
  assert.equal(new Set(annual.map((item) => item.season)).size, 3);
});

test("academy players appear in the world but cannot win senior honours", () => {
  const { simulateHonours } = loadTypeScriptModule("features/career/honours.ts");
  const [annual] = simulateHonours({
    player: player({ age: 16, squad: "academy" }), offer: cityOffer("academy"),
    years: 1, apps: 40, goals: 40, assists: 20, rating: 90, reputation: 90,
  }, () => 0);
  assert.deepEqual(annual.playerHonours, []);
  assert.equal(annual.topScorer.isPlayer, false);
  assert.equal(annual.playerOfSeason.isPlayer, false);
  assert.equal(annual.ballonDor.isPlayer, false);
  const { isGeneratedName } = loadTypeScriptModule("features/career/names.ts");
  assert.ok(annual.divisionRoll.every((division) =>
    isGeneratedName(division.country, division.topScorer.name)
      && isGeneratedName(division.country, division.playerOfSeason.name),
  ));
});

test("the trophy room is idempotent and keeps separate career saves", () => {
  const { simulateHonours } = loadTypeScriptModule("features/career/honours.ts");
  const { EMPTY_TROPHY_ROOM, mergeCareerSnapshot, trophyRoomTotals } = loadTypeScriptModule("features/career/trophyRoom.ts");
  const annual = simulateHonours({
    player: player(), offer: cityOffer(), years: 1, apps: 48, goals: 42,
    assists: 18, rating: 94, reputation: 95,
  }, () => 0);
  const season = {
    fromAge: 25, toAge: 26, club: "Manchester City", country: "ENG",
    league: "Premier League", role: "Star", kind: "stay", apps: 48, goals: 42,
    assists: 18, before: 92, after: 94,
    trophies: annual[0].playerHonours.filter((honour) => honour.category === "team").length,
    event: "A historic season", honours: annual,
  };
  const snapshot = player({ age: 26, history: [season], trophies: season.trophies });
  const once = mergeCareerSnapshot(EMPTY_TROPHY_ROOM, "career-one", snapshot);
  const twice = mergeCareerSnapshot(once, "career-one", snapshot);
  const otherCareer = mergeCareerSnapshot(twice, "career-two", player({ name: "Ari Cohen" }));

  assert.equal(twice.careers.length, 1);
  assert.equal(twice.careers[0].honours.length, annual[0].playerHonours.length);
  assert.deepEqual(twice.careers[0].clubs, ["Manchester City"]);
  assert.equal(otherCareer.careers.length, 2);
  assert.equal(trophyRoomTotals(twice).total, annual[0].playerHonours.length);
});

test("old saves retain unnamed trophy totals during migration", () => {
  const { EMPTY_TROPHY_ROOM, mergeCareerSnapshot, trophyRoomTotals } = loadTypeScriptModule("features/career/trophyRoom.ts");
  const room = mergeCareerSnapshot(EMPTY_TROPHY_ROOM, "legacy", player({ trophies: 3 }));
  assert.equal(room.careers[0].honours[0].name, "Unspecified silverware");
  assert.equal(room.careers[0].honours[0].count, 3);
  assert.equal(trophyRoomTotals(room).team, 3);
});
test("the collection exposes every division award, national cup, and club", () => {
  const { CLUBS } = loadTypeScriptModule("features/career/catalog.ts");
  const { clubDivision } = loadTypeScriptModule("features/career/finances.ts");
  const { EMPTY_TROPHY_ROOM, mergeCareerSnapshot } = loadTypeScriptModule("features/career/trophyRoom.ts");
  const { clubAlbum, representedClubs, trophyCollection } = loadTypeScriptModule("features/career/trophyCollection.ts");
  const divisions = new Set(CLUBS.map((club) => `${club.country}:${clubDivision(club)}`));
  const countries = new Set(CLUBS.map((club) => club.country));
  const empty = trophyCollection(EMPTY_TROPHY_ROOM);

  assert.equal(empty.team.length, divisions.size + countries.size);
  assert.equal(empty.individual.length, divisions.size * 2 + 1);
  assert.equal(empty.all.filter((entry) => entry.unlocked).length, 0);
  assert.equal(clubAlbum(EMPTY_TROPHY_ROOM).flatMap((group) => group.clubs).length, CLUBS.length);

  const room = mergeCareerSnapshot(EMPTY_TROPHY_ROOM, "album-career", player());
  assert.equal(representedClubs(room).has("Manchester City"), true);
  assert.equal(clubAlbum(room).reduce((total, group) => total + group.collected, 0), 1);
});


function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

test("every represented division is a complete catalog league", () => {
  const { CLUBS } = loadTypeScriptModule("features/career/catalog.ts");
  const { COMPLETE_LEAGUES, COMPLETE_LEAGUE_CLUB_COUNT } = loadTypeScriptModule("features/career/leagueCatalog.ts");
  const { clubDivision } = loadTypeScriptModule("features/career/finances.ts");
  const expected = new Map(COMPLETE_LEAGUES.map((league) => [
    `${league.country}:${league.league}:${league.division}`,
    league.expectedClubs,
  ]));
  const actual = new Map();

  CLUBS.forEach((club) => {
    const key = `${club.country}:${club.league}:${clubDivision(club)}`;
    actual.set(key, (actual.get(key) ?? 0) + 1);
  });

  assert.equal(CLUBS.length, 738);
  assert.equal(COMPLETE_LEAGUE_CLUB_COUNT, 738);
  assert.deepEqual(actual, expected);

  const addedTopFlights = new Map([
    ["AUT:Austrian Bundesliga", 12],
    ["CZE:Czech First League", 16],
    ["DEN:Danish Superliga", 12],
    ["SUI:Swiss Super League", 12],
    ["NOR:Eliteserien", 16],
    ["SWE:Allsvenskan", 16],
    ["UKR:Ukrainian Premier League", 16],
    ["SRB:Serbian SuperLiga", 14],
    ["ROU:Romanian SuperLiga", 16],
    ["HUN:Nemzeti Bajnokság I", 12],
  ]);
  addedTopFlights.forEach((clubCount, key) => {
    const [country, league] = key.split(":");
    assert.equal(CLUBS.filter((club) => club.country === country && club.league === league).length, clubCount, key);
  });
});

test("established contenders dominate league odds until an exceptional player bends them", () => {
  const { CLUBS } = loadTypeScriptModule("features/career/catalog.ts");
  const {
    competitionStrength,
    exceptionalPlayerBoost,
    pickCompetitionWinner,
  } = loadTypeScriptModule("features/career/competitionStrength.ts");
  const premierLeague = CLUBS.filter((club) => club.country === "ENG" && club.league === "Premier League");
  const liverpool = premierLeague.find((club) => club.name === "Liverpool");
  const hull = premierLeague.find((club) => club.name === "Hull City");
  assert.ok(liverpool && hull);
  assert.ok(competitionStrength(liverpool) - competitionStrength(hull) >= 40);

  const runs = 20_000;
  const baseline = new Map();
  const baselineRandom = seededRandom(4744);
  for (let index = 0; index < runs; index += 1) {
    const winner = pickCompetitionWinner(premierLeague, "", 0, "league", baselineRandom);
    baseline.set(winner, (baseline.get(winner) ?? 0) + 1);
  }

  const establishedWins = ["Liverpool", "Arsenal", "Manchester City"]
    .reduce((total, club) => total + (baseline.get(club) ?? 0), 0);
  const baselineHullWins = baseline.get("Hull City") ?? 0;
  assert.ok(establishedWins / runs > .72);
  assert.ok(baselineHullWins / runs < .001);

  const insaneSeasonBoost = exceptionalPlayerBoost({
    rating: 94, apps: 48, goals: 42, assists: 18, reputation: 95,
  });
  const inspired = new Map();
  const inspiredRandom = seededRandom(4744);
  for (let index = 0; index < runs; index += 1) {
    const winner = pickCompetitionWinner(
      premierLeague, "Hull City", insaneSeasonBoost, "league", inspiredRandom,
    );
    inspired.set(winner, (inspired.get(winner) ?? 0) + 1);
  }

  const inspiredHullRate = (inspired.get("Hull City") ?? 0) / runs;
  assert.ok(insaneSeasonBoost > 40);
  assert.ok(inspiredHullRate > .15);
  assert.ok(inspiredHullRate < .35);
});
