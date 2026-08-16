import { CATALOG_SEASON, COMPLETE_LEAGUES } from "./leagueCatalog";

export type TitleStructure = "table" | "split-table" | "playoff" | "short-season-playoff";
export type MovementStatus = "loaded" | "closed" | "pyramid-missing" | "season-gated";

export type CompetitionFormat = {
  key: string;
  country: string;
  league: string;
  division: number;
  season: string;
  titleStructure: TitleStructure;
  titleNames: string[];
  movement: MovementStatus;
  note?: string;
};

export type PyramidBoundary = {
  country: string;
  upperDivision: number;
  lowerDivision: number;
  automaticPromotions: number;
  playoffPromotion: { from: number; to: number } | null;
  boundaryPlayoff: boolean;
  ineligiblePrefixes?: string[];
};

export const PYRAMID_BOUNDARIES: readonly PyramidBoundary[] = [
  { country: "ENG", upperDivision: 1, lowerDivision: 2, automaticPromotions: 2, playoffPromotion: { from: 3, to: 6 }, boundaryPlayoff: false },
  { country: "ENG", upperDivision: 2, lowerDivision: 3, automaticPromotions: 2, playoffPromotion: { from: 3, to: 6 }, boundaryPlayoff: false },
  { country: "ENG", upperDivision: 3, lowerDivision: 4, automaticPromotions: 3, playoffPromotion: { from: 4, to: 7 }, boundaryPlayoff: false },
  { country: "ENG", upperDivision: 4, lowerDivision: 5, automaticPromotions: 1, playoffPromotion: { from: 2, to: 7 }, boundaryPlayoff: false },
  { country: "ESP", upperDivision: 1, lowerDivision: 2, automaticPromotions: 2, playoffPromotion: { from: 3, to: 6 }, boundaryPlayoff: false },
  { country: "GER", upperDivision: 1, lowerDivision: 2, automaticPromotions: 2, playoffPromotion: null, boundaryPlayoff: true },
  { country: "ITA", upperDivision: 1, lowerDivision: 2, automaticPromotions: 2, playoffPromotion: { from: 3, to: 8 }, boundaryPlayoff: false },
  { country: "POR", upperDivision: 1, lowerDivision: 2, automaticPromotions: 2, playoffPromotion: null, boundaryPlayoff: true },
  { country: "NED", upperDivision: 1, lowerDivision: 2, automaticPromotions: 2, playoffPromotion: null, boundaryPlayoff: true, ineligiblePrefixes: ["Jong "] },
] as const;

const TITLE_OVERRIDES: Record<string, Pick<CompetitionFormat, "titleStructure" | "titleNames" | "note">> = {
  "ISR:Israeli Premier League": { titleStructure: "split-table", titleNames: ["Champion"], note: "Top-six championship group after the regular phase." },
  "CYP:Cypriot First Division": { titleStructure: "split-table", titleNames: ["Champion"], note: "Top-six championship group after the regular phase." },
  "SCO:Scottish Premiership": { titleStructure: "split-table", titleNames: ["Champion"], note: "Top-six title group with points carried forward." },
  "GRE:Super League Greece": { titleStructure: "split-table", titleNames: ["Champion"], note: "The top-four group resolves the title." },
  "AUT:Austrian Bundesliga": { titleStructure: "split-table", titleNames: ["Champion"], note: "A 22-round regular phase is followed by championship and qualification groups." },
  "CZE:Czech First League": { titleStructure: "split-table", titleNames: ["Champion"], note: "The regular table splits into championship, middle and relegation groups." },
  "DEN:Danish Superliga": { titleStructure: "split-table", titleNames: ["Champion"], note: "The top six enter a championship group after the regular phase." },
  "SUI:Swiss Super League": { titleStructure: "split-table", titleNames: ["Champion"], note: "The table splits into championship and relegation groups after 33 rounds." },
  "SRB:Serbian SuperLiga": { titleStructure: "split-table", titleNames: ["Champion"], note: "After 26 rounds, the top six play for the title and the bottom eight play out relegation." },
  "ROU:Romanian SuperLiga": { titleStructure: "split-table", titleNames: ["Champion"], note: "The top six contest the championship play-off after the regular phase." },
  "USA:Major League Soccer": { titleStructure: "playoff", titleNames: ["MLS Cup"], note: "Conference qualification, Wild Card, best-of-three first round and knockout cup." },
  "ARG:Liga Profesional": { titleStructure: "short-season-playoff", titleNames: ["Apertura", "Clausura"], note: "Two zonal league phases followed by knockout titles." },
  "MEX:Liga MX": { titleStructure: "short-season-playoff", titleNames: ["Apertura", "Clausura"], note: "Two regular phases followed by Play-In and Liguilla." },
};

function movementStatus(country: string, division: number): MovementStatus {
  if (country === "USA") return "closed";
  if (country === "MEX") return "season-gated";
  return PYRAMID_BOUNDARIES.some((boundary) => boundary.country === country &&
    (boundary.upperDivision === division || boundary.lowerDivision === division))
    ? "loaded"
    : "pyramid-missing";
}

export const COMPETITION_FORMATS: readonly CompetitionFormat[] = COMPLETE_LEAGUES.map((competition) => {
  const key = `${competition.country}:${competition.league}`;
  const override = TITLE_OVERRIDES[key];
  return {
    key,
    country: competition.country,
    league: competition.league,
    division: competition.division,
    season: CATALOG_SEASON,
    titleStructure: override?.titleStructure ?? "table",
    titleNames: override?.titleNames ?? ["Champion"],
    movement: movementStatus(competition.country, competition.division),
    note: override?.note,
  };
});

const formatsByKey = new Map(COMPETITION_FORMATS.map((format) => [format.key, format]));

export function competitionFormat(country: string, league: string) {
  return formatsByKey.get(`${country}:${league}`);
}
