import type { Club, Role } from "./domain";
import { CATALOG_SEASON } from "./leagueCatalog";

export type FinancialBand = 1 | 2 | 3 | 4 | 5;

export type ClubFinance = {
  financialBand: FinancialBand;
  financeSource: "goalbound";
  financeSeason: string;
};

type TierFinance = {
  squadValueProxy: number;
  hardMaxSingleFee: number;
};

const FINANCIAL_MULTIPLIER: Record<FinancialBand, number> = {
  1: .45,
  2: .70,
  3: 1,
  4: 1.40,
  5: 2.20,
};

const ROLE_FACTOR: Record<Role, number> = {
  Prospect: .75,
  Rotation: .90,
  Starter: 1.05,
  Star: 1.20,
};

const TIER_FINANCES: Record<string, TierFinance> = {
  "ENG:1": { squadValueProxy: 450_000_000, hardMaxSingleFee: 175_000_000 },
  "ENG:2": { squadValueProxy: 80_000_000, hardMaxSingleFee: 25_000_000 },
  "ENG:3": { squadValueProxy: 10_000_000, hardMaxSingleFee: 4_000_000 },
  "ENG:4": { squadValueProxy: 4_000_000, hardMaxSingleFee: 1_500_000 },
  "ENG:5": { squadValueProxy: 1_000_000, hardMaxSingleFee: 500_000 },
  "ESP:1": { squadValueProxy: 350_000_000, hardMaxSingleFee: 175_000_000 },
  "ESP:2": { squadValueProxy: 45_000_000, hardMaxSingleFee: 12_000_000 },
  "GER:1": { squadValueProxy: 350_000_000, hardMaxSingleFee: 175_000_000 },
  "GER:2": { squadValueProxy: 45_000_000, hardMaxSingleFee: 12_000_000 },
  "ITA:1": { squadValueProxy: 300_000_000, hardMaxSingleFee: 125_000_000 },
  "ITA:2": { squadValueProxy: 40_000_000, hardMaxSingleFee: 12_000_000 },
  "FRA:1": { squadValueProxy: 280_000_000, hardMaxSingleFee: 125_000_000 },
  "FRA:2": { squadValueProxy: 35_000_000, hardMaxSingleFee: 12_000_000 },
  "POR:1": { squadValueProxy: 110_000_000, hardMaxSingleFee: 75_000_000 },
  "POR:2": { squadValueProxy: 20_000_000, hardMaxSingleFee: 12_000_000 },
  "NED:1": { squadValueProxy: 100_000_000, hardMaxSingleFee: 75_000_000 },
  "NED:2": { squadValueProxy: 18_000_000, hardMaxSingleFee: 12_000_000 },
  "ISR:1": { squadValueProxy: 20_000_000, hardMaxSingleFee: 10_000_000 },
  "POL:1": { squadValueProxy: 25_000_000, hardMaxSingleFee: 10_000_000 },
  "CYP:1": { squadValueProxy: 15_000_000, hardMaxSingleFee: 7_500_000 },
};

