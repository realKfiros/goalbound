import type { EuropeanCompetitionKey, EuropeanQualification } from "./domain";

export const UEFA_ACCESS_SEASON = "2026/27";

/** Official 2026/27 access order, including suspended Russia and cup-only Liechtenstein. */
export const UEFA_ASSOCIATION_RANKING = [
  "ENG", "ITA", "ESP", "GER", "FRA", "NED", "POR", "BEL", "CZE", "TUR",
  "NOR", "GRE", "AUT", "SCO", "POL", "DEN", "SUI", "ISR", "CYP", "SWE",
  "CRO", "SRB", "UKR", "HUN", "ROU", "RUS", "SVK", "SVN", "BUL", "AZE",
  "IRL", "MDA", "ISL", "BIH", "ARM", "LVA", "KOS", "FIN", "KAZ", "FRO",
  "MLT", "NIR", "LTU", "LIE", "EST", "ALB", "MNE", "LUX", "WAL", "GEO",
  "MKD", "BLR", "AND", "GIB", "SMR",
] as const;

export const UEFA_ASSOCIATIONS = UEFA_ASSOCIATION_RANKING.filter((country) => country !== "RUS");

export const NATIONAL_CUP_NAMES: Record<string, string> = {
  ENG: "FA Cup", ITA: "Coppa Italia", ESP: "Copa del Rey", GER: "DFB-Pokal", FRA: "Coupe de France",
  NED: "KNVB Cup", POR: "Taça de Portugal", BEL: "Belgian Cup", CZE: "Czech Cup", TUR: "Turkish Cup",
  NOR: "Norwegian Cup", GRE: "Greek Cup", AUT: "ÖFB Cup", SCO: "Scottish Cup", POL: "Polish Cup",
  DEN: "Danish Cup", SUI: "Swiss Cup", ISR: "State Cup", CYP: "Cypriot Cup", SWE: "Svenska Cupen",
  CRO: "Croatian Cup", SRB: "Serbian Cup", UKR: "Ukrainian Cup", HUN: "Magyar Kupa", ROU: "Cupa României",
  SVK: "Slovak Cup", SVN: "Slovenian Cup", BUL: "Bulgarian Cup", AZE: "Azerbaijan Cup", IRL: "FAI Cup",
  MDA: "Moldovan Cup", ISL: "Icelandic Cup", BIH: "Bosnia and Herzegovina Cup", ARM: "Armenian Cup",
  LVA: "Latvian Cup", KOS: "Kosovar Cup", FIN: "Finnish Cup", KAZ: "Kazakhstan Cup", FRO: "Faroe Islands Cup",
  MLT: "Maltese FA Trophy", NIR: "Irish Cup", LTU: "Lithuanian Cup", LIE: "Liechtenstein Cup",
  EST: "Estonian Cup", ALB: "Albanian Cup", MNE: "Montenegrin Cup", LUX: "Luxembourg Cup", WAL: "Welsh Cup",
  GEO: "Georgian Cup", MKD: "Macedonian Cup", BLR: "Belarusian Cup", AND: "Copa Constitució",
  GIB: "Rock Cup", SMR: "Coppa Titano",
};

export type AccessSource =
  | { kind: "table"; position: number }
  | { kind: "next" }
  | { kind: "cup" }
  | { kind: "league-cup"; name: string }
  | { kind: "virtual"; club: string };

export type AccessRoute = {
  slotId: string;
  association: string;
  competition: EuropeanCompetitionKey;
  entryRound: EuropeanQualification["entryRound"];
  path: EuropeanQualification["path"];
  source: AccessSource;
  qualifiedVia: string;
};

const ROUND = {
  league: "League phase",
  first: "First qualifying round",
  second: "Second qualifying round",
  third: "Third qualifying round",
  playoff: "Play-off round",
} as const;

function countryAt(rank: number) {
  return UEFA_ASSOCIATION_RANKING[rank - 1];
}

function countries(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => countryAt(from + index))
    .filter((country) => country !== "RUS");
}

function route(
  slotId: string,
  association: string,
  competition: EuropeanCompetitionKey,
  entryRound: AccessRoute["entryRound"],
  path: AccessRoute["path"],
  source: AccessSource,
  qualifiedVia: string,
): AccessRoute {
  return { slotId, association, competition, entryRound, path, source, qualifiedVia };
}

function tableRoute(
  association: string,
  position: number,
  entryRound: AccessRoute["entryRound"],
  path: AccessRoute["path"],
) {
  const number = position + 1;
  const suffix = number === 1 ? "st" : number === 2 ? "nd" : number === 3 ? "rd" : "th";
  return route(`${association}:N${number}:UCL`, association, "champions-league", entryRound, path, { kind: "table", position },
    position === 0 ? "Domestic champion" : `League position · ${number}${suffix}`);
}

function nextRoute(
  association: string,
  sourceId: string,
  competition: EuropeanCompetitionKey,
  entryRound: AccessRoute["entryRound"],
  path: AccessRoute["path"],
  qualifiedVia: string,
) {
  return route(`${association}:${sourceId}:${competition}`, association, competition, entryRound, path, { kind: "next" }, qualifiedVia);
}

function cupRoute(
  association: string,
  competition: EuropeanCompetitionKey,
  entryRound: AccessRoute["entryRound"],
  path: AccessRoute["path"],
) {
  return route(`${association}:CW:${competition}`, association, competition, entryRound, path, { kind: "cup" }, `${NATIONAL_CUP_NAMES[association] ?? "National cup"} winner`);
}

