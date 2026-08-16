import { DEFAULT_SAVE, type SavedGame, type TrophyRoom } from "./domain";
import { EMPTY_TROPHY_ROOM } from "./trophyRoom";
import { migrateWorldState } from "./world";

const SAVE_KEY = "goalbound-career-v3";
const TROPHY_ROOM_KEY = "goalbound-trophy-room-v1";

export function newCareerId() {
  return window.crypto.randomUUID?.() ?? `career-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadCareer(): SavedGame | null {
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SavedGame;
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      careerId: parsed.careerId ?? newCareerId(),
      player: parsed.player ? { ...parsed.player, developmentTrend: parsed.player.developmentTrend ?? 0 } : null,
      world: parsed.player ? migrateWorldState(parsed.world) : null,
    };
  } catch {
    window.localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

export function saveCareer(game: SavedGame) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

export function clearCareer() {
  window.localStorage.removeItem(SAVE_KEY);
}

export function loadTrophyRoom(): TrophyRoom {
  const raw = window.localStorage.getItem(TROPHY_ROOM_KEY);
  if (!raw) return EMPTY_TROPHY_ROOM;
  try {
    const parsed = JSON.parse(raw) as TrophyRoom;
    return parsed.version === 1 && Array.isArray(parsed.careers) ? parsed : EMPTY_TROPHY_ROOM;
  } catch {
    window.localStorage.removeItem(TROPHY_ROOM_KEY);
    return EMPTY_TROPHY_ROOM;
  }
}

export function saveTrophyRoom(room: TrophyRoom) {
  window.localStorage.setItem(TROPHY_ROOM_KEY, JSON.stringify(room));
}