const COUNTRY_TOP_FLIGHT: Record<string, TierFinance> = {
  BRA: { squadValueProxy: 180_000_000, hardMaxSingleFee: 90_000_000 },
  ARG: { squadValueProxy: 130_000_000, hardMaxSingleFee: 65_000_000 },
  USA: { squadValueProxy: 90_000_000, hardMaxSingleFee: 45_000_000 },
  BEL: { squadValueProxy: 85_000_000, hardMaxSingleFee: 50_000_000 },
  SCO: { squadValueProxy: 70_000_000, hardMaxSingleFee: 40_000_000 },
  TUR: { squadValueProxy: 100_000_000, hardMaxSingleFee: 60_000_000 },
  CRO: { squadValueProxy: 35_000_000, hardMaxSingleFee: 20_000_000 },
  GRE: { squadValueProxy: 55_000_000, hardMaxSingleFee: 30_000_000 },
  AUT: { squadValueProxy: 75_000_000, hardMaxSingleFee: 45_000_000 },
  CZE: { squadValueProxy: 70_000_000, hardMaxSingleFee: 40_000_000 },
  DEN: { squadValueProxy: 75_000_000, hardMaxSingleFee: 45_000_000 },
  SUI: { squadValueProxy: 70_000_000, hardMaxSingleFee: 40_000_000 },
  NOR: { squadValueProxy: 60_000_000, hardMaxSingleFee: 35_000_000 },
  SWE: { squadValueProxy: 55_000_000, hardMaxSingleFee: 30_000_000 },
  UKR: { squadValueProxy: 65_000_000, hardMaxSingleFee: 40_000_000 },
  SRB: { squadValueProxy: 45_000_000, hardMaxSingleFee: 25_000_000 },
  ROU: { squadValueProxy: 45_000_000, hardMaxSingleFee: 25_000_000 },
  HUN: { squadValueProxy: 40_000_000, hardMaxSingleFee: 25_000_000 },
  ALB: { squadValueProxy: 10_000_000, hardMaxSingleFee: 4_000_000 },
  AND: { squadValueProxy: 3_000_000, hardMaxSingleFee: 750_000 },
  ARM: { squadValueProxy: 12_000_000, hardMaxSingleFee: 5_000_000 },
  AZE: { squadValueProxy: 30_000_000, hardMaxSingleFee: 15_000_000 },
  BLR: { squadValueProxy: 18_000_000, hardMaxSingleFee: 8_000_000 },
  BIH: { squadValueProxy: 14_000_000, hardMaxSingleFee: 6_000_000 },
  BUL: { squadValueProxy: 28_000_000, hardMaxSingleFee: 14_000_000 },
  EST: { squadValueProxy: 7_000_000, hardMaxSingleFee: 2_500_000 },
  FRO: { squadValueProxy: 4_000_000, hardMaxSingleFee: 1_000_000 },
  FIN: { squadValueProxy: 18_000_000, hardMaxSingleFee: 8_000_000 },
  GEO: { squadValueProxy: 12_000_000, hardMaxSingleFee: 5_000_000 },
  GIB: { squadValueProxy: 3_000_000, hardMaxSingleFee: 750_000 },
  ISL: { squadValueProxy: 14_000_000, hardMaxSingleFee: 6_000_000 },
  KAZ: { squadValueProxy: 35_000_000, hardMaxSingleFee: 18_000_000 },
  KOS: { squadValueProxy: 8_000_000, hardMaxSingleFee: 3_000_000 },
  LVA: { squadValueProxy: 9_000_000, hardMaxSingleFee: 3_500_000 },
  LTU: { squadValueProxy: 9_000_000, hardMaxSingleFee: 3_500_000 },
  LUX: { squadValueProxy: 8_000_000, hardMaxSingleFee: 3_000_000 },
  MLT: { squadValueProxy: 8_000_000, hardMaxSingleFee: 3_000_000 },
  MDA: { squadValueProxy: 11_000_000, hardMaxSingleFee: 5_000_000 },
  MNE: { squadValueProxy: 9_000_000, hardMaxSingleFee: 3_500_000 },
  MKD: { squadValueProxy: 10_000_000, hardMaxSingleFee: 4_000_000 },
  NIR: { squadValueProxy: 12_000_000, hardMaxSingleFee: 5_000_000 },
  IRL: { squadValueProxy: 20_000_000, hardMaxSingleFee: 9_000_000 },
  SMR: { squadValueProxy: 2_000_000, hardMaxSingleFee: 500_000 },
  SVK: { squadValueProxy: 28_000_000, hardMaxSingleFee: 14_000_000 },
  SVN: { squadValueProxy: 24_000_000, hardMaxSingleFee: 12_000_000 },
  WAL: { squadValueProxy: 8_000_000, hardMaxSingleFee: 3_000_000 },
  SAU: { squadValueProxy: 220_000_000, hardMaxSingleFee: 150_000_000 },
  JPN: { squadValueProxy: 70_000_000, hardMaxSingleFee: 40_000_000 },
  MEX: { squadValueProxy: 90_000_000, hardMaxSingleFee: 50_000_000 },
};

