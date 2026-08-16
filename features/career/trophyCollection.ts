import { CLUBS, country } from "./catalog";
import type { Club, HonourCategory, HonourKind, TrophyRoom, TrophyRoomHonour } from "./domain";
import { clubDivision } from "./finances";
import { nationalCupName } from "./honours";
import { UEFA_COMPETITION_DEFINITIONS } from "./uefaCompetitions";

export type TrophyCollectionEntry = {
  id: string;
  name: string;
  detail: string;
  country: string | null;
  category: HonourCategory;
  kind: HonourKind;
  icon: string;
  honours: TrophyRoomHonour[];
  count: number;
  unlocked: boolean;
};

export type ClubAlbumGroup = {
  id: string;
  country: string;
  league: string;
  division: number;
  clubs: Club[];
  collected: number;
};

const allHonours = (room: TrophyRoom) => room.careers.flatMap((career) => career.honours);
const unique = <T,>(items: T[]) => [...new Set(items)];

function honourEntry(
  roomHonours: TrophyRoomHonour[],
  entry: Omit<TrophyCollectionEntry, "honours" | "count" | "unlocked">,
  matches: (honour: TrophyRoomHonour) => boolean,
): TrophyCollectionEntry {
  const honours = roomHonours.filter(matches);
  const count = honours.reduce((total, honour) => total + honour.count, 0);
  return { ...entry, honours, count, unlocked: count > 0 };
}

function divisionGroups() {
  const groups = new Map<string, Club[]>();
  CLUBS.forEach((club) => {
    const key = `${club.country}:${clubDivision(club)}`;
    groups.set(key, [...(groups.get(key) ?? []), club]);
  });
  return [...groups.entries()].map(([id, clubs]) => ({
    id,
    country: clubs[0]?.country ?? "",
    league: clubs[0]?.league ?? "Unknown division",
    division: clubDivision(clubs[0]),
    clubs,
  }));
}

export function trophyCollection(room: TrophyRoom) {
  const honours = allHonours(room);
  const divisions = divisionGroups();
  const team: TrophyCollectionEntry[] = [];
  const individual: TrophyCollectionEntry[] = [];

  divisions.forEach((division) => {
    team.push(honourEntry(honours, {
      id: `league:${division.id}`,
      name: `${division.league} title`,
      detail: country(division.country).name,
      country: division.country,
      category: "team",
      kind: "league-title",
      icon: "🏆",
    }, (honour) => honour.kind === "league-title" && honour.name === `${division.league} champion`));

    individual.push(honourEntry(honours, {
      id: `golden-boot:${division.id}`,
      name: `${division.league} Golden Boot`,
      detail: country(division.country).name,
      country: division.country,
      category: "individual",
      kind: "golden-boot",
      icon: "👟",
    }, (honour) => honour.kind === "golden-boot" && honour.name === `${division.league} Golden Boot`));

    individual.push(honourEntry(honours, {
      id: `player-of-season:${division.id}`,
      name: `${division.league} Player of the Season`,
      detail: country(division.country).name,
      country: division.country,
      category: "individual",
      kind: "player-of-season",
      icon: "⭐",
    }, (honour) => honour.kind === "player-of-season" && honour.name === `${division.league} Player of the Season`));
  });

  unique(CLUBS.map((club) => club.country)).forEach((countryCode) => {
    const cup = nationalCupName(countryCode);
    team.push(honourEntry(honours, {
      id: `cup:${countryCode}`,
      name: cup,
      detail: country(countryCode).name,
      country: countryCode,
      category: "team",
      kind: "national-cup",
      icon: "🏆",
    }, (honour) => honour.kind === "national-cup" && honour.name === `${cup} winner`));
  });

  UEFA_COMPETITION_DEFINITIONS.forEach((competition) => {
    team.push(honourEntry(honours, {
      id: `continental:${competition.key}`,
      name: competition.name,
      detail: "European football",
      country: null,
      category: "team",
      kind: "continental-title",
      icon: "🏆",
    }, (honour) => honour.kind === "continental-title" && honour.name === `${competition.name} winner`));
  });

  individual.push(honourEntry(honours, {
    id: "ballon-dor",
    name: "Ballon d'Or",
    detail: "World award",
    country: null,
    category: "individual",
    kind: "ballon-dor",
    icon: "◉",
  }, (honour) => honour.kind === "ballon-dor"));

  const legacyHonours = honours.filter((honour) => honour.name === "Unspecified silverware");
  if (legacyHonours.length) {
    const count = legacyHonours.reduce((total, honour) => total + honour.count, 0);
    team.push({
      id: "legacy-silverware",
      name: "Legacy silverware",
      detail: "Imported from an older save",
      country: null,
      category: "team",
      kind: "league-title",
      icon: "🏆",
      honours: legacyHonours,
      count,
      unlocked: true,
    });
  }

  return { team, individual, all: [...team, ...individual] };
}

export function clubAlbum(room: TrophyRoom): ClubAlbumGroup[] {
  const represented = new Set(room.careers.flatMap((career) => career.clubs));
  return divisionGroups().map((group) => ({
    ...group,
    collected: group.clubs.filter((club) => represented.has(club.name)).length,
  }));
}

export function representedClubs(room: TrophyRoom) {
  return new Set(room.careers.flatMap((career) => career.clubs));
}
