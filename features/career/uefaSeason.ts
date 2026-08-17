import type {
  ClubSeasonState,
  ContinentalClub,
  ContinentalCompetition,
  ContinentalStanding,
  CupHonours,
  EuropeanCompetitionKey,
  EuropeanQualification,
  PlayoffBracket,
  PlayoffTie,
} from "./domain";
import {
  NATIONAL_CUP_NAMES,
  UEFA_ACCESS_LIST_2026_27,
  UEFA_ASSOCIATIONS,
  type AccessRoute,
} from "./uefaAccessList";

export { UEFA_ASSOCIATIONS } from "./uefaAccessList";

export const UEFA_COMPETITION_DEFINITIONS = [
  { key: "champions-league", name: "Champions League", shortName: "Champions League", leagueMatches: 8, pots: 4 },
  { key: "europa-league", name: "Europa League", shortName: "Europa League", leagueMatches: 8, pots: 4 },
  { key: "conference-league", name: "Conference League", shortName: "Conference League", leagueMatches: 6, pots: 6 },
] as const;

type Definition = typeof UEFA_COMPETITION_DEFINITIONS[number];
type DomesticOutcome = { country: string; division: number; table: string[] };
type PlayerImpact = { club: string; boost: number };
type QualifiedClub = { state: ClubSeasonState; qualifiedVia: string };

export type EuropeanAccessContext = {
  additionalCups?: CupHonours[];
  previousChampions?: Partial<Record<EuropeanCompetitionKey, ContinentalClub>>;
  previousPerformance?: Record<string, number>;
  performanceSpots?: readonly string[];
  publishedAccessList?: boolean;
};

type QualifyingResult = {
  winners: QualifiedClub[];
  losers: QualifiedClub[];
  bracket: PlayoffBracket;
};

const UEFA_SET = new Set<string>(UEFA_ASSOCIATIONS);
const ROUND = {
  league: "League phase",
  first: "First qualifying round",
  second: "Second qualifying round",
  third: "Third qualifying round",
  playoff: "Play-off round",
} as const;

