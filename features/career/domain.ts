export type Screen = "home" | "setup" | "career" | "summary" | "trophy-room";
export type Phase = "origin-reveal" | "decision" | "season-result" | "scenario" | "scenario-result";
export type Role = "Prospect" | "Rotation" | "Starter" | "Star";
export type Origin = "academy" | "senior" | "gem";
export type DecisionKind = "first-club" | "continue" | "transfer-interest" | "transfer-request" | "agent-review" | "graduation" | "contract" | "forced-sale" | "released" | "loan-return";

export type Country = { code: string; name: string; flag: string; threshold: number };
export type Club = {
  name: string;
  country: string;
  league: string;
  division?: number;
  level: number;
  development: number;
  identity: string;
  short: string;
  colors: string;
  crest?: string;
};

export type OfferKind = "permanent" | "loan" | "academy" | "stay" | "renewal" | "promotion";
export type ContractTerms = { years: number; weeklyWage: number };
export type Offer = Club & { role: Role; label: string; reason: string; kind: OfferKind; contract?: ContractTerms };
export type HonourKind = "league-title" | "national-cup" | "continental-title" | "golden-boot" | "player-of-season" | "ballon-dor";
export type HonourCategory = "team" | "individual";
export type AwardWinner = { name: string; club: string; isPlayer: boolean; detail?: string };
export type PlayerHonour = {
  id: string;
  kind: HonourKind;
  category: HonourCategory;
  name: string;
  season: string;
  club: string;
  country: string;
  icon: string;
};
export type DivisionHonours = {
  country: string;
  league: string;
  champion: string;
  titleWinners?: CompetitionTitle[];
  topScorer: AwardWinner;
  playerOfSeason: AwardWinner;
};
export type CupHonours = { country: string; name: string; winner: string };
export type CompetitionTitle = { name: string; winner: string };
export type StandingGroup = { name: string; clubs: string[] };
export type PlayoffTie = { round: string; home: string; away: string; winner: string };
export type PlayoffBracket = { name: string; country: string; competition: string; ties: PlayoffTie[] };
export type ContinentalClub = { club: string; country: string; qualifiedVia?: string };
export type EuropeanCompetitionKey = "champions-league" | "europa-league" | "conference-league";
export type EuropeanQualification = ContinentalClub & {
  slotId?: string;
  competition: EuropeanCompetitionKey;
  entryRound: "League phase" | "First qualifying round" | "Second qualifying round" | "Third qualifying round" | "Play-off round";
  path: "Direct" | "Champions path" | "League path" | "Main path";
};
export type ContinentalStanding = ContinentalClub & {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};
export type ContinentalCompetition = {
  key: EuropeanCompetitionKey;
  name: string;
  shortName: string;
  leagueMatches: number;
  entrants: ContinentalClub[];
  table: ContinentalStanding[];
  champion: ContinentalClub;
  qualifyingBrackets: PlayoffBracket[];
  bracket: PlayoffBracket;
};
export type AnnualHonours = {
  season: string;
  league: string;
  champion: string;
  titles?: CompetitionTitle[];
  topScorer: AwardWinner;
  playerOfSeason: AwardWinner;
  cup: { name: string; winner: string };
  additionalCups?: CupHonours[];
  ballonDor: AwardWinner;
  playerHonours: PlayerHonour[];
  divisionRoll?: DivisionHonours[];
  cupRoll?: CupHonours[];
  continentalRoll?: ContinentalCompetition[];
  nextSeasonEuropeanQualification?: EuropeanQualification[];
  movements?: WorldMovement[];
  standingGroups?: StandingGroup[];
  playoffBrackets?: PlayoffBracket[];
};
export type Season = {
  fromAge: number;
  toAge: number;
  club: string;
  country: string;
  league: string;
  role: Role;
  kind: OfferKind;
  apps: number;
  goals: number;
  assists: number;
  before: number;
  after: number;
  trophies: number;
  event: string;
  breakout?: boolean;
  injury?: "minor" | "moderate" | "serious";
  honours?: AnnualHonours[];
};

