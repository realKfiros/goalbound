"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Screen = "home" | "setup" | "career" | "summary";
type Phase = "offers" | "season-result" | "scenario" | "scenario-result";
type Role = "Prospect" | "Rotation" | "Starter" | "Star";

type Country = { code: string; name: string; flag: string; threshold: number };
type Club = {
  name: string;
  country: string;
  league: string;
  level: number;
  development: number;
  identity: string;
  short: string;
  colors: string;
  crest?: string;
};
type Offer = Club & { role: Role; label: string; reason: string; kind: "permanent" | "loan" | "academy" };
type Season = {
  fromAge: number;
  toAge: number;
  club: string;
  country: string;
  league: string;
  role: Role;
  kind: Offer["kind"];
  apps: number;
  goals: number;
  assists: number;
  before: number;
  after: number;
  trophies: number;
  event: string;
};
type Player = {
  name: string;
  nation: string;
  position: string;
  number: number;
  age: number;
  rating: number;
  potential: number;
  value: number;
  currentClub: string;
  parentClub: string | null;
  totalApps: number;
  totalGoals: number;
  totalAssists: number;
  trophies: number;
  caps: number;
  nationalGoals: number;
  morale: number;
  fitness: number;
  reputation: number;
  agent: string;
  roleBoost: number;
  seenScenarios: string[];
  history: Season[];
};
type Effect = {
  rating?: number;
  value?: number;
  morale?: number;
  fitness?: number;
  reputation?: number;
  roleBoost?: number;
  agent?: string;
};
type Outcome = { probability: number; label: string; positive: boolean; effect: Effect };
type ScenarioOption = { label: string; hint: string; outcomes: Outcome[] };
type Scenario = {
  id: string;
  icon: string;
  category: string;
  title: string;
  description: string;
  minAge?: number;
  maxAge?: number;
  needsCaps?: boolean;
  options: ScenarioOption[];
};
type ResolvedOutcome = { label: string; positive: boolean };
type SavedGame = {
  screen: Screen;
  phase: Phase;
  player: Player | null;
  offers: Offer[];
  seasonSpan: number;
  lastSeason: Season | null;
  scenarioId: string | null;
  outcome: ResolvedOutcome | null;
};

const START_COUNTRIES: Country[] = [
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
  { code: "BEL", name: "Belgium", flag: "🇧🇪", threshold: 78 },
  { code: "SCO", name: "Scotland", flag: "🏴", threshold: 76 },
  { code: "TUR", name: "Türkiye", flag: "🇹🇷", threshold: 78 },
  { code: "CRO", name: "Croatia", flag: "🇭🇷", threshold: 78 },
  { code: "GRE", name: "Greece", flag: "🇬🇷", threshold: 76 },
  { code: "SAU", name: "Saudi Arabia", flag: "🇸🇦", threshold: 72 },
  { code: "JPN", name: "Japan", flag: "🇯🇵", threshold: 75 },
  { code: "MEX", name: "Mexico", flag: "🇲🇽", threshold: 76 },
];

const COUNTRIES = [...START_COUNTRIES, ...EXTRA_COUNTRIES];
const POSITIONS = ["LW", "ST", "RW", "CAM", "CM", "CDM", "LB", "CB", "RB", "GK"];
const SHOW_OFFICIAL_CRESTS = false;
const crest = (id: number) => `https://crests.football-data.org/${id}.png`;

