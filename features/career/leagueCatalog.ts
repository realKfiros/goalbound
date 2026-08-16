import type { Club } from "./domain";

export const CATALOG_SEASON = "2026–27";

type LeagueSeed = {
  country: string;
  league: string;
  division: number;
  expectedClubs: number;
  clubs: readonly string[];
};

export const COMPLETE_LEAGUES: readonly LeagueSeed[] = [
  {
    country: "ENG", league: "Premier League", division: 1, expectedClubs: 20,
    clubs: [
      "Arsenal", "Aston Villa", "AFC Bournemouth", "Brentford", "Brighton & Hove Albion",
      "Chelsea", "Coventry City", "Crystal Palace", "Everton", "Fulham", "Hull City",
      "Ipswich Town", "Leeds United", "Liverpool", "Manchester City", "Manchester United",
      "Newcastle United", "Nottingham Forest", "Sunderland", "Tottenham Hotspur",
    ],
  },
  {
    country: "ENG", league: "EFL Championship", division: 2, expectedClubs: 24,
    clubs: [
      "Millwall", "Southampton", "Middlesbrough", "Wrexham", "Derby County", "Norwich City",
      "Birmingham City", "Swansea City", "Bristol City", "Sheffield United", "Preston North End",
      "Queens Park Rangers", "Watford", "Stoke City", "Portsmouth", "Charlton Athletic",
      "Blackburn Rovers", "West Bromwich Albion", "Wolverhampton Wanderers", "Burnley",
      "West Ham United", "Lincoln City", "Cardiff City", "Bolton Wanderers",
    ],
  },
  {
    country: "ENG", league: "EFL League One", division: 3, expectedClubs: 24,
    clubs: [
      "Stockport County", "Bradford City", "Stevenage", "Luton Town", "Plymouth Argyle",
      "Huddersfield Town", "Mansfield Town", "Wycombe Wanderers", "Reading", "Blackpool",
      "Doncaster Rovers", "Barnsley", "Wigan Athletic", "Burton Albion", "Peterborough United",
      "AFC Wimbledon", "Leyton Orient", "Leicester City", "Sheffield Wednesday", "Oxford United",
      "Bromley", "Milton Keynes Dons", "Cambridge United", "Notts County",
    ],
  },
  {
    country: "ENG", league: "EFL League Two", division: 4, expectedClubs: 24,
    clubs: [
      "Newport County", "Rochdale", "Oldham Athletic", "Port Vale", "Accrington Stanley",
      "Colchester United", "Barnet", "Salford City", "Cheltenham Town", "Rotherham United",
      "Chesterfield", "Fleetwood Town", "Crawley Town", "Crewe Alexandra", "Gillingham",
      "Walsall", "Grimsby Town", "Exeter City", "Northampton Town", "Swindon Town",
      "Tranmere Rovers", "Shrewsbury Town", "York City", "Bristol Rovers",
    ],
  },
  {
    country: "ENG", league: "National League", division: 5, expectedClubs: 24,
    clubs: [
      "AFC Fylde", "Aldershot Town", "Altrincham", "Barrow", "Boreham Wood",
      "Carlisle United", "Dorking Wanderers", "Eastleigh", "FC Halifax Town",
      "Forest Green Rovers", "Gateshead", "Harrogate Town", "Hartlepool United",
      "Macclesfield", "Morecambe", "Scunthorpe United", "Solihull Moors", "Southend United",
      "Sutton United", "Tamworth", "Torquay United", "Wealdstone", "Woking", "Yeovil Town",
    ],
  },
  {
    country: "ESP", league: "La Liga", division: 1, expectedClubs: 20,
    clubs: [
      "Athletic Club", "Atlético Madrid", "CA Osasuna", "RC Celta", "Deportivo Alavés",
      "Elche CF", "FC Barcelona", "Getafe CF", "Levante UD", "Málaga CF",
      "Racing de Santander", "Rayo Vallecano", "RC Deportivo de La Coruña", "RCD Espanyol",
      "Real Betis", "Real Madrid", "Real Sociedad", "Sevilla FC", "Valencia CF", "Villarreal",
    ],
  },
  {
    country: "ESP", league: "Segunda División", division: 2, expectedClubs: 22,
    clubs: [
      "AD Ceuta FC", "Albacete BP", "Burgos CF", "Cádiz CF", "CD Castellón", "CD Eldense",
      "CD Leganés", "CD Tenerife", "CE Sabadell", "Celta Fortuna", "Córdoba CF", "FC Andorra",
      "Girona FC", "Granada CF", "Real Sociedad B", "RCD Mallorca", "Real Oviedo",
      "Sporting Gijón", "Real Valladolid CF", "Eibar", "UD Almería", "UD Las Palmas",
    ],
  },
  {
    country: "GER", league: "Bundesliga", division: 1, expectedClubs: 18,
    clubs: [
      "FC Augsburg", "1. FC Union Berlin", "Werder Bremen", "Borussia Dortmund",
      "SV Elversberg", "Eintracht Frankfurt", "SC Freiburg", "Hamburger SV", "TSG Hoffenheim",
      "1. FC Köln", "RB Leipzig", "Bayer Leverkusen", "Mainz 05", "Borussia Mönchengladbach",
      "Bayern Munich", "SC Paderborn 07", "Schalke 04", "VfB Stuttgart",
    ],
  },
  {
    country: "GER", league: "2. Bundesliga", division: 2, expectedClubs: 18,
    clubs: [
      "VfL Wolfsburg", "1. FC Heidenheim", "FC St. Pauli", "Hannover 96",
      "SV Darmstadt 98", "1. FC Kaiserslautern", "Hertha BSC", "1. FC Nürnberg",
      "VfL Bochum", "Karlsruher SC", "Dynamo Dresden", "Holstein Kiel",
      "Arminia Bielefeld", "1. FC Magdeburg", "Eintracht Braunschweig", "Greuther Fürth",
      "VfL Osnabrück", "Energie Cottbus",
    ],
  },
  {
    country: "ITA", league: "Serie A", division: 1, expectedClubs: 20,
    clubs: [
      "Atalanta", "Bologna", "Cagliari", "Como", "Fiorentina", "Frosinone", "Genoa",
      "Inter Milan", "Juventus", "Lazio", "Lecce", "AC Milan", "Monza", "Napoli",
      "Parma", "Roma", "Sassuolo", "Torino", "Udinese", "Venezia",
    ],
  },
  {
    country: "ITA", league: "Serie B", division: 2, expectedClubs: 20,
    clubs: [
      "Arezzo", "Ascoli", "Avellino", "Benevento", "Carrarese", "Catanzaro", "Cesena",
      "Cremonese", "Empoli", "Hellas Verona", "Juve Stabia", "L.R. Vicenza", "Mantova",
      "Modena", "Padova", "Palermo", "Pisa", "Sampdoria", "Südtirol", "Virtus Entella",
    ],
  },
  {
    country: "FRA", league: "Ligue 1", division: 1, expectedClubs: 18,
    clubs: [
      "Angers SCO", "AJ Auxerre", "Stade Brestois 29", "Le Havre AC", "Le Mans FC",
      "RC Lens", "FC Lorient", "Lille", "Olympique Lyonnais", "Olympique Marseille",
      "AS Monaco", "OGC Nice", "Paris FC", "Paris Saint-Germain", "Stade Rennais",
      "RC Strasbourg Alsace", "Toulouse FC", "ESTAC Troyes",
    ],
  },
  {
    country: "FRA", league: "Ligue 2", division: 2, expectedClubs: 16,
    clubs: [
      "US Boulogne CO", "AS Nancy Lorraine", "Clermont Foot", "Stade de Reims", "FC Metz",
      "Guingamp", "Montpellier HSC", "Dijon FCO", "FC Nantes", "Red Star FC", "Pau FC",
      "FC Annecy", "Rodez AF", "Stade Lavallois", "FC Sochaux-Montbéliard", "Saint-Étienne",
    ],
  },
  {
    country: "POR", league: "Primeira Liga", division: 1, expectedClubs: 18,
    clubs: [
      "FC Porto", "Sporting CP", "Benfica", "Braga", "FC Famalicão", "Gil Vicente",
      "Moreirense", "FC Arouca", "Vitória SC", "Estoril Praia", "FC Alverca", "Rio Ave",
      "Santa Clara", "Nacional", "Estrela da Amadora", "Casa Pia", "Marítimo",
      "Académico de Viseu",
    ],
  },
  {
    country: "POR", league: "Liga Portugal 2", division: 2, expectedClubs: 18,
    clubs: [
      "CD Tondela", "AVS", "Torreense", "Vizela", "FC Porto B", "União de Leiria",
      "Leixões", "Feirense", "Chaves", "Benfica B", "Felgueiras", "Lusitânia Lourosa",
      "Sporting CP B", "Penafiel", "Portimonense", "Farense", "Amarante", "Académica",
    ],
  },
  {
    country: "NED", league: "Eredivisie", division: 1, expectedClubs: 18,
    clubs: [
      "ADO Den Haag", "Ajax", "AZ Alkmaar", "Excelsior Rotterdam", "FC Groningen",
      "FC Twente", "FC Utrecht", "Feyenoord", "Fortuna Sittard", "Go Ahead Eagles",
      "NEC Nijmegen", "PEC Zwolle", "PSV Eindhoven", "SC Cambuur", "sc Heerenveen",
      "Sparta Rotterdam", "Telstar", "Willem II",
    ],
  },
  {
    country: "NED", league: "Eerste Divisie", division: 2, expectedClubs: 20,
    clubs: [
      "FC Dordrecht", "Jong Ajax", "FC Emmen", "Roda JC", "TOP Oss", "NAC Breda",
      "Vitesse", "RKC Waalwijk", "VVV-Venlo", "Heracles Almelo", "FC Den Bosch",
      "Almere City FC", "MVV Maastricht", "Jong FC Utrecht", "Helmond Sport",
      "De Graafschap", "Jong AZ", "FC Eindhoven", "Jong PSV", "FC Volendam",
    ],
  },
  {
    country: "ISR", league: "Israeli Premier League", division: 1, expectedClubs: 14,
    clubs: [
      "Hapoel Be’er Sheva", "Beitar Jerusalem", "Maccabi Tel Aviv", "Hapoel Tel Aviv",
      "Maccabi Haifa", "Hapoel Petah Tikva", "Maccabi Netanya", "Ironi Kiryat Shmona",
      "Ironi Tiberias", "Hapoel Haifa", "Bnei Sakhnin", "Hapoel Jerusalem",
      "Maccabi Petah Tikva", "Hapoel Ramat Gan",
    ],
  },
  {
    country: "POL", league: "Ekstraklasa", division: 1, expectedClubs: 18,
    clubs: [
      "Zagłębie Lubin", "Wisła Płock", "Wisła Kraków", "Górnik Zabrze", "Radomiak Radom",
      "Legia Warszawa", "Jagiellonia Białystok", "Motor Lublin", "Widzew Łódź",
      "Lech Poznań", "Cracovia", "Raków Częstochowa", "Śląsk Wrocław", "GKS Katowice",
      "Wieczysta Kraków", "Korona Kielce", "Pogoń Szczecin", "Piast Gliwice",
    ],
  },
  {
    country: "CYP", league: "Cypriot First Division", division: 1, expectedClubs: 14,
    clubs: [
      "AEK Larnaca", "AEL Limassol", "ALS Omonia 29M", "Anorthosis Famagusta",
      "APOEL Nicosia", "Apollon Limassol", "Aris Limassol", "Nea Salamina Famagusta",
      "Karmiotissa Polemidion", "Olympiakos Nicosia", "Omonia Aradippou", "Omonia Nicosia",
      "Pafos FC", "Krasava ENY",
    ],
  },
  {
    country: "BRA", league: "Brasileirão", division: 1, expectedClubs: 20,
    clubs: [
      "Athletico Paranaense", "Atlético Mineiro", "Bahia", "Botafogo", "Chapecoense",
      "Corinthians", "Coritiba", "Cruzeiro", "Flamengo", "Fluminense", "Grêmio",
      "Internacional", "Mirassol", "Palmeiras", "Red Bull Bragantino", "Remo", "Santos",
      "São Paulo", "Vasco da Gama", "Vitória",
    ],
  },
  {
    country: "ARG", league: "Liga Profesional", division: 1, expectedClubs: 30,
    clubs: [
      "Aldosivi", "Argentinos Juniors", "Atlético Tucumán", "Banfield", "Barracas Central",
      "Belgrano", "Boca Juniors", "Central Córdoba", "Defensa y Justicia",
      "Deportivo Riestra", "Estudiantes (BA)", "Estudiantes de La Plata",
      "Gimnasia de Mendoza", "Gimnasia y Esgrima La Plata", "Huracán", "Independiente",
      "Independiente Rivadavia", "Instituto", "Lanús", "Newell's Old Boys", "Platense",
      "Racing Club", "River Plate", "Rosario Central", "San Lorenzo", "Sarmiento",
      "Talleres", "Tigre", "Unión", "Vélez Sarsfield",
    ],
  },
  {
    country: "USA", league: "Major League Soccer", division: 1, expectedClubs: 30,
    clubs: [
      "Atlanta United", "Austin FC", "Charlotte FC", "Chicago Fire", "FC Cincinnati",
      "Colorado Rapids", "Columbus Crew", "D.C. United", "FC Dallas", "Houston Dynamo",
      "Inter Miami", "LA Galaxy", "Los Angeles FC", "Minnesota United", "CF Montréal",
      "Nashville SC", "New England Revolution", "New York City FC", "New York Red Bulls",
      "Orlando City", "Philadelphia Union", "Portland Timbers", "Real Salt Lake",
      "San Diego FC", "San Jose Earthquakes", "Seattle Sounders", "Sporting Kansas City",
      "St. Louis CITY", "Toronto FC", "Vancouver Whitecaps",
    ],
  },
  {
    country: "BEL", league: "Belgian Pro League", division: 1, expectedClubs: 18,
    clubs: [
      "RSC Anderlecht", "Royal Antwerp", "Cercle Brugge", "Club Brugge", "KAA Gent", "Genk",
      "KV Kortrijk", "KV Mechelen", "KVC Westerlo", "Lommel SK", "OH Leuven",
      "RAAL La Louvière", "Sporting Charleroi", "SK Beveren", "Standard Liège", "STVV",
      "Union Saint-Gilloise", "Zulte Waregem",
    ],
  },
  {
    country: "SCO", league: "Scottish Premiership", division: 1, expectedClubs: 12,
    clubs: [
      "Aberdeen", "Celtic", "Dundee", "Dundee United", "Falkirk", "Heart of Midlothian",
      "Hibernian", "Kilmarnock", "Motherwell", "Rangers", "St Johnstone", "St Mirren",
    ],
  },
  {
    country: "TUR", league: "Süper Lig", division: 1, expectedClubs: 18,
    clubs: [
      "Alanyaspor", "Amedspor", "Beşiktaş", "Çaykur Rizespor", "Çorum FK", "Erzurumspor",
      "Eyüpspor", "Fenerbahçe", "Galatasaray", "Gaziantep FK", "Gençlerbirliği", "Göztepe",
      "İstanbul Başakşehir", "Kasımpaşa", "Kocaelispor", "Konyaspor", "Samsunspor",
      "Trabzonspor",
    ],
  },
  {
    country: "CRO", league: "Croatian Football League", division: 1, expectedClubs: 10,
    clubs: [
      "Dinamo Zagreb", "HNK Gorica", "Hajduk Split", "HNK Rijeka", "Istra 1961",
      "Lokomotiva Zagreb", "Osijek", "Rudeš", "Slaven Belupo", "Varaždin",
    ],
  },
  {
    country: "GRE", league: "Super League Greece", division: 1, expectedClubs: 14,
    clubs: [
      "AEK Athens", "Aris Thessaloniki", "Asteras Tripolis", "Atromitos", "Volos",
      "Iraklis", "Kalamata", "Kifisia", "Levadiakos", "Olympiacos", "OFI Crete",
      "Panathinaikos", "Panetolikos", "PAOK",
    ],
  },
  {
    country: "SAU", league: "Saudi Pro League", division: 1, expectedClubs: 18,
    clubs: [
      "Abha", "Al Ahli", "Al Ettifaq", "Al Faisaly", "Al Fateh", "Al Fayha", "Al Hazem",
      "Al Hilal", "Al Ittihad", "Al Khaleej", "Al Kholood", "Al Nassr", "Al Qadsiah",
      "Al Riyadh", "Al Shabab", "Al Taawoun", "Diriyah Club", "Neom S.C.",
    ],
  },
  {
    country: "JPN", league: "J1 League", division: 1, expectedClubs: 20,
    clubs: [
      "Avispa Fukuoka", "Cerezo Osaka", "F.C. Tokyo", "Fagiano Okayama", "Gamba Osaka",
      "JEF United Chiba", "Kashima Antlers", "Kashiwa Reysol", "Kawasaki Frontale",
      "Kyoto Sanga", "Machida Zelvia", "Mito Hollyhock", "Nagoya Grampus",
      "Sanfrecce Hiroshima", "Shimizu S-Pulse", "Tokyo Verdy", "Urawa Red Diamonds",
      "V-Varen Nagasaki", "Vissel Kobe", "Yokohama F. Marinos",
    ],
  },
  {
    country: "MEX", league: "Liga MX", division: 1, expectedClubs: 18,
    clubs: [
      "Club América", "Atlas", "Atlético San Luis", "Cruz Azul", "Guadalajara", "FC Juárez",
      "León", "Mazatlán", "Monterrey", "Necaxa", "Pachuca", "Puebla", "Pumas UNAM",
      "Querétaro", "Santos Laguna", "Tigres UANL", "Tijuana", "Toluca",
    ],
  },
] as const;

