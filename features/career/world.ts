import { CLUBS } from "./catalog";
import { competitionFormat, PYRAMID_BOUNDARIES, type PyramidBoundary } from "./competitionFormats";
import { competitionStrength } from "./competitionStrength";
import { clubFinance } from "./finances";
import { CATALOG_SEASON, COMPLETE_LEAGUES } from "./leagueCatalog";
import { simulateUefaCompetitions } from "./uefaCompetitions";
import type { Club, ClubSeasonState, CompetitionTitle, ContinentalCompetition, PlayoffBracket, PlayoffTie, StandingGroup, WorldMovement, WorldState } from "./domain";

export type WorldPlayerImpact = { club: string; boost: number };
export type WorldCompetitionOutcome = {
  key: string;
  country: string;
  league: string;
  division: number;
  table: string[];
  titles: CompetitionTitle[];
  standings: StandingGroup[];
  playoffBrackets: PlayoffBracket[];
};
export type WorldSeasonSimulation = {
  world: WorldState;
  competitions: WorldCompetitionOutcome[];
  cupWinners: Record<string, string>;
  continentalCompetitions: ContinentalCompetition[];
  movements: WorldMovement[];
  playoffBrackets: PlayoffBracket[];
};

const MLS_EAST = new Set([
  "Atlanta United", "Charlotte FC", "Chicago Fire", "FC Cincinnati", "Columbus Crew",
  "D.C. United", "Inter Miami", "CF Montréal", "Nashville SC", "New England Revolution",
  "New York City FC", "New York Red Bulls", "Orlando City", "Philadelphia Union", "Toronto FC",
]);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function worldClubKey(country: string, club: string) {
  return `${country}:${club}`;
}

function effectiveStrength(club: ClubSeasonState, impact: WorldPlayerImpact) {
  const playerBoost = club.club === impact.club ? impact.boost : 0;
  return club.squadQuality * .68 + club.finances * .15 + club.reputation * .17 + club.momentum + playerBoost;
}

function gumbel(random: () => number) {
  const draw = clamp(random(), Number.MIN_VALUE, 1 - Number.EPSILON);
  return -Math.log(-Math.log(draw));
}

function rankClubs(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number) {
  return clubs
    .map((club) => ({ club, score: effectiveStrength(club, impact) + gumbel(random) * 6.1 }))
    .sort((left, right) => right.score - left.score)
    .map(({ club }) => club);
}

function matchWinner(left: ClubSeasonState, right: ClubSeasonState, impact: WorldPlayerImpact, random: () => number, series = false) {
  const scale = series ? 6.2 : 9.2;
  const difference = (effectiveStrength(left, impact) - effectiveStrength(right, impact)) / scale;
  const probability = 1 / (1 + Math.exp(-difference));
  return random() < probability ? left : right;
}

function seededKnockout(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number, series = false) {
  let round = [...clubs];
  while (round.length > 1) {
    const next: ClubSeasonState[] = [];
    for (let index = 0; index < Math.floor(round.length / 2); index += 1) {
      next.push(matchWinner(round[index], round[round.length - 1 - index], impact, random, series));
    }
    if (round.length % 2 === 1) next.push(round[Math.floor(round.length / 2)]);
    round = next;
  }
  return round[0];
}

function recordedMatch(
  round: string,
  left: ClubSeasonState,
  right: ClubSeasonState,
  impact: WorldPlayerImpact,
  random: () => number,
  ties: PlayoffTie[],
  series = false,
) {
  const winner = matchWinner(left, right, impact, random, series);
  ties.push({ round, home: left.club, away: right.club, winner: winner.club });
  return winner;
}

function knockoutRoundName(size: number) {
  if (size >= 16) return "Round of 16";
  if (size >= 8) return "Quarter-final";
  if (size >= 6) return "Playoff round";
  if (size >= 4) return "Semi-final";
  if (size === 3) return "Semi-final";
  return "Final";
}

function recordedKnockout(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number, series = false) {
  const ties: PlayoffTie[] = [];
  let round = [...clubs];
  while (round.length > 1) {
    const next: ClubSeasonState[] = [];
    const roundName = knockoutRoundName(round.length);
    for (let index = 0; index < Math.floor(round.length / 2); index += 1) {
      next.push(recordedMatch(roundName, round[index], round[round.length - 1 - index], impact, random, ties, series));
    }
    if (round.length % 2 === 1) next.push(round[Math.floor(round.length / 2)]);
    round = next;
  }
  return { winner: round[0], ties };
}

