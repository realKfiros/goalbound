import type { Club, Country, Scenario } from "./domain";
import { FULL_LEAGUE_CLUBS } from "./leagueCatalog";

const ORIGINAL_START_COUNTRIES: Country[] = [
  { code: "ENG", name: "England", flag: "🇬🇧", threshold: 83 },
  { code: "ESP", name: "Spain", flag: "🇪🇸", threshold: 83 },
  { code: "GER", name: "Germany", flag: "🇩🇪", threshold: 82 },
  { code: "ITA", name: "Italy", flag: "🇮🇹", threshold: 82 },
  { code: "FRA", name: "France", flag: "🇫🇷", threshold: 84 },
  { code: "POR", name: "Portugal", flag: "🇵🇹", threshold: 80 },
  { code: "NED", name: "Netherlands", flag: "🇳🇱", threshold: 80 },
  { code: "BRA", name: "Brazil", flag: "🇧🇷", threshold: 84 },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", threshold: 84 },
  { code: "USA", name: "United States", flag: "🇺🇸", threshold: 75 },
];

const EXTRA_COUNTRIES: Country[] = [
  { code: "ISR", name: "Israel", flag: "🇮🇱", threshold: 76 },
  { code: "POL", name: "Poland", flag: "🇵🇱", threshold: 78 },
  { code: "CYP", name: "Cyprus", flag: "🇨🇾", threshold: 73 },
  { code: "BEL", name: "Belgium", flag: "🇧🇪", threshold: 78 },
  { code: "SCO", name: "Scotland", flag: "🏴", threshold: 76 },
  { code: "TUR", name: "Türkiye", flag: "🇹🇷", threshold: 78 },
  { code: "CRO", name: "Croatia", flag: "🇭🇷", threshold: 78 },
  { code: "GRE", name: "Greece", flag: "🇬🇷", threshold: 76 },
  { code: "AUT", name: "Austria", flag: "🇦🇹", threshold: 79 },
  { code: "CZE", name: "Czechia", flag: "🇨🇿", threshold: 79 },
  { code: "DEN", name: "Denmark", flag: "🇩🇰", threshold: 80 },
  { code: "SUI", name: "Switzerland", flag: "🇨🇭", threshold: 79 },
  { code: "NOR", name: "Norway", flag: "🇳🇴", threshold: 79 },
  { code: "SWE", name: "Sweden", flag: "🇸🇪", threshold: 79 },
  { code: "UKR", name: "Ukraine", flag: "🇺🇦", threshold: 80 },
  { code: "SRB", name: "Serbia", flag: "🇷🇸", threshold: 78 },
  { code: "ROU", name: "Romania", flag: "🇷🇴", threshold: 77 },
  { code: "HUN", name: "Hungary", flag: "🇭🇺", threshold: 77 },
  { code: "SAU", name: "Saudi Arabia", flag: "🇸🇦", threshold: 72 },
  { code: "JPN", name: "Japan", flag: "🇯🇵", threshold: 75 },
  { code: "MEX", name: "Mexico", flag: "🇲🇽", threshold: 76 },
  { code: "ALB", name: "Albania", flag: "🇦🇱", threshold: 75 },
  { code: "AND", name: "Andorra", flag: "🇦🇩", threshold: 68 },
  { code: "ARM", name: "Armenia", flag: "🇦🇲", threshold: 73 },
  { code: "AZE", name: "Azerbaijan", flag: "🇦🇿", threshold: 73 },
  { code: "BLR", name: "Belarus", flag: "🇧🇾", threshold: 74 },
  { code: "BIH", name: "Bosnia and Herzegovina", flag: "🇧🇦", threshold: 77 },
  { code: "BUL", name: "Bulgaria", flag: "🇧🇬", threshold: 76 },
  { code: "EST", name: "Estonia", flag: "🇪🇪", threshold: 70 },
  { code: "FRO", name: "Faroe Islands", flag: "🇫🇴", threshold: 70 },
  { code: "FIN", name: "Finland", flag: "🇫🇮", threshold: 75 },
  { code: "GEO", name: "Georgia", flag: "🇬🇪", threshold: 78 },
  { code: "GIB", name: "Gibraltar", flag: "🇬🇮", threshold: 67 },
  { code: "ISL", name: "Iceland", flag: "🇮🇸", threshold: 75 },
  { code: "KAZ", name: "Kazakhstan", flag: "🇰🇿", threshold: 73 },
  { code: "KOS", name: "Kosovo", flag: "🇽🇰", threshold: 74 },
  { code: "LVA", name: "Latvia", flag: "🇱🇻", threshold: 71 },
  { code: "LTU", name: "Lithuania", flag: "🇱🇹", threshold: 71 },
  { code: "LUX", name: "Luxembourg", flag: "🇱🇺", threshold: 75 },
  { code: "MLT", name: "Malta", flag: "🇲🇹", threshold: 70 },
  { code: "MDA", name: "Moldova", flag: "🇲🇩", threshold: 71 },
  { code: "MNE", name: "Montenegro", flag: "🇲🇪", threshold: 75 },
  { code: "MKD", name: "North Macedonia", flag: "🇲🇰", threshold: 75 },
  { code: "NIR", name: "Northern Ireland", flag: "🇬🇧", threshold: 74 },
  { code: "IRL", name: "Republic of Ireland", flag: "🇮🇪", threshold: 75 },
  { code: "SMR", name: "San Marino", flag: "🇸🇲", threshold: 64 },
  { code: "SVK", name: "Slovakia", flag: "🇸🇰", threshold: 78 },
  { code: "SVN", name: "Slovenia", flag: "🇸🇮", threshold: 79 },
  { code: "WAL", name: "Wales", flag: "🏴", threshold: 77 },
];

export const COUNTRIES = [...ORIGINAL_START_COUNTRIES, ...EXTRA_COUNTRIES];
export const START_COUNTRIES = COUNTRIES;
export const POSITIONS = ["LW", "ST", "RW", "CAM", "CM", "CDM", "LB", "CB", "RB", "GK"];
const crest = (id: number) => `https://crests.football-data.org/${id}.png`;