const PALETTE = ["#c7ff35", "#45b7ff", "#ff5c7a", "#ffc857", "#9b7bff", "#36d399", "#ff8a3d"];
const COUNTRY_LEVEL: Record<string, number> = {
  ENG: 4, ESP: 4, GER: 4, ITA: 4, FRA: 4, POR: 3, NED: 3, BRA: 4, ARG: 4,
  USA: 3, BEL: 3, SCO: 3, TUR: 3, SAU: 4, JPN: 3, MEX: 3,
  ISR: 2, POL: 2, CYP: 2, CRO: 2, GRE: 3,
};

function shortName(name: string) {
  const tokens = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !["FC", "AFC", "CF", "AC", "AS", "SC", "CD", "UD", "RC"].includes(token.toUpperCase()));
  if (tokens.length === 0) return "FC";
  if (tokens.length === 1) return tokens[0].slice(0, 3).toUpperCase();
  return tokens.map((token) => token[0]).join("").slice(0, 4).toUpperCase();
}

function clubColor(name: string) {
  const score = [...name].reduce((total, letter) => total + letter.codePointAt(0)!, 0);
  return PALETTE[score % PALETTE.length];
}

function profile(country: string, division: number) {
  if (division === 1) return { level: COUNTRY_LEVEL[country] ?? 2, development: ["GER", "FRA", "POR", "NED", "BRA", "ARG", "BEL", "CRO", "JPN"].includes(country) ? 4 : 3 };
  if (division === 2) return { level: 2, development: 4 };
  if (division === 3) return { level: 2, development: 4 };
  return { level: 1, development: division === 4 ? 4 : 3 };
}