const ASSOCIATION_CONTINENTAL_ADJUSTMENT: Record<string, number> = {
  ENG: 0, ITA: 0, ESP: 0, GER: 0, FRA: -2, NED: -6, POR: -6, BEL: -9,
  CZE: -12, TUR: -10, NOR: -13, AUT: -12, SCO: -14, GRE: -13, DEN: -13,
  SUI: -14, POL: -16, ISR: -18, CYP: -20, SWE: -16, CRO: -17, SRB: -18,
  UKR: -14, HUN: -18, ROU: -18, BUL: -19, AZE: -20, SVK: -19, SVN: -20,
  MDA: -23, KOS: -25, KAZ: -21, FIN: -22, IRL: -22, ARM: -23, LVA: -25,
  FRO: -25, BIH: -22, ISL: -23, NIR: -24, LUX: -25, LTU: -25, ALB: -24,
  EST: -26, MLT: -26, GEO: -23, BLR: -22, MNE: -25, WAL: -25, GIB: -28,
  MKD: -25, AND: -29, SMR: -31,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clubKey(club: Pick<ClubSeasonState, "country" | "club"> | ContinentalClub) {
  return `${club.country}:${club.club}`;
}

export function continentalClubStrength(club: ClubSeasonState, impact: PlayerImpact = { club: "", boost: 0 }) {
  const playerBoost = club.club === impact.club ? impact.boost : 0;
  const domesticStrength = club.squadQuality * .68 + club.finances * .15 + club.reputation * .17 + club.momentum;
  return clamp(domesticStrength + (ASSOCIATION_CONTINENTAL_ADJUSTMENT[club.country] ?? -30) + playerBoost, 12, 99);
}

function gumbel(random: () => number) {
  const draw = clamp(random(), Number.MIN_VALUE, 1 - Number.EPSILON);
  return -Math.log(-Math.log(draw));
}

function rankedCandidates(entries: QualifiedClub[], impact: PlayerImpact, random: () => number, temperature = 5.8) {
  return entries
    .map((entry) => ({ entry, score: continentalClubStrength(entry.state, impact) + gumbel(random) * temperature }))
    .sort((left, right) => right.score - left.score)
    .map(({ entry }) => entry);
}

const VIRTUAL_UEFA_CLUBS: Record<string, ClubSeasonState> = {
  "LIE:FC Vaduz": {
    club: "FC Vaduz",
    country: "LIE",
    league: "Liechtenstein Cup",
    division: 1,
    squadQuality: 49,
    finances: 46,
    reputation: 48,
    momentum: 0,
    previousFinish: null,
    rollingPerformance: [],
  },
};

function resolveClub(clubs: Record<string, ClubSeasonState>, country: string, club: string | undefined) {
  return club ? clubs[`${country}:${club}`] ?? VIRTUAL_UEFA_CLUBS[`${country}:${club}`] : undefined;
}

/**
 * Freezes the domestic places earned in season S for the UEFA edition in S+1.
 * Qualifying results are deliberately not resolved here; this list is what the
 * completed domestic table is allowed to claim.
 */
export function projectNextUefaQualification(
  clubs: Record<string, ClubSeasonState>,
  domestic: readonly DomesticOutcome[],
  cupWinners: Record<string, string>,
  access: EuropeanAccessContext,
) {
  const tables = new Map(domestic
    .filter((competition) => competition.division === 1 && UEFA_SET.has(competition.country))
    .map((competition) => [competition.country, competition.table]));
  const taken = new Set<string>();
  const domesticUsed = new Set<string>();
  const extraTitleholders = new Set<string>();
  const places: EuropeanQualification[] = [];

  const tableClub = (country: string, position: number) => resolveClub(clubs, country, tables.get(country)?.[position]);
  const nextDomestic = (country: string, used: ReadonlySet<string> = domesticUsed) => (tables.get(country) ?? [])
    .map((club) => resolveClub(clubs, country, club))
    .find((club): club is ClubSeasonState => !!club && !used.has(clubKey(club)));
  const add = (
    state: ClubSeasonState | undefined,
    competition: EuropeanCompetitionKey,
    entryRound: EuropeanQualification["entryRound"],
    path: EuropeanQualification["path"],
    qualifiedVia: string,
    slotId?: string,
  ) => {
    if (!state || taken.has(clubKey(state))) return false;
    places.push({ club: state.club, country: state.country, competition, entryRound, path, qualifiedVia, slotId });
    taken.add(clubKey(state));
    return true;
  };
  const roundPlaceCount = (
    competition: EuropeanCompetitionKey,
    entryRound: EuropeanQualification["entryRound"],
    path: EuropeanQualification["path"],
  ) => places.filter((place) =>
    place.competition === competition && place.entryRound === entryRound && place.path === path).length;
  const previousChampion = (key: EuropeanCompetitionKey) => {
    const holder = access.previousChampions?.[key];
    return holder ? resolveClub(clubs, holder.country, holder.club) : undefined;
  };
  type ResolvedRoute = { state: ClubSeasonState; qualifiedVia: string; consumedByTitleholder: boolean };
  const resolveCandidate = (state: ClubSeasonState | undefined, qualifiedVia: string): ResolvedRoute | undefined => {
    if (!state) return undefined;
    return { state, qualifiedVia, consumedByTitleholder: extraTitleholders.has(clubKey(state)) };
  };
  const resolveRoute = (route: AccessRoute, used: ReadonlySet<string> = domesticUsed): ResolvedRoute | undefined => {
    if (route.source.kind === "table") {
      const state = tableClub(route.association, route.source.position);
      return state && !used.has(clubKey(state)) ? resolveCandidate(state, route.qualifiedVia) : undefined;
    }
    if (route.source.kind === "next") {
      return resolveCandidate(nextDomestic(route.association, used), route.qualifiedVia);
    }
    if (route.source.kind === "virtual") {
      const state = resolveClub(clubs, route.association, route.source.club);
      return state && !used.has(clubKey(state)) ? resolveCandidate(state, route.qualifiedVia) : undefined;
    }
    const cupName = route.source.kind === "league-cup"
      ? route.source.name
      : NATIONAL_CUP_NAMES[route.association] ?? "National cup";
    const winner = route.source.kind === "league-cup"
      ? access.additionalCups?.find((cup) => cup.country === route.association && cup.name === route.source.name)?.winner
      : cupWinners[route.association];
    const cupWinner = resolveClub(clubs, route.association, winner);
    if (cupWinner && !used.has(clubKey(cupWinner))) {
      return resolveCandidate(cupWinner, `${cupName} winner`);
    }
    return resolveCandidate(nextDomestic(route.association, used), `League position · ${cupName} place passed down`);
  };
  const addRoute = (
    route: AccessRoute,
    override: Partial<Pick<AccessRoute, "competition" | "entryRound" | "path" | "qualifiedVia">> = {},
  ) => {
    const resolved = resolveRoute(route);
    if (!resolved) return false;
    domesticUsed.add(clubKey(resolved.state));
    if (resolved.consumedByTitleholder) return false;
    return add(
      resolved.state,
      override.competition ?? route.competition,
      override.entryRound ?? route.entryRound,
      override.path ?? route.path,
      override.qualifiedVia ?? resolved.qualifiedVia,
      route.slotId,
    );
  };
  const addRoutes = (routes: readonly AccessRoute[]) => routes.forEach((route) => addRoute(route));
  const takeStrongest = (routes: AccessRoute[], count: number) => {
    const selected = routes
      .map((route) => ({ route, resolved: resolveRoute(route) }))
      .filter((item): item is { route: AccessRoute; resolved: ResolvedRoute } =>
        !!item.resolved && !item.resolved.consumedByTitleholder)
      .sort((left, right) => continentalClubStrength(right.resolved.state) - continentalClubStrength(left.resolved.state))
      .slice(0, count)
      .map((item) => item.route);
    const selectedSet = new Set(selected);
    return { selected, remaining: routes.filter((route) => !selectedSet.has(route)) };
  };
  const takePublished = (routes: AccessRoute[], associations: readonly string[]) => {
    const selected = associations.map((association) => routes.find((route) => route.association === association));
    if (selected.some((route) => !route)) {
      throw new Error(`Published UEFA adaptation is missing ${associations.join(", ")}.`);
    }
    const published = selected as AccessRoute[];
    const selectedSet = new Set(published);
    return { selected: published, remaining: routes.filter((route) => !selectedSet.has(route)) };
  };
  const addDomestic = (
    state: ClubSeasonState | undefined,
    competition: EuropeanCompetitionKey,
    entryRound: EuropeanQualification["entryRound"],
    path: EuropeanQualification["path"],
    qualifiedVia: string,
    slotId?: string,
  ) => {
    if (!state) return false;
    domesticUsed.add(clubKey(state));
    return add(state, competition, entryRound, path, qualifiedVia, slotId);
  };
  const assignTitleholder = (key: EuropeanCompetitionKey, competition: EuropeanCompetitionKey, qualifiedVia: string) => {
    const holder = previousChampion(key);
    if (!holder) return { holder: undefined, vacancy: true };
    const existing = places.find((place) => clubKey(place) === clubKey(holder));
    if (existing) {
      existing.qualifiedVia = qualifiedVia;
      return { holder, vacancy: true };
    }
    if (add(holder, competition, ROUND.league, "Direct", qualifiedVia, `${holder.country}:${key}:TH`)) {
      extraTitleholders.add(clubKey(holder));
      return { holder, vacancy: false };
    }
    return { holder, vacancy: true };
  };
  const accessList = UEFA_ACCESS_LIST_2026_27;

  addRoutes(accessList.championsLeague.direct);
  const performanceAssociations = access.performanceSpots ?? Object.entries(access.previousPerformance ?? {})
    .filter(([country]) => UEFA_SET.has(country))
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([country]) => country);
  const uniquePerformanceAssociations = [...new Set(performanceAssociations)];
  if (uniquePerformanceAssociations.length !== 2) {
    throw new Error("Two European Performance Spot associations are required for the UEFA access list.");
  }
  uniquePerformanceAssociations.forEach((country) =>
    addDomestic(nextDomestic(country), "champions-league", ROUND.league, "Direct", "European Performance Spot", `${country}:EPS:UCL`));

  const championsTitleholder = assignTitleholder(
    "champions-league", "champions-league", "Champions League holder",
  );
  const championsHolderVacancy = championsTitleholder.vacancy;
  const europaTitleholder = assignTitleholder(
    "europa-league", "champions-league", "Europa League holder",
  );
  const europaHolderVacancy = europaTitleholder.vacancy;

  let championsSecond = [...accessList.championsLeague.championsSecond];
  let championsFirst = [...accessList.championsLeague.championsFirst];
  let leagueThird = [...accessList.championsLeague.leagueThird];
  let leagueSecond = [...accessList.championsLeague.leagueSecond];
  if (championsHolderVacancy) {
    const directPromotion = access.publishedAccessList
      ? takePublished(championsSecond, ["UKR"])
      : takeStrongest(championsSecond, 1);
    championsSecond = directPromotion.remaining;
    directPromotion.selected.forEach((route) => addRoute(route, {
      entryRound: ROUND.league,
      path: "Direct",
      qualifiedVia: "Champions League holder vacancy rebalancing",
    }));
    const secondRoundPromotions = access.publishedAccessList
      ? takePublished(championsFirst, ["SVK", "SVN"])
      : takeStrongest(championsFirst, 2);
    championsFirst = secondRoundPromotions.remaining;
    championsSecond.push(...secondRoundPromotions.selected.map((route) => ({
      ...route,
      entryRound: ROUND.second,
      qualifiedVia: "Champions path · access-list rebalancing",
    })));
  }
  if (europaHolderVacancy) {
    const directPromotion = access.publishedAccessList
      ? takePublished(leagueThird, ["POR"])
      : takeStrongest(leagueThird, 1);
    leagueThird = directPromotion.remaining;
    directPromotion.selected.forEach((route) => addRoute(route, {
      entryRound: ROUND.league,
      path: "Direct",
      qualifiedVia: "Europa League holder vacancy rebalancing",
    }));
    const thirdRoundPromotions = access.publishedAccessList
      ? takePublished(leagueSecond, ["NOR", "GRE"])
      : takeStrongest(leagueSecond, 2);
    leagueSecond = thirdRoundPromotions.remaining;
    leagueThird.push(...thirdRoundPromotions.selected.map((route) => ({
      ...route,
      entryRound: ROUND.third,
      qualifiedVia: "League path · access-list rebalancing",
    })));
  }
  if (roundPlaceCount("champions-league", ROUND.league, "Direct") !== 29) {
    throw new Error("Champions League access-list rebalancing did not produce 29 direct entrants.");
  }
  addRoutes(championsFirst);
  addRoutes(championsSecond);
  addRoutes(accessList.championsLeague.championsPlayoff);
  addRoutes(leagueSecond);
  addRoutes(leagueThird);

  const conferenceHolder = previousChampion("conference-league");
  if (conferenceHolder && !taken.has(clubKey(conferenceHolder))) {
    if (add(conferenceHolder, "europa-league", ROUND.league, "Direct", "Conference League holder",
      `${conferenceHolder.country}:conference-league:TH`)) {
      extraTitleholders.add(clubKey(conferenceHolder));
    }
  }

  const europaDirect = [...accessList.europaLeague.direct];
  const europaPlayoff = [...accessList.europaLeague.playoff];
  const europaThird = [...accessList.europaLeague.third];
  const europaSecond = [...accessList.europaLeague.second];
  let europaFirst = [...accessList.europaLeague.first];
  if (europaHolderVacancy) {
    const knockOnPromotions = europaFirst.slice(0, 4);
    europaFirst = europaFirst.slice(4);
    europaSecond.push(...knockOnPromotions.map((route) => ({
      ...route,
      entryRound: ROUND.second,
      qualifiedVia: `${route.qualifiedVia} · Europa League holder vacancy rebalancing`,
    })));
  }
  addRoutes(europaDirect);
  addRoutes(europaPlayoff);
  addRoutes(europaThird);
  addRoutes(europaSecond);
  addRoutes(europaFirst);

  while (roundPlaceCount("europa-league", ROUND.league, "Direct") < 13) {
    const candidate = places
      .filter((place) => place.competition === "europa-league" && place.entryRound !== ROUND.league)
      .map((place) => ({ place, state: resolveClub(clubs, place.country, place.club) }))
      .filter((item): item is { place: EuropeanQualification; state: ClubSeasonState } => !!item.state)
      .sort((left, right) => continentalClubStrength(right.state) - continentalClubStrength(left.state))[0];
    if (!candidate) throw new Error("Unable to rebalance the Conference League holder place in the Europa League.");
    candidate.place.entryRound = ROUND.league;
    candidate.place.path = "Direct";
    candidate.place.qualifiedVia = "Conference League holder vacancy rebalancing";
  }

  addRoutes(accessList.conferenceLeague.playoff);
  addRoutes(accessList.conferenceLeague.second);
  addRoutes(accessList.conferenceLeague.first);

  return places;
}

