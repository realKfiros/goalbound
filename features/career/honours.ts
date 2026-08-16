import { CLUBS, clubByName, country } from "./catalog";
import { competitionStrength, exceptionalPlayerBoost, pickCompetitionWinner } from "./competitionStrength";
import { clubDivision } from "./finances";
import type { AnnualHonours, AwardWinner, Club, DivisionHonours, Offer, Player, PlayerHonour } from "./domain";

type HonoursInput = {
  player: Player;
  offer: Offer;
  years: number;
  apps: number;
  goals: number;
  assists: number;
  rating: number;
  reputation: number;
};

const CUP_NAMES: Record<string, string> = {
  ENG: "FA Cup", ESP: "Copa del Rey", GER: "DFB-Pokal", ITA: "Coppa Italia",
  FRA: "Coupe de France", POR: "Taça de Portugal", NED: "KNVB Cup",
  ISR: "State Cup", POL: "Polish Cup", CYP: "Cypriot Cup",
  BRA: "Copa do Brasil", ARG: "Copa Argentina", USA: "U.S. Open Cup",
  BEL: "Belgian Cup", SCO: "Scottish Cup", TUR: "Turkish Cup", CRO: "Croatian Cup",
  GRE: "Greek Cup", SAU: "King's Cup", JPN: "Emperor's Cup", MEX: "Copa MX",
};
const FIRST_NAMES = ["Mateo", "Jamal", "Luka", "Noah", "Rafael", "Elias", "Milan", "Thiago", "Omar", "Leo"];
const LAST_NAMES = ["Costa", "Diallo", "Novak", "Silva", "Moretti", "Santos", "Bakayoko", "Ibrahim", "Kovač", "Martin"];

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function pick<T>(items: T[], random: () => number): T | undefined {
  return items[Math.floor(random() * items.length)];
}
function fictionalWinner(club: string, random: () => number, detail?: string): AwardWinner {
  return {
    name: `${pick(FIRST_NAMES, random) ?? "Alex"} ${pick(LAST_NAMES, random) ?? "Martin"}`,
    club,
    isPlayer: false,
    detail,
  };
}

function groupedClubs(keyFor: (club: Club) => string) {
  const groups = new Map<string, Club[]>();
  CLUBS.forEach((club) => groups.set(keyFor(club), [...(groups.get(keyFor(club)) ?? []), club]));
  return [...groups.entries()];
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
    id: `${season}:${kind}:${input.offer.name}`,
    kind, category, name, season, club: input.offer.name, country: input.offer.country, icon,
  };
}
function yearlyStats(total: number, years: number, index: number, random: () => number) {
  const average = total / Math.max(1, years);
  const variance = years === 1 ? 0 : (random() - .5) * Math.max(2, average * .28);
  return Math.max(0, Math.round(average + variance + (index === years - 1 ? average * .05 : 0)));
}