const FEATURED_CLUBS: Club[] = [
  { name: "Arsenal", country: "ENG", league: "Premier League", level: 5, development: 5, identity: "Young, technical, impatient", short: "ARS", colors: "#e30613", crest: crest(57) },
  { name: "Liverpool", country: "ENG", league: "Premier League", level: 5, development: 4, identity: "Intensity and expectation", short: "LIV", colors: "#c8102e", crest: crest(64) },
  { name: "Manchester City", country: "ENG", league: "Premier League", level: 5, development: 3, identity: "Elite squad, tiny margin", short: "MCI", colors: "#6cabdd", crest: crest(65) },
  { name: "Chelsea", country: "ENG", league: "Premier League", level: 5, development: 4, identity: "Talent everywhere", short: "CHE", colors: "#034694", crest: crest(61) },
  { name: "Brighton & Hove Albion", country: "ENG", league: "Premier League", level: 3, development: 5, identity: "Smart pathway to the top", short: "BHA", colors: "#0057b8", crest: crest(397) },
  { name: "Southampton", country: "ENG", league: "English Championship", level: 2, development: 5, identity: "Minutes before headlines", short: "SOU", colors: "#d71920", crest: crest(340) },
  { name: "Sunderland", country: "ENG", league: "English Championship", level: 2, development: 4, identity: "A huge crowd and a real pathway", short: "SUN", colors: "#eb172b" },
  { name: "Coventry City", country: "ENG", league: "English Championship", level: 1, development: 4, identity: "A first team that rewards patience", short: "COV", colors: "#69b3e7" },
  { name: "Bristol City", country: "ENG", league: "English Championship", level: 1, development: 4, identity: "Senior minutes without celebrity", short: "BRC", colors: "#e21a2d", crest: "https://r2.thesportsdb.com/images/media/team/badge/0ejxwz1601721013.png" },

  { name: "Real Madrid", country: "ESP", league: "La Liga", level: 5, development: 3, identity: "Win now or become trivia", short: "RMA", colors: "#ffffff", crest: crest(86) },
  { name: "FC Barcelona", country: "ESP", league: "La Liga", level: 5, development: 5, identity: "Academy ideals, global pressure", short: "BAR", colors: "#a50044", crest: crest(81) },
  { name: "Atlético Madrid", country: "ESP", league: "La Liga", level: 5, development: 3, identity: "Earn every metre", short: "ATM", colors: "#cb3524", crest: crest(78) },
  { name: "Real Sociedad", country: "ESP", league: "La Liga", level: 4, development: 5, identity: "Patient technical growth", short: "RSO", colors: "#0067b1", crest: crest(92) },
  { name: "Villarreal", country: "ESP", league: "La Liga", level: 4, development: 4, identity: "European nights, clear roles", short: "VIL", colors: "#ffe667", crest: crest(94) },
  { name: "Real Betis", country: "ESP", league: "La Liga", level: 3, development: 4, identity: "Flair with a loud soundtrack", short: "BET", colors: "#00954c", crest: crest(90) },
  { name: "Real Zaragoza", country: "ESP", league: "Segunda División", level: 2, development: 4, identity: "A grand name rebuilding patiently", short: "ZAR", colors: "#ffffff" },
  { name: "Sporting Gijón", country: "ESP", league: "Segunda División", level: 1, development: 5, identity: "A traditional academy route", short: "GIJ", colors: "#d71920" },
  { name: "Eibar", country: "ESP", league: "Segunda División", level: 1, development: 4, identity: "Small ground, serious football", short: "EIB", colors: "#005eb8" },

  { name: "Bayern Munich", country: "GER", league: "Bundesliga", level: 5, development: 3, identity: "Titles are the minimum", short: "FCB", colors: "#dc052d", crest: crest(5) },
  { name: "Borussia Dortmund", country: "GER", league: "Bundesliga", level: 5, development: 5, identity: "Young talent on a huge stage", short: "BVB", colors: "#fde100", crest: crest(4) },
  { name: "Bayer Leverkusen", country: "GER", league: "Bundesliga", level: 5, development: 4, identity: "Modern and relentless", short: "B04", colors: "#e32221", crest: crest(3) },
  { name: "RB Leipzig", country: "GER", league: "Bundesliga", level: 4, development: 5, identity: "Fast-track development", short: "RBL", colors: "#dd0741", crest: crest(721) },
  { name: "Eintracht Frankfurt", country: "GER", league: "Bundesliga", level: 4, development: 4, identity: "Big nights, fierce crowd", short: "SGE", colors: "#e1000f", crest: crest(19) },
  { name: "SC Freiburg", country: "GER", league: "Bundesliga", level: 3, development: 5, identity: "Coaching over celebrity", short: "SCF", colors: "#e2001a", crest: crest(17) },
  { name: "Hannover 96", country: "GER", league: "2. Bundesliga", level: 2, development: 4, identity: "A big club looking upward", short: "H96", colors: "#179d64" },
  { name: "Karlsruher SC", country: "GER", league: "2. Bundesliga", level: 1, development: 5, identity: "Development before headlines", short: "KSC", colors: "#005ca9" },
  { name: "Fortuna Düsseldorf", country: "GER", league: "2. Bundesliga", level: 2, development: 4, identity: "Ambition with room to play", short: "F95", colors: "#e30613" },

  { name: "Inter Milan", country: "ITA", league: "Serie A", level: 5, development: 3, identity: "Tactical detail, title pressure", short: "INT", colors: "#0068a8", crest: crest(108) },
  { name: "AC Milan", country: "ITA", league: "Serie A", level: 5, development: 4, identity: "History watching every touch", short: "MIL", colors: "#fb090b", crest: crest(98) },
  { name: "Juventus", country: "ITA", league: "Serie A", level: 5, development: 3, identity: "Winning is considered admin", short: "JUV", colors: "#ffffff", crest: crest(109) },
  { name: "Napoli", country: "ITA", league: "Serie A", level: 5, development: 4, identity: "Football as civic religion", short: "NAP", colors: "#12a0d7", crest: crest(113) },
  { name: "Atalanta", country: "ITA", league: "Serie A", level: 4, development: 5, identity: "A development laboratory", short: "ATA", colors: "#1d71b8", crest: crest(102) },
  { name: "Bologna", country: "ITA", league: "Serie A", level: 3, development: 5, identity: "Smart coaching, real minutes", short: "BOL", colors: "#1a2f48", crest: crest(103) },
  { name: "Palermo", country: "ITA", league: "Serie B", level: 2, development: 4, identity: "A football city waiting to rise", short: "PAL", colors: "#f5a6c8" },
  { name: "Bari", country: "ITA", league: "Serie B", level: 1, development: 4, identity: "Pressure, patience and senior minutes", short: "BAR", colors: "#d71920" },
  { name: "Cesena", country: "ITA", league: "Serie B", level: 1, development: 5, identity: "A quieter place to become a pro", short: "CES", colors: "#ffffff" },

  { name: "Paris Saint-Germain", country: "FRA", league: "Ligue 1", level: 5, development: 2, identity: "Superstars and spotlights", short: "PSG", colors: "#004170", crest: crest(524) },
  { name: "AS Monaco", country: "FRA", league: "Ligue 1", level: 4, development: 5, identity: "The launchpad with a view", short: "ASM", colors: "#e20e17", crest: crest(548) },
  { name: "Lille", country: "FRA", league: "Ligue 1", level: 4, development: 5, identity: "Recruit, improve, compete", short: "LOSC", colors: "#e01e13", crest: crest(521) },
  { name: "Olympique Marseille", country: "FRA", league: "Ligue 1", level: 4, development: 3, identity: "Volcanic support", short: "OM", colors: "#2faee0", crest: crest(516) },
  { name: "Olympique Lyonnais", country: "FRA", league: "Ligue 1", level: 3, development: 5, identity: "Academy DNA", short: "OL", colors: "#1b2d57", crest: crest(523) },
  { name: "Stade Rennais", country: "FRA", league: "Ligue 1", level: 3, development: 5, identity: "Young players get trusted", short: "REN", colors: "#d71920", crest: crest(529) },
  { name: "Saint-Étienne", country: "FRA", league: "Ligue 2", level: 2, development: 5, identity: "History, youth and a demanding crowd", short: "ASSE", colors: "#008c4a" },
  { name: "Caen", country: "FRA", league: "Ligue 2", level: 1, development: 4, identity: "A proper first professional step", short: "SMC", colors: "#0055a5" },
  { name: "Guingamp", country: "FRA", league: "Ligue 2", level: 1, development: 5, identity: "A small club that trusts its pathway", short: "EAG", colors: "#e30613" },

  { name: "Benfica", country: "POR", league: "Primeira Liga", level: 4, development: 5, identity: "Elite talent factory", short: "SLB", colors: "#e30613", crest: crest(1903) },
  { name: "FC Porto", country: "POR", league: "Primeira Liga", level: 4, development: 5, identity: "Europe's hardest shop window", short: "FCP", colors: "#00428c", crest: crest(503) },
  { name: "Sporting CP", country: "POR", league: "Primeira Liga", level: 4, development: 5, identity: "Academy first, trophies too", short: "SCP", colors: "#008c5a", crest: crest(498) },
  { name: "Braga", country: "POR", league: "Primeira Liga", level: 3, development: 5, identity: "A clever first European step", short: "BRA", colors: "#e30613" },
  { name: "Vitória SC", country: "POR", league: "Primeira Liga", level: 2, development: 4, identity: "A noisy place to grow up", short: "VSC", colors: "#ffffff" },
  { name: "Marítimo", country: "POR", league: "Liga Portugal 2", level: 1, development: 4, identity: "Island life and immediate responsibility", short: "MAR", colors: "#008c45" },
  { name: "Académica", country: "POR", league: "Liga 3", level: 1, development: 5, identity: "A famous classroom for footballers", short: "AAC", colors: "#111111" },

  { name: "Ajax", country: "NED", league: "Eredivisie", level: 4, development: 5, identity: "The academy is the identity", short: "AJA", colors: "#d2122e", crest: crest(678) },
  { name: "PSV Eindhoven", country: "NED", league: "Eredivisie", level: 4, development: 5, identity: "Attack, develop, repeat", short: "PSV", colors: "#ed1c24", crest: crest(674) },
  { name: "Feyenoord", country: "NED", league: "Eredivisie", level: 4, development: 4, identity: "A demanding football city", short: "FEY", colors: "#e41e2b", crest: crest(675) },
  { name: "AZ Alkmaar", country: "NED", league: "Eredivisie", level: 3, development: 5, identity: "Data, youth, opportunity", short: "AZ", colors: "#d71920", crest: crest(682) },
  { name: "FC Utrecht", country: "NED", league: "Eredivisie", level: 2, development: 4, identity: "Minutes without the microscope", short: "UTR", colors: "#e30613" },
  { name: "Willem II", country: "NED", league: "Eerste Divisie", level: 1, development: 5, identity: "A direct route to senior football", short: "WIL", colors: "#d71920" },
  { name: "NAC Breda", country: "NED", league: "Eerste Divisie", level: 1, development: 4, identity: "A loud crowd and honest minutes", short: "NAC", colors: "#f2c600" },

  { name: "Flamengo", country: "BRA", league: "Brasileirão", level: 5, development: 4, identity: "A nation-sized fanbase", short: "FLA", colors: "#d71920" },
  { name: "Palmeiras", country: "BRA", league: "Brasileirão", level: 5, development: 5, identity: "Win and develop", short: "PAL", colors: "#006437" },
  { name: "São Paulo", country: "BRA", league: "Brasileirão", level: 4, development: 5, identity: "A famous academy route", short: "SAO", colors: "#e30613" },
  { name: "Santos", country: "BRA", league: "Brasileirão", level: 3, development: 5, identity: "Youth and enormous ghosts", short: "SAN", colors: "#ffffff" },
  { name: "Fluminense", country: "BRA", league: "Brasileirão", level: 4, development: 4, identity: "Technique under pressure", short: "FLU", colors: "#7a263a" },
  { name: "Ceará", country: "BRA", league: "Brasileirão Série B", level: 2, development: 4, identity: "A senior shirt that must be earned", short: "CEA", colors: "#ffffff" },
  { name: "Sport Recife", country: "BRA", league: "Brasileirão Série B", level: 2, development: 4, identity: "Heat, noise and opportunity", short: "SCR", colors: "#d71920" },
  { name: "Vila Nova", country: "BRA", league: "Brasileirão Série B", level: 1, development: 5, identity: "A grounded place to break through", short: "VNO", colors: "#e30613" },

  { name: "River Plate", country: "ARG", league: "Liga Profesional", level: 5, development: 5, identity: "The academy must also win", short: "RIV", colors: "#e30613" },
  { name: "Boca Juniors", country: "ARG", league: "Liga Profesional", level: 5, development: 4, identity: "Every match feels decisive", short: "BOC", colors: "#003f7d" },
  { name: "Racing Club", country: "ARG", league: "Liga Profesional", level: 4, development: 4, identity: "Emotion at full volume", short: "RAC", colors: "#59c5eb" },
  { name: "Vélez Sarsfield", country: "ARG", league: "Liga Profesional", level: 3, development: 5, identity: "A genuine youth pathway", short: "VEL", colors: "#005baa" },
  { name: "Newell's Old Boys", country: "ARG", league: "Liga Profesional", level: 3, development: 5, identity: "Technique before hype", short: "NOB", colors: "#d71920" },
  { name: "Argentinos Juniors", country: "ARG", league: "Liga Profesional", level: 2, development: 5, identity: "A production line with history", short: "ARG", colors: "#e30613" },
  { name: "Banfield", country: "ARG", league: "Liga Profesional", level: 2, development: 5, identity: "Youth gets a real shirt here", short: "BAN", colors: "#178447" },
  { name: "Quilmes", country: "ARG", league: "Primera Nacional", level: 1, development: 4, identity: "A hard first rung on the ladder", short: "QUI", colors: "#ffffff" },

  { name: "Inter Miami", country: "USA", league: "Major League Soccer", level: 4, development: 2, identity: "Famous faces, instant attention", short: "MIA", colors: "#f7b5cd" },
  { name: "Los Angeles FC", country: "USA", league: "Major League Soccer", level: 4, development: 4, identity: "Modern and ambitious", short: "LAFC", colors: "#c39e6d" },
  { name: "Seattle Sounders", country: "USA", league: "Major League Soccer", level: 3, development: 4, identity: "Stable club, serious crowds", short: "SEA", colors: "#5d9732" },
  { name: "FC Dallas", country: "USA", league: "Major League Soccer", level: 2, development: 5, identity: "A clear academy route", short: "FCD", colors: "#d71920" },
  { name: "Philadelphia Union", country: "USA", league: "Major League Soccer", level: 3, development: 5, identity: "Develop and sell well", short: "PHI", colors: "#071b2c" },
  { name: "New York Red Bulls", country: "USA", league: "Major League Soccer", level: 3, development: 5, identity: "A direct pathway and relentless pressing", short: "RBNY", colors: "#e30613" },
  { name: "Real Salt Lake", country: "USA", league: "Major League Soccer", level: 2, development: 5, identity: "Academy graduates are expected, not decorative", short: "RSL", colors: "#b30838" },
  { name: "Minnesota United", country: "USA", league: "Major League Soccer", level: 2, development: 4, identity: "A stable place to become a starter", short: "MIN", colors: "#8cd2f4" },

  { name: "Club Brugge", country: "BEL", league: "Belgian Pro League", level: 3, development: 5, identity: "A proven European bridge", short: "BRU", colors: "#0080c8" },
  { name: "Genk", country: "BEL", league: "Belgian Pro League", level: 3, development: 5, identity: "Young players become assets", short: "GNK", colors: "#0050a4" },
  { name: "Celtic", country: "SCO", league: "Scottish Premiership", level: 4, development: 4, identity: "Win weekly, learn in Europe", short: "CEL", colors: "#018749" },
  { name: "Rangers", country: "SCO", league: "Scottish Premiership", level: 4, development: 3, identity: "Pressure starts on day one", short: "RAN", colors: "#0038a8" },
  { name: "Galatasaray", country: "TUR", league: "Süper Lig", level: 4, development: 3, identity: "Noise, stars and expectation", short: "GAL", colors: "#fdb912" },
  { name: "Fenerbahçe", country: "TUR", league: "Süper Lig", level: 4, development: 3, identity: "Every week is a referendum", short: "FEN", colors: "#ffed00" },
  { name: "Dinamo Zagreb", country: "CRO", league: "Croatian Football League", level: 3, development: 5, identity: "A classic stepping stone", short: "DIN", colors: "#004b9b" },
  { name: "HNK Rijeka", country: "CRO", league: "Croatian Football League", level: 2, development: 4, identity: "European qualifiers, real minutes", short: "RIJ", colors: "#61b9e9" },
  { name: "Olympiacos", country: "GRE", league: "Super League Greece", level: 3, development: 3, identity: "Trophies and a fierce crowd", short: "OLY", colors: "#e30613" },
  { name: "Al Hilal", country: "SAU", league: "Saudi Pro League", level: 4, development: 2, identity: "Big contract, bigger spotlight", short: "HIL", colors: "#1d4ed8" },
  { name: "Al Nassr", country: "SAU", league: "Saudi Pro League", level: 4, development: 2, identity: "Global attention immediately", short: "NAS", colors: "#f4df00" },
  { name: "Urawa Red Diamonds", country: "JPN", league: "J1 League", level: 3, development: 4, identity: "A meticulous new football life", short: "URD", colors: "#e60012" },
  { name: "Club América", country: "MEX", league: "Liga MX", level: 4, development: 3, identity: "You are either loved or discussed", short: "AME", colors: "#f8df00" },
];

