import type { Player, PlayerHonour, Season } from "./domain";

type ValueProfile = Pick<Player, "rating" | "age" | "potential"> & { history: Season[] };

function uniqueCareerHonours(history: Season[]) {
  const honours = history.flatMap((season) => (season.honours ?? []).flatMap((annual) => annual.playerHonours));
  return [...new Map(honours.map((honour) => [honour.id, honour])).values()];
}

function countHonours(honours: PlayerHonour[], kind: PlayerHonour["kind"]) {
  return honours.filter((honour) => honour.kind === kind).length;
}

export function careerBallonDorWins(player: Pick<Player, "history">) {
  return countHonours(uniqueCareerHonours(player.history), "ballon-dor");
}

export function baseMarketValue(rating: number, age: number, potential: number) {
  const ageFactor = age <= 21 ? 1.2 : age <= 27 ? 1 : age <= 30 ? .82 : age <= 33 ? .55 : .28;
  const potentialFactor = age < 24 ? 1 + Math.max(0, potential - rating) / 35 : 1;
  return Math.round(Math.max(80_000, (rating - 45) ** 3 * 430 * ageFactor * potentialFactor));
}

export function calculatedMarketValue(profile: ValueProfile) {
  const honours = uniqueCareerHonours(profile.history);
  const ballonDorWins = countHonours(honours, "ballon-dor");
  const playerOfSeasonWins = countHonours(honours, "player-of-season");
  const goldenBoots = countHonours(honours, "golden-boot");
  const ballonDorPremium = ballonDorWins ? .65 + Math.max(0, ballonDorWins - 1) * .4 : 0;
  const domesticPremium = Math.min(.25, playerOfSeasonWins * .06 + goldenBoots * .04);
  const prestigeMultiplier = Math.min(3.2, 1 + ballonDorPremium + domesticPremium);
  const value = baseMarketValue(profile.rating, profile.age, profile.potential) * prestigeMultiplier;
  const rounding = value >= 1_000_000 ? 100_000 : 10_000;
  return Math.round(value / rounding) * rounding;
}

export function currentMarketValue(player: Player) {
  if (player.valuationVersion === 3) return player.value;
  // Only decorated old saves need migration; preserve deliberately low legacy values for everyone else.
  const honours = uniqueCareerHonours(player.history);
  const hasPrestigeAward = honours.some((honour) =>
    ["ballon-dor", "player-of-season", "golden-boot"].includes(honour.kind));
  return hasPrestigeAward ? Math.max(player.value, calculatedMarketValue(player)) : player.value;
}