for (const league of COMPLETE_LEAGUES) {
  if (league.clubs.length !== league.expectedClubs) {
    throw new Error(`${league.league} catalog has ${league.clubs.length} clubs; expected ${league.expectedClubs}.`);
  }
}

export const FULL_LEAGUE_CLUBS: Club[] = COMPLETE_LEAGUES.flatMap((league) =>
  league.clubs.map((name) => ({
    name,
    country: league.country,
    league: league.league,
    division: league.division,
    ...profile(league.country, league.division),
    identity: league.division === 1
      ? `${league.league} football · pressure arrives before patience`
      : `${league.league} pathway · senior minutes over glamour`,
    short: shortName(name),
    colors: clubColor(name),
  })),
);

export const COMPLETE_LEAGUE_CLUB_COUNT = FULL_LEAGUE_CLUBS.length;

if (COMPLETE_LEAGUE_CLUB_COUNT !== 596) {
  throw new Error(`Complete catalog has ${COMPLETE_LEAGUE_CLUB_COUNT} clubs; expected 596.`);
}

const uniqueClubKeys = new Set(FULL_LEAGUE_CLUBS.map((club) => `${club.country}:${club.name}`));
if (uniqueClubKeys.size !== COMPLETE_LEAGUE_CLUB_COUNT) {
  throw new Error("Complete catalog contains a duplicate club.");
}
