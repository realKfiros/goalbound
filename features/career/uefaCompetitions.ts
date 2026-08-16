import type {
  ClubSeasonState,
  ContinentalClub,
  ContinentalCompetition,
  ContinentalStanding,
  PlayoffTie,
} from "./domain";

export const UEFA_COMPETITION_DEFINITIONS = [
  { key: "champions-league", name: "Champions League", shortName: "Champions League", leagueMatches: 8 },
  { key: "europa-league", name: "Europa League", shortName: "Europa League", leagueMatches: 8 },
  { key: "conference-league", name: "Conference League", shortName: "Conference League", leagueMatches: 6 },
] as const;

export const UEFA_ASSOCIATIONS = [
  "ENG", "ESP", "ITA", "GER", "FRA", "NED", "POR", "BEL", "TUR", "CZE",
  "GRE", "AUT", "SCO", "DEN", "SUI", "NOR", "SWE", "POL", "ISR", "CRO",
  "SRB", "UKR", "ROU", "HUN", "CYP",
] as const;

type CompetitionKey = ContinentalCompetition["key"];
type PlayerImpact = { club: string; boost: number };
type DomesticOutcome = { country: string; division: number; table: string[] };
type Definition = typeof UEFA_COMPETITION_DEFINITIONS[number];

const UEFA_SET = new Set<string>(UEFA_ASSOCIATIONS);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clubKey(club: Pick<ClubSeasonState, "country" | "club">) {
  return `${club.country}:${club.club}`;
}

