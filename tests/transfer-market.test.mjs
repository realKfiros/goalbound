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

function eliteEnglishProspect(nation = "ENG", overrides = {}) {
  return {
    name: "Regression Prospect", nation, position: "CM", number: 18,
    age: 24, rating: 67, potential: 83, value: 8_000_000,
    currentClub: "Manchester City", parentClub: null,
    totalApps: 42, totalGoals: 4, totalAssists: 7, trophies: 1, caps: 0, nationalGoals: 0,
    morale: 70, fitness: 92, reputation: 100, agent: "International agent", roleBoost: 0,
    origin: "academy", squad: "senior", contractYears: 3, clubSeasons: 4,
    lastRole: "Rotation", seenScenarios: [], history: [],
    ...overrides,
  };
}

function sampledContractedBids(overrides = {}) {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const offers = [];
  for (let seed = 1; seed <= 2_000; seed += 1) {
    const engine = createCareerEngine(seededRandom(seed));
    const decision = engine.ordinaryDecision(eliteEnglishProspect("ENG", overrides));
    offers.push(...decision.offers.filter((offer) => offer.reason.includes(" agreed ")));
  }
  return offers;
}

function sampledForcedSaleOffers() {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const offers = [];
  for (let seed = 1; seed <= 2_000; seed += 1) {
    const engine = createCareerEngine(seededRandom(seed));
    const player = eliteEnglishProspect("ENG", {
      currentClub: "Bristol City", rating: 72, value: 12_000_000,
    });
    const latestSeason = {
      fromAge: 23, toAge: 24, club: "Bristol City", country: "ENG",
      league: "EFL Championship", role: "Star", kind: "stay",
      apps: 34, goals: 7, assists: 10, before: 69, after: 72, trophies: 0, event: "Breakout season",
    };
    const beat = engine.nextBeat(player, latestSeason);
    if (beat.type === "decision" && beat.kind === "forced-sale") offers.push(...beat.offers);
  }
  return offers;
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

function sampledDirectMarket(player, seeds = 400) {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const offers = [];
  for (let seed = 1; seed <= seeds; seed += 1) {
    offers.push(...createCareerEngine(seededRandom(seed)).marketOffers(player, 3, true, false));
  }
  return offers;
}

function club(name) {
  const { CLUBS } = loadTypeScriptModule("features/career/catalog.ts");
  const match = CLUBS.find((item) => item.name === name);
  assert.ok(match, `Expected ${name} in the club catalog`);
  return match;
}

test("club finances vary by stature within the same league", () => {
  const { clubFinance, maxSingleFee } = loadTypeScriptModule("features/career/finances.ts");
  const city = club("Manchester City");
  const brighton = club("Brighton & Hove Albion");
  const hull = club("Hull City");

  assert.equal(clubFinance(city).financialBand, 5);
  assert.equal(clubFinance(brighton).financialBand, 3);
  assert.equal(clubFinance(hull).financialBand, 1);
  assert.ok(maxSingleFee(city, "Star") > maxSingleFee(brighton, "Star"));
  assert.ok(maxSingleFee(brighton, "Star") > maxSingleFee(hull, "Star"));
});

test("club finance estimates are stable and role-sensitive", () => {
  const { maxSingleFee } = loadTypeScriptModule("features/career/finances.ts");
  const arsenal = club("Arsenal");
  assert.equal(maxSingleFee(arsenal, "Starter"), maxSingleFee(arsenal, "Starter"));
  assert.ok(maxSingleFee(arsenal, "Star") > maxSingleFee(arsenal, "Rotation"));
});

test("pyramid ceilings still override club stature", () => {
  const { maxSingleFee } = loadTypeScriptModule("features/career/finances.ts");
  assert.ok(maxSingleFee(club("Leicester City"), "Star") <= 4_000_000);
  assert.ok(maxSingleFee(club("Salford City"), "Star") <= 1_500_000);
  assert.ok(maxSingleFee(club("Southend United"), "Star") <= 500_000);
  assert.ok(maxSingleFee(club("Dorking Wanderers"), "Star") < 100_000);
});

test("typical buying power falls down the English pyramid", () => {
  const { CLUBS } = loadTypeScriptModule("features/career/catalog.ts");
  const { clubDivision, maxSingleFee } = loadTypeScriptModule("features/career/finances.ts");
  const ceilings = [0, 175_000_000, 25_000_000, 4_000_000, 1_500_000, 500_000];
  const medians = [];

  for (let division = 1; division <= 5; division += 1) {
    const budgets = CLUBS
      .filter((item) => item.country === "ENG" && clubDivision(item) === division)
      .map((item) => maxSingleFee(item, "Starter"))
      .sort((a, b) => a - b);
    assert.ok(budgets.length > 0, `Expected English division ${division} clubs`);
    assert.ok(budgets.every((budget) => budget <= ceilings[division]));
    medians.push(budgets[Math.floor(budgets.length / 2)]);
  }

  assert.deepEqual([...medians].sort((a, b) => b - a), medians);
  assert.equal(new Set(medians).size, medians.length);
});

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

test("National League clubs do not bid for eight-figure players", () => {
  const invalid = sampledContractedBids({ value: 12_000_000 }).find((offer) =>
    (offer.division ?? 1) >= 5,
  );
  assert.equal(invalid, undefined, invalid
    ? `${invalid.name} submitted this bid: ${invalid.reason}`
    : undefined);
});

test("National League clubs can still bid for affordable players", () => {
  const affordable = sampledContractedBids({ rating: 58, value: 80_000 }).find((offer) =>
    (offer.division ?? 1) >= 5,
  );
  assert.ok(affordable, "Expected an affordable National League transfer to remain possible");
  assert.match(affordable.reason, /agreed €\d+k/);
});

test("forced sales also respect the buying club's budget", () => {
  const invalid = sampledForcedSaleOffers().find((offer) => (offer.division ?? 1) >= 5);
  assert.equal(invalid, undefined, invalid
    ? `Forced sale offered an unaffordable move to ${invalid.name}`
    : undefined);
});

test("local representation keeps a lower-tier English player out of unrelated foreign markets", () => {
  const player = eliteEnglishProspect("ENG", {
    currentClub: "Southend United", age: 24, rating: 58, potential: 66,
    value: 80_000, reputation: 35, agent: "Self-represented",
  });
  const offers = sampledDirectMarket(player);
  assert.ok(offers.length > 0);
  assert.ok(offers.every((offer) => offer.country === "ENG"));
});

test("an international agent can open a credible foreign market for that player", () => {
  const player = eliteEnglishProspect("ENG", {
    currentClub: "Southend United", age: 24, rating: 58, potential: 66,
    value: 80_000, reputation: 55, agent: "International agent",
  });
  const offers = sampledDirectMarket(player, 700);
  assert.ok(offers.some((offer) => offer.country !== "ENG"));
  assert.ok(offers.some((offer) => offer.country === "ISR"));
});

test("nationality and known leagues remain reachable without a global agent", () => {
  const player = eliteEnglishProspect("NED", {
    currentClub: "Southend United", age: 27, rating: 61, potential: 68,
    value: 250_000, reputation: 30, agent: "Local specialist",
  });
  const offers = sampledDirectMarket(player);
  assert.ok(offers.some((offer) => offer.country === "NED"));
  assert.ok(offers.every((offer) => ["ENG", "NED"].includes(offer.country)));
});

test("former clubs return only when the sporting and financial level is realistic", () => {
  const maccabiSeason = {
    fromAge: 18, toAge: 21, club: "Maccabi Haifa", country: "ISR",
    league: "Israeli Premier League", role: "Star", kind: "stay",
    apps: 100, goals: 20, assists: 15, before: 68, after: 76, trophies: 2, event: "Breakthrough",
  };
  const liverpoolPrime = eliteEnglishProspect("ISR", {
    currentClub: "Liverpool", age: 27, rating: 90, potential: 92,
    value: 120_000_000, reputation: 95, agent: "Family representative",
    history: [maccabiSeason],
  });
  assert.equal(sampledDirectMarket(liverpoolPrime).some((offer) => offer.name === "Maccabi Haifa"), false);

  const declinedVeteran = {
    ...liverpoolPrime, age: 33, rating: 74, potential: 90, value: 4_000_000,
    history: [{
      fromAge: 27, toAge: 32, club: "Liverpool", country: "ENG", league: "Premier League",
      role: "Star", kind: "stay", apps: 168, goals: 54, assists: 39,
      before: 90, after: 81, trophies: 6, event: "Reached the highest level",
    }, maccabiSeason],
  };
  const veteranMarket = sampledDirectMarket(declinedVeteran, 1400);
  assert.equal(veteranMarket.some((offer) => offer.name === "Liverpool"), false);
  const returnOffer = veteranMarket.find((offer) => offer.name === "Maccabi Haifa");
  assert.ok(returnOffer);
  assert.equal(returnOffer.label, "Former-club return");
});

test("a forced sale never opens an empty decision screen", () => {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const player = eliteEnglishProspect("ISR", {
    currentClub: "Maccabi Haifa", position: "ST", age: 26,
    rating: 90, potential: 94, value: 120_000_000,
    reputation: 96, agent: "International agent", contractYears: 3,
    clubSeasons: 6, lastRole: "Star",
  });
  const beat = createCareerEngine(() => 0).nextBeat(player, null);
  assert.equal(beat.type, "decision");
  assert.equal(beat.kind, "forced-sale");
  assert.ok(beat.offers.length > 0, "Forced sale must include at least one accepted bid");

  const impossibleMarket = createCareerEngine(() => 0).nextBeat({ ...player, value: 500_000_000 }, null);
  assert.ok(impossibleMarket.type !== "decision" || impossibleMarket.kind !== "forced-sale" || impossibleMarket.offers.length > 0);

  const recovered = createCareerEngine(() => 0).recoverDecision(player, "forced-sale");
  assert.equal(recovered.kind, "forced-sale");
  assert.ok(recovered.offers.length > 0, "A previously stuck forced-sale save must be repaired on load");
});

test("any contracted senior player can request a move and Israeli clubs accept realistic export fees", () => {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const engine = createCareerEngine(seededRandom(1948));
  const player = eliteEnglishProspect("ISR", {
    currentClub: "Maccabi Haifa", position: "ST", age: 25,
    rating: 82, potential: 88, value: 12_000_000,
    reputation: 78, agent: "International agent", contractYears: 3,
    clubSeasons: 3, lastRole: "Star",
  });

  assert.equal(engine.hasOutgrownClub(player), true);
  assert.equal(engine.canRequestTransfer(player), true);
  const result = engine.requestTransfer(player);
  const bids = result.decision.offers.filter((offer) => offer.kind === "permanent");

  assert.equal(result.decision.kind, "transfer-request");
  assert.ok(result.player.morale < player.morale);
  assert.ok(bids.length > 0);
  assert.ok(bids.every((offer) => offer.country !== "ISR"));
  bids.forEach((offer) => {
    const fee = offer.reason.match(/agreed €([\d.]+)m/)?.[1];
    assert.ok(fee, offer.reason);
    assert.ok(Number(fee) >= 4 && Number(fee) <= 5.8, offer.reason);
  });

  const settledAtEliteClub = { ...player, currentClub: "Manchester City", rating: 90, value: 120_000_000, clubSeasons: 2 };
  assert.equal(engine.hasOutgrownClub(settledAtEliteClub), false);
  assert.equal(engine.canRequestTransfer(settledAtEliteClub), true);
  assert.equal(engine.canRequestTransfer({ ...settledAtEliteClub, clubSeasons: 5 }), true);
});

test("players can review eligible agents and change representation without waiting for a scenario", () => {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const engine = createCareerEngine(() => .5);
  const player = eliteEnglishProspect("ISR", {
    currentClub: "Maccabi Haifa", age: 22, rating: 73,
    reputation: 48, agent: "Self-represented", contractYears: 2,
  });

  const options = engine.availableAgents(player);
  assert.ok(options.length >= 4);
  assert.ok(options.some((agent) => agent.name === "Local specialist"));
  assert.ok(options.some((agent) => agent.name === "International agent"));
  assert.equal(engine.changeAgent(player, "International agent").agent, "International agent");
  assert.equal(engine.changeAgent(player, "Elite super-agent").agent, "Self-represented");
});

test("agent shortlists follow the player's current career situation", () => {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const engine = createCareerEngine(() => .5);
  const namesFor = (player) => engine.availableAgents(player).map((agent) => agent.name);

  const academyProspect = eliteEnglishProspect("ENG", {
    currentClub: "Manchester City", squad: "academy", age: 17,
    rating: 58, reputation: 12, contractYears: 2, agent: "Self-represented",
  });
  const prospectAgents = namesFor(academyProspect);
  assert.ok(prospectAgents.includes("Development agency"));
  assert.ok(!prospectAgents.includes("International agent"));
  assert.ok(!prospectAgents.includes("Elite super-agent"));
  assert.ok(!prospectAgents.includes("Veteran broker"));

  const elitePlayer = eliteEnglishProspect("ENG", {
    currentClub: "Manchester City", age: 27, rating: 90,
    reputation: 94, morale: 82, contractYears: 3, agent: "International agent",
  });
  const eliteAgents = namesFor(elitePlayer);
  assert.ok(eliteAgents.includes("International agent"));
  assert.ok(eliteAgents.includes("Elite super-agent"));
  assert.ok(!eliteAgents.includes("Development agency"));
  assert.ok(!eliteAgents.includes("Optimistic agent"));

  const decliningVeteran = eliteEnglishProspect("ENG", {
    currentClub: "Manchester City", age: 33, rating: 77,
    reputation: 69, morale: 72, contractYears: 1,
  });
  assert.ok(namesFor(decliningVeteran).includes("Veteran broker"));

  const unsettledPlayer = eliteEnglishProspect("ENG", {
    currentClub: "Bristol City", age: 27, rating: 65,
    reputation: 25, morale: 38, contractYears: 1,
  });
  assert.ok(namesFor(unsettledPlayer).includes("Optimistic agent"));
  assert.ok(engine.availableAgents(unsettledPlayer).every((agent) => agent.availabilityReason.length > 20));
});

test("season development can rise for a young player and fall with age or injury", () => {
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const southend = club("Southend United");
  const bristol = club("Bristol City");
  const young = eliteEnglishProspect("ENG", {
    currentClub: southend.name, age: 20, rating: 62, potential: 82,
    value: 900_000, reputation: 25, fitness: 94, developmentTrend: 0,
  });
  const veteran = eliteEnglishProspect("ENG", {
    currentClub: southend.name, age: 34, rating: 78, potential: 88,
    value: 1_500_000, reputation: 70, fitness: 90, developmentTrend: 0,
  });
  const injuredPrime = eliteEnglishProspect("ENG", {
    currentClub: bristol.name, age: 27, rating: 75, potential: 84,
    value: 4_000_000, reputation: 55, fitness: 50, developmentTrend: 0,
  });
  const offer = (target, role) => ({ ...target, role, label: "Stay", reason: "Test season", kind: "stay" });

  const youngSeason = createCareerEngine(() => .5).simulateSeason(young, offer(southend, "Starter"), 1);
  const veteranSeason = createCareerEngine(() => .5).simulateSeason(veteran, offer(southend, "Rotation"), 1);
  const injurySeason = createCareerEngine(() => 0).simulateSeason(injuredPrime, offer(bristol, "Starter"), 1);
  assert.ok(youngSeason.player.rating > young.rating, `${young.rating} -> ${youngSeason.player.rating}`);
  assert.ok(veteranSeason.player.rating < veteran.rating, `${veteran.rating} -> ${veteranSeason.player.rating}`);
  assert.ok(injurySeason.player.rating < injuredPrime.rating, `${injuredPrime.rating} -> ${injurySeason.player.rating}`);
});

test("scenario answers can damage rating, potential and future development", () => {
  const { SCENARIOS } = loadTypeScriptModule("features/career/catalog.ts");
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const scenario = SCENARIOS.find((item) => item.id === "surgery-choice");
  const riskyOption = scenario.options.find((option) => option.label === "Play through the season");
  const player = eliteEnglishProspect("ENG", {
    rating: 80, potential: 88, fitness: 55, developmentTrend: 0,
  });
  const result = createCareerEngine(() => .9).resolveScenario(player, scenario, riskyOption);
  assert.equal(result.player.rating, 77);
  assert.equal(result.player.potential, 85);
  assert.equal(result.player.developmentTrend, -2);
});

test("representation choices change the player's active market profile", () => {
  const { SCENARIOS } = loadTypeScriptModule("features/career/catalog.ts");
  const { createCareerEngine } = loadTypeScriptModule("features/career/engine.ts");
  const { AGENT_PROFILES } = loadTypeScriptModule("features/career/agents.ts");
  const scenario = SCENARIOS.find((item) => item.id === "agent-pitch");
  const localOption = scenario.options.find((option) => option.label === "Choose a local specialist");
  const result = createCareerEngine(() => .5).resolveScenario(eliteEnglishProspect(), scenario, localOption);
  assert.equal(result.player.agent, "Local specialist");
  assert.ok(Object.keys(AGENT_PROFILES).length >= 8);
  SCENARIOS.flatMap((item) => item.options).flatMap((option) => option.outcomes)
    .map((outcome) => outcome.effect.agent).filter(Boolean)
    .forEach((agent) => assert.ok(AGENT_PROFILES[agent], agent));
});