const CLUBS: Club[] = [
  { name: "Arsenal", country: "ENG", league: "Premier League", level: 5, development: 5, identity: "Young, technical, impatient", short: "ARS", colors: "#e30613", crest: crest(57) },
  { name: "Liverpool", country: "ENG", league: "Premier League", level: 5, development: 4, identity: "Intensity and expectation", short: "LIV", colors: "#c8102e", crest: crest(64) },
  { name: "Manchester City", country: "ENG", league: "Premier League", level: 5, development: 3, identity: "Elite squad, tiny margin", short: "MCI", colors: "#6cabdd", crest: crest(65) },
  { name: "Chelsea", country: "ENG", league: "Premier League", level: 5, development: 4, identity: "Talent everywhere", short: "CHE", colors: "#034694", crest: crest(61) },
  { name: "Brighton & Hove Albion", country: "ENG", league: "Premier League", level: 3, development: 5, identity: "Smart pathway to the top", short: "BHA", colors: "#0057b8", crest: crest(397) },
  { name: "Southampton", country: "ENG", league: "English Championship", level: 2, development: 5, identity: "Minutes before headlines", short: "SOU", colors: "#d71920", crest: crest(340) },

  { name: "Real Madrid", country: "ESP", league: "La Liga", level: 5, development: 3, identity: "Win now or become trivia", short: "RMA", colors: "#ffffff", crest: crest(86) },
  { name: "FC Barcelona", country: "ESP", league: "La Liga", level: 5, development: 5, identity: "Academy ideals, global pressure", short: "BAR", colors: "#a50044", crest: crest(81) },
  { name: "Atlético Madrid", country: "ESP", league: "La Liga", level: 5, development: 3, identity: "Earn every metre", short: "ATM", colors: "#cb3524", crest: crest(78) },
  { name: "Real Sociedad", country: "ESP", league: "La Liga", level: 4, development: 5, identity: "Patient technical growth", short: "RSO", colors: "#0067b1", crest: crest(92) },
  { name: "Villarreal", country: "ESP", league: "La Liga", level: 4, development: 4, identity: "European nights, clear roles", short: "VIL", colors: "#ffe667", crest: crest(94) },
  { name: "Real Betis", country: "ESP", league: "La Liga", level: 3, development: 4, identity: "Flair with a loud soundtrack", short: "BET", colors: "#00954c", crest: crest(90) },

  { name: "Bayern Munich", country: "GER", league: "Bundesliga", level: 5, development: 3, identity: "Titles are the minimum", short: "FCB", colors: "#dc052d", crest: crest(5) },
  { name: "Borussia Dortmund", country: "GER", league: "Bundesliga", level: 5, development: 5, identity: "Young talent on a huge stage", short: "BVB", colors: "#fde100", crest: crest(4) },
  { name: "Bayer Leverkusen", country: "GER", league: "Bundesliga", level: 5, development: 4, identity: "Modern and relentless", short: "B04", colors: "#e32221", crest: crest(3) },
  { name: "RB Leipzig", country: "GER", league: "Bundesliga", level: 4, development: 5, identity: "Fast-track development", short: "RBL", colors: "#dd0741", crest: crest(721) },
  { name: "Eintracht Frankfurt", country: "GER", league: "Bundesliga", level: 4, development: 4, identity: "Big nights, fierce crowd", short: "SGE", colors: "#e1000f", crest: crest(19) },
  { name: "SC Freiburg", country: "GER", league: "Bundesliga", level: 3, development: 5, identity: "Coaching over celebrity", short: "SCF", colors: "#e2001a", crest: crest(17) },

  { name: "Inter Milan", country: "ITA", league: "Serie A", level: 5, development: 3, identity: "Tactical detail, title pressure", short: "INT", colors: "#0068a8", crest: crest(108) },
  { name: "AC Milan", country: "ITA", league: "Serie A", level: 5, development: 4, identity: "History watching every touch", short: "MIL", colors: "#fb090b", crest: crest(98) },
  { name: "Juventus", country: "ITA", league: "Serie A", level: 5, development: 3, identity: "Winning is considered admin", short: "JUV", colors: "#ffffff", crest: crest(109) },
  { name: "Napoli", country: "ITA", league: "Serie A", level: 5, development: 4, identity: "Football as civic religion", short: "NAP", colors: "#12a0d7", crest: crest(113) },
  { name: "Atalanta", country: "ITA", league: "Serie A", level: 4, development: 5, identity: "A development laboratory", short: "ATA", colors: "#1d71b8", crest: crest(102) },
  { name: "Bologna", country: "ITA", league: "Serie A", level: 3, development: 5, identity: "Smart coaching, real minutes", short: "BOL", colors: "#1a2f48", crest: crest(103) },

  { name: "Paris Saint-Germain", country: "FRA", league: "Ligue 1", level: 5, development: 2, identity: "Superstars and spotlights", short: "PSG", colors: "#004170", crest: crest(524) },
  { name: "AS Monaco", country: "FRA", league: "Ligue 1", level: 4, development: 5, identity: "The launchpad with a view", short: "ASM", colors: "#e20e17", crest: crest(548) },
  { name: "Lille", country: "FRA", league: "Ligue 1", level: 4, development: 5, identity: "Recruit, improve, compete", short: "LOSC", colors: "#e01e13", crest: crest(521) },
  { name: "Olympique Marseille", country: "FRA", league: "Ligue 1", level: 4, development: 3, identity: "Volcanic support", short: "OM", colors: "#2faee0", crest: crest(516) },
  { name: "Olympique Lyonnais", country: "FRA", league: "Ligue 1", level: 3, development: 5, identity: "Academy DNA", short: "OL", colors: "#1b2d57", crest: crest(523) },
  { name: "Stade Rennais", country: "FRA", league: "Ligue 1", level: 3, development: 5, identity: "Young players get trusted", short: "REN", colors: "#d71920", crest: crest(529) },

  { name: "Benfica", country: "POR", league: "Primeira Liga", level: 4, development: 5, identity: "Elite talent factory", short: "SLB", colors: "#e30613", crest: crest(1903) },
  { name: "FC Porto", country: "POR", league: "Primeira Liga", level: 4, development: 5, identity: "Europe's hardest shop window", short: "FCP", colors: "#00428c", crest: crest(503) },
  { name: "Sporting CP", country: "POR", league: "Primeira Liga", level: 4, development: 5, identity: "Academy first, trophies too", short: "SCP", colors: "#008c5a", crest: crest(498) },
  { name: "Braga", country: "POR", league: "Primeira Liga", level: 3, development: 5, identity: "A clever first European step", short: "BRA", colors: "#e30613" },
  { name: "Vitória SC", country: "POR", league: "Primeira Liga", level: 2, development: 4, identity: "A noisy place to grow up", short: "VSC", colors: "#ffffff" },

  { name: "Ajax", country: "NED", league: "Eredivisie", level: 4, development: 5, identity: "The academy is the identity", short: "AJA", colors: "#d2122e", crest: crest(678) },
  { name: "PSV Eindhoven", country: "NED", league: "Eredivisie", level: 4, development: 5, identity: "Attack, develop, repeat", short: "PSV", colors: "#ed1c24", crest: crest(674) },
  { name: "Feyenoord", country: "NED", league: "Eredivisie", level: 4, development: 4, identity: "A demanding football city", short: "FEY", colors: "#e41e2b", crest: crest(675) },
  { name: "AZ Alkmaar", country: "NED", league: "Eredivisie", level: 3, development: 5, identity: "Data, youth, opportunity", short: "AZ", colors: "#d71920", crest: crest(682) },
  { name: "FC Utrecht", country: "NED", league: "Eredivisie", level: 2, development: 4, identity: "Minutes without the microscope", short: "UTR", colors: "#e30613" },

  { name: "Flamengo", country: "BRA", league: "Brasileirão", level: 5, development: 4, identity: "A nation-sized fanbase", short: "FLA", colors: "#d71920" },
  { name: "Palmeiras", country: "BRA", league: "Brasileirão", level: 5, development: 5, identity: "Win and develop", short: "PAL", colors: "#006437" },
  { name: "São Paulo", country: "BRA", league: "Brasileirão", level: 4, development: 5, identity: "A famous academy route", short: "SAO", colors: "#e30613" },
  { name: "Santos", country: "BRA", league: "Brasileirão", level: 3, development: 5, identity: "Youth and enormous ghosts", short: "SAN", colors: "#ffffff" },
  { name: "Fluminense", country: "BRA", league: "Brasileirão", level: 4, development: 4, identity: "Technique under pressure", short: "FLU", colors: "#7a263a" },

  { name: "River Plate", country: "ARG", league: "Liga Profesional", level: 5, development: 5, identity: "The academy must also win", short: "RIV", colors: "#e30613" },
  { name: "Boca Juniors", country: "ARG", league: "Liga Profesional", level: 5, development: 4, identity: "Every match feels decisive", short: "BOC", colors: "#003f7d" },
  { name: "Racing Club", country: "ARG", league: "Liga Profesional", level: 4, development: 4, identity: "Emotion at full volume", short: "RAC", colors: "#59c5eb" },
  { name: "Vélez Sarsfield", country: "ARG", league: "Liga Profesional", level: 3, development: 5, identity: "A genuine youth pathway", short: "VEL", colors: "#005baa" },
  { name: "Newell's Old Boys", country: "ARG", league: "Liga Profesional", level: 3, development: 5, identity: "Technique before hype", short: "NOB", colors: "#d71920" },

  { name: "Inter Miami", country: "USA", league: "Major League Soccer", level: 4, development: 2, identity: "Famous faces, instant attention", short: "MIA", colors: "#f7b5cd" },
  { name: "Los Angeles FC", country: "USA", league: "Major League Soccer", level: 4, development: 4, identity: "Modern and ambitious", short: "LAFC", colors: "#c39e6d" },
  { name: "Seattle Sounders", country: "USA", league: "Major League Soccer", level: 3, development: 4, identity: "Stable club, serious crowds", short: "SEA", colors: "#5d9732" },
  { name: "FC Dallas", country: "USA", league: "Major League Soccer", level: 2, development: 5, identity: "A clear academy route", short: "FCD", colors: "#d71920" },
  { name: "Philadelphia Union", country: "USA", league: "Major League Soccer", level: 3, development: 5, identity: "Develop and sell well", short: "PHI", colors: "#071b2c" },

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

const SCENARIOS: Scenario[] = [
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
      { label: "Train like the cameras are always on", hint: "High reward, soft-tissue danger", outcomes: [{ probability: .6, label: "The coach is impressed. You jump up the pecking order.", positive: true, effect: { roleBoost: 1, rating: 1 } }, { probability: .4, label: "Your hamstring files a formal complaint.", positive: false, effect: { fitness: -22, rating: -1 } }] },
      { label: "Trust the CV and train normally", hint: "Professional, not necessarily memorable", outcomes: [{ probability: .4, label: "Calm competence wins him over.", positive: true, effect: { roleBoost: 1 } }, { probability: .6, label: "He prefers a player he already knows from a club you dislike.", positive: false, effect: { roleBoost: -1, morale: -5 } }] },
    ],
  },
  {
    id: "team-party", icon: "🪩", category: "Team culture", title: "The squad plans a night out before a cup tie",
    description: "The captain says it is 'important for chemistry.' The fitness coach says nothing, but his left eye begins twitching.", maxAge: 28,
    options: [
      { label: "Go out with the squad", hint: "Chemistry with a side of jeopardy", outcomes: [{ probability: .72, label: "You become part of the group and somehow make breakfast.", positive: true, effect: { morale: 12, roleBoost: 1 } }, { probability: .28, label: "You injure yourself attempting a dance last popular in 2017.", positive: false, effect: { fitness: -28, rating: -1 } }] },
      { label: "Sleep at 21:30", hint: "Safe for the body, brutal for the group chat", outcomes: [{ probability: 1, label: "Perfect sleep score. The squad removes you from two group chats.", positive: false, effect: { fitness: 8, morale: -5 } }] },
    ],
  },
  {
    id: "teammate-mum", icon: "📺", category: "Media", title: "A teammate's mum destroys you on television",
    description: "A link arrives in the group chat. She is on a popular football show, armed with statistics she has almost understood.", minAge: 18,
    options: [
      { label: "Call the show and respond live", hint: "Prime-time coin toss", outcomes: [{ probability: .5, label: "She retreats. The dressing room gives you a standing ovation.", positive: true, effect: { rating: 2, reputation: 8 } }, { probability: .5, label: "You lose an argument to someone's mum on national television.", positive: false, effect: { rating: -2, morale: -12 } }] },
      { label: "Ignore it with great dignity", hint: "Dignity is not always selected", outcomes: [{ probability: 1, label: "The coach saw the clip. He now wants to 'protect you' on the bench.", positive: false, effect: { roleBoost: -1 } }] },
    ],
  },
  {
    id: "agent-pitch", icon: "🤝", category: "Representation", title: "An ambitious agent slides into your DMs",
    description: "His profile says 'GLOBAL FOOTBALL CONNECTOR' and features photographs with three players who do not follow him back.", minAge: 20,
    options: [
      { label: "Sign with the ambitious agent", hint: "Better reach, louder phone", outcomes: [{ probability: .75, label: "He genuinely has contacts. Your next market gets wider.", positive: true, effect: { agent: "International agent", reputation: 7, value: 1.08 } }, { probability: .25, label: "His main contact is a group chat called Transfers 2.", positive: false, effect: { agent: "Optimistic agent", value: .94 } }] },
      { label: "Keep the family friend", hint: "Fewer contacts, excellent birthday messages", outcomes: [{ probability: 1, label: "No new doors open, but your aunt remains delighted.", positive: true, effect: { agent: "Family representative", morale: 5 } }] },
    ],
  },
  {
    id: "derby-quote", icon: "🎙️", category: "Media", title: "A journalist wants a derby quote",
    description: "He asks whether the rival club's defence scares you. His phone is already recording and his headline is 80% written.",
    options: [
      { label: "Give him the sharp quote", hint: "Hero or tomorrow's meme", outcomes: [{ probability: .5, label: "You score. The quote becomes a banner behind the goal.", positive: true, effect: { rating: 2, reputation: 8 } }, { probability: .5, label: "You lose. The quote follows you to every airport for six months.", positive: false, effect: { rating: -2, morale: -8 } }] },
      { label: "Say you respect every opponent", hint: "Media training has won", outcomes: [{ probability: 1, label: "Nothing happens. Somewhere, a press officer quietly celebrates.", positive: true, effect: { morale: 2 } }] },
    ],
  },
  {
    id: "play-through-pain", icon: "🩹", category: "Fitness", title: "The manager asks you to play through knee pain",
    description: "The medical staff say 'manageable.' They do not specify whose problem it becomes if it stops being manageable.", minAge: 20,
    options: [
      { label: "Play the match", hint: "Glory or an MRI", outcomes: [{ probability: .52, label: "You deliver and become the manager's favourite emergency contact.", positive: true, effect: { rating: 2, reputation: 5 } }, { probability: .48, label: "The knee gets worse. The medical room learns your coffee order.", positive: false, effect: { rating: -2, fitness: -30 } }] },
      { label: "Listen to your body", hint: "Sensible people rarely trend", outcomes: [{ probability: .45, label: "The manager understands. You recover fully.", positive: true, effect: { fitness: 14 } }, { probability: .55, label: "He calls it a 'mentality issue' and starts someone with one functioning ankle.", positive: false, effect: { roleBoost: -1 } }] },
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
      { label: "Stay home and prepare", hint: "Very professional, deeply untelevised", outcomes: [{ probability: 1, label: "You play well. Nobody clips tactical discipline for social media.", positive: true, effect: { fitness: 6, rating: 1 } }] },
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
      { label: "Take the money", hint: "A spectacularly poor life plan", outcomes: [{ probability: .25, label: "Nobody notices. You feel terrible and richer.", positive: false, effect: { value: 1.12, morale: -18 } }, { probability: .75, label: "Everyone notices. The suspension is long and the headlines are longer.", positive: false, effect: { rating: -4, value: .7, reputation: -30 } }] },
    ],
  },
  {
    id: "language-barrier", icon: "🗣️", category: "Life abroad", title: "The tactical meeting is happening in your fourth language",
    description: "You understand 'press,' 'inside' and, concerningly, your own name shouted twice.",
    options: [
      { label: "Nod with total confidence", hint: "Efficient until kick-off", outcomes: [{ probability: .45, label: "You guessed correctly. Football truly is universal.", positive: true, effect: { rating: 1, morale: 4 } }, { probability: .55, label: "You press the wrong centre-back for 37 minutes.", positive: false, effect: { roleBoost: -1, rating: -1 } }] },
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
      { label: "Try the miracle treatment", hint: "The word miracle is doing work", outcomes: [{ probability: .3, label: "Against medical science and common sense, you feel brilliant.", positive: true, effect: { fitness: 25, rating: 1 } }, { probability: .7, label: "The magnets remain undefeated. Your rehab does not.", positive: false, effect: { fitness: -20, rating: -1 } }] },
      { label: "Stay with the club physio", hint: "Slow, boring, evidence-based", outcomes: [{ probability: 1, label: "Recovery is gradual and successful. Nobody starts a podcast.", positive: true, effect: { fitness: 12 } }] },
    ],
  },
  {
    id: "social-rant", icon: "📱", category: "Social media", title: "You type a furious post after being benched",
    description: "It is 01:14. The draft contains six exclamation marks and the phrase 'people will know the truth.'",
    options: [
      { label: "Post it", hint: "Fast thumbs, slow consequences", outcomes: [{ probability: .35, label: "The fans back you. The manager absolutely does not.", positive: true, effect: { reputation: 8, morale: 5 } }, { probability: .65, label: "The club fines you before breakfast and benches you before lunch.", positive: false, effect: { roleBoost: -1, value: .9 } }] },
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
];

const DEFAULT_SAVE: SavedGame = { screen: "home", phase: "offers", player: null, offers: [], seasonSpan: 1, lastSeason: null, scenarioId: null, outcome: null };
const ROLE_SCORE: Record<Role, number> = { Prospect: 1, Rotation: 2, Starter: 3, Star: 4 };

function country(code: string) { return COUNTRIES.find((item) => item.code === code) ?? START_COUNTRIES[0]; }
function clubByName(name: string) { return CLUBS.find((item) => item.name === name); }
function money(value: number) { return value >= 1_000_000 ? `€${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m` : `€${Math.round(value / 1_000)}k`; }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - .5); }
function roleFor(rating: number, clubLevel: number, age: number, boost = 0): Role {
  const required = 49 + clubLevel * 8;
  const score = rating + boost * 4;
  if (age <= 17 && clubLevel >= 4) return "Prospect";
  if (score >= required + 8) return "Star";
  if (score >= required) return "Starter";
  if (score >= required - 7) return "Rotation";
  return "Prospect";
}
function marketValue(rating: number, age: number, potential: number) {
  const ageFactor = age <= 21 ? 1.2 : age <= 27 ? 1 : age <= 30 ? .82 : age <= 33 ? .55 : .28;
  const potentialFactor = age < 24 ? 1 + Math.max(0, potential - rating) / 35 : 1;
  return Math.round(Math.max(80_000, (rating - 45) ** 3 * 430 * ageFactor * potentialFactor));
}
function offerReason(club: Club, player: Player, role: Role) {
  if (player.age <= 17) return `${club.development}/5 academy · ${role.toLowerCase()} pathway`;
  if (player.age >= 32) return club.country === player.nation ? "A homecoming with real minutes" : "One last adventure, one serious contract";
  if (club.country !== player.nation && ["POR", "NED", "BEL", "CRO"].includes(club.country)) return "A proven bridge to a bigger league";
  if (role === "Prospect") return "Prestige now, patience required";
  if (role === "Star") return "The team is being built around you";
  return `${club.development}/5 development · a credible next step`;
}
function buildOffers(player: Player, first = false): Offer[] {
  if (first) {
    const domestic = CLUBS.filter((club) => club.country === player.nation);
    return shuffle(domestic).slice(0, 3).map((club) => ({ ...club, role: roleFor(player.rating + club.development, club.level, player.age), label: "Academy offer", reason: `${club.development}/5 development · the first door opens`, kind: "academy" }));
  }
  const current = clubByName(player.currentClub);
  const ideal = player.rating >= 87 ? 5 : player.rating >= 80 ? 4 : player.rating >= 72 ? 3 : player.rating >= 64 ? 2 : 1;
  let pool = CLUBS.filter((club) => club.name !== player.currentClub && Math.abs(club.level - ideal) <= (player.agent.includes("International") ? 2 : 1));
  if (player.age < 18) {
    pool = CLUBS.filter((club) => club.name !== player.currentClub && club.country === player.nation);
  } else if (player.age <= 21) {
    const hubs = new Set([player.nation, "POR", "NED", "BEL", "GER", "FRA"]);
    pool = pool.filter((club) => hubs.has(club.country) || club.development >= 5);
  }
  if (player.age >= 31) {
    const lateMarkets = new Set([player.nation, "USA", "SAU", "JPN", "MEX", "BRA", "ARG", "TUR"]);
    pool = pool.filter((club) => lateMarkets.has(club.country) || club.level >= 4);
  }
  const selected = shuffle(pool).slice(0, current ? 2 : 3);
  const offers: Offer[] = selected.map((club) => {
    const role = roleFor(player.rating, club.level, player.age, player.roleBoost);
    const loan = player.age <= 22 && role === "Prospect" && Math.random() < .55;
    return { ...club, role: loan ? "Starter" : role, label: loan ? "Loan proposal" : club.country === player.nation ? "Domestic move" : player.age >= 31 ? "Final adventure" : "Move abroad", reason: offerReason(club, player, loan ? "Starter" : role), kind: loan ? "loan" : "permanent" };
  });
  if (current) {
    const role = roleFor(player.rating, current.level, player.age, player.roleBoost + 1);
    const backFromLoan = player.history[0]?.kind === "loan";
    offers.unshift({ ...current, role, label: backFromLoan ? "Return from loan" : "Stay at the club", reason: backFromLoan ? "The parent club has watched the tape—at least that is what they claim" : role === "Prospect" ? "Fight for a place in familiar surroundings" : "Continuity, status and unfinished business", kind: "permanent" });
  }
  return offers.slice(0, 3);
}
function eligibleScenario(player: Player) {
  const available = SCENARIOS.filter((item) => !player.seenScenarios.includes(item.id) && (!item.minAge || player.age >= item.minAge) && (!item.maxAge || player.age <= item.maxAge) && (!item.needsCaps || player.caps > 0));
  return shuffle(available.length ? available : SCENARIOS.filter((item) => (!item.minAge || player.age >= item.minAge) && (!item.maxAge || player.age <= item.maxAge)))[0];
}
function positionRates(position: string, rating: number) {
  const quality = clamp((rating - 55) / 45, 0, 1);
  if (position === "ST") return { goals: .22 + quality * .42, assists: .08 + quality * .12 };
  if (["LW", "RW"].includes(position)) return { goals: .12 + quality * .28, assists: .13 + quality * .2 };
  if (position === "CAM") return { goals: .08 + quality * .2, assists: .16 + quality * .25 };
  if (["CM", "CDM"].includes(position)) return { goals: .03 + quality * .1, assists: .08 + quality * .17 };
  if (["LB", "RB"].includes(position)) return { goals: .01 + quality * .04, assists: .06 + quality * .13 };
  if (position === "CB") return { goals: .02 + quality * .04, assists: .01 + quality * .03 };
  return { goals: 0, assists: .01 };
}
function seasonNarrative(role: Role, apps: number, movedAbroad: boolean, injured: boolean, trophies: number) {
  if (injured) return "The season had momentum. Your hamstring preferred a different narrative.";
  if (trophies) return "You lifted silverware. Nobody remembers the November draw anymore.";
  if (apps < 15) return "Your most consistent position was next to the assistant coach.";
  if (role === "Star") return "The manager finally built around you. Subtlety was not required.";
  if (movedAbroad) return "You settled abroad and learned the language—especially the useful words referees dislike.";
  if (role === "Starter") return "The team sheet stopped being a source of suspense. Progress.";
  return "A useful season: enough football to grow, enough bench time to stay humble.";
}
function getAchievements(player: Player) {
  const list = ["Professional debut"];
  const nations = new Set(player.history.map((season) => season.country));
  if (nations.size >= 3) list.push("Three-country career");
  if (player.totalApps >= 100) list.push("Century of appearances");
  if (player.totalGoals >= 100) list.push("Hundred-goal club");
  if (player.trophies >= 3) list.push("Serial winner");
  if (player.caps >= 25) list.push("International regular");
  if (player.rating >= 88) list.push("World class");
  return list;
}