const featuredByName = new Map(FEATURED_CLUBS.map((club) => [`${club.country}:${club.name}`, club]));
export const CLUBS: Club[] = [
  ...FULL_LEAGUE_CLUBS.map((club) => {
    const featured = featuredByName.get(`${club.country}:${club.name}`);
    return featured ? { ...club, ...featured, league: club.league, division: club.division } : club;
  }),
];

export const SCENARIOS: Scenario[] = [
  {
    id: "veterans-bags", icon: "🧳", category: "Dressing room", title: "The veterans have found their luggage intern",
    description: "As the youngest player, you are expected to carry the senior players' kit bags after training. They call it tradition. Your lower back calls it unpaid labour.", maxAge: 21,
    options: [
      { label: "Carry the bags and learn the names", hint: "Safe, humble, slightly undignified", outcomes: [{ probability: 1, label: "The veterans adopt you. Your matchday minutes improve.", positive: true, effect: { roleBoost: 1, morale: 4 } }] },
      { label: "Demand equal treatment", hint: "Respect or instant exile", outcomes: [{ probability: .4, label: "They respect the nerve. You are suddenly one of them.", positive: true, effect: { roleBoost: 1, reputation: 6 } }, { probability: .6, label: "You are now 'the kid who thinks he's Ronaldo.' The bench awaits.", positive: false, effect: { roleBoost: -1, morale: -7 } }] },
    ],
  },
  {
    id: "new-coach", icon: "🆕", category: "Manager", title: "A new coach promises a clean slate",
    description: "He says everyone starts from zero. The club captain nods as if his 412 appearances have also been deleted.",
    options: [
      { label: "Train like the cameras are always on", hint: "High reward, soft-tissue danger", outcomes: [{ probability: .6, label: "The coach is impressed. You jump up the pecking order.", positive: true, effect: { roleBoost: 1, rating: 1, development: 1 } }, { probability: .4, label: "Your hamstring files a formal complaint.", positive: false, effect: { fitness: -22, rating: -1, development: -1, potential: -1 } }] },
      { label: "Trust the CV and train normally", hint: "Professional, not necessarily memorable", outcomes: [{ probability: .4, label: "Calm competence wins him over.", positive: true, effect: { roleBoost: 1 } }, { probability: .6, label: "He prefers a player he already knows from a club you dislike.", positive: false, effect: { roleBoost: -1, morale: -5 } }] },
    ],
  },
  {
    id: "team-party", icon: "🪩", category: "Team culture", title: "The squad plans a night out before a cup tie",
    description: "The captain says it is 'important for chemistry.' The fitness coach says nothing, but his left eye begins twitching.", maxAge: 28,
    options: [
      { label: "Go out with the squad", hint: "Chemistry with a side of jeopardy", outcomes: [{ probability: .72, label: "You become part of the group and somehow make breakfast.", positive: true, effect: { morale: 12, roleBoost: 1 } }, { probability: .28, label: "You injure yourself attempting a dance last popular in 2017.", positive: false, effect: { fitness: -28, rating: -1, development: -1 } }] },
      { label: "Sleep at 21:30", hint: "Safe for the body, brutal for the group chat", outcomes: [{ probability: 1, label: "Perfect sleep score. The squad removes you from two group chats.", positive: false, effect: { fitness: 8, morale: -5 } }] },
    ],
  },
  {
    id: "teammate-mum", icon: "📺", category: "Media", title: "A teammate's mum destroys you on television",
    description: "A link arrives in the group chat. She is on a popular football show, armed with statistics she has almost understood.", minAge: 18,
    options: [
      { label: "Call the show and respond live", hint: "Prime-time coin toss", outcomes: [{ probability: .5, label: "She retreats. The dressing room gives you a standing ovation.", positive: true, effect: { rating: 2, reputation: 8, development: 1 } }, { probability: .5, label: "You lose an argument to someone's mum on national television.", positive: false, effect: { rating: -2, morale: -12, development: -1 } }] },
      { label: "Ignore it with great dignity", hint: "Dignity is not always selected", outcomes: [{ probability: 1, label: "The coach saw the clip. He now wants to 'protect you' on the bench.", positive: false, effect: { roleBoost: -1 } }] },
    ],
  },
  {
    id: "agent-pitch", icon: "🤝", category: "Representation", title: "An ambitious agent slides into your DMs",
    description: "His profile says 'GLOBAL FOOTBALL CONNECTOR' and features photographs with three players who do not follow him back.", minAge: 20, maxAge: 27,
    allowedAgents: ["Self-represented", "Family representative", "Optimistic agent"],
    options: [
      { label: "Sign with the ambitious agent", hint: "Better reach, louder phone", outcomes: [{ probability: .75, label: "He genuinely has contacts. Your next market gets wider.", positive: true, effect: { agent: "International agent", reputation: 7, value: 1.08 } }, { probability: .25, label: "His main contact is a group chat called Transfers 2.", positive: false, effect: { agent: "Optimistic agent", value: .94 } }] },
      { label: "Choose a local specialist", hint: "More domestic calls, fewer airport lounges", outcomes: [{ probability: 1, label: "The local network knows every sporting director within driving distance.", positive: true, effect: { agent: "Local specialist", reputation: 3 } }] },
      { label: "Join a development agency", hint: "Young-player routes through stepping-stone leagues", outcomes: [{ probability: .82, label: "The agency maps out credible routes through development leagues abroad.", positive: true, effect: { agent: "Development agency", development: 1 } }, { probability: .18, label: "The pathway deck was mostly stock photography and arrows.", positive: false, effect: { agent: "Optimistic agent", value: .95 } }] },
      { label: "Keep the family friend", hint: "Fewer contacts, excellent birthday messages", outcomes: [{ probability: 1, label: "No new doors open, but your aunt remains delighted.", positive: true, effect: { agent: "Family representative", morale: 5 } }] },
    ],
  },
  {
    id: "derby-quote", icon: "🎙️", category: "Media", title: "A journalist wants a derby quote",
    description: "He asks whether the rival club's defence scares you. His phone is already recording and his headline is 80% written.",
    options: [
      { label: "Give him the sharp quote", hint: "Hero or tomorrow's meme", outcomes: [{ probability: .5, label: "You score. The quote becomes a banner behind the goal.", positive: true, effect: { rating: 2, reputation: 8, development: 1 } }, { probability: .5, label: "You lose. The quote follows you to every airport for six months.", positive: false, effect: { rating: -2, morale: -8, development: -1 } }] },
      { label: "Say you respect every opponent", hint: "Media training has won", outcomes: [{ probability: 1, label: "Nothing happens. Somewhere, a press officer quietly celebrates.", positive: true, effect: { morale: 2 } }] },
    ],
  },
  {
    id: "play-through-pain", icon: "🩹", category: "Fitness", title: "The manager asks you to play through knee pain",
    description: "The medical staff say 'manageable.' They do not specify whose problem it becomes if it stops being manageable.", minAge: 20,
    options: [
      { label: "Play the match", hint: "Glory or an MRI", outcomes: [{ probability: .52, label: "You deliver and become the manager's favourite emergency contact.", positive: true, effect: { rating: 2, reputation: 5 } }, { probability: .48, label: "The knee gets worse. The medical room learns your coffee order.", positive: false, effect: { rating: -2, fitness: -30, development: -2, potential: -2 } }] },
      { label: "Listen to your body", hint: "Sensible people rarely trend", outcomes: [{ probability: .45, label: "The manager understands. You recover fully.", positive: true, effect: { fitness: 14 } }, { probability: .55, label: "He calls it a 'mentality issue' and starts someone with one functioning ankle.", positive: false, effect: { roleBoost: -1 } }] },
    ],
  },
  {
    id: "return-from-injury", icon: "🧑‍⚕️", category: "Injury", title: "The physio clears you. The injured muscle requests an appeal",
    description: "Training says available. The scan says improving. Your body has submitted a third opinion in the form of a suspicious twinge.", minAge: 18, maxFitness: 65,
    options: [
      { label: "Take the phased return", hint: "Lose a few matches, protect the next few years", outcomes: [{ probability: 1, label: "The comeback is boring, controlled and successful. The medical team frames the word 'boring'.", positive: true, effect: { fitness: 28, development: 1, roleBoost: -1 } }] },
      { label: "Declare yourself fully fit", hint: "Immediate minutes, meaningful reinjury risk", outcomes: [{ probability: .42, label: "The muscle holds and your fearless return lifts the whole side.", positive: true, effect: { rating: 2, reputation: 6 } }, { probability: .58, label: "You last 23 minutes. The substitute is ready before the stretcher reaches the tunnel.", positive: false, effect: { rating: -3, fitness: -32, development: -2, potential: -1 } }] },
      { label: "Request an independent scan", hint: "More certainty, less trust from the club doctor", outcomes: [{ probability: .75, label: "The second scan finds the problem. Rehab changes and the pain finally stops negotiating.", positive: true, effect: { fitness: 22, development: 2 } }, { probability: .25, label: "The scan finds nothing except an invoice and three more weeks of doubt.", positive: false, effect: { morale: -7, roleBoost: -1 } }] },
    ],
  },
  {
    id: "recurring-ankle", icon: "🦶", category: "Injury", title: "Your ankle has started remembering every old tackle",
    description: "It can be managed, rested or repaired. Everyone agrees—right before recommending a different option.", minAge: 19, maxFitness: 78,
    options: [
      { label: "Accept a six-week rehab block", hint: "Short-term absence, safer long-term load", outcomes: [{ probability: 1, label: "You lose your place, then return without needing to tape half the boot room to your leg.", positive: true, effect: { fitness: 24, development: 1, roleBoost: -1 } }] },
      { label: "Use an injection and keep playing", hint: "Big matches now, ankle consequences later", outcomes: [{ probability: .55, label: "The ankle survives the run-in and you deliver when the club needs you.", positive: true, effect: { rating: 1, reputation: 6, fitness: -5 } }, { probability: .45, label: "The pain disappears. Unfortunately, so does the ankle's remaining patience.", positive: false, effect: { rating: -2, fitness: -30, development: -2, potential: -1 } }] },
      { label: "Choose surgery now", hint: "Longer road, stronger repair", outcomes: [{ probability: 1, label: "Rehab swallows the calendar, but the joint returns without its collection of alarming noises.", positive: true, effect: { rating: -1, fitness: 35, development: 2 } }] },
    ],
  },
  {
    id: "boot-sponsor", icon: "👟", category: "Commercial", title: "Your boot deal clashes with the club sponsor",
    description: "You signed with one brand. The club signed with its sworn corporate enemy. Both insist this is about values.", minAge: 21,
    options: [
      { label: "Keep your personal deal", hint: "Lucrative, politically exciting", outcomes: [{ probability: .5, label: "A compromise appears. Both brands claim victory.", positive: true, effect: { value: 1.25, reputation: 5 } }, { probability: .5, label: "The club is furious. Your boots get more minutes than you do.", positive: false, effect: { roleBoost: -1 } }] },
      { label: "Give up the deal", hint: "Peace at a price", outcomes: [{ probability: 1, label: "The club is happy. Your accountant is performing grief counselling.", positive: false, effect: { value: .94, morale: -4 } }] },
    ],
  },
  {
    id: "talk-show", icon: "🛋️", category: "Media", title: "A talk show wants you the night before a big match",
    description: "The producer promises a 'relaxed chat.' The previous guest left wearing a foam crown and apologising to his former manager.", minAge: 20,
    options: [
      { label: "Accept the invitation", hint: "Visibility with studio lighting", outcomes: [{ probability: .68, label: "You are charming, funny and unexpectedly good at the quiz.", positive: true, effect: { reputation: 10, value: 1.08 } }, { probability: .32, label: "A joke about the coach lands like a back-pass in a final.", positive: false, effect: { morale: -8, roleBoost: -1 } }] },
      { label: "Stay home and prepare", hint: "Very professional, deeply untelevised", outcomes: [{ probability: 1, label: "You play well. Nobody clips tactical discipline for social media.", positive: true, effect: { fitness: 6, rating: 1, development: 1 } }] },
    ],
  },
  {
    id: "contract-standoff", icon: "🖊️", category: "Contract", title: "The renewal offer is insultingly low",
    description: "The sporting director calls it 'a structure with upside.' Your agent calls it several things not suitable for the club website.", minAge: 24,
    options: [
      { label: "Threaten to leave for free", hint: "Leverage or a very cold winter", outcomes: [{ probability: .5, label: "The club improves the offer. Suddenly the structure has more upside.", positive: true, effect: { value: 1.18, reputation: 5 } }, { probability: .5, label: "They call your bluff and remove your locker nameplate with alarming speed.", positive: false, effect: { roleBoost: -1, morale: -10 } }] },
      { label: "Sign for peace of mind", hint: "Security over market value", outcomes: [{ probability: 1, label: "The deal is done. Your agent stares silently out of a window.", positive: false, effect: { value: .84, morale: 7 } }] },
    ],
  },
  {
    id: "fixer", icon: "💼", category: "Integrity", title: "A stranger offers money for a quiet match",
    description: "He wants a few misplaced passes. He also claims to be in 'sports analytics,' which is not helping his case.", minAge: 19,
    options: [
      { label: "Report him immediately", hint: "Correct and surprisingly valuable", outcomes: [{ probability: 1, label: "The club praises your integrity. Your reputation travels.", positive: true, effect: { reputation: 15, value: 1.1 } }] },
      { label: "Take the money", hint: "A spectacularly poor life plan", outcomes: [{ probability: .25, label: "Nobody notices. You feel terrible and richer.", positive: false, effect: { value: 1.12, morale: -18 } }, { probability: .75, label: "Everyone notices. The suspension is long and the headlines are longer.", positive: false, effect: { rating: -4, value: .7, reputation: -30, development: -2, potential: -2 } }] },
    ],
  },
  {
    id: "language-barrier", icon: "🗣️", category: "Life abroad", title: "The tactical meeting is happening in your fourth language",
    description: "You understand 'press,' 'inside' and, concerningly, your own name shouted twice.", requiresAbroad: true,
    options: [
      { label: "Nod with total confidence", hint: "Efficient until kick-off", outcomes: [{ probability: .45, label: "You guessed correctly. Football truly is universal.", positive: true, effect: { rating: 1, morale: 4 } }, { probability: .55, label: "You press the wrong centre-back for 37 minutes.", positive: false, effect: { roleBoost: -1, rating: -1, development: -1 } }] },
      { label: "Ask the analyst to explain again", hint: "Minor embarrassment, major clarity", outcomes: [{ probability: 1, label: "The analyst helps. The manager respects the honesty.", positive: true, effect: { roleBoost: 1, reputation: 3 } }] },
    ],
  },
  {
    id: "rival-flirt", icon: "👀", category: "Transfer politics", title: "A rival coach flirts with you in public",
    description: "He says he would 'love to work with you.' Your fans react as if you personally drafted the quote.", minAge: 22,
    options: [
      { label: "Declare loyalty to your club", hint: "Beloved locally, awkward globally", outcomes: [{ probability: .6, label: "The fans sing your name before warm-up.", positive: true, effect: { morale: 12, reputation: 6 } }, { probability: .4, label: "Other clubs decide you are unavailable. Your market cools.", positive: false, effect: { value: .78 } }] },
      { label: "Say absolutely nothing", hint: "Ambiguity, the agent's favourite language", outcomes: [{ probability: 1, label: "The story survives for three days and then loses to a manager sacking.", positive: true, effect: { value: 1.04 } }] },
    ],
  },
  {
    id: "captaincy", icon: "©", category: "National team", title: "Pundits debate whether you should captain your country",
    description: "One panel has discussed your 'leadership aura' for 19 minutes without defining either word.", minAge: 25, needsCaps: true,
    options: [
      { label: "Say you are ready for the armband", hint: "Leadership or naked ambition", outcomes: [{ probability: .42, label: "The manager agrees. You lead the next camp.", positive: true, effect: { reputation: 14, value: 1.08 } }, { probability: .58, label: "The squad thinks you campaigned for it. Lunch becomes extremely quiet.", positive: false, effect: { morale: -12 } }] },
      { label: "Leave it to the manager", hint: "Diplomatic coin toss", outcomes: [{ probability: .5, label: "The armband arrives anyway.", positive: true, effect: { reputation: 10 } }, { probability: .5, label: "It goes elsewhere. You clap professionally.", positive: false, effect: { morale: -4 } }] },
    ],
  },
  {
    id: "rehab-guru", icon: "🔮", category: "Fitness", title: "A recovery guru promises to halve your rehab",
    description: "His method involves magnets, moonlight and a testimonial from a retired winger with a podcast.", minAge: 22,
    options: [
      { label: "Try the miracle treatment", hint: "The word miracle is doing work", outcomes: [{ probability: .3, label: "Against medical science and common sense, you feel brilliant.", positive: true, effect: { fitness: 25, rating: 1 } }, { probability: .7, label: "The magnets remain undefeated. Your rehab does not.", positive: false, effect: { fitness: -20, rating: -1, development: -1, potential: -1 } }] },
      { label: "Stay with the club physio", hint: "Slow, boring, evidence-based", outcomes: [{ probability: 1, label: "Recovery is gradual and successful. Nobody starts a podcast.", positive: true, effect: { fitness: 12, development: 1 } }] },
    ],
  },
  {
    id: "social-rant", icon: "📱", category: "Social media", title: "You type a furious post after being benched",
    description: "It is 01:14. The draft contains six exclamation marks and the phrase 'people will know the truth.'",
    options: [
      { label: "Post it", hint: "Fast thumbs, slow consequences", outcomes: [{ probability: .35, label: "The fans back you. The manager absolutely does not.", positive: true, effect: { reputation: 8, morale: 5 } }, { probability: .65, label: "The club fines you before breakfast and benches you before lunch.", positive: false, effect: { roleBoost: -1, value: .9, development: -1 } }] },
      { label: "Delete the draft", hint: "The rare 01:14 masterclass", outcomes: [{ probability: 1, label: "Nothing happens, which is the best possible social-media outcome.", positive: true, effect: { morale: 3 } }] },
    ],
  },
  {
    id: "relegation-clause", icon: "📉", category: "Contract", title: "Your contract contains a relegation pay cut",
    description: "The clause looked theoretical in July. It now looks extremely interested in becoming real.", minAge: 24,
    options: [
      { label: "Demand protection now", hint: "Good finance, risky timing", outcomes: [{ probability: .5, label: "The club agrees. Your accountant sends a heart emoji.", positive: true, effect: { morale: 8, value: 1.05 } }, { probability: .5, label: "The board calls it disloyal and the manager receives a mysterious memo.", positive: false, effect: { roleBoost: -1 } }] },
      { label: "Focus on staying up", hint: "Football first, spreadsheet later", outcomes: [{ probability: .48, label: "The club survives. The clause returns to being boring.", positive: true, effect: { reputation: 6 } }, { probability: .52, label: "Relegated. The wage cut arrives before the apology email.", positive: false, effect: { value: .72, morale: -10 } }] },
    ],
  },
  {
    id: "career-plateau", icon: "📊", category: "Development", title: "Your progress has flattened out",
    description: "The analyst calls it a plateau. The coach calls it consistency. Your rating screen is less diplomatic.", minAge: 23,
    options: [
      { label: "Hire a specialist coach", hint: "Fresh detail, heavier training load", outcomes: [{ probability: .65, label: "The extra work finds another level in your game.", positive: true, effect: { rating: 1, development: 2, fitness: -5 } }, { probability: .35, label: "The extra sessions become extra fatigue and very little else.", positive: false, effect: { rating: -1, development: -1, fitness: -14 } }] },
      { label: "Simplify your game", hint: "Lower ceiling, steadier floor", outcomes: [{ probability: 1, label: "You strip out the noise and become reliably effective again.", positive: true, effect: { development: 1, morale: 7, fitness: 5 } }] },
    ],
  },
  {
    id: "surgery-choice", icon: "🏥", category: "Fitness", title: "The specialist recommends surgery",
    description: "You can fix the underlying problem now or keep managing it with tape, injections and optimism.", minAge: 22, maxFitness: 65,
    options: [
      { label: "Have the operation", hint: "Short-term setback, better long-term outlook", outcomes: [{ probability: 1, label: "Rehab is slow, but the joint finally feels trustworthy again.", positive: true, effect: { rating: -1, fitness: 32, development: 2 } }] },
      { label: "Play through the season", hint: "Immediate minutes, serious downside", outcomes: [{ probability: .35, label: "The body holds together and you produce a defiant run of form.", positive: true, effect: { rating: 1, reputation: 5 } }, { probability: .65, label: "The problem worsens. Pace, confidence and future ceiling all suffer.", positive: false, effect: { rating: -3, fitness: -22, development: -2, potential: -3 } }] },
    ],
  },
  {
    id: "ageing-reinvention", icon: "🧠", category: "Late career", title: "The coach wants you to reinvent your game",
    description: "The first five metres are fading. The coach thinks positioning can replace some of what time has taken.", minAge: 30,
    options: [
      { label: "Rebuild around intelligence", hint: "Adapt now to slow the decline", outcomes: [{ probability: .72, label: "You learn to arrive early instead of running late.", positive: true, effect: { development: 2, roleBoost: 1, morale: 5 } }, { probability: .28, label: "The new role exposes habits that pace used to hide.", positive: false, effect: { rating: -1, roleBoost: -1 } }] },
      { label: "Keep playing your old game", hint: "Familiar, proud and physically expensive", outcomes: [{ probability: .42, label: "Experience buys you another excellent stretch.", positive: true, effect: { rating: 1, reputation: 4 } }, { probability: .58, label: "The old movements are still there. The recovery speed is not.", positive: false, effect: { rating: -2, fitness: -12, development: -1 } }] },
    ],
  },
  {
    id: "elite-agent", icon: "📞", category: "Representation", title: "A super-agent wants to take over your career",
    description: "The pitch includes global offices, private jets and a slide titled 'Legacy Architecture.'", minAge: 24, minRating: 78, minReputation: 50,
    allowedAgents: ["International agent", "Development agency", "Local specialist", "Optimistic agent"],
    options: [
      { label: "Join the super-agency", hint: "Elite access, elite expectations", outcomes: [{ probability: .72, label: "The agency's calls are returned immediately. Bigger markets open.", positive: true, effect: { agent: "Elite super-agent", reputation: 6, value: 1.1 } }, { probability: .28, label: "You were recruited for the brochure, not the priority list.", positive: false, effect: { agent: "Optimistic agent", morale: -8, value: .94 } }] },
      { label: "Keep your current agent", hint: "Known relationship, known network", outcomes: [{ probability: 1, label: "Your agent celebrates the loyalty by forwarding three voice notes.", positive: true, effect: { morale: 5 } }] },
    ],
  },
  {
    id: "veteran-broker", icon: "🗺️", category: "Representation", title: "A veteran-market broker presents the final chapters",
    description: "He has contacts in your home country, former clubs and leagues where experience still earns a serious contract.", minAge: 30,
    options: [
      { label: "Sign with the veteran broker", hint: "Homecomings and late-career markets", outcomes: [{ probability: 1, label: "The next calls are more realistic—and considerably more specific.", positive: true, effect: { agent: "Veteran broker", value: 1.05 } }] },
      { label: "Stay with your current representation", hint: "Keep chasing the existing market", outcomes: [{ probability: 1, label: "The plan stays unchanged. Time, less helpfully, does not.", positive: true, effect: { morale: 2 } }] },
    ],
  },
  {
    id: "emergency-goalkeeper", icon: "🧤", category: "Matchday", title: "The substitute goalkeeper has pulled something during the warm-up",
    description: "The coach scans the dressing room for volunteers. Every outfield player suddenly becomes fascinated by their own boots.", minAge: 18,
    allowedPositions: ["LW", "ST", "RW", "CAM", "CM", "CDM", "LB", "CB", "RB"],
    options: [
      { label: "Take the gloves", hint: "Heroism with unfamiliar handwear", outcomes: [{ probability: .38, label: "You save a penalty and spend the next month requesting goalkeeper bonuses.", positive: true, effect: { reputation: 12, morale: 10, development: 1 } }, { probability: .62, label: "Your first dive begins after the ball reaches the net. The gloves are returned quietly.", positive: false, effect: { morale: -8, reputation: -2 } }] },
      { label: "Nominate the tallest centre-back", hint: "Leadership through delegation", outcomes: [{ probability: 1, label: "He agrees, then adds your name to a private list titled 'people to remember.'", positive: true, effect: { morale: 3 } }] },
    ],
  },
  {
    id: "public-half-time", icon: "📢", category: "Touchline theatre", title: "The manager starts the half-time talk on the pitch",
    description: "{club} are losing badly and the tunnel remains unused. The television director has never been happier.", countryTags: ["ENG", "NIR", "SCO", "WAL"], minPreviousFinish: 8, maxMorale: 75,
    options: [
      { label: "Stand beside him", hint: "Public solidarity, public volume", outcomes: [{ probability: .46, label: "The spectacle becomes a rally and {club} rescue the match.", positive: true, effect: { morale: 12, reputation: 6, development: 1 } }, { probability: .54, label: "The lecture continues long enough for the opponents to finish their tea.", positive: false, effect: { morale: -10 } }] },
      { label: "Walk into the dressing room", hint: "There are still chairs in there", outcomes: [{ probability: 1, label: "Three teammates follow. The manager calls it a tactical subgroup.", positive: true, effect: { fitness: 4 } }] },
    ],
  },
  {
    id: "living-mascot", icon: "🐐", category: "Club tradition", title: "The living mascot has selected your boots for lunch",
    description: "The animal is a beloved club institution. Your limited-edition boots are apparently a beloved source of fibre.", countryTags: ["GER"], minClubSeasons: 1,
    options: [
      { label: "Accept ceremonial feeding duty", hint: "Tradition outranks footwear", outcomes: [{ probability: 1, label: "Supporters adore the photographs. The boot sponsor requests a meeting without the mascot.", positive: true, effect: { reputation: 7, morale: 5 } }] },
      { label: "Rescue the boots", hint: "Fast feet finally prove commercially useful", outcomes: [{ probability: .7, label: "Boots saved, dignity mostly intact.", positive: true, effect: { morale: 4 } }, { probability: .3, label: "The mascot wins possession and refuses to release it.", positive: false, effect: { value: .97 } }] },
    ],
  },
  {
    id: "qualifier-kit-bag", icon: "👕", category: "European qualifier", title: "The kit bag has reached the wrong country",
    description: "{club} have a European tie tonight. The shirts are enjoying a completely different capital city.", requiresEuropeanPlace: true, maxClubLevel: 3,
    options: [
      { label: "Wear the emergency shirts", hint: "Names added with optimism and tape", outcomes: [{ probability: .72, label: "The improvised kit becomes a collector's item after {club} advance.", positive: true, effect: { reputation: 6, morale: 8 } }, { probability: .28, label: "Your taped number leaves at half-time. You finish the match as a punctuation mark.", positive: false, effect: { morale: -4 } }] },
      { label: "Delay kick-off for the courier", hint: "Trust logistics in extra time", outcomes: [{ probability: .5, label: "The bag arrives with six minutes to spare and the courier receives a standing ovation.", positive: true, effect: { fitness: 3 } }, { probability: .5, label: "The courier reaches the stadium tomorrow, extremely prepared.", positive: false, effect: { reputation: -3 } }] },
    ],
  },
  {
    id: "broken-goalpost", icon: "🥅", category: "Ground trouble", title: "One goal is visibly shorter than the other",
    description: "The referee has found a tape measure. The groundskeeper has found a saw. Nobody has found confidence.", maxClubLevel: 2,
    options: [
      { label: "Help the ground staff", hint: "Unexpected practical leadership", outcomes: [{ probability: 1, label: "The goal is repaired. Your technique with a spirit level earns louder applause than warm-up.", positive: true, effect: { reputation: 5, morale: 5 } }] },
      { label: "Keep warming up", hint: "Professional distance from carpentry", outcomes: [{ probability: .65, label: "The match starts late and normally.", positive: true, effect: { fitness: 3 } }, { probability: .35, label: "You over-warm up and begin the match feeling 47 years old.", positive: false, effect: { fitness: -8 } }] },
    ],
  },
  {
    id: "pitch-cup-pause", icon: "🥤", category: "Crowd control", title: "One plastic cup has stopped the entire match",
    description: "The object lands near the pitch. The officials apply the rule with the solemnity of a constitutional crisis.", countryTags: ["NED"], minAge: 18,
    options: [
      { label: "Ask the crowd to calm down", hint: "Diplomacy under beverage pressure", outcomes: [{ probability: .78, label: "The message works and the restart arrives before everyone forgets the score.", positive: true, effect: { reputation: 7 } }, { probability: .22, label: "Your appeal inspires a second cup and a much longer meeting.", positive: false, effect: { morale: -5 } }] },
      { label: "Stay completely out of it", hint: "Hydration without intervention", outcomes: [{ probability: 1, label: "You complete another warm-up. Fitness coaches call this a data opportunity.", positive: true, effect: { fitness: 2 } }] },
    ],
  },
  {
    id: "former-crowd-script", icon: "🫶", category: "Former club", title: "The away end from {formerClub} is singing about you",
    description: "The relationship survived your departure, although the exact lyrics suggest several unresolved footnotes.", requiresFormerClub: true, minAge: 21, minClubSeasons: 1,
    options: [
      { label: "Promise not to celebrate", hint: "Respect, unless muscle memory intervenes", outcomes: [{ probability: .58, label: "You score and keep the promise. Both sets of supporters briefly approve of the same person.", positive: true, effect: { reputation: 10, morale: 6 } }, { probability: .42, label: "You score, slide on your knees, and remember the promise halfway through the slide.", positive: false, effect: { reputation: -5, morale: -4 } }] },
      { label: "Say the past is the past", hint: "Clean quote, noisy reception", outcomes: [{ probability: 1, label: "The headline is efficient. The reunion is considerably less so.", positive: false, effect: { morale: 2 } }] },
    ],
  },
  {
    id: "president-bonus", icon: "🎁", category: "Boardroom", title: "The club president promises an unusual title bonus",
    description: "{club} are near the top and the president has offered every player a reward that is memorable, expensive and difficult to park.", maxPreviousFinish: 3, minClubSeasons: 1,
    options: [
      { label: "Accept the mystery prize", hint: "Motivation with paperwork", outcomes: [{ probability: .55, label: "The bonus arrives. Your accountant asks whether livestock can be depreciated.", positive: true, effect: { morale: 12, value: 1.03 } }, { probability: .45, label: "The promise quietly becomes a commemorative keyring.", positive: false, effect: { morale: -7 } }] },
      { label: "Ask for a staff bonus instead", hint: "Popular with everyone except accounting", outcomes: [{ probability: 1, label: "The kit staff and analysts receive a reward. Your dressing-room standing rises.", positive: true, effect: { reputation: 8, morale: 8 } }] },
    ],
  },
  {
    id: "open-training-crisis", icon: "🚪", category: "Relegation fight", title: "Supporters have arrived for an unscheduled open training session",
    description: "{club} are struggling. Several hundred fans would like to explain pressing triggers in person.", minPreviousFinish: 10, maxMorale: 70, minAge: 20,
    options: [
      { label: "Speak to them", hint: "Leadership without a media officer", outcomes: [{ probability: .62, label: "The conversation is blunt but useful. Training ends with applause instead of furniture movement.", positive: true, effect: { morale: 10, reputation: 8, development: 1 } }, { probability: .38, label: "Your promise to 'fight for every ball' is immediately reviewed frame by frame.", positive: false, effect: { morale: -8 } }] },
      { label: "Let the captain handle it", hint: "Delegation under pressure", outcomes: [{ probability: 1, label: "The captain speaks. You stand nearby with a face suggesting full strategic involvement.", positive: true, effect: { morale: 3 } }] },
    ],
  },
  {
    id: "passport-qualifier", icon: "🛂", category: "European travel", title: "Your passport is still in the kitchen drawer",
    description: "The {club} team bus is at the airport. Your passport is not. The European away leg has become a personal time trial.", requiresAbroad: true, requiresEuropeanPlace: true,
    options: [
      { label: "Race home for it", hint: "High-speed document recovery", outcomes: [{ probability: .7, label: "You make the flight as the gate closes. The club liaison ages visibly.", positive: true, effect: { reputation: 4, morale: 5 } }, { probability: .3, label: "You reach the gate in time to watch the aircraft demonstrate excellent acceleration.", positive: false, effect: { reputation: -7, roleBoost: -1 } }] },
      { label: "Ask the liaison to solve it", hint: "The professional choice, eventually", outcomes: [{ probability: 1, label: "Emergency arrangements work. You buy the liaison dinner for the rest of the season.", positive: true, effect: { morale: 4 } }] },
    ],
  },
  {
    id: "sponsor-after-defeat", icon: "🎬", category: "Commercial timing", title: "The sponsor needs a cheerful video immediately after a heavy defeat",
    description: "The script begins, 'What an unbelievable week at {club}!' Nobody in the room is willing to identify the unbelievable part.", minClubLevel: 4, maxMorale: 65,
    options: [
      { label: "Perform it enthusiastically", hint: "Professionalism at maximum brightness", outcomes: [{ probability: .55, label: "The clip becomes unintentionally hilarious and the fans forgive it.", positive: true, effect: { reputation: 6, value: 1.05 } }, { probability: .45, label: "Your smile becomes the reaction image for the defeat.", positive: false, effect: { morale: -6 } }] },
      { label: "Ask to postpone filming", hint: "Emotionally sensible, contractually adventurous", outcomes: [{ probability: .65, label: "The sponsor agrees. Humanity survives a calendar invitation.", positive: true, effect: { morale: 7 } }, { probability: .35, label: "The commercial director says 'brand obligations' eleven times.", positive: false, effect: { reputation: -3 } }] },
    ],
  },
  {
    id: "winter-pitch-adventure", icon: "❄️", category: "Calendar football", title: "The pitch has become a weather documentary",
    description: "The lines are visible in places, the ball is orange, and the grounds crew are receiving tactical instructions.", countryTags: ["NOR", "SWE", "FIN", "ISL", "FRO", "EST", "LVA", "LTU", "KAZ"],
    options: [
      { label: "Embrace the conditions", hint: "First touch optional, layers mandatory", outcomes: [{ probability: .68, label: "You adapt first and produce the least elegant excellent performance of your career.", positive: true, effect: { rating: 1, reputation: 5, fitness: -4 } }, { probability: .32, label: "Your first touch travels farther than several domestic flights.", positive: false, effect: { morale: -5 } }] },
      { label: "Lobby for postponement", hint: "Safety meeting with frozen eyebrows", outcomes: [{ probability: .5, label: "The referee agrees and everyone rediscovers circulation indoors.", positive: true, effect: { fitness: 6 } }, { probability: .5, label: "The referee says the surface is playable. The surface declines to comment.", positive: false, effect: { fitness: -6 } }] },
    ],
  },
];


export function country(code: string) { return COUNTRIES.find((item) => item.code === code) ?? COUNTRIES[0]; }
export function clubByName(name: string) { return CLUBS.find((item) => item.name === name); }
