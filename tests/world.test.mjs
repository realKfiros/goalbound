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

function seededRandom(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

test("every catalog division has a versioned competition format", () => {
  const { COMPETITION_FORMATS, competitionFormat } = loadTypeScriptModule("features/career/competitionFormats.ts");
  const { COMPLETE_LEAGUES } = loadTypeScriptModule("features/career/leagueCatalog.ts");
  assert.equal(COMPETITION_FORMATS.length, COMPLETE_LEAGUES.length);
  COMPLETE_LEAGUES.forEach((competition) => {
    const format = competitionFormat(competition.country, competition.league);
    assert.ok(format, `Missing format for ${competition.country}:${competition.league}`);
    assert.equal(format.season, "2026–27");
  });
  assert.equal(competitionFormat("USA", "Major League Soccer").movement, "closed");
  assert.equal(competitionFormat("USA", "Major League Soccer").titleStructure, "playoff");
  assert.equal(competitionFormat("MEX", "Liga MX").titleStructure, "short-season-playoff");
  [
    ["AUT", "Austrian Bundesliga"],
    ["CZE", "Czech First League"],
    ["DEN", "Danish Superliga"],
    ["SUI", "Swiss Super League"],
    ["SRB", "Serbian SuperLiga"],
    ["ROU", "Romanian SuperLiga"],
  ].forEach(([country, league]) => {
    assert.equal(competitionFormat(country, league).titleStructure, "split-table", `${country}:${league}`);
  });
});

test("every loaded nation is playable and produces domestic starting offers", () => {
  const { CLUBS, COUNTRIES, START_COUNTRIES } = loadTypeScriptModule("features/career/catalog.ts");
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const loadedCountries = [...new Set(CLUBS.map((club) => club.country))].sort();
  const playableCountries = COUNTRIES.map((item) => item.code).sort();

  assert.deepEqual(playableCountries, loadedCountries);
  assert.deepEqual(START_COUNTRIES, COUNTRIES);

  [
    ["academy", .5],
    ["senior", .15],
    ["gem", .01],
  ].forEach(([origin, roll]) => {
    COUNTRIES.forEach((nation) => {
      const start = createCareerEngine(() => roll).createCareer({
        name: "Route Test",
        nation: nation.code,
        position: "ST",
        number: 9,
      });
      assert.equal(start.player.origin, origin, `${nation.code}:${origin}`);
      assert.equal(start.offers.length, 3, `${nation.code}:${origin}`);
      assert.ok(start.offers.every((offer) => offer.country === nation.code), `${nation.code}:${origin}`);
    });
  });
});

test("every playable nation has a broad local name pool", () => {
  const { COUNTRIES } = loadTypeScriptModule("features/career/catalog.ts");
  const { availableNameCount, generateName, isGeneratedName } = loadTypeScriptModule("features/career/names.ts");

  COUNTRIES.forEach((nation, index) => {
    assert.ok(availableNameCount(nation.code) >= 64, nation.code);
    const random = seededRandom(9000 + index);
    const samples = Array.from({ length: 24 }, () => generateName(nation.code, random));
    assert.ok(new Set(samples).size >= 16, nation.code);
    assert.ok(samples.every((name) => isGeneratedName(nation.code, name)), nation.code);
    assert.ok(samples.every((name) => name.length <= 22), nation.code);
  });

  assert.equal(generateName("ENG", () => 0), "Oliver Bennett");
  assert.equal(generateName("JPN", () => 0), "Haruto Sato");
});

test("a blank player name receives a nationality-aware fallback", () => {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const { isGeneratedName } = loadTypeScriptModule("features/career/names.ts");
  const start = createCareerEngine(seededRandom(2048)).createCareer({
    name: "   ",
    nation: "SRB",
    position: "CM",
    number: 8,
  });
  assert.ok(isGeneratedName("SRB", start.player.name));
});

test("a new save contains every club exactly once", () => {
  const { CLUBS } = loadTypeScriptModule("features/career/catalog.ts");
  const { createWorldState } = loadTypeScriptModule("features/career/world.ts");
  const world = createWorldState();
  assert.equal(Object.keys(world.clubs).length, CLUBS.length);
  assert.equal(world.elapsedYears, 0);
  assert.deepEqual(world.history, []);
});

test("loaded pyramids move clubs atomically and preserve every division size", () => {
  const { COMPLETE_LEAGUES } = loadTypeScriptModule("features/career/leagueCatalog.ts");
  const { createWorldState, simulateWorldSeason } = loadTypeScriptModule("features/career/world.ts");
  const simulation = simulateWorldSeason(createWorldState(), { club: "", boost: 0 }, seededRandom(4744));
  const englishMovements = simulation.movements.filter((movement) => movement.country === "ENG");
  assert.equal(englishMovements.filter((movement) => movement.direction === "promoted").length, 12);
  assert.equal(englishMovements.filter((movement) => movement.direction === "relegated").length, 12);
  assert.ok(englishMovements.some((movement) => movement.route === "playoff"));
  assert.ok(simulation.playoffBrackets.some((bracket) => bracket.name === "EFL Championship Promotion Playoff"));
  assert.ok(simulation.playoffBrackets.every((bracket) => bracket.ties.every((tie) => tie.home && tie.away && tie.winner)));

  COMPLETE_LEAGUES.forEach((competition) => {
    const members = Object.values(simulation.world.clubs).filter((club) =>
      club.country === competition.country && club.league === competition.league && club.division === competition.division,
    );
    assert.equal(members.length, competition.expectedClubs, competition.league);
  });
});

test("the 2026/27 UEFA access list covers every active association and entry round", () => {
  const {
    UEFA_ACCESS_LIST_2026_27,
    UEFA_ASSOCIATION_RANKING,
    UEFA_ASSOCIATIONS,
  } = loadTypeScriptModule("features/career/uefaAccessList.ts");
  const { championsLeague, europaLeague, conferenceLeague } = UEFA_ACCESS_LIST_2026_27;

  assert.equal(UEFA_ASSOCIATION_RANKING.length, 55);
  assert.equal(UEFA_ASSOCIATIONS.length, 54);
  assert.ok(UEFA_ASSOCIATIONS.includes("LIE"));
  assert.equal(UEFA_ASSOCIATIONS.includes("RUS"), false);
  assert.deepEqual({
    direct: championsLeague.direct.length,
    championsPlayoff: championsLeague.championsPlayoff.length,
    championsSecond: championsLeague.championsSecond.length,
    championsFirst: championsLeague.championsFirst.length,
    leagueThird: championsLeague.leagueThird.length,
    leagueSecond: championsLeague.leagueSecond.length,
  }, { direct: 25, championsPlayoff: 4, championsSecond: 9, championsFirst: 30, leagueThird: 5, leagueSecond: 6 });
  assert.deepEqual({
    direct: europaLeague.direct.length,
    playoff: europaLeague.playoff.length,
    third: europaLeague.third.length,
    second: europaLeague.second.length,
    first: europaLeague.first.length,
  }, { direct: 12, playoff: 5, third: 3, second: 8, first: 16 });
  assert.deepEqual({
    playoff: conferenceLeague.playoff.length,
    second: conferenceLeague.second.length,
    first: conferenceLeague.first.length,
  }, { playoff: 5, second: 54, first: 52 });

  const uclRoutes = Object.values(championsLeague).flat();
  const uelRoutes = Object.values(europaLeague).flat();
  const allRoutes = [...uclRoutes, ...uelRoutes, ...Object.values(conferenceLeague).flat()];
  assert.equal(new Set(allRoutes.map((route) => route.slotId)).size, allRoutes.length);
  const routesFor = (country) => ({
    ucl: uclRoutes.filter((route) => route.association === country),
    uel: uelRoutes.filter((route) => route.association === country),
    uecl: Object.values(conferenceLeague).flat().filter((route) => route.association === country),
  });
  assert.deepEqual(Object.fromEntries(Object.entries(routesFor("ENG")).map(([key, routes]) => [key, routes.length])),
    { ucl: 4, uel: 2, uecl: 1 });
  assert.deepEqual(Object.fromEntries(Object.entries(routesFor("ISR")).map(([key, routes]) => [key, routes.length])),
    { ucl: 1, uel: 1, uecl: 2 });
  assert.deepEqual(Object.fromEntries(Object.entries(routesFor("BIH")).map(([key, routes]) => [key, routes.length])),
    { ucl: 1, uel: 0, uecl: 3 });
  assert.deepEqual(Object.fromEntries(Object.entries(routesFor("LIE")).map(([key, routes]) => [key, routes.length])),
    { ucl: 0, uel: 0, uecl: 1 });
  assert.deepEqual(Object.fromEntries(Object.entries(routesFor("MKD")).map(([key, routes]) => [key, routes.length])),
    { ucl: 1, uel: 0, uecl: 2 });
});

test("the published 2026/27 adaptation moves the exact access-list slots", () => {
  const { createWorldState } = loadTypeScriptModule("features/career/world.ts");
  const { projectNextUefaQualification, UEFA_ASSOCIATIONS } = loadTypeScriptModule("features/career/uefaSeason.ts");
  const world = createWorldState();
  const associationSet = new Set(UEFA_ASSOCIATIONS);
  const tables = new Map();
  Object.values(world.clubs)
    .filter((club) => club.division === 1 && associationSet.has(club.country))
    .forEach((club) => tables.set(club.country, [...(tables.get(club.country) ?? []), club]));
  tables.forEach((table) => table.sort((left, right) =>
    right.squadQuality - left.squadQuality || right.reputation - left.reputation || left.club.localeCompare(right.club)));
  const domestic = [...tables].map(([country, table]) => ({
    country, division: 1, table: table.map((club) => club.club),
  }));
  const cupWinners = Object.fromEntries([...tables].map(([country, table]) => [country, table[0].club]));
  const places = projectNextUefaQualification(world.clubs, domestic, cupWinners, {
    additionalCups: [{ country: "ENG", name: "EFL Cup", winner: tables.get("ENG")[0].club }],
    performanceSpots: ["ENG", "ESP"],
    publishedAccessList: true,
    previousChampions: { "conference-league": { country: "ENG", club: "Crystal Palace" } },
  });
  const slot = (slotId) => places.find((place) => place.slotId === slotId);

  [
    ["UKR:N1:UCL", "League phase"],
    ["SVK:N1:UCL", "Second qualifying round"],
    ["SVN:N1:UCL", "Second qualifying round"],
    ["POR:N2:UCL", "League phase"],
    ["NOR:N2:UCL", "Third qualifying round"],
    ["GRE:N2:UCL", "Third qualifying round"],
  ].forEach(([slotId, entryRound]) => assert.equal(slot(slotId)?.entryRound, entryRound, slotId));
  ["DEN", "SUI", "ISR", "CYP", "SWE"].forEach((country) =>
    assert.equal(slot(`${country}:CW:europa-league`)?.entryRound, "Second qualifying round", country));
  assert.equal(slot("CRO:CW:europa-league")?.entryRound, "First qualifying round");
  ["KAZ", "FRO", "MLT", "NIR", "LTU", "LIE"].forEach((country) =>
    assert.equal(slot(`${country}:CW:conference-league`)?.entryRound, "Second qualifying round", country));

  const count = (competition, entryRound, path) => places.filter((place) =>
    place.competition === competition && place.entryRound === entryRound && place.path === path).length;
  assert.deepEqual({
    direct: count("champions-league", "League phase", "Direct"),
    championsFirst: count("champions-league", "First qualifying round", "Champions path"),
    championsSecond: count("champions-league", "Second qualifying round", "Champions path"),
    championsPlayoff: count("champions-league", "Play-off round", "Champions path"),
    leagueSecond: count("champions-league", "Second qualifying round", "League path"),
    leagueThird: count("champions-league", "Third qualifying round", "League path"),
  }, { direct: 29, championsFirst: 28, championsSecond: 10, championsPlayoff: 4, leagueSecond: 4, leagueThird: 6 });
  assert.deepEqual({
    direct: count("europa-league", "League phase", "Direct"),
    playoff: count("europa-league", "Play-off round", "Main path"),
    third: count("europa-league", "Third qualifying round", "Main path"),
    second: count("europa-league", "Second qualifying round", "Main path"),
    first: count("europa-league", "First qualifying round", "Main path"),
  }, { direct: 13, playoff: 5, third: 3, second: 12, first: 12 });
  assert.deepEqual({
    playoff: count("conference-league", "Play-off round", "Main path"),
    second: count("conference-league", "Second qualifying round", "Main path"),
    first: count("conference-league", "First qualifying round", "Main path"),
  }, { playoff: 5, second: 54, first: 52 });
});

test("European competitions qualify exclusive fields and play the current league-phase format", () => {
  const { createWorldState, simulateWorldSeason } = loadTypeScriptModule("features/career/world.ts");
  const { UEFA_ASSOCIATIONS } = loadTypeScriptModule("features/career/uefaSeason.ts");
  const simulation = simulateWorldSeason(createWorldState(), { club: "", boost: 0 }, seededRandom(202627));
  const competitions = simulation.continentalCompetitions;

  assert.deepEqual(simulation.additionalCups.map((cup) => `${cup.country}:${cup.name}`), ["ENG:EFL Cup"]);

  assert.deepEqual(competitions.map((competition) => competition.name), [
    "Champions League", "Europa League", "Conference League",
  ]);
  assert.deepEqual(competitions.map((competition) => competition.leagueMatches), [8, 8, 6]);
  const allEntrants = competitions.flatMap((competition) => competition.entrants.map((club) => `${club.country}:${club.club}`));
  assert.equal(allEntrants.length, 108);
  assert.equal(new Set(allEntrants).size, 108);
  assert.equal(UEFA_ASSOCIATIONS.length, 54);
  assert.equal(UEFA_ASSOCIATIONS.includes("LIE"), true);
  assert.equal(UEFA_ASSOCIATIONS.includes("RUS"), false);

  const expectedQualifyingTies = new Map([
    ["Champions League", 45],
    ["Europa League", 40],
    ["Conference League", 129],
  ]);

  competitions.forEach((competition) => {
    assert.equal(competition.entrants.length, 36, competition.name);
    assert.equal(competition.table.length, 36, competition.name);
    assert.ok(competition.entrants.every((club) => club.qualifiedVia), `${competition.name} qualification routes`);
    assert.ok(competition.entrants.every((club) => UEFA_ASSOCIATIONS.includes(club.country)), competition.name);
    assert.ok(competition.table.every((club) => club.played === competition.leagueMatches), competition.name);
    assert.ok(competition.table.every((club) => club.won + club.drawn + club.lost === club.played), competition.name);
    assert.ok(competition.table.every((club) => club.points === club.won * 3 + club.drawn), competition.name);
    assert.ok(competition.table.every((club, index, table) => index === 0 || table[index - 1].points >= club.points), competition.name);
    assert.equal(
      competition.qualifyingBrackets.reduce((total, bracket) => total + bracket.ties.length, 0),
      expectedQualifyingTies.get(competition.name),
      `${competition.name} qualifying ties`,
    );
    assert.deepEqual(
      Object.fromEntries(["Knockout phase play-off", "Round of 16", "Quarter-final", "Semi-final", "Final"]
        .map((round) => [round, competition.bracket.ties.filter((tie) => tie.round === round).length])),
      { "Knockout phase play-off": 8, "Round of 16": 8, "Quarter-final": 4, "Semi-final": 2, "Final": 1 },
      competition.name,
    );
    assert.equal(competition.bracket.ties.at(-1).winner, competition.champion.club, competition.name);
  });
  assert.ok(simulation.world.history[0].champions["EUROPE:champions-league"]);
  assert.ok(simulation.world.history[0].continentalChampions["champions-league"]);
  assert.ok(Object.keys(simulation.world.history[0].europeanPerformance).length >= 10);
});

test("European access routes carry titleholders and performance spots into the next season", () => {
  const { createWorldState, simulateWorldSeason } = loadTypeScriptModule("features/career/world.ts");
  const first = simulateWorldSeason(createWorldState(), { club: "", boost: 0 }, seededRandom(4101));
  const second = simulateWorldSeason(first.world, { club: "", boost: 0 }, seededRandom(4102));
  const firstByKey = new Map(first.continentalCompetitions.map((competition) => [competition.key, competition]));
  const secondByKey = new Map(second.continentalCompetitions.map((competition) => [competition.key, competition]));
  const championsEntrants = secondByKey.get("champions-league").entrants;
  const europaEntrants = secondByKey.get("europa-league").entrants;

  const championsHolder = firstByKey.get("champions-league").champion;
  const europaHolder = firstByKey.get("europa-league").champion;
  assert.equal(championsEntrants.find((club) => club.club === championsHolder.club)?.qualifiedVia, "Champions League holder");
  assert.equal(championsEntrants.find((club) => club.club === europaHolder.club)?.qualifiedVia, "Europa League holder");

  const conferenceHolder = firstByKey.get("conference-league").champion;
  const conferenceHolderInChampionsLeague = championsEntrants.some((club) => club.club === conferenceHolder.club && club.country === conferenceHolder.country);
  if (!conferenceHolderInChampionsLeague) {
    assert.equal(europaEntrants.find((club) => club.club === conferenceHolder.club)?.qualifiedVia, "Conference League holder");
  }

  const performanceAssociations = Object.entries(first.world.history.at(-1).europeanPerformance)
    .sort((left, right) => right[1] - left[1]).slice(0, 2).map(([country]) => country);
  performanceAssociations.forEach((country) => {
    assert.ok(championsEntrants.some((club) => club.country === country && club.qualifiedVia === "European Performance Spot"), country);
  });

  const projectedDirectPlaces = first.nextSeasonEuropeanQualification.filter((place) => place.entryRound === "League phase");
  projectedDirectPlaces.forEach((place) => {
    const currentField = secondByKey.get(place.competition).entrants;
    assert.ok(currentField.some((club) => club.country === place.country && club.club === place.club),
      `${place.country}:${place.club} should enter the following season`);
  });
  assert.deepEqual(first.world.history.at(-1).nextEuropeanQualification, first.nextSeasonEuropeanQualification);
});

test("England and Israel preserve domestic UEFA quotas when cup winners qualify higher", () => {
  const { createWorldState } = loadTypeScriptModule("features/career/world.ts");
  const { projectNextUefaQualification, UEFA_ASSOCIATIONS } = loadTypeScriptModule("features/career/uefaSeason.ts");
  const world = createWorldState();
  const associationSet = new Set(UEFA_ASSOCIATIONS);
  const tables = new Map();

  Object.values(world.clubs)
    .filter((club) => club.division === 1 && associationSet.has(club.country))
    .forEach((club) => {
      const table = tables.get(club.country) ?? [];
      table.push(club);
      tables.set(club.country, table);
    });
  tables.forEach((table) => table.sort((left, right) =>
    right.squadQuality - left.squadQuality || right.reputation - left.reputation || left.club.localeCompare(right.club)));

  const domestic = [...tables].map(([country, table]) => ({
    country,
    division: 1,
    table: table.map((club) => club.club),
  }));
  const cupWinners = Object.fromEntries([...tables].map(([country, table]) => [country, table[0].club]));
  const scottishChampion = tables.get("SCO")[0];
  const italianChampion = tables.get("ITA")[0];
  const places = projectNextUefaQualification(world.clubs, domestic, cupWinners, {
    additionalCups: [{ country: "ENG", name: "EFL Cup", winner: tables.get("ENG")[0].club }],
    previousChampions: {
      "champions-league": scottishChampion,
      "europa-league": italianChampion,
      "conference-league": scottishChampion,
    },
    previousPerformance: { ENG: 100, ITA: 90 },
  });

  const forCountry = (country) => places.filter((place) => place.country === country);
  const counts = (country) => Object.fromEntries(["champions-league", "europa-league", "conference-league"]
    .map((competition) => [competition, forCountry(country).filter((place) => place.competition === competition).length]));
  assert.deepEqual(counts("ENG"), {
    "champions-league": 5,
    "europa-league": 2,
    "conference-league": 1,
  });
  assert.deepEqual(counts("ISR"), {
    "champions-league": 1,
    "europa-league": 1,
    "conference-league": 2,
  });

  const english = tables.get("ENG");
  const englandPlaces = forCountry("ENG");
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "European Performance Spot")?.club, english[4].club);
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "European Performance Spot")?.slotId, "ENG:EPS:UCL");
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "League position · Europa League")?.club, english[5].club);
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "League position · Europa League")?.slotId,
    "ENG:LQ1:europa-league");
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "League position · FA Cup place passed down")?.club, english[6].club);
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "League position · FA Cup place passed down")?.slotId,
    "ENG:CW:europa-league");
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "League position · EFL Cup place passed down")?.club, english[7].club);
  assert.equal(englandPlaces.find((place) => place.qualifiedVia === "League position · EFL Cup place passed down")?.slotId,
    "ENG:EFL_CUP:conference-league");

  const israel = tables.get("ISR");
  const israelPlaces = forCountry("ISR");
  assert.equal(israelPlaces.find((place) => place.competition === "europa-league")?.club, israel[1].club);
  assert.equal(israelPlaces.find((place) => place.competition === "europa-league")?.entryRound, "Second qualifying round");
  assert.equal(israelPlaces.find((place) => place.competition === "europa-league")?.qualifiedVia,
    "League position · State Cup place passed down");
  assert.equal(israelPlaces.find((place) => place.competition === "europa-league")?.slotId, "ISR:CW:europa-league");
  assert.deepEqual(israelPlaces.filter((place) => place.competition === "conference-league").map((place) => place.club),
    [israel[2].club, israel[3].club]);
  assert.ok(israelPlaces.filter((place) => place.competition === "conference-league")
    .every((place) => place.entryRound === "Second qualifying round"));

  assert.equal(new Set(places.map((place) => `${place.country}:${place.club}`)).size, places.length);
  assert.ok(places.every((place) => place.slotId));
});