function placeEntries(
  clubs: Record<string, ClubSeasonState>,
  places: readonly EuropeanQualification[],
  competition: EuropeanCompetitionKey,
  entryRound: EuropeanQualification["entryRound"],
  path: EuropeanQualification["path"],
) {
  return places
    .filter((place) => place.competition === competition && place.entryRound === entryRound && place.path === path)
    .map((place) => {
      const state = resolveClub(clubs, place.country, place.club);
      return state ? { state, qualifiedVia: place.qualifiedVia ?? `${entryRound} · ${path}` } : undefined;
    })
    .filter((entry): entry is QualifiedClub => !!entry);
}

function knockoutWinner(left: ClubSeasonState, right: ClubSeasonState, impact: PlayerImpact, random: () => number, series = true) {
  const difference = continentalClubStrength(left, impact) - continentalClubStrength(right, impact);
  const probability = 1 / (1 + Math.exp(-difference / (series ? 6.2 : 9.2)));
  return random() < probability ? left : right;
}

function qualifierRound(
  competition: string,
  round: string,
  path: string,
  entries: QualifiedClub[],
  expectedWinners: number | undefined,
  impact: PlayerImpact,
  random: () => number,
): QualifyingResult {
  const winnerCount = expectedWinners ?? Math.ceil(entries.length / 2);
  if (!Number.isInteger(winnerCount) || entries.length < winnerCount || entries.length > winnerCount * 2) {
    const expectation = expectedWinners === undefined
      ? "at least one club"
      : `${expectedWinners}–${expectedWinners * 2}`;
    throw new Error(`${competition} ${round} ${path} has ${entries.length} clubs; expected ${expectation}.`);
  }
  const ranked = rankedCandidates(entries, impact, random);
  const winners: QualifiedClub[] = [];
  const losers: QualifiedClub[] = [];
  const ties: PlayoffTie[] = [];
  const tieCount = entries.length - winnerCount;
  for (let index = 0; index < tieCount; index += 1) {
    const left = ranked[index];
    const right = ranked[ranked.length - 1 - index];
    const winningState = knockoutWinner(left.state, right.state, impact, random);
    const winner = winningState === left.state ? left : right;
    const loser = winner === left ? right : left;
    winners.push({ ...winner, qualifiedVia: `${competition} ${round} · ${path}` });
    losers.push(loser);
    ties.push({ round, home: left.state.club, away: right.state.club, winner: winner.state.club });
  }
  ranked.slice(tieCount, winnerCount).forEach((entry) => winners.push({
    ...entry,
    qualifiedVia: `${competition} ${round} · ${path} bye`,
  }));
  return {
    winners,
    losers,
    bracket: { name: `${round} · ${path}`, country: "EUROPE", competition, ties },
  };
}