function mlsCompetition(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number) {
  const ties: PlayoffTie[] = [];
  const eastTable = rankClubs(clubs.filter((club) => MLS_EAST.has(club.club)), impact, random);
  const westTable = rankClubs(clubs.filter((club) => !MLS_EAST.has(club.club)), impact, random);
  const conferenceWinner = (ranked: ClubSeasonState[], conference: string) => {
    const wildCard = recordedMatch(`${conference} Wild Card`, ranked[7], ranked[8], impact, random, ties);
    const firstRound = [
      recordedMatch(`${conference} First Round`, ranked[0], wildCard, impact, random, ties, true),
      recordedMatch(`${conference} First Round`, ranked[1], ranked[6], impact, random, ties, true),
      recordedMatch(`${conference} First Round`, ranked[2], ranked[5], impact, random, ties, true),
      recordedMatch(`${conference} First Round`, ranked[3], ranked[4], impact, random, ties, true),
    ];
    const semiOne = recordedMatch(`${conference} Semi-final`, firstRound[0], firstRound[3], impact, random, ties);
    const semiTwo = recordedMatch(`${conference} Semi-final`, firstRound[1], firstRound[2], impact, random, ties);
    return recordedMatch(`${conference} Final`, semiOne, semiTwo, impact, random, ties);
  };
  const east = conferenceWinner(eastTable, "Eastern Conference");
  const west = conferenceWinner(westTable, "Western Conference");
  const champion = recordedMatch("MLS Cup", east, west, impact, random, ties);
  const table = eastTable.flatMap((club, index) => [club, westTable[index]]).filter(Boolean);
  return {
    table,
    standings: [
      { name: "Eastern Conference", clubs: eastTable.map((club) => club.club) },
      { name: "Western Conference", clubs: westTable.map((club) => club.club) },
    ],
    titles: [{ name: "MLS Cup", winner: champion.club }],
    playoffBrackets: [{ name: "MLS Cup Playoffs", country: clubs[0].country, competition: clubs[0].league, ties }],
  };
}

function ligaMxStage(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number, stage: string) {
  const ties: PlayoffTie[] = [];
  const ranked = rankClubs(clubs, impact, random);
  const seventhSeed = recordedMatch("Play-In", ranked[6], ranked[7], impact, random, ties);
  const firstPlayInLoser = seventhSeed === ranked[6] ? ranked[7] : ranked[6];
  const ninthTenthWinner = recordedMatch("Play-In", ranked[8], ranked[9], impact, random, ties);
  const eighthSeed = recordedMatch("Play-In", firstPlayInLoser, ninthTenthWinner, impact, random, ties);
  const knockout = recordedKnockout([...ranked.slice(0, 6), seventhSeed, eighthSeed], impact, random, true);
  return { ranked, winner: knockout.winner, ties: [...ties, ...knockout.ties], stage };
}

function argentinaStage(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number, stage: string, offset: number) {
  const ties: PlayoffTie[] = [];
  const zones = [clubs.filter((_, index) => (index + offset) % 2 === 0), clubs.filter((_, index) => (index + offset) % 2 === 1)];
  const zoneA = rankClubs(zones[0], impact, random);
  const zoneB = rankClubs(zones[1], impact, random);
  const roundOf16: ClubSeasonState[] = [];
  for (let index = 0; index < 8; index += 1) {
    roundOf16.push(recordedMatch("Round of 16", zoneA[index], zoneB[7 - index], impact, random, ties));
  }
  const knockout = recordedKnockout(roundOf16, impact, random);
  return { zoneA, zoneB, winner: knockout.winner, ties: [...ties, ...knockout.ties], stage };
}