test("continental calibration keeps domestic giants realistic in Europe", () => {
  const { createWorldState, simulateWorldSeason } = loadTypeScriptModule("features/career/world.ts");
  const { continentalClubStrength } = loadTypeScriptModule("features/career/uefaSeason.ts");
  const world = createWorldState();
  assert.ok(continentalClubStrength(world.clubs["ESP:Real Madrid"]) - continentalClubStrength(world.clubs["CRO:Dinamo Zagreb"]) >= 20);
  assert.ok(continentalClubStrength(world.clubs["ENG:Liverpool"]) - continentalClubStrength(world.clubs["SCO:Celtic"]) >= 12);

  const runs = 300;
  const leadingAssociations = new Set(["ENG", "ITA", "ESP", "GER", "FRA"]);
  let leadingWins = 0;
  let dinamoWins = 0;
  for (let index = 0; index < runs; index += 1) {
    const simulation = simulateWorldSeason(createWorldState(), { club: "", boost: 0 }, seededRandom(7000 + index));
    const champion = simulation.continentalCompetitions[0].champion;
    if (leadingAssociations.has(champion.country)) leadingWins += 1;
    if (champion.country === "CRO" && champion.club === "Dinamo Zagreb") dinamoWins += 1;
  }
  assert.ok(leadingWins / runs >= .8, `Leading-association win rate: ${leadingWins}/${runs}`);
  assert.ok(dinamoWins <= 1, `Dinamo Zagreb wins: ${dinamoWins}/${runs}`);
});