function withRoute(entries: QualifiedClub[], qualifiedVia: string) {
  return entries.map((entry) => ({ ...entry, qualifiedVia }));
}

function simulateQualifiers(
  clubs: Record<string, ClubSeasonState>,
  places: readonly EuropeanQualification[],
  impact: PlayerImpact,
  random: () => number,
) {
  const brackets: Record<EuropeanCompetitionKey, PlayoffBracket[]> = {
    "champions-league": [], "europa-league": [], "conference-league": [],
  };
  const record = (key: EuropeanCompetitionKey, result: QualifyingResult) => {
    brackets[key].push(result.bracket);
    return result;
  };

  const uclQ1 = record("champions-league", qualifierRound("Champions League", ROUND.first, "Champions path",
    placeEntries(clubs, places, "champions-league", ROUND.first, "Champions path"), undefined, impact, random));
  const uclQ2Cp = record("champions-league", qualifierRound("Champions League", ROUND.second, "Champions path", [
    ...uclQ1.winners,
    ...placeEntries(clubs, places, "champions-league", ROUND.second, "Champions path"),
  ], undefined, impact, random));
  const uclQ2Lp = record("champions-league", qualifierRound("Champions League", ROUND.second, "League path",
    placeEntries(clubs, places, "champions-league", ROUND.second, "League path"), undefined, impact, random));
  const uclQ3Cp = record("champions-league", qualifierRound("Champions League", ROUND.third, "Champions path",
    uclQ2Cp.winners, 6, impact, random));
  const uclQ3Lp = record("champions-league", qualifierRound("Champions League", ROUND.third, "League path", [
    ...uclQ2Lp.winners,
    ...placeEntries(clubs, places, "champions-league", ROUND.third, "League path"),
  ], 4, impact, random));
  const uclPoCp = record("champions-league", qualifierRound("Champions League", ROUND.playoff, "Champions path", [
    ...uclQ3Cp.winners,
    ...placeEntries(clubs, places, "champions-league", ROUND.playoff, "Champions path"),
  ], 5, impact, random));
  const uclPoLp = record("champions-league", qualifierRound("Champions League", ROUND.playoff, "League path",
    uclQ3Lp.winners, 2, impact, random));
  const uclLeague = [
    ...placeEntries(clubs, places, "champions-league", ROUND.league, "Direct"),
    ...withRoute(uclPoCp.winners, "Champions Path play-off winner"),
    ...withRoute(uclPoLp.winners, "League Path play-off winner"),
  ];

  const uelQ1 = record("europa-league", qualifierRound("Europa League", ROUND.first, "Main path",
    placeEntries(clubs, places, "europa-league", ROUND.first, "Main path"), undefined, impact, random));
  const uelQ2 = record("europa-league", qualifierRound("Europa League", ROUND.second, "Main path", [
    ...uelQ1.winners,
    ...placeEntries(clubs, places, "europa-league", ROUND.second, "Main path"),
  ], undefined, impact, random));
  const uelQ3Cp = record("europa-league", qualifierRound("Europa League", ROUND.third, "Champions path",
    withRoute(uclQ2Cp.losers, "Transferred from Champions League second qualifying round"), 6, impact, random));
  const uelQ3Mp = record("europa-league", qualifierRound("Europa League", ROUND.third, "Main path", [
    ...uelQ2.winners,
    ...placeEntries(clubs, places, "europa-league", ROUND.third, "Main path"),
    ...withRoute(uclQ2Lp.losers, "Transferred from Champions League second qualifying round"),
  ], 7, impact, random));
  const uelPoCp = record("europa-league", qualifierRound("Europa League", ROUND.playoff, "Champions path", [
    ...uelQ3Cp.winners,
    ...withRoute(uclQ3Cp.losers, "Transferred from Champions League third qualifying round"),
  ], 6, impact, random));
  const uclTransfers = [
    ...withRoute(uclQ3Lp.losers, "Transferred from Champions League third qualifying round"),
    ...withRoute(uclPoCp.losers, "Transferred from Champions League play-offs"),
    ...withRoute(uclPoLp.losers, "Transferred from Champions League play-offs"),
  ];
  const uelDirect = placeEntries(clubs, places, "europa-league", ROUND.league, "Direct");
  const uelMainPathWinnerTarget = 36 - uelDirect.length - uclTransfers.length - uelPoCp.winners.length;
  const uelPoMp = record("europa-league", qualifierRound("Europa League", ROUND.playoff, "Main path", [
    ...uelQ3Mp.winners,
    ...placeEntries(clubs, places, "europa-league", ROUND.playoff, "Main path"),
  ], uelMainPathWinnerTarget, impact, random));
  const uelLeague = [
    ...uelDirect,
    ...withRoute(uelPoCp.winners, "Europa League play-off winner"),
    ...withRoute(uelPoMp.winners, "Europa League play-off winner"),
    ...uclTransfers,
  ];

  const ueclQ1 = record("conference-league", qualifierRound("Conference League", ROUND.first, "Main path",
    placeEntries(clubs, places, "conference-league", ROUND.first, "Main path"), 26, impact, random));
  const uclQ1ToConference = uclQ1.losers;
  const uclQ1ConferenceByeCount = 16 - uclQ1ToConference.length;
  const drawnUclQ1Transfers = [...uclQ1ToConference];
  for (let index = drawnUclQ1Transfers.length - 1; index > 0; index -= 1) {
    const drawnIndex = Math.floor(random() * (index + 1));
    [drawnUclQ1Transfers[index], drawnUclQ1Transfers[drawnIndex]] =
      [drawnUclQ1Transfers[drawnIndex], drawnUclQ1Transfers[index]];
  }
  const uclQ1ConferenceByes = drawnUclQ1Transfers.slice(0, uclQ1ConferenceByeCount);
  const uclQ1ConferenceQ2 = drawnUclQ1Transfers.slice(uclQ1ConferenceByeCount);
  const ueclQ2Cp = record("conference-league", qualifierRound("Conference League", ROUND.second, "Champions path",
    withRoute(uclQ1ConferenceQ2, "Transferred from Champions League first qualifying round"),
    undefined, impact, random));
  const ueclQ2Mp = record("conference-league", qualifierRound("Conference League", ROUND.second, "Main path", [
    ...ueclQ1.winners,
    ...placeEntries(clubs, places, "conference-league", ROUND.second, "Main path"),
    ...withRoute(uelQ1.losers, "Transferred from Europa League first qualifying round"),
  ], undefined, impact, random));
  const ueclQ3Cp = record("conference-league", qualifierRound("Conference League", ROUND.third, "Champions path", [
    ...ueclQ2Cp.winners,
    ...withRoute(uclQ1ConferenceByes, "Champions League balancing bye draw"),
  ], 4, impact, random));
  const ueclQ3Mp = record("conference-league", qualifierRound("Conference League", ROUND.third, "Main path", [
    ...ueclQ2Mp.winners,
    ...withRoute(uelQ2.losers, "Transferred from Europa League second qualifying round"),
  ], 26, impact, random));
  const ueclPoCp = record("conference-league", qualifierRound("Conference League", ROUND.playoff, "Champions path", [
    ...ueclQ3Cp.winners,
    ...withRoute(uelQ3Cp.losers, "Transferred from Europa League third qualifying round"),
  ], 5, impact, random));
  const uelPlayoffTransfers = [...uelPoCp.losers, ...uelPoMp.losers];
  const ueclMainPathWinnerTarget = 36 - ueclPoCp.winners.length - uelPlayoffTransfers.length;
  const ueclPoMp = record("conference-league", qualifierRound("Conference League", ROUND.playoff, "Main path", [
    ...ueclQ3Mp.winners,
    ...placeEntries(clubs, places, "conference-league", ROUND.playoff, "Main path"),
    ...withRoute(uelQ3Mp.losers, "Transferred from Europa League third qualifying round"),
  ], ueclMainPathWinnerTarget, impact, random));
  const ueclLeague = [
    ...withRoute(ueclPoCp.winners, "Conference League play-off winner"),
    ...withRoute(ueclPoMp.winners, "Conference League play-off winner"),
    ...withRoute(uelPlayoffTransfers, "Transferred from Europa League play-offs"),
  ];

  return {
    entrants: {
      "champions-league": uclLeague,
      "europa-league": uelLeague,
      "conference-league": ueclLeague,
    },
    brackets,
  };
}