function competitionOutcome(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number) {
  const format = competitionFormat(clubs[0].country, clubs[0].league);
  if (format?.titleStructure === "playoff" && clubs[0].country === "USA") return mlsCompetition(clubs, impact, random);
  if (format?.titleStructure === "short-season-playoff" && clubs[0].country === "MEX") {
    const apertura = ligaMxStage(clubs, impact, random, "Apertura");
    const clausura = ligaMxStage(clubs, impact, random, "Clausura");
    return {
      table: clausura.ranked,
      standings: [
        { name: "Apertura table", clubs: apertura.ranked.map((club) => club.club) },
        { name: "Clausura table", clubs: clausura.ranked.map((club) => club.club) },
      ],
      titles: [{ name: "Apertura", winner: apertura.winner.club }, { name: "Clausura", winner: clausura.winner.club }],
      playoffBrackets: [apertura, clausura].map((stage) => ({ name: `${stage.stage} Liguilla`, country: clubs[0].country, competition: clubs[0].league, ties: stage.ties })),
    };
  }
  if (format?.titleStructure === "short-season-playoff" && clubs[0].country === "ARG") {
    const apertura = argentinaStage(clubs, impact, random, "Apertura", 0);
    const clausura = argentinaStage(clubs, impact, random, "Clausura", 1);
    return {
      table: apertura.zoneA.flatMap((club, index) => [club, apertura.zoneB[index]]).filter(Boolean),
      standings: [
        { name: "Apertura Zone A", clubs: apertura.zoneA.map((club) => club.club) },
        { name: "Apertura Zone B", clubs: apertura.zoneB.map((club) => club.club) },
        { name: "Clausura Zone A", clubs: clausura.zoneA.map((club) => club.club) },
        { name: "Clausura Zone B", clubs: clausura.zoneB.map((club) => club.club) },
      ],
      titles: [{ name: "Apertura", winner: apertura.winner.club }, { name: "Clausura", winner: clausura.winner.club }],
      playoffBrackets: [apertura, clausura].map((stage) => ({ name: `${stage.stage} Playoffs`, country: clubs[0].country, competition: clubs[0].league, ties: stage.ties })),
    };
  }
  const table = rankClubs(clubs, impact, random);
  return {
    table,
    standings: [{ name: format?.titleStructure === "split-table" ? "Final table after the split" : "Final table", clubs: table.map((club) => club.club) }],
    titles: [{ name: format?.titleNames[0] ?? "Champion", winner: table[0].club }],
    playoffBrackets: [] as PlayoffBracket[],
  };
}

function knockoutCupWinner(clubs: ClubSeasonState[], impact: WorldPlayerImpact, random: () => number) {
  const ordered = rankClubs(clubs, impact, random);
  return seededKnockout(ordered, impact, random)?.club ?? clubs[0]?.club ?? "Unknown club";
}

function cloneWorld(world: WorldState): WorldState {
  return {
    ...world,
    clubs: Object.fromEntries(Object.entries(world.clubs).map(([key, club]) => [key, {
      ...club,
      rollingPerformance: [...club.rollingPerformance],
    }])),
    history: [...world.history],
  };
}

export function createWorldState(): WorldState {
  const clubs = Object.fromEntries(CLUBS.map((club) => {
    const strength = competitionStrength(club);
    const finance = clubFinance(club).financialBand;
    return [worldClubKey(club.country, club.name), {
      club: club.name,
      country: club.country,
      league: club.league,
      division: club.division ?? 1,
      squadQuality: strength,
      finances: clamp(strength - 5 + finance * 2, 18, 98),
      reputation: clamp(strength + (club.level - 3) * 2, 18, 98),
      momentum: 0,
      previousFinish: null,
      rollingPerformance: [],
    } satisfies ClubSeasonState];
  }));
  return { version: 1, catalogSeason: CATALOG_SEASON, elapsedYears: 0, clubs, history: [] };
}

export function migrateWorldState(value: unknown): WorldState {
  if (!value || typeof value !== "object") return createWorldState();
  const candidate = value as Partial<WorldState>;
  if (candidate.version !== 1 || candidate.catalogSeason !== CATALOG_SEASON ||
      !candidate.clubs || Object.keys(candidate.clubs).length !== CLUBS.length || !Array.isArray(candidate.history)) {
    return createWorldState();
  }
  const complete = Object.values(candidate.clubs).every((club) => club && typeof club.club === "string" &&
    typeof club.league === "string" && typeof club.division === "number" && Array.isArray(club.rollingPerformance));
  return complete ? candidate as WorldState : createWorldState();
}

export function clubSeasonState(world: WorldState | null | undefined, club: string, countryCode?: string) {
  if (!world) return undefined;
  if (countryCode) return world.clubs[worldClubKey(countryCode, club)];
  return Object.values(world.clubs).find((state) => state.club === club);
}

export function clubInWorld(club: Club, world: WorldState | null | undefined): Club {
  const state = clubSeasonState(world, club.name, club.country);
  if (!state) return club;
  const originalDivision = club.division ?? 1;
  return {
    ...club,
    league: state.league,
    division: state.division,
    level: clamp(club.level + originalDivision - state.division, 1, 5),
  };
}

function competitionByDivision(country: string, division: number) {
  return COMPLETE_LEAGUES.find((competition) => competition.country === country && competition.division === division);
}

