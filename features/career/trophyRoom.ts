import type { Player, TrophyRoom, TrophyRoomCareer, TrophyRoomHonour } from "./domain";

export const EMPTY_TROPHY_ROOM: TrophyRoom = { version: 1, careers: [] };
const unique = <T,>(items: T[]) => [...new Set(items)];

export function mergeCareerSnapshot(room: TrophyRoom, careerId: string, player: Player): TrophyRoom {
  const clubs = unique([
    ...player.history.map((season) => season.club),
    ...(player.currentClub !== "Free agent" ? [player.currentClub] : []),
  ]);
  const namedHonours: TrophyRoomHonour[] = player.history.flatMap((season) =>
    (season.honours ?? []).flatMap((annual) => annual.playerHonours).map((honour) => ({
      ...honour,
      id: `${careerId}:${honour.id}`,
      careerId,
      playerName: player.name,
      count: 1,
    })),
  );
  const teamHonours = namedHonours.filter((honour) => honour.category === "team").length;
  const legacyTrophies = Math.max(0, player.trophies - teamHonours);
  if (legacyTrophies > 0) {
    namedHonours.push({
      id: `${careerId}:legacy-team-honours`, careerId, playerName: player.name,
      kind: "league-title", category: "team", name: "Unspecified silverware",
      season: "Before named honours", club: player.history[0]?.club ?? player.currentClub,
      country: player.history[0]?.country ?? player.nation, icon: "🏆", count: legacyTrophies,
    });
  }
  const honours = [...new Map(namedHonours.map((honour) => [honour.id, honour])).values()];
  const career: TrophyRoomCareer = {
    id: careerId, playerName: player.name, nation: player.nation, finalAge: player.age,
    finalRating: player.rating, clubs, honours,
  };
  return { version: 1, careers: [career, ...room.careers.filter((item) => item.id !== careerId)] };
}

export function trophyRoomTotals(room: TrophyRoom) {
  const honours = room.careers.flatMap((career) => career.honours);
  const count = (category?: "team" | "individual") => honours
    .filter((honour) => !category || honour.category === category)
    .reduce((total, honour) => total + honour.count, 0);
  return {
    careers: room.careers.length,
    clubs: unique(room.careers.flatMap((career) => career.clubs)).length,
    team: count("team"), individual: count("individual"), total: count(),
  };
}
