import type { Club } from "./domain";

const CACHE_KEY = "goalbound-club-badges-v1";
const SPORTS_DB_ENDPOINT = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php";
const memoryCache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();
let cacheLoaded = false;

type SportsDbTeam = {
  strTeam?: string | null;
  strTeamAlternate?: string | null;
  strSport?: string | null;
  strGender?: string | null;
  strBadge?: string | null;
};

function keyFor(club: Club) {
  return `${club.country}:${club.name}`;
}

function normalize(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(?:football club|futbol club|soccer club|afc|fc|cf|ac|sc)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function readCache() {
  if (cacheLoaded || typeof window === "undefined") return;
  cacheLoaded = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "{}") as Record<string, string>;
    Object.entries(saved).forEach(([key, value]) => memoryCache.set(key, value || null));
  } catch {
    // A blocked or malformed local cache should never stop the game.
  }
}

function saveCache() {
  if (typeof window === "undefined") return;
  try {
    const saved = Object.fromEntries([...memoryCache.entries()].map(([key, value]) => [key, value ?? ""]));
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(saved));
  } catch {
    // Badge caching is an enhancement; the generated fallback remains available.
  }
}

function matchingBadge(club: Club, teams: SportsDbTeam[]) {
  const requested = normalize(club.name);
  const candidates = teams.filter((team) =>
    team.strSport === "Soccer" && (!team.strGender || team.strGender === "Male") && team.strBadge,
  );
  const exact = candidates.find((team) =>
    [team.strTeam, team.strTeamAlternate].some((name) => name && normalize(name) === requested),
  );
  if (exact?.strBadge) return exact.strBadge;

  const close = candidates.find((team) => {
    const candidate = normalize(team.strTeam ?? "");
    const shorter = Math.min(candidate.length, requested.length);
    return shorter >= 5 && (candidate.includes(requested) || requested.includes(candidate)) &&
      shorter / Math.max(candidate.length, requested.length) >= .58;
  });
  return close?.strBadge ?? null;
}

export function knownClubBadge(club: Club | undefined) {
  return club?.crest ?? null;
}

export async function resolveClubBadge(club: Club): Promise<string | null> {
  if (club.crest) return club.crest;
  readCache();
  const key = keyFor(club);
  if (memoryCache.has(key)) return memoryCache.get(key) ?? null;
  const existing = pending.get(key);
  if (existing) return existing;

  const request = fetch(`${SPORTS_DB_ENDPOINT}?t=${encodeURIComponent(club.name)}`)
    .then(async (response) => {
      if (!response.ok) return null;
      const body = await response.json() as { teams?: SportsDbTeam[] | null };
      return matchingBadge(club, body.teams ?? []);
    })
    .catch(() => null)
    .then((badge) => {
      if (badge) {
        memoryCache.set(key, badge);
        saveCache();
      }
      pending.delete(key);
      return badge;
    });

  pending.set(key, request);
  return request;
}
