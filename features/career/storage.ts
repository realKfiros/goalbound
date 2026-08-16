import type { SavedGame } from "./domain";

const SAVE_KEY = "goalbound-career-v3";

export function loadCareer(): SavedGame | null {
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedGame;
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