function blankStanding(entry: QualifiedClub): ContinentalStanding {
  return {
    club: entry.state.club, country: entry.state.country, qualifiedVia: entry.qualifiedVia,
    played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
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
  return outcome === "left" ? { leftGoals: base + margin, rightGoals: base } : { leftGoals: base, rightGoals: base + margin };
}

function leagueFixtures(entrants: QualifiedClub[], definition: Definition, impact: PlayerImpact) {
  const seeded = [...entrants].sort((left, right) => continentalClubStrength(right.state, impact) - continentalClubStrength(left.state, impact));
  const potSize = seeded.length / definition.pots;
  const pots = Array.from({ length: definition.pots }, (_, index) => seeded.slice(index * potSize, (index + 1) * potSize));
  const fixtures: Array<[QualifiedClub, QualifiedClub]> = [];
  if (definition.pots === 4) {
    pots.forEach((pot) => {
      for (let index = 0; index < pot.length; index += 1) fixtures.push([pot[index], pot[(index + 1) % pot.length]]);
    });
    for (let leftPot = 0; leftPot < pots.length; leftPot += 1) {
      for (let rightPot = leftPot + 1; rightPot < pots.length; rightPot += 1) {
        for (let offset = 0; offset < 2; offset += 1) {
          for (let index = 0; index < potSize; index += 1) {
            fixtures.push([pots[leftPot][index], pots[rightPot][(index + offset) % potSize]]);
          }
        }
      }
    }
  } else {
    pots.forEach((pot) => {
      for (let index = 0; index < pot.length; index += 2) fixtures.push([pot[index], pot[index + 1]]);
    });
    for (let leftPot = 0; leftPot < pots.length; leftPot += 1) {
      for (let rightPot = leftPot + 1; rightPot < pots.length; rightPot += 1) {
        for (let index = 0; index < potSize; index += 1) {
          fixtures.push([pots[leftPot][index], pots[rightPot][(index + leftPot + rightPot) % potSize]]);
        }
      }
    }
  }
  return fixtures;
}

function leaguePhase(entrants: QualifiedClub[], definition: Definition, impact: PlayerImpact, random: () => number) {
  const states = new Map(entrants.map((entrant) => [clubKey(entrant.state), blankStanding(entrant)]));
  leagueFixtures(entrants, definition, impact).forEach(([left, right]) => {
    const leftStanding = states.get(clubKey(left.state))!;
    const rightStanding = states.get(clubKey(right.state))!;
    const result = matchResult(left.state, right.state, impact, random);
    leftStanding.played += 1; rightStanding.played += 1;
    leftStanding.goalsFor += result.leftGoals; leftStanding.goalsAgainst += result.rightGoals;
    rightStanding.goalsFor += result.rightGoals; rightStanding.goalsAgainst += result.leftGoals;
    if (result.leftGoals === result.rightGoals) {
      leftStanding.drawn += 1; rightStanding.drawn += 1; leftStanding.points += 1; rightStanding.points += 1;
    } else if (result.leftGoals > result.rightGoals) {
      leftStanding.won += 1; rightStanding.lost += 1; leftStanding.points += 3;
    } else {
      rightStanding.won += 1; leftStanding.lost += 1; rightStanding.points += 3;
    }
  });
  return [...states.values()]
    .map((standing) => ({ ...standing, goalDifference: standing.goalsFor - standing.goalsAgainst }))
    .sort((left, right) => right.points - left.points || right.goalDifference - left.goalDifference || right.goalsFor - left.goalsFor || right.won - left.won);
}

function playRound(round: string, clubs: ClubSeasonState[], impact: PlayerImpact, random: () => number, ties: PlayoffTie[], series = true) {
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

function simulateCompetition(
  definition: Definition,
  entrants: QualifiedClub[],
  qualifyingBrackets: PlayoffBracket[],
  impact: PlayerImpact,
  random: () => number,
): ContinentalCompetition {
  if (entrants.length !== 36) throw new Error(`${definition.name} league phase has ${entrants.length} clubs; expected 36.`);
  const table = leaguePhase(entrants, definition, impact, random);
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
    qualifyingBrackets,
    bracket: { name: `${definition.shortName} knockout phase`, country: "EUROPE", competition: definition.name, ties },
  };
}

export function simulateUefaCompetitions(
  clubs: Record<string, ClubSeasonState>,
  places: readonly EuropeanQualification[],
  impact: PlayerImpact,
  random: () => number = Math.random,
) {
  const qualification = simulateQualifiers(clubs, places, impact, random);
  return UEFA_COMPETITION_DEFINITIONS.map((definition) => simulateCompetition(
    definition,
    qualification.entrants[definition.key],
    qualification.brackets[definition.key],
    impact,
    random,
  ));
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

export function isUefaClub(club: ContinentalClub) {
  return UEFA_SET.has(club.country);
}
