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
