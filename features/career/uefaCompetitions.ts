import type {
  ClubSeasonState,
  ContinentalClub,
  ContinentalCompetition,
  ContinentalStanding,
  CupHonours,
  PlayoffTie,
} from "./domain";

export const UEFA_COMPETITION_DEFINITIONS = [
  { key: "champions-league", name: "Champions League", shortName: "Champions League", leagueMatches: 8 },
  { key: "europa-league", name: "Europa League", shortName: "Europa League", leagueMatches: 8 },
  { key: "conference-league", name: "Conference League", shortName: "Conference League", leagueMatches: 6 },
] as const;

/** 2026/27 access-list order, restricted to the associations in the game. */
export const UEFA_ASSOCIATIONS = [
  "ENG", "ITA", "ESP", "GER", "FRA", "NED", "POR", "BEL", "CZE", "TUR",
  "NOR", "AUT", "SCO", "GRE", "DEN", "SUI", "POL", "ISR", "CYP", "SWE",
  "CRO", "SRB", "UKR", "HUN", "ROU",
] as const;

type CompetitionKey = ContinentalCompetition["key"];
type PlayerImpact = { club: string; boost: number };
type DomesticOutcome = { country: string; division: number; table: string[] };
type Definition = typeof UEFA_COMPETITION_DEFINITIONS[number];
type QualifiedClub = { state: ClubSeasonState; qualifiedVia: string };

export type EuropeanAccessContext = {
  additionalCups?: CupHonours[];
  previousChampions?: Partial<Record<CompetitionKey, ContinentalClub>>;
  previousPerformance?: Record<string, number>;
};

const UEFA_SET = new Set<string>(UEFA_ASSOCIATIONS);

/* Domestic ratings describe gaps within a league. These adjustments put them
 * onto one continental scale without weakening smaller-league clubs at home. */
const ASSOCIATION_CONTINENTAL_ADJUSTMENT: Record<string, number> = {
  ENG: 0, ITA: 0, ESP: 0, GER: 0, FRA: -2,
  NED: -6, POR: -6, BEL: -9, CZE: -12, TUR: -10,
  NOR: -13, AUT: -12, SCO: -14, GRE: -13, DEN: -13,
  SUI: -14, POL: -16, ISR: -18, CYP: -20, SWE: -16,
  CRO: -17, SRB: -18, UKR: -14, HUN: -18, ROU: -18,
};

const CHAMPIONS_LEAGUE_DOMESTIC_SLOTS: ReadonlyArray<readonly [string, number]> = [
  ["ENG", 4], ["ITA", 4], ["ESP", 4], ["GER", 4], ["FRA", 3],
  ["NED", 2], ["POR", 1], ["BEL", 1], ["CZE", 1], ["TUR", 1],
];