function playoffCandidate(table: string[], boundary: PyramidBoundary, clubs: Record<string, ClubSeasonState>, impact: WorldPlayerImpact, random: () => number) {
  if (!boundary.playoffPromotion) return null;
  const candidates = table
    .slice(boundary.playoffPromotion.from - 1, boundary.playoffPromotion.to)
    .map((name) => clubs[worldClubKey(boundary.country, name)])
    .filter(Boolean);
  return recordedKnockout(candidates, impact, random, true);
}

function applyMovement(
  world: WorldState,
  promoted: ClubSeasonState,
  relegated: ClubSeasonState,
  upperLeague: string,
  lowerLeague: string,
  route: WorldMovement["route"],
) {
  promoted.league = upperLeague;
  promoted.division -= 1;
  promoted.finances = clamp(promoted.finances + 5, 18, 99);
  promoted.reputation = clamp(promoted.reputation + 3, 18, 99);
  promoted.momentum = clamp(promoted.momentum + 2, -6, 6);
  relegated.league = lowerLeague;
  relegated.division += 1;
  relegated.finances = clamp(relegated.finances - 7, 18, 99);
  relegated.reputation = clamp(relegated.reputation - 4, 18, 99);
  relegated.squadQuality = clamp(relegated.squadQuality - 3, 18, 99);
  relegated.momentum = clamp(relegated.momentum - 2, -6, 6);
  return [
    { club: promoted.club, country: promoted.country, fromLeague: lowerLeague, toLeague: upperLeague, direction: "promoted", route },
    { club: relegated.club, country: relegated.country, fromLeague: upperLeague, toLeague: lowerLeague, direction: "relegated", route },
  ] satisfies WorldMovement[];
}

function resolveMovements(world: WorldState, outcomes: WorldCompetitionOutcome[], impact: WorldPlayerImpact, random: () => number) {
  const movements: WorldMovement[] = [];
  const playoffBrackets: PlayoffBracket[] = [];
  for (const boundary of PYRAMID_BOUNDARIES) {
    const upper = outcomes.find((outcome) => outcome.country === boundary.country && outcome.division === boundary.upperDivision);
    const lower = outcomes.find((outcome) => outcome.country === boundary.country && outcome.division === boundary.lowerDivision);
    const upperCompetition = competitionByDivision(boundary.country, boundary.upperDivision);
    const lowerCompetition = competitionByDivision(boundary.country, boundary.lowerDivision);
    if (!upper || !lower || !upperCompetition || !lowerCompetition) continue;

    const eligibleLower = lower.table.filter((name) => !(boundary.ineligiblePrefixes ?? []).some((prefix) => name.startsWith(prefix)));
    const promotionPairs: { promoted: ClubSeasonState; route: WorldMovement["route"] }[] = eligibleLower
      .slice(0, boundary.automaticPromotions)
      .map((name) => ({ promoted: world.clubs[worldClubKey(boundary.country, name)], route: "automatic" }));
    const playoff = playoffCandidate(eligibleLower, boundary, world.clubs, impact, random);
    if (playoff) {
      promotionPairs.push({ promoted: playoff.winner, route: "playoff" });
      playoffBrackets.push({ name: `${lowerCompetition.league} Promotion Playoff`, country: boundary.country, competition: lowerCompetition.league, ties: playoff.ties });
    }

    const automaticRelegated = upper.table.slice(-promotionPairs.length)
      .map((name) => world.clubs[worldClubKey(boundary.country, name)]);
    promotionPairs.forEach(({ promoted, route }, index) => {
      movements.push(...applyMovement(world, promoted, automaticRelegated[index], upperCompetition.league, lowerCompetition.league, route));
    });

    if (boundary.boundaryPlayoff) {
      const lowerCandidateName = eligibleLower[boundary.automaticPromotions];
      const upperCandidateName = upper.table[upper.table.length - boundary.automaticPromotions - 1];
      const lowerCandidate = world.clubs[worldClubKey(boundary.country, lowerCandidateName)];
      const upperCandidate = world.clubs[worldClubKey(boundary.country, upperCandidateName)];
      if (lowerCandidate && upperCandidate) {
        const ties: PlayoffTie[] = [];
        const winner = recordedMatch("Two-legged tie", upperCandidate, lowerCandidate, impact, random, ties, true);
        playoffBrackets.push({ name: `${upperCompetition.league} / ${lowerCompetition.league} Playoff`, country: boundary.country, competition: upperCompetition.league, ties });
        if (winner === lowerCandidate) {
          movements.push(...applyMovement(world, lowerCandidate, upperCandidate, upperCompetition.league, lowerCompetition.league, "playoff"));
        }
      }
    }
  }
  return { movements, playoffBrackets };
}