export type Player = {
  name: string;
  nation: string;
  position: string;
  number: number;
  age: number;
  rating: number;
  potential: number;
  value: number;
  valuationVersion?: 4;
  currentClub: string;
  parentClub: string | null;
  totalApps: number;
  totalGoals: number;
  totalAssists: number;
  trophies: number;
  caps: number;
  nationalGoals: number;
  morale: number;
  fitness: number;
  reputation: number;
  agent: string;
  lastAgentReviewAge?: number;
  roleBoost: number;
  developmentTrend?: number;
  origin: Origin;
  squad: "academy" | "senior";
  contractYears: number;
  weeklyWage: number;
  clubSeasons: number;
  lastRole: Role;
  seenScenarios: string[];
  history: Season[];
};

export type ClubSeasonState = {
  club: string;
  country: string;
  league: string;
  division: number;
  squadQuality: number;
  finances: number;
  reputation: number;
  momentum: number;
  previousFinish: number | null;
  rollingPerformance: number[];
};
export type WorldMovement = {
  club: string;
  country: string;
  fromLeague: string;
  toLeague: string;
  direction: "promoted" | "relegated";
  route: "automatic" | "playoff";
};
export type WorldSeasonRecord = {
  index: number;
  champions: Record<string, CompetitionTitle[]>;
  movements: WorldMovement[];
  continentalChampions?: Partial<Record<ContinentalCompetition["key"], ContinentalClub>>;
  europeanPerformance?: Record<string, number>;
  nextEuropeanQualification?: EuropeanQualification[];
};
export type WorldState = {
  version: 1;
  catalogSeason: string;
  elapsedYears: number;
  clubs: Record<string, ClubSeasonState>;
  history: WorldSeasonRecord[];
};

export type Effect = {
  rating?: number;
  value?: number;
  morale?: number;
  fitness?: number;
  reputation?: number;
  roleBoost?: number;
  development?: number;
  potential?: number;
  agent?: string;
};
export type Outcome = { probability: number; label: string; positive: boolean; effect: Effect };
export type ScenarioOption = { label: string; hint: string; outcomes: Outcome[] };
export type Scenario = {
  id: string;
  icon: string;
  category: string;
  title: string;
  description: string;
  minAge?: number;
  maxAge?: number;
  minRating?: number;
  minReputation?: number;
  maxFitness?: number;
  requiresAbroad?: boolean;
  countryTags?: string[];
  allowedPositions?: string[];
  minClubLevel?: number;
  maxClubLevel?: number;
  minClubSeasons?: number;
  minPreviousFinish?: number;
  maxPreviousFinish?: number;
  maxMorale?: number;
  requiresEuropeanPlace?: boolean;
  requiresFormerClub?: boolean;
  allowedAgents?: string[];
  needsCaps?: boolean;
  options: ScenarioOption[];
};

export type ResolvedOutcome = { label: string; positive: boolean };
export type SavedGame = {
  careerId: string | null;
  screen: Screen;
  phase: Phase;
  player: Player | null;
  offers: Offer[];
  seasonSpan: number;
  lastSeason: Season | null;
  scenarioId: string | null;
  outcome: ResolvedOutcome | null;
  decisionKind: DecisionKind;
  decisionTitle: string;
  decisionDescription: string;
  world: WorldState | null;
};
export type TrophyRoomHonour = PlayerHonour & { careerId: string; playerName: string; count: number };
export type TrophyRoomCareer = {
  id: string;
  playerName: string;
  nation: string;
  finalAge: number;
  finalRating: number;
  clubs: string[];
  honours: TrophyRoomHonour[];
};
export type TrophyRoom = { version: 1; careers: TrophyRoomCareer[] };
export type Motion = { kind: "origin" | "season" | "fate"; title: string; detail: string };

export type CareerDraft = { name: string; nation: string; position: string; number: number };
export type CareerStart = { player: Player; offers: Offer[]; title: string; description: string };
export type CareerDecision = { type: "decision"; kind: DecisionKind; title: string; description: string; offers: Offer[] };
export type CareerBeat = CareerDecision | { type: "scenario"; scenario: Scenario } | { type: "summary" };
export type SeasonSimulation = { player: Player; season: Season; world: WorldState };
export type ScenarioResolution = { player: Player; outcome: ResolvedOutcome };

export const DEFAULT_SAVE: SavedGame = {
  careerId: null,
  screen: "home",
  phase: "origin-reveal",
  player: null,
  offers: [],
  seasonSpan: 1,
  lastSeason: null,
  scenarioId: null,
  outcome: null,
  decisionKind: "first-club",
  decisionTitle: "Choose your first club",
  decisionDescription: "Your route into professional football is about to be drawn.",
  world: null,
};
