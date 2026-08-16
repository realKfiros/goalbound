import type { Club } from "./domain";
import { clubDivision, clubFinance } from "./finances";

export type CompetitionKind = "league" | "cup";

export type PlayerSeasonImpact = {
  rating: number;
  apps: number;
  goals: number;
  assists: number;
  reputation: number;
};

const DIVISION_BASE: Record<number, number> = {
  1: 62,
  2: 50,
  3: 40,
  4: 31,
  5: 24,
};

/**
 * Goalbound-owned title ratings. They are deliberately sparse: named contenders
 * get a calibrated starting point while the rest are derived from tier, level and
 * financial band. This keeps newly-added clubs playable without treating every
 * club in a division as equally likely to win it.
 */
const TITLE_STRENGTH: Record<string, number> = {
  "ENG:Liverpool": 94, "ENG:Arsenal": 93, "ENG:Manchester City": 92,
  "ENG:Chelsea": 85, "ENG:Manchester United": 83, "ENG:Newcastle United": 81,
  "ENG:Aston Villa": 79, "ENG:Tottenham Hotspur": 78, "ENG:Brighton & Hove Albion": 74,
  "ENG:Hull City": 52, "ENG:Coventry City": 52,

  "ESP:Real Madrid": 96, "ESP:FC Barcelona": 94, "ESP:Atlético Madrid": 88,
  "ESP:Villarreal": 81, "ESP:Athletic Club": 80, "ESP:Real Sociedad": 78,
  "ESP:Real Betis": 76,

  "GER:Bayern Munich": 96, "GER:Bayer Leverkusen": 89, "GER:Borussia Dortmund": 88,
  "GER:RB Leipzig": 84, "GER:Eintracht Frankfurt": 80, "GER:VfB Stuttgart": 79,

  "ITA:Inter Milan": 93, "ITA:Napoli": 90, "ITA:Juventus": 88, "ITA:AC Milan": 87,
  "ITA:Atalanta": 84, "ITA:Roma": 82, "ITA:Lazio": 78,

  "FRA:Paris Saint-Germain": 98, "FRA:AS Monaco": 84, "FRA:Olympique Marseille": 83,
  "FRA:Lille": 81, "FRA:Olympique Lyonnais": 78, "FRA:RC Lens": 78,

  "POR:Benfica": 91, "POR:Sporting CP": 91, "POR:FC Porto": 89, "POR:Braga": 80,

  "NED:PSV Eindhoven": 91, "NED:Feyenoord": 87, "NED:Ajax": 86, "NED:AZ Alkmaar": 79,

  "ISR:Maccabi Tel Aviv": 88, "ISR:Maccabi Haifa": 85, "ISR:Hapoel Be’er Sheva": 83,
  "ISR:Beitar Jerusalem": 78,

  "POL:Legia Warszawa": 84, "POL:Lech Poznań": 84, "POL:Jagiellonia Białystok": 81,
  "POL:Raków Częstochowa": 80,

  "CYP:Pafos FC": 84, "CYP:APOEL Nicosia": 84, "CYP:Omonia Nicosia": 83,
  "CYP:Aris Limassol": 79,

  "BRA:Flamengo": 93, "BRA:Palmeiras": 92, "BRA:Botafogo": 84, "BRA:Cruzeiro": 83,
  "BRA:Atlético Mineiro": 82, "BRA:São Paulo": 81, "BRA:Corinthians": 80,

  "ARG:River Plate": 92, "ARG:Boca Juniors": 90, "ARG:Racing Club": 84,
  "ARG:Independiente": 82, "ARG:Estudiantes de La Plata": 82,
  "ARG:Vélez Sarsfield": 81, "ARG:Rosario Central": 80,

  "USA:Inter Miami": 85, "USA:Los Angeles FC": 84, "USA:Columbus Crew": 82,
  "USA:Seattle Sounders": 82, "USA:FC Cincinnati": 81,

  "BEL:Club Brugge": 89, "BEL:Union Saint-Gilloise": 87, "BEL:Genk": 84,
  "BEL:RSC Anderlecht": 83, "BEL:KAA Gent": 79, "BEL:Royal Antwerp": 78,

  "SCO:Celtic": 94, "SCO:Rangers": 89, "SCO:Heart of Midlothian": 75,
  "SCO:Aberdeen": 73, "SCO:Hibernian": 70,

  "TUR:Galatasaray": 93, "TUR:Fenerbahçe": 90, "TUR:Beşiktaş": 84,
  "TUR:Trabzonspor": 80, "TUR:İstanbul Başakşehir": 78,

  "CRO:Dinamo Zagreb": 91, "CRO:Hajduk Split": 84, "CRO:HNK Rijeka": 82,
  "CRO:Osijek": 73,

  "GRE:Olympiacos": 92, "GRE:Panathinaikos": 86, "GRE:PAOK": 85,
  "GRE:AEK Athens": 84, "GRE:Aris Thessaloniki": 76,

  "AUT:Red Bull Salzburg": 88, "AUT:Sturm Graz": 84, "AUT:Rapid Wien": 79,
  "AUT:LASK": 78, "AUT:Austria Wien": 77,

  "CZE:Slavia Prague": 89, "CZE:Sparta Prague": 88, "CZE:Viktoria Plzeň": 84,
  "CZE:Baník Ostrava": 77,

  "DEN:FC Copenhagen": 89, "DEN:FC Midtjylland": 87, "DEN:Brøndby IF": 81,
  "DEN:AGF": 79, "DEN:FC Nordsjælland": 78,

  "SUI:Young Boys": 86, "SUI:FC Basel 1893": 85, "SUI:Servette FC": 79,
  "SUI:FC Lugano": 78, "SUI:FC St. Gallen 1879": 76,

  "NOR:Bodø/Glimt": 88, "NOR:Viking FK": 83, "NOR:Molde FK": 81,
  "NOR:SK Brann": 80, "NOR:Rosenborg BK": 76,

  "SWE:Malmö FF": 87, "SWE:Hammarby": 82, "SWE:Mjällby AIF": 81,
  "SWE:Djurgården": 80, "SWE:AIK": 78,

  "UKR:Shakhtar Donetsk": 90, "UKR:Dynamo Kyiv": 88, "UKR:Polissya Zhytomyr": 79,
  "UKR:Karpaty Lviv": 76,

  "SRB:Red Star Belgrade": 92, "SRB:Partizan Belgrade": 84, "SRB:Vojvodina": 78,
  "SRB:Čukarički": 75,

  "ROU:FCSB": 85, "ROU:CFR Cluj": 83, "ROU:Universitatea Craiova": 80,
  "ROU:Rapid București": 78, "ROU:Dinamo București": 75,

  "HUN:Ferencváros": 89, "HUN:Puskás Akadémia": 80, "HUN:Paks": 78,
  "HUN:ETO FC Győr": 74,

  "SAU:Al Hilal": 94, "SAU:Al Nassr": 93, "SAU:Al Ahli": 90,
  "SAU:Al Ittihad": 88, "SAU:Al Qadsiah": 85, "SAU:Al Taawoun": 77,

  "JPN:Vissel Kobe": 85, "JPN:Kashima Antlers": 84, "JPN:Sanfrecce Hiroshima": 82,
  "JPN:Kawasaki Frontale": 81, "JPN:Yokohama F. Marinos": 80,

  "MEX:Club América": 88, "MEX:Toluca": 86, "MEX:Cruz Azul": 85,
  "MEX:Monterrey": 84, "MEX:Tigres UANL": 83, "MEX:Pachuca": 79,
  "MEX:Guadalajara": 77,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function competitionStrength(club: Club) {
  const calibrated = TITLE_STRENGTH[`${club.country}:${club.name}`];
  if (calibrated !== undefined) return calibrated;

  const division = clubDivision(club);
  const base = DIVISION_BASE[division] ?? 20;
  const finance = (clubFinance(club).financialBand - 3) * 4;
  const level = (club.level - 3) * 4.5;
  const development = (club.development - 3) * .8;
  return clamp(base + finance + level + development, 18, 90);
}

/**
 * A good player improves a team; only a freakish season bends a title race.
 * The thresholds prevent routine 80-OVR seasons from turning relegation clubs
 * into favourites, while still allowing a 94-OVR, 40-goal season to create a
 * genuine Leicester-style shock.
 */
export function exceptionalPlayerBoost(season: PlayerSeasonImpact) {
  const rating = Math.max(0, season.rating - 84) * 2.1;
  const goals = Math.max(0, season.goals - 15) * .55;
  const assists = Math.max(0, season.assists - 10) * .4;
  const availability = season.apps >= 32 ? 2 : season.apps >= 24 ? 1 : 0;
  const reputation = Math.max(0, season.reputation - 85) * .12;
  return rating + goals + assists + availability + reputation;
}

function gumbel(random: () => number) {
  const draw = clamp(random(), Number.MIN_VALUE, 1 - Number.EPSILON);
  return -Math.log(-Math.log(draw));
}

export function pickCompetitionWinner(
  clubs: Club[],
  currentClub: string,
  playerBoost: number,
  kind: CompetitionKind,
  random: () => number = Math.random,
) {
  if (clubs.length === 0) return currentClub;

  const temperature = kind === "league" ? 5.3 : 8.4;
  return clubs.reduce((best, club) => {
    const activeBoost = club.name === currentClub ? playerBoost : 0;
    const score = competitionStrength(club) + activeBoost + gumbel(random) * temperature;
    return score > best.score ? { name: club.name, score } : best;
  }, { name: clubs[0].name, score: -Infinity }).name;
}
