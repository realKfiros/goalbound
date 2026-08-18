import type { Club, ContractTerms, OfferKind, Player, Role } from "./domain";
import { maxSingleFee, transferMarketTier } from "./finances";
import { careerBallonDorWins, currentMarketValue } from "./valuation";

const ROLE_WAGE_FACTOR: Record<Role, number> = {
  Prospect: .58,
  Rotation: .78,
  Starter: .98,
  Star: 1.14,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function stableNumber(value: string) {
  return [...value].reduce((total, letter) => ((total * 31) + letter.codePointAt(0)!) >>> 0, 11);
}

function roundedWeeklyWage(value: number) {
  const step = value >= 100_000 ? 5_000 : value >= 20_000 ? 1_000 : value >= 5_000 ? 500 : 100;
  return Math.max(step, Math.round(value / step) * step);
}

function offeredYears(club: Club, player: Player, kind: OfferKind) {
  if (kind === "stay") return Math.max(0, player.contractYears);
  if (kind === "academy") return 3 + stableNumber(`${club.name}:${player.name}:academy`) % 2;

  const [minimum, maximum] = player.age <= 21 ? [4, 5]
    : player.age <= 27 ? [3, 5]
      : player.age <= 30 ? [3, 4]
        : player.age <= 33 ? [2, 3]
          : player.age <= 35 ? [1, 2]
            : [1, 1];
  const variation = stableNumber(`${club.country}:${club.name}:${player.name}:${kind}`) % (maximum - minimum + 1);
  const years = minimum + variation;
  return kind === "promotion" ? Math.max(2, player.contractYears, years) : years;
}

function offeredWeeklyWage(club: Club, player: Player, role: Role, kind: OfferKind) {
  const tier = transferMarketTier(club);
  const destinationPremium = club.country === "SAU" ? 2.2 : club.country === "USA" ? 1.35 : 1;
  const wageCapacity = maxSingleFee(club, "Star") * .14 / 52 * destinationPremium;
  const variation = .94 + stableNumber(`${club.name}:${player.name}:${role}`) % 13 / 100;

  if (kind === "academy") {
    return roundedWeeklyWage(Math.min(wageCapacity, 350 + tier * 550 + player.rating * 24));
  }

  const awardPremium = 1 + Math.min(.3, careerBallonDorWins(player) * .06);
  const expected = currentMarketValue(player) * .1 / 52
    * ROLE_WAGE_FACTOR[role]
    * awardPremium
    * destinationPremium
    * variation;
  const tierFloor = ({ 1: 600, 2: 2_000, 3: 7_500, 4: 22_000, 5: 55_000 } as Record<number, number>)[tier];
  const renewalFloor = kind === "renewal" && player.weeklyWage > 0 ? player.weeklyWage * 1.05 : 0;
  return roundedWeeklyWage(clamp(Math.max(expected, tierFloor, renewalFloor), 500, Math.max(500, wageCapacity)));
}

export function contractTermsForOffer(club: Club, player: Player, role: Role, kind: OfferKind): ContractTerms | undefined {
  if (kind === "loan") return undefined;
  if (kind === "stay" && player.contractYears <= 0) return undefined;
  const years = offeredYears(club, player, kind);
  if (years <= 0) return undefined;
  return {
    years,
    weeklyWage: kind === "stay" && player.weeklyWage > 0
      ? player.weeklyWage
      : offeredWeeklyWage(club, player, role, kind),
  };
}