function ClubBadge({ club, small = false }: { club: Club | undefined; small?: boolean }) {
  if (!club) return <span className={small ? "club-badge small" : "club-badge"}>FA</span>;
  return (
    <span className={small ? "club-badge small" : "club-badge"} style={{ "--club-color": club.colors } as CSSProperties}>
      {SHOW_OFFICIAL_CRESTS && club.crest ? <img src={club.crest} alt={`${club.name} crest`} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <b>{club.short}</b>}
    </span>
  );
}

export default function Home() {
  const [game, setGame] = useState<SavedGame>(DEFAULT_SAVE);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("Kai Nash");
  const [nation, setNation] = useState("ENG");
  const [position, setPosition] = useState("ST");
  const [number, setNumber] = useState(9);

  useEffect(() => {
    const raw = window.localStorage.getItem("goalbound-career-v2");
    if (raw) {
      try { setGame(JSON.parse(raw) as SavedGame); } catch { window.localStorage.removeItem("goalbound-career-v2"); }
    }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) window.localStorage.setItem("goalbound-career-v2", JSON.stringify(game)); }, [game, loaded]);

  const player = game.player;
  const playerCountry = useMemo(() => country(player?.nation ?? nation), [player?.nation, nation]);
  const scenario = game.scenarioId ? SCENARIOS.find((item) => item.id === game.scenarioId) ?? null : null;
  const achievements = player ? getAchievements(player) : [];

  function startSetup() { setGame((current) => ({ ...current, screen: "setup" })); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function startCareer() {
    const potential = randomInt(76, 94);
    const next: Player = { name: name.trim() || "Kai Nash", nation, position, number, age: 16, rating: 52, potential, value: 125_000, currentClub: "Free agent", parentClub: null, totalApps: 0, totalGoals: 0, totalAssists: 0, trophies: 0, caps: 0, nationalGoals: 0, morale: 72, fitness: 92, reputation: 8, agent: "Self-represented", roleBoost: 0, seenScenarios: [], history: [] };
    setGame((current) => ({ ...current, screen: "career", phase: "offers", player: next, offers: buildOffers(next, true), lastSeason: null, scenarioId: null, outcome: null }));
  }
  function chooseOffer(offer: Offer) {
    if (!player) return;
    const years = Math.min(game.seasonSpan, 36 - player.age);
    const roleScore = clamp(ROLE_SCORE[offer.role] + player.roleBoost, 1, 4);
    const perYearApps = roleScore === 1 ? randomInt(4, 15) : roleScore === 2 ? randomInt(16, 29) : roleScore === 3 ? randomInt(28, 42) : randomInt(36, 48);
    const injuryChance = clamp(.08 + (100 - player.fitness) / 240 + Math.max(0, player.age - 30) / 80, .07, .38);
    const injured = Math.random() < injuryChance;
    const apps = Math.max(2, Math.round(perYearApps * years * (injured ? randomInt(45, 72) / 100 : 1)));
    const rates = positionRates(player.position, player.rating);
    const goals = Math.max(0, Math.round(apps * rates.goals * randomInt(75, 125) / 100));
    const assists = Math.max(0, Math.round(apps * rates.assists * randomInt(75, 125) / 100));
    const ageBase = player.age < 19 ? 5 : player.age < 22 ? 4 : player.age < 26 ? 2 : player.age < 29 ? 1 : player.age < 32 ? 0 : -2;
    const positionAgeAdjustment = player.position === "GK" ? (player.age < 21 ? -2 : player.age >= 29 ? 1 : 0) : ["CB", "CDM"].includes(player.position) && player.age >= 29 ? 1 : 0;
    const minutesBonus = apps / years >= 28 ? 2 : apps / years >= 16 ? 0 : -2;
    const rawGrowth = Math.round((ageBase + positionAgeAdjustment + Math.floor(offer.development / 2) + minutesBonus + player.morale / 50 - (injured ? 2 : 0)) * Math.sqrt(years) / 1.8);
    const nextRating = clamp(Math.min(player.potential, player.rating + rawGrowth), 45, 96);
    const titleChance = offer.level * roleScore + Math.max(0, nextRating - 78);
    const trophies = titleChance > randomInt(20, 39) ? 1 : 0;
    const threshold = country(player.nation).threshold;
    const getsCaps = nextRating >= threshold || (nextRating >= threshold - 3 && player.reputation >= 55);
    const caps = getsCaps ? years * randomInt(2, 8) : 0;
    const internationalRates = positionRates(player.position, nextRating);
    const nationalGoals = Math.round(caps * internationalRates.goals * .65);
    const movedAbroad = offer.country !== player.nation;
    const event = seasonNarrative(offer.role, apps, movedAbroad, injured, trophies);
    const season: Season = { fromAge: player.age, toAge: player.age + years, club: offer.name, country: offer.country, league: offer.league, role: offer.role, kind: offer.kind, apps, goals, assists, before: player.rating, after: nextRating, trophies, event };
    const returningParent = offer.kind === "loan" ? player.currentClub : null;
    const next: Player = { ...player, age: player.age + years, rating: nextRating, value: marketValue(nextRating, player.age + years, player.potential), currentClub: returningParent ?? offer.name, parentClub: null, totalApps: player.totalApps + apps, totalGoals: player.totalGoals + goals, totalAssists: player.totalAssists + assists, trophies: player.trophies + trophies, caps: player.caps + caps, nationalGoals: player.nationalGoals + nationalGoals, morale: clamp(player.morale + (apps / years >= 25 ? 6 : -8) + (trophies ? 8 : 0), 20, 100), fitness: clamp(player.fitness + (injured ? -22 : 5) - Math.max(0, player.age - 31), 25, 100), reputation: clamp(player.reputation + Math.round(apps / years / 7) + trophies * 6, 0, 100), roleBoost: 0, history: [season, ...player.history] };
    setGame((current) => ({ ...current, screen: "career", phase: "season-result", player: next, offers: [], lastSeason: season, scenarioId: null, outcome: null }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function continueAfterSeason() {
    if (!player) return;
    if (player.age >= 36) {
      setGame((current) => ({ ...current, screen: "summary" }));
      return;
    }
    const nextScenario = eligibleScenario(player);
    setGame((current) => ({ ...current, phase: "scenario", scenarioId: nextScenario.id, outcome: null }));
  }
  function resolveScenario(option: ScenarioOption) {
    if (!player || !scenario) return;
    const roll = Math.random();
    let cursor = 0;
    const outcome = option.outcomes.find((item) => { cursor += item.probability; return roll <= cursor; }) ?? option.outcomes[option.outcomes.length - 1];
    const effect = outcome.effect;
    const nextRating = clamp(player.rating + (effect.rating ?? 0), 45, player.potential);
    const next: Player = { ...player, rating: nextRating, value: Math.round(marketValue(nextRating, player.age, player.potential) * (effect.value ?? 1)), morale: clamp(player.morale + (effect.morale ?? 0), 0, 100), fitness: clamp(player.fitness + (effect.fitness ?? 0), 0, 100), reputation: clamp(player.reputation + (effect.reputation ?? 0), 0, 100), roleBoost: clamp(player.roleBoost + (effect.roleBoost ?? 0), -2, 2), agent: effect.agent ?? player.agent, seenScenarios: [...player.seenScenarios, scenario.id] };
    setGame((current) => ({ ...current, phase: "scenario-result", player: next, outcome: { label: outcome.label, positive: outcome.positive } }));
  }
  function continueAfterScenario() {
    if (!player) return;
    setGame((current) => ({ ...current, phase: "offers", offers: buildOffers(player), scenarioId: null, outcome: null }));
  }
  function resetGame() {
    window.localStorage.removeItem("goalbound-career-v2");
    setGame(DEFAULT_SAVE); setName("Kai Nash"); setNation("ENG"); setPosition("ST"); setNumber(9);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => setGame((current) => ({ ...current, screen: "home" }))} aria-label="Goalbound home"><span className="brand-mark">G</span><span>GOALBOUND</span></button>
        <div className="topbar-right"><span className="save-status"><i /> Saved on this device</span>{player && <button className="quiet-button" onClick={resetGame}>New career</button>}</div>
      </header>

      {game.screen === "home" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span>Career simulator</span><span>Real clubs</span></div>
              <h1>Your talent.<br /><em>Your choices.</em><br />Your legacy.</h1>
              <p>Start at 16. Earn your minutes. Survive agents, managers, bad advice and worse television. One career, no reloads.</p>
              <div className="hero-actions"><button className="primary-button" onClick={startSetup}>Start your career <span>→</span></button>{player && <button className="secondary-button" onClick={() => setGame((current) => ({ ...current, screen: player.age >= 36 ? "summary" : "career" }))}>Resume {player.name}</button>}</div>
              <div className="nation-strip" aria-label="Available nations">{START_COUNTRIES.map((item) => <span key={item.code} title={item.name}>{item.flag}</span>)}</div>
            </div>
            <div className="hero-card-wrap" aria-hidden="true">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="prospect-card"><div className="prospect-top"><span className="rating-big">52</span><div><strong>OVR</strong><span>RISING TALENT</span></div><span className="card-flag">🌍</span></div><div className="shirt-graphic"><span>9</span></div><div className="prospect-name">YOUR NAME</div><div className="card-data"><span>AGE <strong>16</strong></span><span>POS <strong>ST</strong></span><span>VALUE <strong>€125k</strong></span></div></div>
              <div className="floating-tag tag-left"><small>NEXT MOVE</small><strong>YOU DECIDE</strong></div><div className="floating-tag tag-right"><small>OUTCOME</small><strong>FATE DECIDES</strong></div>
            </div>
          </section>
          <section className="manifesto"><div><span className="step-number">01</span><h3>Real football world</h3><p>Join Arsenal, Barcelona, River Plate, Ajax and dozens more real clubs.</p></div><div><span className="step-number">02</span><h3>Decisions with teeth</h3><p>See the odds, choose your risk and live with what the football gods decide.</p></div><div><span className="step-number">03</span><h3>No perfect pathway</h3><p>Loans, injuries, agents and late-career adventures make every run different.</p></div></section>
        </>
      )}

      {game.screen === "setup" && (
        <section className="setup-page page-enter">
          <div className="page-heading"><button className="back-link" onClick={() => setGame((current) => ({ ...current, screen: "home" }))}>← Back</button><span className="eyebrow">New career · Age 16</span><h2>Create your player</h2><p>This is where the story starts. The rest is earned, guessed or blamed on your agent.</p></div>
          <div className="setup-grid">
            <div className="form-panel">
              <div className="field-grid"><label className="field"><span>Player name</span><input value={name} maxLength={22} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label><label className="field small-field"><span>Shirt number</span><input type="number" min="1" max="99" value={number} onChange={(event) => setNumber(clamp(Number(event.target.value), 1, 99))} /></label></div>
              <fieldset><legend>Nationality</legend><div className="country-grid">{START_COUNTRIES.map((item) => <button key={item.code} className={nation === item.code ? "country-option selected" : "country-option"} onClick={() => setNation(item.code)} aria-pressed={nation === item.code}><span>{item.flag}</span><strong>{item.name}</strong><small>{item.code}</small></button>)}</div></fieldset>
              <fieldset><legend>Position</legend><div className="position-grid">{POSITIONS.map((item) => <button key={item} className={position === item ? "position-option selected" : "position-option"} onClick={() => setPosition(item)} aria-pressed={position === item}>{item}</button>)}</div></fieldset>
              <fieldset><legend>Decisions every</legend><div className="span-options">{[1, 2, 3].map((years) => <button key={years} className={game.seasonSpan === years ? "span-option selected" : "span-option"} onClick={() => setGame((current) => ({ ...current, seasonSpan: years }))}>{years} {years === 1 ? "season" : "seasons"}</button>)}</div><p className="field-note">One season is the full soap opera. Three seasons is chaos at high speed.</p></fieldset>
            </div>
            <aside className="live-card"><div className="live-card-top"><span>PROSPECT ID</span><span>{playerCountry.code} / 016</span></div><div className="live-score"><strong>52</strong><span>OVR<br />POTENTIAL: ?</span></div><div className="live-shirt"><b>{number}</b><small>{playerCountry.flag}</small></div><div className="live-name">{name || "YOUR NAME"}</div><div className="live-meta"><span><small>NATION</small>{playerCountry.name}</span><span><small>POSITION</small>{position}</span><span><small>STATUS</small>Free agent</span></div><button className="primary-button full-button" onClick={startCareer}>Enter the football world <span>→</span></button></aside>
          </div>
        </section>
      )}

      {game.screen === "career" && player && (
        <section className="career-page page-enter">
          <div className="career-head"><div className="identity-block"><div className="mini-shirt">{player.number}</div><div><span className="eyebrow">{playerCountry.flag} {playerCountry.name} · #{player.number} {player.position}</span><h2>{player.name}</h2><p>{player.currentClub} · Age {player.age}</p></div></div><div className="rating-block"><strong>{player.rating}</strong><span>OVR</span></div></div>
          <div className="career-stats"><div><small>Market value</small><strong>{money(player.value)}</strong></div><div><small>Appearances</small><strong>{player.totalApps}</strong></div><div><small>Goals</small><strong>{player.totalGoals}</strong></div><div><small>Assists</small><strong>{player.totalAssists}</strong></div><div><small>Trophies</small><strong>{player.trophies}</strong></div><div><small>National caps</small><strong>{player.caps}</strong></div></div>
          <div className="career-vitals"><span><i style={{ width: `${player.fitness}%` }} /><small>Fitness</small><strong>{player.fitness}</strong></span><span><i style={{ width: `${player.morale}%` }} /><small>Morale</small><strong>{player.morale}</strong></span><span><i style={{ width: `${player.reputation}%` }} /><small>Reputation</small><strong>{player.reputation}</strong></span><span className="agent-pill"><small>Representation</small><strong>{player.agent}</strong></span></div>

          {game.phase === "offers" && <>
            <div className="decision-heading"><div><span className="eyebrow">The next decision</span><h3>{player.age === 16 ? "Choose your first academy" : "Where do you go next?"}</h3></div><div className="season-control"><span>Simulate</span>{[1, 2, 3].map((years) => <button key={years} className={game.seasonSpan === years ? "active" : ""} onClick={() => setGame((current) => ({ ...current, seasonSpan: years }))}>{years}Y</button>)}</div></div>
            <div className="offers-grid">{game.offers.map((offer, index) => <button className="offer-card" key={`${offer.name}-${index}`} onClick={() => chooseOffer(offer)}><div className="offer-index">0{index + 1}</div><div className="offer-top"><span>{offer.label}</span><ClubBadge club={offer} /></div><h4>{offer.name}</h4><p>{offer.league} · {country(offer.country).flag} {country(offer.country).name}</p><div className="offer-details"><span><small>ROLE</small>{offer.role}</span><span><small>WHY IT FITS</small>{offer.reason}</span></div><div className="offer-action"><span>Choose club</span><strong>→</strong></div></button>)}</div>
          </>}

          {game.phase === "season-result" && game.lastSeason && <div className="story-stage season-stage">
            <div className="story-kicker">Season complete · Age {game.lastSeason.fromAge}–{game.lastSeason.toAge}</div>
            <div className="season-club"><ClubBadge club={clubByName(game.lastSeason.club)} /><div><span>{game.lastSeason.kind === "loan" ? "On loan at" : "Chapter at"}</span><h3>{game.lastSeason.club}</h3><p>{game.lastSeason.league}</p></div></div>
            <blockquote>{game.lastSeason.event}</blockquote>
            <div className="season-numbers"><span><strong>{game.lastSeason.apps}</strong><small>Apps</small></span><span><strong>{game.lastSeason.goals}</strong><small>Goals</small></span><span><strong>{game.lastSeason.assists}</strong><small>Assists</small></span><span><strong>{game.lastSeason.trophies}</strong><small>Trophies</small></span><span className={game.lastSeason.after >= game.lastSeason.before ? "up" : "down"}><strong>{game.lastSeason.before} → {game.lastSeason.after}</strong><small>OVR</small></span></div>
            <button className="primary-button story-continue" onClick={continueAfterSeason}>See what happens off the pitch <span>→</span></button>
          </div>}

          {game.phase === "scenario" && scenario && <div className="story-stage scenario-stage">
            <div className="scenario-icon">{scenario.icon}</div><span className="story-kicker">{scenario.category} · Career decision</span><h3>{scenario.title}</h3><p className="scenario-description">{scenario.description}</p>
            <div className="scenario-options">{scenario.options.map((option, index) => <button key={option.label} onClick={() => resolveScenario(option)}><span className="option-number">0{index + 1}</span><div className="option-copy"><strong>{option.label}</strong><small>{option.hint}</small></div><div className="odds">{option.outcomes.map((item) => <span className={item.positive ? "positive" : "negative"} key={item.label}><b>{Math.round(item.probability * 100)}%</b>{item.label}</span>)}</div><em>Choose →</em></button>)}</div>
          </div>}

          {game.phase === "scenario-result" && game.outcome && <div className={game.outcome.positive ? "story-stage outcome-stage positive" : "story-stage outcome-stage negative"}>
            <div className="fate-coin">{game.outcome.positive ? "✓" : "×"}</div><span className="story-kicker">Fate has decided</span><h3>{game.outcome.label}</h3><p>Your rating, value, fitness and status have been updated. Football has moved on already.</p><button className="primary-button story-continue" onClick={continueAfterScenario}>Open the transfer window <span>→</span></button>
          </div>}

          <div className="career-lower"><div className="timeline-panel"><div className="panel-heading"><h3>Career path</h3><span>{player.history.length} chapters</span></div>{player.history.length === 0 ? <p className="empty-state">Your first contract will start the timeline.</p> : <div className="timeline">{player.history.map((season, index) => <div className="timeline-row" key={`${season.club}-${season.fromAge}-${index}`}><span className="timeline-age">{season.fromAge}–{season.toAge}</span><ClubBadge club={clubByName(season.club)} small /><div><strong>{season.kind === "loan" ? "↳ " : ""}{season.club}</strong><small>{season.role} · {season.apps} apps · {season.goals} G · {season.assists} A</small></div><span className={season.after >= season.before ? "rating-rise" : "rating-fall"}>{season.before} → {season.after}</span></div>)}</div>}</div><aside className="achievements-panel"><div className="panel-heading"><h3>Legacy</h3><span>{achievements.length}/7</span></div><div className="achievement-list">{achievements.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>)}</div></aside></div>
        </section>
      )}

      {game.screen === "summary" && player && <section className="summary-page page-enter"><span className="eyebrow">Career complete · Age {player.age}</span><h2>{player.name}<br /><em>leaves a legacy.</em></h2><p className="summary-lead">From {country(player.nation).name} to the world. {player.history.length} clubs and decisions, several excellent contracts, one suspicious recovery guru.</p><div className="summary-score"><span>FINAL OVR</span><strong>{player.rating}</strong><small>{player.rating >= 90 ? "WORLD ICON" : player.rating >= 82 ? "ELITE CAREER" : player.rating >= 72 ? "PROVEN PROFESSIONAL" : "CULT HERO"}</small></div><div className="summary-stats"><div><strong>{player.totalApps}</strong><span>Apps</span></div><div><strong>{player.totalGoals}</strong><span>Goals</span></div><div><strong>{player.totalAssists}</strong><span>Assists</span></div><div><strong>{player.trophies}</strong><span>Trophies</span></div><div><strong>{player.caps}</strong><span>Caps</span></div></div><div className="summary-actions"><button className="primary-button" onClick={resetGame}>Start another career <span>↻</span></button></div></section>}

      <footer><span>GOALBOUND © 2026</span><span>Real clubs · Original scenarios · No real player likenesses</span></footer>
    </main>
  );
}
