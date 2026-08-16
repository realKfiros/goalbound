export type Screen = "home" | "setup" | "career" | "summary";
export type Phase = "origin-reveal" | "decision" | "season-result" | "scenario" | "scenario-result";
export type Role = "Prospect" | "Rotation" | "Starter" | "Star";
export type Origin = "academy" | "senior" | "gem";
export type DecisionKind = "first-club" | "continue" | "transfer-interest" | "graduation" | "contract" | "forced-sale" | "released" | "loan-return";

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
export type Offer = Club & { role: Role; label: string; reason: string; kind: OfferKind };
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
  roleBoost: number;
  origin: Origin;
  squad: "academy" | "senior";
  contractYears: number;
  clubSeasons: number;
  lastRole: Role;
  seenScenarios: string[];
  history: Season[];
};

export type Effect = {
  rating?: number;
  value?: number;
  morale?: number;
  fitness?: number;
  reputation?: number;
  roleBoost?: number;
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
  needsCaps?: boolean;
  options: ScenarioOption[];
};

export type ResolvedOutcome = { label: string; positive: boolean };
export type SavedGame = {
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
};
export type Motion = { kind: "origin" | "season" | "fate"; title: string; detail: string };

export type CareerDraft = { name: string; nation: string; position: string; number: number };
export type CareerStart = { player: Player; offers: Offer[]; title: string; description: string };
export type CareerDecision = { type: "decision"; kind: DecisionKind; title: string; description: string; offers: Offer[] };
export type CareerBeat = CareerDecision | { type: "scenario"; scenario: Scenario } | { type: "summary" };
export type SeasonSimulation = { player: Player; season: Season };
export type ScenarioResolution = { player: Player; outcome: ResolvedOutcome };

export const DEFAULT_SAVE: SavedGame = {
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
};
