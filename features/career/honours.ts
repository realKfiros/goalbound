import { clubByName, country } from "./catalog";
import { exceptionalPlayerBoost } from "./competitionStrength";
import { clubDivision } from "./finances";
import { generateName } from "./names";
import { continentalClubStrength } from "./uefaSeason";
import { clubSeasonState, createWorldState, simulateWorldSeason } from "./world";
import type { AnnualHonours, AwardWinner, ContinentalCompetition, DivisionHonours, Offer, Player, PlayerHonour, WorldState } from "./domain";

export type HonoursInput = {
  player: Player;
  offer: Offer;
  years: number;
  apps: number;
  goals: number;
  assists: number;
  rating: number;
  reputation: number;
};

export type HonoursSimulation = { honours: AnnualHonours[]; world: WorldState };

const CUP_NAMES: Record<string, string> = {
  ENG: "FA Cup", ESP: "Copa del Rey", GER: "DFB-Pokal", ITA: "Coppa Italia",
  FRA: "Coupe de France", POR: "Taça de Portugal", NED: "KNVB Cup",
  ISR: "State Cup", POL: "Polish Cup", CYP: "Cypriot Cup",
  BRA: "Copa do Brasil", ARG: "Copa Argentina", USA: "U.S. Open Cup",
  BEL: "Belgian Cup", SCO: "Scottish Cup", TUR: "Turkish Cup", CRO: "Croatian Cup",
  GRE: "Greek Cup", SAU: "King's Cup", JPN: "Emperor's Cup", MEX: "Copa MX",
  AUT: "ÖFB Cup", CZE: "Czech Cup", DEN: "Danish Cup", SUI: "Swiss Cup",
  NOR: "Norwegian Cup", SWE: "Svenska Cupen", UKR: "Ukrainian Cup",
  SRB: "Serbian Cup", ROU: "Cupa României", HUN: "Magyar Kupa",
};
function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function weightedPick<T>(items: T[], weight: (item: T, index: number) => number, random: () => number): T | undefined {
  const weighted = items.map((item, index) => ({ item, weight: Math.max(0, weight(item, index)) }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (!total) return items[0];
  let cursor = random() * total;
  return weighted.find((entry) => { cursor -= entry.weight; return cursor <= 0; })?.item ?? weighted.at(-1)?.item;
}
function fictionalWinner(club: string, countryCode: string, random: () => number, detail?: string): AwardWinner {
  return {
    name: generateName(countryCode, random),
    club,
    isPlayer: false,
    detail,
  };
}

export function nationalCupName(countryCode: string) {
  return CUP_NAMES[countryCode] ?? `${country(countryCode).name} Cup`;
}
function playerHonour(
  input: HonoursInput,
  season: string,
  kind: PlayerHonour["kind"],
  category: PlayerHonour["category"],
  name: string,
  icon: string,
): PlayerHonour {
  return {
    id: `${season}:${kind}:${input.offer.name}:${name}`,
    kind, category, name, season, club: input.offer.name, country: input.offer.country, icon,
  };
}
function yearlyStats(total: number, years: number, index: number, random: () => number) {
  const average = total / Math.max(1, years);
  const variance = years === 1 ? 0 : (random() - .5) * Math.max(2, average * .28);
  return Math.max(0, Math.round(average + variance + (index === years - 1 ? average * .05 : 0)));
}

function domesticAwardClub(table: string[], award: "scorer" | "player", random: () => number) {
  const credibleField = table.slice(0, Math.max(1, Math.ceil(table.length * (award === "player" ? .45 : .7))));
  return weightedPick(credibleField, (_club, index) => award === "player"
    ? Math.exp(-index / 2.8)
    : Math.exp(-index / 5.5), random) ?? table[0];
}

function continentalProgress(competition: ContinentalCompetition, club: string) {
  if (competition.champion.club === club) return 20;
  const wonRounds = competition.bracket.ties.filter((tie) => tie.winner === club).map((tie) => tie.round);
  if (wonRounds.includes("Semi-final")) return 14;
  if (wonRounds.includes("Quarter-final")) return 10;
  if (wonRounds.includes("Round of 16")) return 7;
  if (wonRounds.includes("Knockout phase play-off")) return 4;
  const index = competition.table.findIndex((standing) => standing.club === club);
  return index >= 0 && index < 8 ? 5 : index >= 0 && index < 24 ? 2 : 0;
}

function fictionalBallonDor(
  competitions: ContinentalCompetition[],
  domestic: { country: string; table: string[] }[],
  world: WorldState,
  random: () => number,
) {
  const domesticFinish = new Map(domestic.flatMap((competition) =>
    competition.table.map((club, index) => [`${competition.country}:${club}`, index] as const)));
  const candidates = competitions.flatMap((competition) => competition.table.slice(0, competition.key === "champions-league" ? 24 : 8)
    .map((standing) => {
      const state = clubSeasonState(world, standing.club, standing.country);
      const strength = state ? continentalClubStrength(state) : 45;
      const progress = continentalProgress(competition, standing.club);
      const finish = domesticFinish.get(`${standing.country}:${standing.club}`) ?? 20;
      const competitionWeight = competition.key === "champions-league" ? 10 : competition.key === "europa-league" ? 4 : 1;
      return {
        club: standing.club,
        country: standing.country,
        score: strength * .55 + progress + competitionWeight + (finish === 0 ? 7 : finish < 4 ? 3 : 0) + random() * 8,
        detail: progress === 20 ? `${competition.name} winner` : progress >= 10 ? `Deep ${competition.shortName} run` : "Elite European season",
      };
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 30);
  const winner = weightedPick(candidates, (candidate) => Math.exp((candidate.score - (candidates[0]?.score ?? 0)) / 3.2), random)
    ?? { club: "Unknown", country: "ENG", score: 70, detail: "Outstanding season" };
  return { winner: fictionalWinner(winner.club, winner.country, random, winner.detail), score: winner.score };
}

export function simulateHonoursWithWorld(
  input: HonoursInput,
  existingWorld: WorldState | null | undefined,
  random: () => number = Math.random,
): HonoursSimulation {
  const activeClub = clubByName(input.offer.name);
  const seniorEligible = input.offer.kind !== "academy";
  let world = existingWorld ?? createWorldState();
  const honours: AnnualHonours[] = [];

  for (let index = 0; index < input.years; index += 1) {
    const fromAge = input.player.age + index;
    const season = `Age ${fromAge}–${fromAge + 1}`;
    const goals = yearlyStats(input.goals, input.years, index, random);
    const assists = yearlyStats(input.assists, input.years, index, random);
    const apps = yearlyStats(input.apps, input.years, index, random);
    const playerImpact = seniorEligible
      ? exceptionalPlayerBoost({ rating: input.rating, apps, goals, assists, reputation: input.reputation })
      : 0;
    const membership = clubSeasonState(world, input.offer.name, input.offer.country);
    const division = membership?.division ?? (activeClub ? clubDivision(activeClub) : input.offer.division ?? 1);
    const league = membership?.league ?? activeClub?.league ?? input.offer.league;
    const simulated = simulateWorldSeason(world, { club: input.offer.name, boost: playerImpact }, random);
    world = simulated.world;
    const activeCompetition = simulated.competitions.find((competition) =>
      competition.country === input.offer.country && competition.division === division && competition.league === league,
    );
    const titleWinners = activeCompetition?.titles ?? [{ name: "Champion", winner: input.offer.name }];
    const champion = titleWinners[0].winner;
    const wonLeagueTitles = titleWinners.filter((title) => title.winner === input.offer.name);
    const cupWinner = simulated.cupWinners[input.offer.country] ?? input.offer.name;
    const additionalCups = simulated.additionalCups.filter((cup) => cup.country === input.offer.country);
    const wonAdditionalCups = additionalCups.filter((cup) => cup.winner === input.offer.name);
    const continentalTitles = simulated.continentalCompetitions.filter((competition) =>
      competition.champion.club === input.offer.name && competition.champion.country === input.offer.country,
    );
    const divisionClubNames = activeCompetition?.table ?? [input.offer.name];
    const rivalScorerClub = domesticAwardClub(divisionClubNames.filter((name) => name !== input.offer.name), "scorer", random) ?? input.offer.name;
    const rivalPlayerClub = domesticAwardClub(divisionClubNames.filter((name) => name !== input.offer.name), "player", random) ?? input.offer.name;
    const rivalGoals = randomInt(random, 16, 30);
    const winsGoldenBoot = seniorEligible && apps >= 16 && goals >= rivalGoals;
    const topScorer = winsGoldenBoot
      ? { name: input.player.name, club: input.offer.name, isPlayer: true, detail: `${goals} goals` }
      : fictionalWinner(rivalScorerClub, input.offer.country, random, `${rivalGoals} goals`);
    const activeFinish = Math.max(0, activeCompetition?.table.indexOf(input.offer.name) ?? 10);
    const overPerformance = activeClub ? Math.max(0, 4 - activeClub.level) * Math.max(0, 8 - activeFinish) * .35 : 0;
    const playerSeasonScore = input.rating + goals * 1.25 + assists * .7 + Math.min(8, apps / 5) + overPerformance;
    const winsPlayerOfSeason = seniorEligible && apps >= 20 && playerSeasonScore >= randomInt(random, 104, 122);
    const playerOfSeason = winsPlayerOfSeason
      ? { name: input.player.name, club: input.offer.name, isPlayer: true }
      : fictionalWinner(rivalPlayerClub, input.offer.country, random);
    const fictionalGlobalWinner = fictionalBallonDor(simulated.continentalCompetitions, simulated.competitions, world, random);
    const currentEuropeanCompetition = simulated.continentalCompetitions.find((competition) =>
      competition.entrants.some((entrant) => entrant.club === input.offer.name && entrant.country === input.offer.country));
    const europeanProgress = currentEuropeanCompetition ? continentalProgress(currentEuropeanCompetition, input.offer.name) : 0;
    const activeState = clubSeasonState(world, input.offer.name, input.offer.country);
    const contextStrength = activeState ? continentalClubStrength(activeState) : 35;
    const ballonScore = input.rating * .55 + Math.min(45, goals) * .35 + Math.min(20, assists) * .2 + Math.min(4, apps / 8) +
      europeanProgress + (activeFinish === 0 ? 7 : activeFinish < 4 ? 3 : 0) +
      (cupWinner === input.offer.name || wonAdditionalCups.length ? 3 : 0) + input.reputation * .05;
    const hasGlobalEvidence = currentEuropeanCompetition?.key === "champions-league" && europeanProgress >= 2
      || europeanProgress >= 10
      || contextStrength >= 78 && input.rating >= 91 && goals + assists >= 38;
    const winsBallonDor = seniorEligible && input.rating >= 86 && apps >= 24 && hasGlobalEvidence
      && ballonScore + random() * 5 >= fictionalGlobalWinner.score;
    const ballonDor = winsBallonDor
      ? { name: input.player.name, club: input.offer.name, isPlayer: true, detail: `Season dossier ${Math.round(ballonScore)}` }
      : fictionalGlobalWinner.winner;
    const cupTitle = nationalCupName(input.offer.country);
    const playerHonours: PlayerHonour[] = [];

    if (seniorEligible) wonLeagueTitles.forEach((title) => {
      const name = title.name === "Champion" ? `${league} champion` : `${league} ${title.name} champion`;
      playerHonours.push(playerHonour(input, season, "league-title", "team", name, "🏆"));
    });
    if (seniorEligible && cupWinner === input.offer.name) playerHonours.push(playerHonour(input, season, "national-cup", "team", `${cupTitle} winner`, "🏆"));
    if (seniorEligible) wonAdditionalCups.forEach((cup) => {
      playerHonours.push(playerHonour(input, season, "national-cup", "team", `${cup.name} winner`, "🏆"));
    });
    if (seniorEligible) continentalTitles.forEach((competition) => {
      playerHonours.push(playerHonour(input, season, "continental-title", "team", `${competition.name} winner`, "🏆"));
    });
    if (winsGoldenBoot) playerHonours.push(playerHonour(input, season, "golden-boot", "individual", `${league} Golden Boot`, "👟"));
    if (winsPlayerOfSeason) playerHonours.push(playerHonour(input, season, "player-of-season", "individual", `${league} Player of the Season`, "⭐"));
    if (winsBallonDor) playerHonours.push(playerHonour(input, season, "ballon-dor", "individual", "Ballon d'Or", "◉"));

    const activeDivisionKey = `${input.offer.country}:${league}`;
    const divisionRoll: DivisionHonours[] = simulated.competitions.map((competition) => {
        if (competition.key === activeDivisionKey) return { country: input.offer.country, league, champion, titleWinners, topScorer, playerOfSeason };
        const winningClub = competition.titles[0]?.winner ?? competition.table[0];
        const scorerClub = domesticAwardClub(competition.table, "scorer", random) ?? winningClub;
        const awardClub = domesticAwardClub(competition.table, "player", random) ?? winningClub;
        return {
          country: competition.country,
          league: competition.league,
          champion: winningClub,
          titleWinners: competition.titles,
          topScorer: fictionalWinner(scorerClub, competition.country, random, `${randomInt(random, 14, 31)} goals`),
          playerOfSeason: fictionalWinner(awardClub, competition.country, random),
        };
      });
    const cupRoll = Object.entries(simulated.cupWinners).map(([countryCode, winner]) => ({
      country: countryCode,
      name: nationalCupName(countryCode),
      winner,
    })).concat(simulated.additionalCups);

    honours.push({
      season, league, champion, titles: titleWinners, topScorer, playerOfSeason,
      cup: { name: cupTitle, winner: cupWinner }, additionalCups, ballonDor, playerHonours,
      divisionRoll, cupRoll, continentalRoll: simulated.continentalCompetitions, movements: simulated.movements,
      nextSeasonEuropeanQualification: simulated.nextSeasonEuropeanQualification,
      standingGroups: activeCompetition?.standings,
      playoffBrackets: simulated.playoffBrackets.filter((bracket) => bracket.country === input.offer.country),
    });
  }
  return { honours, world };
}

export function simulateHonours(input: HonoursInput, random: () => number = Math.random): AnnualHonours[] {
  return simulateHonoursWithWorld(input, null, random).honours;
}