function evolveClubs(world: WorldState, outcomes: WorldCompetitionOutcome[], random: () => number) {
  outcomes.forEach((outcome) => {
    const expected = [...outcome.table].sort((left, right) => {
      const leftState = world.clubs[worldClubKey(outcome.country, left)];
      const rightState = world.clubs[worldClubKey(outcome.country, right)];
      return effectiveStrength(rightState, { club: "", boost: 0 }) - effectiveStrength(leftState, { club: "", boost: 0 });
    });
    outcome.table.forEach((name, index) => {
      const club = world.clubs[worldClubKey(outcome.country, name)];
      const expectedIndex = expected.indexOf(name);
      const overPerformance = (expectedIndex - index) / Math.max(1, outcome.table.length - 1);
      const finishScore = 1 - index / Math.max(1, outcome.table.length - 1);
      const champion = outcome.titles.some((title) => title.winner === name);
      club.momentum = clamp(club.momentum * .35 + overPerformance * 5 + (random() - .5) * 1.5, -6, 6);
      club.squadQuality = clamp(club.squadQuality + club.momentum * .16 + (random() - .5) * 1.8 + (champion ? .7 : 0), 18, 99);
      club.finances = clamp(club.finances + (finishScore - .48) * 2.2 + (champion ? 1.2 : 0), 18, 99);
      club.reputation = clamp(club.reputation * .985 + club.squadQuality * .015 + overPerformance * 1.5 + (champion ? .9 : 0), 18, 99);
      club.previousFinish = index + 1;
      club.rollingPerformance = [...club.rollingPerformance, Number(finishScore.toFixed(3))].slice(-5);
    });
  });
}

function assertMembership(world: WorldState) {
  COMPLETE_LEAGUES.forEach((competition) => {
    const count = Object.values(world.clubs).filter((club) => club.country === competition.country && club.league === competition.league && club.division === competition.division).length;
    if (count !== competition.expectedClubs) {
      throw new Error(`${competition.league} has ${count} clubs after rollover; expected ${competition.expectedClubs}.`);
    }
  });
}

export function simulateWorldSeason(
  existingWorld: WorldState | null | undefined,
  impact: WorldPlayerImpact = { club: "", boost: 0 },
  random: () => number = Math.random,
): WorldSeasonSimulation {
  const world = cloneWorld(existingWorld ?? createWorldState());
  const groups = new Map<string, ClubSeasonState[]>();
  Object.values(world.clubs).forEach((club) => {
    const key = `${club.country}:${club.league}`;
    groups.set(key, [...(groups.get(key) ?? []), club]);
  });
  const competitions = [...groups.entries()].map(([key, clubs]) => {
    const competition = competitionOutcome(clubs, impact, random);
    return {
      key,
      country: clubs[0].country,
      league: clubs[0].league,
      division: clubs[0].division,
      table: competition.table.map((club) => club.club),
      titles: competition.titles,
      standings: competition.standings,
      playoffBrackets: competition.playoffBrackets,
    } satisfies WorldCompetitionOutcome;
  });
  const cupWinners = Object.fromEntries([...new Set(Object.values(world.clubs).map((club) => club.country))]
    .map((country) => [country, knockoutCupWinner(Object.values(world.clubs).filter((club) => club.country === country), impact, random)]));
  const continentalCompetitions = simulateUefaCompetitions(world.clubs, competitions, cupWinners, impact, random);

  evolveClubs(world, competitions, random);
  const movementSimulation = resolveMovements(world, competitions, impact, random);
  const movements = movementSimulation.movements;
  const playoffBrackets = [...competitions.flatMap((competition) => competition.playoffBrackets), ...movementSimulation.playoffBrackets];
  world.elapsedYears += 1;
  world.history = [...world.history, {
    index: world.elapsedYears,
    champions: Object.fromEntries([
      ...competitions.map((competition) => [competition.key, competition.titles] as const),
      ...continentalCompetitions.map((competition) => [`EUROPE:${competition.key}`, [{ name: "Champion", winner: competition.champion.club }]] as const),
    ]),
    movements,
  }].slice(-30);
  assertMembership(world);
  return { world, competitions, cupWinners, continentalCompetitions, movements, playoffBrackets };
}