const CLUB_FINANCIAL_BANDS: Record<string, FinancialBand> = {
  "ENG:Manchester City": 5, "ENG:Arsenal": 5, "ENG:Chelsea": 5, "ENG:Liverpool": 5,
  "ENG:Manchester United": 4, "ENG:Tottenham Hotspur": 4, "ENG:Newcastle United": 4,
  "ENG:Aston Villa": 4, "ENG:Brighton & Hove Albion": 3, "ENG:Nottingham Forest": 3,
  "ENG:Crystal Palace": 3, "ENG:Brentford": 3, "ENG:AFC Bournemouth": 3,
  "ENG:Everton": 3, "ENG:Fulham": 3, "ENG:Leeds United": 3, "ENG:Sunderland": 2,
  "ENG:Ipswich Town": 2, "ENG:Hull City": 1, "ENG:Coventry City": 1,
  "ENG:West Ham United": 5, "ENG:Wolverhampton Wanderers": 5, "ENG:Burnley": 4,
  "ENG:Southampton": 4, "ENG:Sheffield United": 4, "ENG:Birmingham City": 4,
  "ENG:Wrexham": 4, "ENG:West Bromwich Albion": 4, "ENG:Leicester City": 5,
  "ENG:Sheffield Wednesday": 4, "ENG:Luton Town": 4, "ENG:Reading": 4,
  "ENG:Salford City": 4, "ENG:Southend United": 4, "ENG:Dorking Wanderers": 1,
  "ENG:Tamworth": 1, "ENG:Wealdstone": 1,

  "ESP:Real Madrid": 5, "ESP:FC Barcelona": 5, "ESP:Atlético Madrid": 4,
  "ESP:Athletic Club": 4, "ESP:Villarreal": 4, "ESP:Real Sociedad": 3,
  "ESP:Real Betis": 3, "ESP:Sevilla FC": 3, "ESP:Valencia CF": 3,
  "ESP:Deportivo Alavés": 1, "ESP:Elche CF": 1, "ESP:Levante UD": 1,
  "GER:Bayern Munich": 5, "GER:Borussia Dortmund": 4, "GER:Bayer Leverkusen": 4,
  "GER:RB Leipzig": 4, "GER:Eintracht Frankfurt": 3, "GER:VfB Stuttgart": 3,
  "GER:SV Elversberg": 1, "GER:SC Paderborn 07": 1,
  "ITA:Inter Milan": 5, "ITA:AC Milan": 4, "ITA:Juventus": 4, "ITA:Napoli": 4,
  "ITA:Roma": 4, "ITA:Atalanta": 4, "ITA:Fiorentina": 3, "ITA:Bologna": 3,
  "ITA:Frosinone": 1, "ITA:Venezia": 1,
  "FRA:Paris Saint-Germain": 5, "FRA:AS Monaco": 4, "FRA:Olympique Marseille": 4,
  "FRA:Lille": 4, "FRA:Olympique Lyonnais": 3, "FRA:Stade Rennais": 3,
  "FRA:Le Mans FC": 1, "FRA:ESTAC Troyes": 1,
  "POR:Benfica": 5, "POR:Sporting CP": 5, "POR:FC Porto": 5, "POR:Braga": 4,
  "POR:Vitória SC": 3, "POR:Académico de Viseu": 1,
  "NED:Ajax": 5, "NED:PSV Eindhoven": 5, "NED:Feyenoord": 4, "NED:AZ Alkmaar": 4,
  "NED:FC Utrecht": 3, "NED:Telstar": 1,
  "ISR:Maccabi Tel Aviv": 5, "ISR:Maccabi Haifa": 5, "ISR:Hapoel Be’er Sheva": 4,
  "ISR:Beitar Jerusalem": 4, "ISR:Hapoel Tel Aviv": 3,
  "POL:Legia Warszawa": 5, "POL:Lech Poznań": 5, "POL:Raków Częstochowa": 4,
  "POL:Jagiellonia Białystok": 4, "POL:Wisła Kraków": 3,
  "CYP:APOEL Nicosia": 5, "CYP:Omonia Nicosia": 5, "CYP:Pafos FC": 5,
  "CYP:Aris Limassol": 4, "CYP:AEK Larnaca": 4,
  "AUT:Red Bull Salzburg": 5, "AUT:Sturm Graz": 4, "AUT:Rapid Wien": 4,
  "CZE:Slavia Prague": 5, "CZE:Sparta Prague": 5, "CZE:Viktoria Plzeň": 4,
  "DEN:FC Copenhagen": 5, "DEN:FC Midtjylland": 5, "DEN:Brøndby IF": 4,
  "SUI:Young Boys": 5, "SUI:FC Basel 1893": 5, "SUI:Servette FC": 4,
  "NOR:Bodø/Glimt": 5, "NOR:Molde FK": 4, "NOR:Viking FK": 4,
  "SWE:Malmö FF": 5, "SWE:Hammarby": 4, "SWE:Djurgården": 4,
  "UKR:Shakhtar Donetsk": 5, "UKR:Dynamo Kyiv": 5, "UKR:Polissya Zhytomyr": 4,
  "SRB:Red Star Belgrade": 5, "SRB:Partizan Belgrade": 5, "SRB:Vojvodina": 4,
  "ROU:FCSB": 5, "ROU:CFR Cluj": 5, "ROU:Universitatea Craiova": 4,
  "HUN:Ferencváros": 5, "HUN:Puskás Akadémia": 4, "HUN:Paks": 4,
  "BRA:Flamengo": 5, "BRA:Palmeiras": 5, "ARG:River Plate": 5, "ARG:Boca Juniors": 5,
  "USA:Inter Miami": 5, "SAU:Al Hilal": 5, "SAU:Al Nassr": 5,
  "SCO:Celtic": 5, "SCO:Rangers": 5, "TUR:Galatasaray": 5, "TUR:Fenerbahçe": 5,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function seededWindowFactor(club: Club) {
  const key = `${CATALOG_SEASON}:${club.country}:${club.name}`;
  const score = [...key].reduce((total, letter) => ((total * 31) + letter.codePointAt(0)!) >>> 0, 7);
  return .85 + (score % 31) / 100;
}

export function clubDivision(club: Club) {
  if (club.division) return club.division;
  const lowerTier = /Championship|Segunda|2\. Bundesliga|Serie B|Ligue 2|Liga Portugal 2|Eerste Divisie|Série B|Primera Nacional|Liga 3/;
  return lowerTier.test(club.league) ? 2 : 1;
}

function tierFinance(club: Club): TierFinance {
  const division = clubDivision(club);
  const configured = TIER_FINANCES[`${club.country}:${division}`];
  if (configured) return configured;
  if (division === 1) {
    return COUNTRY_TOP_FLIGHT[club.country]
      ?? { squadValueProxy: 65_000_000, hardMaxSingleFee: 30_000_000 };
  }
  if (division === 2) return { squadValueProxy: 20_000_000, hardMaxSingleFee: 12_000_000 };
  if (division === 3) return { squadValueProxy: 8_000_000, hardMaxSingleFee: 4_000_000 };
  if (division === 4) return { squadValueProxy: 3_000_000, hardMaxSingleFee: 1_500_000 };
  return { squadValueProxy: 1_000_000, hardMaxSingleFee: 500_000 };
}

export function clubFinance(club: Club): ClubFinance {
  const explicit = CLUB_FINANCIAL_BANDS[`${club.country}:${club.name}`];
  const division = clubDivision(club);
  const seeded = division === 1 && club.division === undefined
    ? clamp(club.level, 1, 5)
    : division === 1 ? 2 : club.level >= 2 ? 3 : 2;
  return {
    financialBand: explicit ?? seeded as FinancialBand,
    financeSource: "goalbound",
    financeSeason: CATALOG_SEASON,
  };
}

export function maxSingleFee(club: Club, role: Role, marqueeFactor = 1) {
  const tier = tierFinance(club);
  const { financialBand } = clubFinance(club);
  const estimate = .10
    * tier.squadValueProxy
    * FINANCIAL_MULTIPLIER[financialBand]
    * seededWindowFactor(club)
    * ROLE_FACTOR[role]
    * clamp(marqueeFactor, 1, 1.4);
  const rounding = clubDivision(club) <= 2 ? 50_000 : 10_000;
  return Math.round(Math.min(tier.hardMaxSingleFee, estimate) / rounding) * rounding;
}