test("closed and missing pyramids do not invent relegation", () => {
  const { createWorldState, simulateWorldSeason } = loadTypeScriptModule("features/career/world.ts");
  const simulation = simulateWorldSeason(createWorldState(), { club: "", boost: 0 }, seededRandom(12));
  assert.equal(simulation.movements.some((movement) => movement.country === "USA"), false);
  assert.equal(simulation.movements.some((movement) => movement.country === "ISR"), false);
  assert.equal(simulation.movements.some((movement) => movement.country === "FRA"), false);
});

test("MLS and short-season leagues produce their actual title shapes", () => {
  const { createWorldState, simulateWorldSeason } = loadTypeScriptModule("features/career/world.ts");
  const simulation = simulateWorldSeason(createWorldState(), { club: "", boost: 0 }, seededRandom(99));
  const mls = simulation.competitions.find((competition) => competition.country === "USA");
  const argentina = simulation.competitions.find((competition) => competition.country === "ARG");
  const mexico = simulation.competitions.find((competition) => competition.country === "MEX");
  assert.deepEqual(mls.titles.map((title) => title.name), ["MLS Cup"]);
  assert.deepEqual(argentina.titles.map((title) => title.name), ["Apertura", "Clausura"]);
  assert.deepEqual(mexico.titles.map((title) => title.name), ["Apertura", "Clausura"]);
  assert.deepEqual(mls.standings.map((group) => group.name), ["Eastern Conference", "Western Conference"]);
  assert.equal(mls.standings.reduce((total, group) => total + group.clubs.length, 0), 30);
  assert.equal(mls.playoffBrackets[0].ties.at(-1).round, "MLS Cup");
  assert.deepEqual(mexico.standings.map((group) => group.name), ["Apertura table", "Clausura table"]);
  assert.deepEqual(mexico.playoffBrackets.map((bracket) => bracket.name), ["Apertura Liguilla", "Clausura Liguilla"]);
  assert.equal(argentina.standings.length, 4);
});

test("club state evolves and persists across multiple seasons", () => {
  const { createWorldState, simulateWorldSeason } = loadTypeScriptModule("features/career/world.ts");
  let world = createWorldState();
  const initial = world.clubs["ENG:Hull City"].squadQuality;
  const random = seededRandom(8008);
  for (let year = 0; year < 3; year += 1) world = simulateWorldSeason(world, { club: "", boost: 0 }, random).world;
  assert.equal(world.elapsedYears, 3);
  assert.equal(world.history.length, 3);
  assert.equal(world.clubs["ENG:Hull City"].rollingPerformance.length, 3);
  assert.notEqual(world.clubs["ENG:Hull City"].squadQuality, initial);
});