const NATIONAL_CUP_NAMES: Record<string, string> = {
  ENG: "FA Cup", ITA: "Coppa Italia", ESP: "Copa del Rey", GER: "DFB-Pokal", FRA: "Coupe de France",
  NED: "KNVB Cup", POR: "Taça de Portugal", BEL: "Belgian Cup", CZE: "Czech Cup", TUR: "Turkish Cup",
  NOR: "Norwegian Cup", AUT: "ÖFB Cup", SCO: "Scottish Cup", GRE: "Greek Cup", DEN: "Danish Cup",
  SUI: "Swiss Cup", POL: "Polish Cup", ISR: "State Cup", CYP: "Cypriot Cup", SWE: "Svenska Cupen",
  CRO: "Croatian Cup", SRB: "Serbian Cup", UKR: "Ukrainian Cup", HUN: "Magyar Kupa", ROU: "Cupa României",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clubKey(club: Pick<ClubSeasonState, "country" | "club">) {
  return `${club.country}:${club.club}`;
}

export function continentalClubStrength(club: ClubSeasonState, impact: PlayerImpact = { club: "", boost: 0 }) {
  const playerBoost = club.club === impact.club ? impact.boost : 0;
  const domesticStrength = club.squadQuality * .68 + club.finances * .15 + club.reputation * .17 + club.momentum;
  return clamp(domesticStrength + (ASSOCIATION_CONTINENTAL_ADJUSTMENT[club.country] ?? -22) + playerBoost, 18, 99);
}

function gumbel(random: () => number) {
  const draw = clamp(random(), Number.MIN_VALUE, 1 - Number.EPSILON);
  return -Math.log(-Math.log(draw));
}

function shuffled<T>(items: readonly T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function rankedCandidates(entries: QualifiedClub[], impact: PlayerImpact, random: () => number, temperature = 5.8) {
  return entries
    .map((entry) => ({ entry, score: continentalClubStrength(entry.state, impact) + gumbel(random) * temperature }))
    .sort((left, right) => right.score - left.score)
    .map(({ entry }) => entry);
}

function uniqueEntries(entries: QualifiedClub[], unavailable: Set<string>) {
  const unique = new Map<string, QualifiedClub>();
  entries.forEach((entry) => {
    const key = clubKey(entry.state);
    if (!unavailable.has(key) && !unique.has(key)) unique.set(key, entry);
  });
  return [...unique.values()];
}

function resolveClub(clubs: Record<string, ClubSeasonState>, country: string, club: string | undefined) {
  return club ? clubs[`${country}:${club}`] : undefined;
}

function ordinal(position: number) {
  const number = position + 1;
  if (number === 1) return "1st";
  if (number === 2) return "2nd";
  if (number === 3) return "3rd";
  return `${number}th`;
}

function qualifyClubs(
  clubs: Record<string, ClubSeasonState>,
  domestic: readonly DomesticOutcome[],
  cupWinners: Record<string, string>,
  access: EuropeanAccessContext,
  impact: PlayerImpact,
  random: () => number,
) {
  const topFlights = new Map(domestic
    .filter((competition) => competition.division === 1 && UEFA_SET.has(competition.country))
    .map((competition) => [competition.country, competition.table]));
  const topFlightClubs = UEFA_ASSOCIATIONS.flatMap((country) =>
    (topFlights.get(country) ?? []).map((name) => resolveClub(clubs, country, name)).filter((club): club is ClubSeasonState => !!club));
  const taken = new Set<string>();
  const entrants = new Map<CompetitionKey, QualifiedClub[]>();

  const entry = (state: ClubSeasonState | undefined, qualifiedVia: string): QualifiedClub | undefined =>
    state ? { state, qualifiedVia } : undefined;
  const tableClub = (country: string, position: number) =>
    resolveClub(clubs, country, topFlights.get(country)?.[position]);
  const remainingLeagueClubs = (country: string) => (topFlights.get(country) ?? [])
    .map((name) => resolveClub(clubs, country, name))
    .filter((club): club is ClubSeasonState => !!club && !taken.has(clubKey(club)));
  const firstAvailable = (country: string) => remainingLeagueClubs(country)[0];
  const add = (target: QualifiedClub[], candidate: QualifiedClub | undefined, total = 36) => {
    if (!candidate || target.length >= total || taken.has(clubKey(candidate.state))) return false;
    target.push(candidate);
    taken.add(clubKey(candidate.state));
    return true;
  };
  const addRanked = (target: QualifiedClub[], candidates: QualifiedClub[], total: number, temperature = 5.8) => {
    const eligible = uniqueEntries(candidates, taken);
    for (const candidate of rankedCandidates(eligible, impact, random, temperature)) {
      if (target.length >= total) break;
      add(target, candidate, total);
    }
  };
  const contest = (candidates: QualifiedClub[], winnerCount: number) => {
    const ranked = rankedCandidates(uniqueEntries(candidates, taken), impact, random);
    return { winners: ranked.slice(0, winnerCount), losers: ranked.slice(winnerCount) };
  };
  const fill = (target: QualifiedClub[], competition: string) => addRanked(
    target,
    topFlightClubs.map((state) => ({ state, qualifiedVia: `${competition} qualifying` })),
    36,
  );
  const addCupOrPassDown = (target: QualifiedClub[], country: string, name: string, winner: string | undefined, total: number) => {
    const cupWinner = resolveClub(clubs, country, winner);
    if (cupWinner && !taken.has(clubKey(cupWinner))) return add(target, entry(cupWinner, `${name} winner`), total);
    return add(target, entry(firstAvailable(country), `League position · ${name} place passed down`), total);
  };
  const previousChampion = (key: CompetitionKey) => {
    const holder = access.previousChampions?.[key];
    return holder ? resolveClub(clubs, holder.country, holder.club) : undefined;
  };

  // Champions League: 25 domestic places, two titleholders, two performance
  // spots and seven winners from the champions and league qualifying paths.
  const championsLeague: QualifiedClub[] = [];
  add(championsLeague, entry(previousChampion("champions-league"), "Champions League holder"));
  add(championsLeague, entry(previousChampion("europa-league"), "Europa League holder"));
  CHAMPIONS_LEAGUE_DOMESTIC_SLOTS.forEach(([country, places]) => {
    for (let position = 0; position < places; position += 1) {
      add(championsLeague, entry(tableClub(country, position), `League position · ${ordinal(position)}`));
    }
  });
  const performanceAssociations = Object.entries(access.previousPerformance ?? {})
    .filter(([country]) => UEFA_SET.has(country))
    .sort((left, right) => right[1] - left[1])
    .map(([country]) => country);
  const performanceSpots = [...new Set([...performanceAssociations, ...UEFA_ASSOCIATIONS])].slice(0, 2);
  performanceSpots.forEach((country) => add(championsLeague, entry(firstAvailable(country), "European performance spot")));

  const championsPath = UEFA_ASSOCIATIONS
    .map((country) => entry(tableClub(country, 0), "Champions path qualifying"))
    .filter((candidate): candidate is QualifiedClub => !!candidate);
  const leaguePathCountries = ["FRA", "NED", "POR", "BEL", "CZE", "TUR", "NOR", "AUT", "SCO", "GRE"];
  const leaguePath = leaguePathCountries.flatMap((country) => remainingLeagueClubs(country).slice(0, 2)
    .map((state) => ({ state, qualifiedVia: "League path qualifying" } satisfies QualifiedClub)));
  const rebalancingCandidates = uniqueEntries([...championsPath, ...leaguePath], taken)
    .sort((left, right) => continentalClubStrength(right.state, impact) - continentalClubStrength(left.state, impact));
  for (const candidate of rebalancingCandidates) {
    if (championsLeague.length >= 29) break;
    add(championsLeague, { ...candidate, qualifiedVia: "Access-list rebalancing" });
  }

  const championsPathResult = contest(championsPath, 5);
  championsPathResult.winners.forEach((candidate) => add(championsLeague, candidate));
  const leaguePathResult = contest(leaguePath, 2);
  leaguePathResult.winners.forEach((candidate) => add(championsLeague, candidate));
  fill(championsLeague, "Champions League");
  entrants.set("champions-league", championsLeague);
  const championsLeagueQualifyingLosers = uniqueEntries([
    ...championsPathResult.losers,
    ...leaguePathResult.losers,
    ...championsPath.filter((candidate) => !taken.has(clubKey(candidate.state))),
    ...leaguePath.filter((candidate) => !taken.has(clubKey(candidate.state))),
  ], taken);

  // Europa League: 13 direct entries, 11 late Champions League transfers and
  // 12 Europa qualifying winners.
  const europaLeague: QualifiedClub[] = [];
  add(europaLeague, entry(previousChampion("conference-league"), "Conference League holder"), 13);
  ["ENG", "ITA", "ESP", "GER", "FRA"].forEach((country) => {
    addCupOrPassDown(europaLeague, country, NATIONAL_CUP_NAMES[country] ?? "National cup", cupWinners[country], 13);
    add(europaLeague, entry(firstAvailable(country), "League position"), 13);
  });
  ["NED", "POR", "BEL"].forEach((country) => {
    addCupOrPassDown(europaLeague, country, NATIONAL_CUP_NAMES[country] ?? "National cup", cupWinners[country], 13);
  });
  for (const country of UEFA_ASSOCIATIONS) {
    if (europaLeague.length >= 13) break;
    add(europaLeague, entry(firstAvailable(country), "League position · access-list rebalancing"), 13);
  }

  const transferredToEuropa = rankedCandidates(championsLeagueQualifyingLosers, impact, random).slice(0, 11);
  transferredToEuropa.forEach((candidate) => add(europaLeague, {
    ...candidate,
    qualifiedVia: "Transferred from Champions League qualifying",
  }));
  const remainingChampionsLeagueLosers = championsLeagueQualifyingLosers
    .filter((candidate) => !taken.has(clubKey(candidate.state)));

  const europaQualifyingCandidates = UEFA_ASSOCIATIONS.flatMap((country) => {
    const cupWinner = resolveClub(clubs, country, cupWinners[country]);
    const candidates: QualifiedClub[] = [];
    if (cupWinner && !taken.has(clubKey(cupWinner))) {
      candidates.push({ state: cupWinner, qualifiedVia: `${NATIONAL_CUP_NAMES[country] ?? "National cup"} winner · Europa League qualifying` });
    }
    candidates.push(...remainingLeagueClubs(country).slice(0, 3)
      .map((state) => ({ state, qualifiedVia: "League position · Europa League qualifying" } satisfies QualifiedClub)));
    return candidates;
  });
  const europaQualifying = contest(europaQualifyingCandidates, 12);
  europaQualifying.winners.forEach((candidate) => add(europaLeague, candidate));
  fill(europaLeague, "Europa League");
  entrants.set("europa-league", europaLeague);

  // Conference League: all 36 clubs qualify. The EFL Cup is England's approved
  // additional domestic route; Europa and earlier Champions League losers also
  // drop into this competition.
  const conferenceLeague: QualifiedClub[] = [];
  const eflCup = access.additionalCups?.find((cup) => cup.country === "ENG" && cup.name === "EFL Cup");
  const conferenceCandidates: QualifiedClub[] = [];
  if (eflCup) {
    const winner = resolveClub(clubs, "ENG", eflCup.winner);
    const passDown = firstAvailable("ENG");
    if (winner && !taken.has(clubKey(winner))) {
      conferenceCandidates.push({ state: winner, qualifiedVia: "EFL Cup winner · Conference League qualifying" });
    } else if (passDown) {
      conferenceCandidates.push({ state: passDown, qualifiedVia: "League position · EFL Cup place passed down" });
    }
  }
  conferenceCandidates.push(...europaQualifying.losers.map((candidate) => ({
    ...candidate,
    qualifiedVia: "Transferred from Europa League qualifying",
  })));
  conferenceCandidates.push(...remainingChampionsLeagueLosers.map((candidate) => ({
    ...candidate,
    qualifiedVia: "Transferred from Champions League qualifying",
  })));
  UEFA_ASSOCIATIONS.forEach((country) => {
    const cupWinner = resolveClub(clubs, country, cupWinners[country]);
    if (cupWinner) conferenceCandidates.push({ state: cupWinner, qualifiedVia: `${NATIONAL_CUP_NAMES[country] ?? "National cup"} winner · Conference League qualifying` });
    conferenceCandidates.push(...remainingLeagueClubs(country).slice(0, 4)
      .map((state) => ({ state, qualifiedVia: "League position · Conference League qualifying" } satisfies QualifiedClub)));
  });
  const conferenceQualifying = contest(conferenceCandidates, 36);
  conferenceQualifying.winners.forEach((candidate) => add(conferenceLeague, candidate));
  fill(conferenceLeague, "Conference League");
  entrants.set("conference-league", conferenceLeague);

  return entrants;
}

function blankStanding(entry: QualifiedClub): ContinentalStanding {
  return {
    club: entry.state.club,
    country: entry.state.country,
    qualifiedVia: entry.qualifiedVia,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function matchResult(left: ClubSeasonState, right: ClubSeasonState, impact: PlayerImpact, random: () => number) {
  const difference = continentalClubStrength(left, impact) - continentalClubStrength(right, impact);
  const drawChance = .27 * Math.exp(-Math.abs(difference) / 34);
  const leftChance = (1 - drawChance) / (1 + Math.exp(-difference / 8.8));
  const roll = random();
  const outcome = roll < leftChance ? "left" : roll < leftChance + drawChance ? "draw" : "right";
  const base = Math.floor(random() * 3);
  if (outcome === "draw") return { leftGoals: base, rightGoals: base };
  const margin = 1 + (random() < .22 ? 1 : 0) + (random() < .05 ? 1 : 0);
  return outcome === "left"
    ? { leftGoals: base + margin, rightGoals: base }
    : { leftGoals: base, rightGoals: base + margin };
}

function leaguePhase(entrants: QualifiedClub[], matches: number, impact: PlayerImpact, random: () => number) {
  const ordered = shuffled(entrants.map((entrant) => entrant.state), random);
  const routes = new Map(entrants.map((entrant) => [clubKey(entrant.state), entrant]));
  const states = new Map(entrants.map((entrant) => [clubKey(entrant.state), blankStanding(entrant)]));
  const size = ordered.length;
  for (let round = 0; round < matches; round += 1) {
    for (let index = 0; index < size / 2; index += 1) {
      const left = ordered[(index + round) % (size - 1)];
      const rightIndex = (size - 1 - index + round) % (size - 1);
      const right = index === 0 ? ordered[size - 1] : ordered[rightIndex];
      const leftStanding = states.get(clubKey(left))!;
      const rightStanding = states.get(clubKey(right))!;
      const result = matchResult(left, right, impact, random);
      leftStanding.played += 1;
      rightStanding.played += 1;
      leftStanding.goalsFor += result.leftGoals;
      leftStanding.goalsAgainst += result.rightGoals;
      rightStanding.goalsFor += result.rightGoals;
      rightStanding.goalsAgainst += result.leftGoals;
      if (result.leftGoals === result.rightGoals) {
        leftStanding.drawn += 1;
        rightStanding.drawn += 1;
        leftStanding.points += 1;
        rightStanding.points += 1;
      } else if (result.leftGoals > result.rightGoals) {
        leftStanding.won += 1;
        rightStanding.lost += 1;
        leftStanding.points += 3;
      } else {
        rightStanding.won += 1;
        leftStanding.lost += 1;
        rightStanding.points += 3;
      }
    }
  }
  return [...states.values()]
    .map((standing) => ({ ...standing, goalDifference: standing.goalsFor - standing.goalsAgainst }))
    .sort((left, right) => right.points - left.points || right.goalDifference - left.goalDifference || right.goalsFor - left.goalsFor ||
      continentalClubStrength(routes.get(clubKey(right))!.state, impact) -
      continentalClubStrength(routes.get(clubKey(left))!.state, impact));
}

function knockoutWinner(left: ClubSeasonState, right: ClubSeasonState, impact: PlayerImpact, random: () => number, series: boolean) {
  const difference = continentalClubStrength(left, impact) - continentalClubStrength(right, impact);
  const probability = 1 / (1 + Math.exp(-difference / (series ? 6.2 : 9.2)));
  return random() < probability ? left : right;
}

function playRound(
  round: string,
  clubs: ClubSeasonState[],
  impact: PlayerImpact,
  random: () => number,
  ties: PlayoffTie[],
  series = true,
) {
  const winners: ClubSeasonState[] = [];
  for (let index = 0; index < clubs.length / 2; index += 1) {
    const left = clubs[index];
    const right = clubs[clubs.length - 1 - index];
    const winner = knockoutWinner(left, right, impact, random, series);
    ties.push({ round, home: left.club, away: right.club, winner: winner.club });
    winners.push(winner);
  }
  return winners;
}

function simulateCompetition(definition: Definition, entrants: QualifiedClub[], impact: PlayerImpact, random: () => number): ContinentalCompetition {
  const table = leaguePhase(entrants, definition.leagueMatches, impact, random);
  const byKey = new Map(entrants.map((entry) => [clubKey(entry.state), entry.state]));
  const ranked = table.map((standing) => byKey.get(clubKey(standing))!);
  const ties: PlayoffTie[] = [];
  const playoffWinners = playRound("Knockout phase play-off", ranked.slice(8, 24), impact, random, ties);
  const roundOf16 = playRound("Round of 16", [...ranked.slice(0, 8), ...playoffWinners], impact, random, ties);
  const quarterFinals = playRound("Quarter-final", roundOf16, impact, random, ties);
  const semiFinals = playRound("Semi-final", quarterFinals, impact, random, ties);
  const finalists = playRound("Final", semiFinals, impact, random, ties, false);
  const champion = finalists[0];
  return {
    ...definition,
    entrants: entrants.map(({ state, qualifiedVia }) => ({ club: state.club, country: state.country, qualifiedVia })),
    table,
    champion: { club: champion.club, country: champion.country },
    bracket: { name: `${definition.shortName} knockout phase`, country: "EUROPE", competition: definition.name, ties },
  };
}

export function calculateEuropeanPerformance(competitions: ContinentalCompetition[]) {
  const scores = new Map<string, number>();
  const entrants = new Map<string, number>();
  competitions.forEach((competition) => {
    const countriesByClub = new Map(competition.entrants.map((club) => [club.club, club.country]));
    competition.table.forEach((standing, index) => {
      const placingBonus = index < 8 ? 4 : index < 24 ? 2 : 0;
      scores.set(standing.country, (scores.get(standing.country) ?? 0) + standing.points + placingBonus);
      entrants.set(standing.country, (entrants.get(standing.country) ?? 0) + 1);
    });
    competition.bracket.ties.forEach((tie) => {
      const winnerCountry = countriesByClub.get(tie.winner);
      if (winnerCountry) scores.set(winnerCountry, (scores.get(winnerCountry) ?? 0) + 2);
    });
  });
  return Object.fromEntries([...scores.entries()].map(([country, score]) => [
    country,
    Number((score / Math.max(1, entrants.get(country) ?? 1)).toFixed(3)),
  ]));
}

export function simulateUefaCompetitions(
  clubs: Record<string, ClubSeasonState>,
  domestic: readonly DomesticOutcome[],
  cupWinners: Record<string, string>,
  access: EuropeanAccessContext,
  impact: PlayerImpact,
  random: () => number = Math.random,
) {
  const entrants = qualifyClubs(clubs, domestic, cupWinners, access, impact, random);
  return UEFA_COMPETITION_DEFINITIONS.map((definition) =>
    simulateCompetition(definition, entrants.get(definition.key) ?? [], impact, random));
}

export function isUefaClub(club: ContinentalClub) {
  return UEFA_SET.has(club.country);
}