function championsLeagueRoutes() {
  const direct: AccessRoute[] = [];
  countries(1, 4).forEach((association) => {
    for (let position = 0; position < 4; position += 1) direct.push(tableRoute(association, position, ROUND.league, "Direct"));
  });
  for (let position = 0; position < 3; position += 1) direct.push(tableRoute(countryAt(5), position, ROUND.league, "Direct"));
  for (let position = 0; position < 2; position += 1) direct.push(tableRoute(countryAt(6), position, ROUND.league, "Direct"));
  countries(7, 10).forEach((association) => direct.push(tableRoute(association, 0, ROUND.league, "Direct")));

  const championsPlayoff = countries(11, 14).map((association) => tableRoute(association, 0, ROUND.playoff, "Champions path"));
  const championsSecond = countries(15, 23)
    .map((association) => tableRoute(association, 0, ROUND.second, "Champions path"));
  const championsFirst = [
    ...countries(24, 25),
    ...countries(27, 43),
    ...countries(45, 55),
  ].map((association) => tableRoute(association, 0, ROUND.first, "Champions path"));
  const leagueThird = [
    tableRoute(countryAt(5), 3, ROUND.third, "League path"),
    tableRoute(countryAt(6), 2, ROUND.third, "League path"),
    ...countries(7, 9).map((association) => tableRoute(association, 1, ROUND.third, "League path")),
  ];
  const leagueSecond = countries(10, 15)
    .map((association) => tableRoute(association, 1, ROUND.second, "League path"));

  return { direct, championsPlayoff, championsSecond, championsFirst, leagueThird, leagueSecond };
}

function europaLeagueRoutes() {
  const direct: AccessRoute[] = [];
  countries(1, 5).forEach((association) => {
    direct.push(nextRoute(association, "LQ1", "europa-league", ROUND.league, "Direct", "League position · Europa League"));
    direct.push(cupRoute(association, "europa-league", ROUND.league, "Direct"));
  });
  countries(6, 7).forEach((association) => direct.push(cupRoute(association, "europa-league", ROUND.league, "Direct")));
  const playoff = countries(8, 12)
    .map((association) => cupRoute(association, "europa-league", ROUND.playoff, "Main path"));
  const third = countries(13, 15)
    .map((association) => cupRoute(association, "europa-league", ROUND.third, "Main path"));
  const second = countries(6, 12)
    .map((association) => nextRoute(association, "LQ1", "europa-league", ROUND.second, "Main path", "League position · Europa League"));
  second.push(cupRoute(countryAt(16), "europa-league", ROUND.second, "Main path"));
  const first = [...countries(17, 25), ...countries(27, 33)]
    .map((association) => cupRoute(association, "europa-league", ROUND.first, "Main path"));
  return { direct, playoff, third, second, first };
}

function conferenceLeagueRoutes() {
  const playoff = countries(1, 5).map((association) => association === "ENG"
    ? route("ENG:EFL_CUP:conference-league", "ENG", "conference-league", ROUND.playoff, "Main path", { kind: "league-cup", name: "EFL Cup" }, "EFL Cup winner")
    : nextRoute(association, "LQ2", "conference-league", ROUND.playoff, "Main path", "League position · Conference League"));
  const second: AccessRoute[] = [];
  const first: AccessRoute[] = [];

  countries(6, 12).forEach((association) => second.push(nextRoute(association, "LQ2", "conference-league", ROUND.second, "Main path", "League position · Conference League")));
  countries(13, 29).forEach((association) => {
    second.push(nextRoute(association, "LQ1", "conference-league", ROUND.second, "Main path", "League position · Conference League"));
    second.push(nextRoute(association, "LQ2", "conference-league", ROUND.second, "Main path", "League position · Conference League"));
  });
  countries(30, 33).forEach((association) => {
    second.push(nextRoute(association, "LQ1", "conference-league", ROUND.second, "Main path", "League position · Conference League"));
    first.push(nextRoute(association, "LQ2", "conference-league", ROUND.first, "Main path", "League position · Conference League"));
  });
  countries(34, 43).forEach((association) => {
    second.push(cupRoute(association, "conference-league", ROUND.second, "Main path"));
    first.push(nextRoute(association, "LQ1", "conference-league", ROUND.first, "Main path", "League position · Conference League"));
    first.push(nextRoute(association, "LQ2", "conference-league", ROUND.first, "Main path", "League position · Conference League"));
  });
  second.push(route("LIE:CW:conference-league", "LIE", "conference-league", ROUND.second, "Main path", { kind: "virtual", club: "FC Vaduz" }, "Liechtenstein Cup winner"));
  countries(45, 50).forEach((association) => {
    first.push(cupRoute(association, "conference-league", ROUND.first, "Main path"));
    first.push(nextRoute(association, "LQ1", "conference-league", ROUND.first, "Main path", "League position · Conference League"));
    first.push(nextRoute(association, "LQ2", "conference-league", ROUND.first, "Main path", "League position · Conference League"));
  });
  countries(51, 55).forEach((association) => {
    first.push(cupRoute(association, "conference-league", ROUND.first, "Main path"));
    first.push(nextRoute(association, "LQ1", "conference-league", ROUND.first, "Main path", "League position · Conference League"));
  });

  return { playoff, second, first };
}

export const UEFA_ACCESS_LIST_2026_27 = {
  season: UEFA_ACCESS_SEASON,
  ranking: UEFA_ASSOCIATION_RANKING,
  suspendedAssociations: ["RUS"] as const,
  championsLeague: championsLeagueRoutes(),
  europaLeague: {
    ...europaLeagueRoutes(),
  },
  conferenceLeague: conferenceLeagueRoutes(),
} as const;