function effectiveStrength(club: ClubSeasonState, impact: PlayerImpact) {
  const playerBoost = club.club === impact.club ? impact.boost : 0;
  return club.squadQuality * .68 + club.finances * .15 + club.reputation * .17 + club.momentum + playerBoost;
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

function rankedCandidates(clubs: ClubSeasonState[], impact: PlayerImpact, random: () => number) {
  return clubs
    .map((club) => ({ club, score: effectiveStrength(club, impact) + gumbel(random) * 8.4 }))
    .sort((left, right) => right.score - left.score)
    .map(({ club }) => club);
}

function resolveClub(clubs: Record<string, ClubSeasonState>, country: string, club: string) {
  return clubs[`${country}:${club}`];
}

function qualifyClubs(
  clubs: Record<string, ClubSeasonState>,
  domestic: readonly DomesticOutcome[],
  cupWinners: Record<string, string>,
  impact: PlayerImpact,
  random: () => number,
) {
  const topFlights = new Map(domestic
    .filter((competition) => competition.division === 1 && UEFA_SET.has(competition.country))
    .map((competition) => [competition.country, competition.table]));
  const allEuropeanClubs = Object.values(clubs).filter((club) => UEFA_SET.has(club.country));
  const taken = new Set<string>();
  const entrants = new Map<CompetitionKey, ClubSeasonState[]>();

  const available = (club: ClubSeasonState | undefined) => club && !taken.has(clubKey(club)) ? club : undefined;
  const tableClub = (country: string, position: number) => {
    const name = topFlights.get(country)?.[position];
    return name ? resolveClub(clubs, country, name) : undefined;
  };
  const firstAvailable = (country: string) => {
    const table = topFlights.get(country) ?? [];
    for (const name of table) {
      const club = available(resolveClub(clubs, country, name));
      if (club) return club;
    }
    return allEuropeanClubs.find((club) => club.country === country && !taken.has(clubKey(club)));
  };
  const add = (target: ClubSeasonState[], club: ClubSeasonState | undefined) => {
    const eligible = available(club);
    if (!eligible || target.length >= 36) return false;
    target.push(eligible);
    taken.add(clubKey(eligible));
    return true;
  };
  const select = (target: ClubSeasonState[], candidates: Array<ClubSeasonState | undefined>, total: number) => {
    const unique = new Map<string, ClubSeasonState>();
    candidates.forEach((club) => {
      const eligible = available(club);
      if (eligible) unique.set(clubKey(eligible), eligible);
    });
    for (const club of rankedCandidates([...unique.values()], impact, random)) {
      if (target.length >= total) break;
      add(target, club);
    }
  };
  const fill = (target: ClubSeasonState[]) => select(target, allEuropeanClubs, 36);

  const championsLeague: ClubSeasonState[] = [];
  UEFA_ASSOCIATIONS.slice(0, 5).forEach((country) => [0, 1, 2].forEach((position) => add(championsLeague, tableClub(country, position))));
  UEFA_ASSOCIATIONS.slice(5, 7).forEach((country) => [0, 1].forEach((position) => add(championsLeague, tableClub(country, position))));
  const championsQualifying = [
    ...UEFA_ASSOCIATIONS.slice(0, 5).map((country) => tableClub(country, 3)),
    ...UEFA_ASSOCIATIONS.slice(5, 7).map((country) => tableClub(country, 2)),
    ...UEFA_ASSOCIATIONS.slice(7).map((country) => tableClub(country, 0)),
  ];
  select(championsLeague, championsQualifying, 36);
  fill(championsLeague);
  entrants.set("champions-league", championsLeague);

  const europaLeague: ClubSeasonState[] = [];
  UEFA_ASSOCIATIONS.slice(0, 7).forEach((country) => {
    add(europaLeague, firstAvailable(country));
    add(europaLeague, firstAvailable(country));
  });
  UEFA_ASSOCIATIONS.slice(7, 16).forEach((country) => add(europaLeague, firstAvailable(country)));
  const europaCandidates = [
    ...UEFA_ASSOCIATIONS.map((country) => resolveClub(clubs, country, cupWinners[country])),
    ...championsQualifying,
    ...UEFA_ASSOCIATIONS.flatMap((country) => (topFlights.get(country) ?? []).map((name) => resolveClub(clubs, country, name))),
  ];
  select(europaLeague, europaCandidates, 36);
  fill(europaLeague);
  entrants.set("europa-league", europaLeague);

  const conferenceLeague: ClubSeasonState[] = [];
  UEFA_ASSOCIATIONS.forEach((country) => add(conferenceLeague, firstAvailable(country)));
  const conferenceCandidates = UEFA_ASSOCIATIONS.flatMap((country) => [
    resolveClub(clubs, country, cupWinners[country]),
    ...(topFlights.get(country) ?? []).map((name) => resolveClub(clubs, country, name)),
  ]);
  select(conferenceLeague, conferenceCandidates, 36);
  fill(conferenceLeague);
  entrants.set("conference-league", conferenceLeague);

  return entrants;
}

function blankStanding(club: ClubSeasonState): ContinentalStanding {
  return {
    club: club.club,
    country: club.country,
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
  const difference = effectiveStrength(left, impact) - effectiveStrength(right, impact);
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

function leaguePhase(entrants: ClubSeasonState[], matches: number, impact: PlayerImpact, random: () => number) {
  const ordered = shuffled(entrants, random);
  const states = new Map(entrants.map((club) => [clubKey(club), blankStanding(club)]));
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
      effectiveStrength(entrants.find((club) => clubKey(club) === clubKey(right))!, impact) -
      effectiveStrength(entrants.find((club) => clubKey(club) === clubKey(left))!, impact));
}

function knockoutWinner(left: ClubSeasonState, right: ClubSeasonState, impact: PlayerImpact, random: () => number, series: boolean) {
  const difference = effectiveStrength(left, impact) - effectiveStrength(right, impact);
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

function simulateCompetition(definition: Definition, entrants: ClubSeasonState[], impact: PlayerImpact, random: () => number): ContinentalCompetition {
  const table = leaguePhase(entrants, definition.leagueMatches, impact, random);
  const byKey = new Map(entrants.map((club) => [clubKey(club), club]));
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
    entrants: entrants.map(({ club, country }) => ({ club, country })),
    table,
    champion: { club: champion.club, country: champion.country },
    bracket: { name: `${definition.shortName} knockout phase`, country: "EUROPE", competition: definition.name, ties },
  };
}

export function simulateUefaCompetitions(
  clubs: Record<string, ClubSeasonState>,
  domestic: readonly DomesticOutcome[],
  cupWinners: Record<string, string>,
  impact: PlayerImpact,
  random: () => number = Math.random,
) {
  const entrants = qualifyClubs(clubs, domestic, cupWinners, impact, random);
  return UEFA_COMPETITION_DEFINITIONS.map((definition) =>
    simulateCompetition(definition, entrants.get(definition.key) ?? [], impact, random));
}

export function isUefaClub(club: ContinentalClub) {
  return UEFA_SET.has(club.country);
}
