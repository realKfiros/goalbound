export type AgentMarket = "none" | "development" | "global" | "veteran";

export type AgentProfile = {
  name: string;
  description: string;
  market: AgentMarket;
  levelRange: number;
  domesticWeight: number;
  homeWeight: number;
  formerClubWeight: number;
  familiarCountryWeight: number;
  foreignWeight: number;
  offerBonus: number;
  interestBonus: number;
};

export type AgentOption = AgentProfile & {
  availabilityReason: string;
};

export const DEVELOPMENT_MARKETS = new Set(["POR", "NED", "BEL", "GER", "FRA", "AUT", "DEN"]);
export const VETERAN_MARKETS = new Set(["USA", "SAU", "JPN", "MEX", "BRA", "ARG", "TUR", "GRE", "CYP"]);

export const AGENT_PROFILES: Record<string, AgentProfile> = {
  "Self-represented": {
    name: "Self-represented",
    description: "Current league, home-country and existing career contacts only.",
    market: "none", levelRange: 1,
    domesticWeight: 6, homeWeight: 5, formerClubWeight: 5, familiarCountryWeight: 3,
    foreignWeight: 0, offerBonus: 0, interestBonus: -.05,
  },
  "Family representative": {
    name: "Family representative",
    description: "Strong homecoming and former-club relationships, with little international reach.",
    market: "none", levelRange: 1,
    domesticWeight: 5, homeWeight: 7, formerClubWeight: 7, familiarCountryWeight: 3,
    foreignWeight: 0, offerBonus: 0, interestBonus: 0,
  },
  "Local specialist": {
    name: "Local specialist",
    description: "Creates more opportunities in your current league and home country.",
    market: "none", levelRange: 1,
    domesticWeight: 8, homeWeight: 6, formerClubWeight: 6, familiarCountryWeight: 4,
    foreignWeight: 0, offerBonus: 1, interestBonus: .04,
  },
  "Development agency": {
    name: "Development agency",
    description: "Places young players in development leagues and stepping-stone markets.",
    market: "development", levelRange: 2,
    domesticWeight: 4, homeWeight: 4, formerClubWeight: 5, familiarCountryWeight: 3,
    foreignWeight: 3, offerBonus: 1, interestBonus: .06,
  },
  "International agent": {
    name: "International agent",
    description: "A broad global network, though a first move abroad still takes convincing.",
    market: "global", levelRange: 2,
    domesticWeight: 4, homeWeight: 4, formerClubWeight: 5, familiarCountryWeight: 3,
    foreignWeight: 2.5, offerBonus: 1, interestBonus: .08,
  },
  "Elite super-agent": {
    name: "Elite super-agent",
    description: "High-level international access for established players with a serious reputation.",
    market: "global", levelRange: 2,
    domesticWeight: 3, homeWeight: 3, formerClubWeight: 4, familiarCountryWeight: 3,
    foreignWeight: 5, offerBonus: 1, interestBonus: .14,
  },
  "Veteran broker": {
    name: "Veteran broker",
    description: "Specialises in homecomings, former clubs and well-paid late-career markets.",
    market: "veteran", levelRange: 2,
    domesticWeight: 4, homeWeight: 7, formerClubWeight: 8, familiarCountryWeight: 5,
    foreignWeight: 4, offerBonus: 1, interestBonus: .08,
  },
  "Optimistic agent": {
    name: "Optimistic agent",
    description: "Claims global reach, but produces fewer and less predictable foreign approaches.",
    market: "global", levelRange: 2,
    domesticWeight: 4, homeWeight: 4, formerClubWeight: 4, familiarCountryWeight: 2,
    foreignWeight: .8, offerBonus: 0, interestBonus: -.01,
  },
};

export function agentProfile(name: string | undefined): AgentProfile {
  return AGENT_PROFILES[name ?? ""] ?? AGENT_PROFILES["Self-represented"];
}

const AGENT_ORDER = [
  "Self-represented",
  "Family representative",
  "Local specialist",
  "Development agency",
  "International agent",
  "Elite super-agent",
  "Veteran broker",
  "Optimistic agent",
] as const;

type AgentCandidate = {
  age: number;
  rating: number;
  reputation: number;
  agent?: string;
  squad?: "academy" | "senior";
  morale?: number;
  contractYears?: number;
};

type AgentSituation = {
  hasClub: boolean;
  isHomeCountry: boolean;
  outgrownClub: boolean;
  declining: boolean;
};

function availabilityReason(name: string, player: AgentCandidate, situation: AgentSituation) {
  if (name === player.agent) return "Your current representative remains available while you decide whether the relationship still fits.";
  if (name === "Self-represented") return "You can always take negotiations back into your own hands.";
  if (name === "Family representative") return player.age <= 23
    ? "Your inner circle offers a low-pressure option while your career is still taking shape."
    : "A familiar voice is willing to rebuild your career around trust and known relationships.";
  if (name === "Local specialist") return situation.isHomeCountry
    ? "Your strongest contacts are still in your home market and current domestic pyramid."
    : "Your performances have created a useful network inside your current league.";
  if (name === "Development agency") return player.squad === "academy"
    ? "You need a clear first-team pathway more than a glamorous client list."
    : "Your age and remaining potential make development-focused moves realistic.";
  if (name === "International agent") return situation.outgrownClub
    ? "Your level is beginning to exceed your present club, so foreign recruitment teams are paying attention."
    : "Your performances and reputation are now strong enough to justify a wider market.";
  if (name === "Elite super-agent") return "Your ability and reputation make you valuable enough for an elite global agency.";
  if (name === "Veteran broker") return situation.declining
    ? "Your career is entering the stage where the right final contract matters more than another speculative move."
    : "Your experience gives a late-career specialist enough leverage to find a tailored move.";
  return (player.morale ?? 100) <= 50
    ? "You look unsettled, and an ambitious agent believes a fresh move can revive the story."
    : "Your uncertain market position attracts an agent willing to promise more than the established firms.";
}

export function availableAgentProfiles(player: AgentCandidate, situation: AgentSituation): AgentOption[] {
  return AGENT_ORDER
    .filter((name) => {
      if (name === player.agent) return true;
      if (name === "Family representative") return player.age <= 23 || player.reputation < 55;
      if (name === "Local specialist") return situation.hasClub && (situation.isHomeCountry || player.reputation < 75);
      if (name === "Development agency") return player.age <= 24 && (player.squad === "academy" || player.rating < 80);
      if (name === "International agent") return situation.outgrownClub || player.rating >= 70 || player.reputation >= 40;
      if (name === "Elite super-agent") return player.rating >= 84 && player.reputation >= 75;
      if (name === "Veteran broker") return player.age >= 29 && (situation.declining || player.rating >= 70);
      if (name === "Optimistic agent") return player.rating < 70 || (player.morale ?? 100) <= 50 || (player.contractYears ?? 3) <= 1;
      return name === "Self-represented";
    })
    .map((name) => ({ ...AGENT_PROFILES[name], availabilityReason: availabilityReason(name, player, situation) }));
}

export function canHireAgent(player: AgentCandidate, situation: AgentSituation, name: string): boolean {
  return availableAgentProfiles(player, situation).some((profile) => profile.name === name);
}