export function simulateHonours(input: HonoursInput, random: () => number = Math.random): AnnualHonours[] {
  const activeClub = clubByName(input.offer.name);
  const division = activeClub ? clubDivision(activeClub) : input.offer.division ?? 1;
  const league = activeClub?.league ?? input.offer.league;
  const divisionClubs = CLUBS.filter((club) => club.country === input.offer.country && clubDivision(club) === division);
  const countryClubs = CLUBS.filter((club) => club.country === input.offer.country);
  const worldClubs = CLUBS.filter((club) => clubDivision(club) === 1 && competitionStrength(club) >= 80);
  const seniorEligible = input.offer.kind !== "academy";

  return Array.from({ length: input.years }, (_, index) => {
    const fromAge = input.player.age + index;
    const season = `Age ${fromAge}–${fromAge + 1}`;
    const goals = yearlyStats(input.goals, input.years, index, random);
    const assists = yearlyStats(input.assists, input.years, index, random);
    const apps = yearlyStats(input.apps, input.years, index, random);
    const playerImpact = seniorEligible
      ? exceptionalPlayerBoost({ rating: input.rating, apps, goals, assists, reputation: input.reputation })
      : 0;
    const champion = pickCompetitionWinner(
      divisionClubs.length ? divisionClubs : activeClub ? [activeClub] : [],
      input.offer.name, playerImpact, "league", random,
    );
    const cupWinner = pickCompetitionWinner(
      countryClubs.length ? countryClubs : activeClub ? [activeClub] : [],
      input.offer.name, playerImpact * .7, "cup", random,
    );
    const rivalClub = pick(divisionClubs.filter((club) => club.name !== input.offer.name), random)?.name ?? input.offer.name;
    const rivalGoals = randomInt(random, 16, 30);
    const winsGoldenBoot = seniorEligible && apps >= 16 && goals >= rivalGoals;
    const topScorer = winsGoldenBoot
      ? { name: input.player.name, club: input.offer.name, isPlayer: true, detail: `${goals} goals` }
      : fictionalWinner(rivalClub, random, `${rivalGoals} goals`);
    const playerSeasonScore = input.rating + goals * 1.25 + assists * .7 + Math.min(8, apps / 5);
    const winsPlayerOfSeason = seniorEligible && apps >= 20 && playerSeasonScore >= randomInt(random, 104, 122);
    const playerOfSeason = winsPlayerOfSeason
      ? { name: input.player.name, club: input.offer.name, isPlayer: true }
      : fictionalWinner(rivalClub, random);
    const worldClub = pick(worldClubs, random)?.name ?? input.offer.name;
    const ballonScore = input.rating + input.reputation * .24 + goals * .85 + assists * .35 +
      (champion === input.offer.name ? 5 : 0) + (cupWinner === input.offer.name ? 3 : 0);
    const winsBallonDor = seniorEligible && input.rating >= 83 && apps >= 24 && ballonScore >= randomInt(random, 121, 139);
    const ballonDor = winsBallonDor
      ? { name: input.player.name, club: input.offer.name, isPlayer: true }
      : fictionalWinner(worldClub, random);
    const cupTitle = nationalCupName(input.offer.country);
    const playerHonours: PlayerHonour[] = [];

    if (seniorEligible && champion === input.offer.name) playerHonours.push(playerHonour(input, season, "league-title", "team", `${league} champion`, "🏆"));
    if (seniorEligible && cupWinner === input.offer.name) playerHonours.push(playerHonour(input, season, "national-cup", "team", `${cupTitle} winner`, "🏆"));
    if (winsGoldenBoot) playerHonours.push(playerHonour(input, season, "golden-boot", "individual", `${league} Golden Boot`, "👟"));
    if (winsPlayerOfSeason) playerHonours.push(playerHonour(input, season, "player-of-season", "individual", `${league} Player of the Season`, "⭐"));
    if (winsBallonDor) playerHonours.push(playerHonour(input, season, "ballon-dor", "individual", "Ballon d'Or", "◉"));

    const activeDivisionKey = `${input.offer.country}:${division}`;
    const divisionRoll: DivisionHonours[] = groupedClubs((club) => `${club.country}:${clubDivision(club)}`)
      .map(([key, clubs]) => {
        if (key === activeDivisionKey) return { country: input.offer.country, league, champion, topScorer, playerOfSeason };
        const winningClub = pickCompetitionWinner(clubs, "", 0, "league", random);
        const awardClub = pick(clubs, random)?.name ?? winningClub;
        return {
          country: clubs[0]?.country ?? "",
          league: clubs[0]?.league ?? "Unknown division",
          champion: winningClub,
          topScorer: fictionalWinner(awardClub, random, `${randomInt(random, 14, 31)} goals`),
          playerOfSeason: fictionalWinner(awardClub, random),
        };
      });
    const cupRoll = groupedClubs((club) => club.country).map(([countryCode, clubs]) => ({
      country: countryCode,
      name: nationalCupName(countryCode),
      winner: countryCode === input.offer.country ? cupWinner : pickCompetitionWinner(clubs, "", 0, "cup", random),
    }));

    return {
      season, league, champion, topScorer, playerOfSeason,
      cup: { name: cupTitle, winner: cupWinner }, ballonDor, playerHonours,
      divisionRoll, cupRoll,
    };
  });
}
