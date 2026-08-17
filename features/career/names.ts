type NamePool = {
  given: readonly string[];
  family: readonly string[];
};

const NAME_POOLS: Record<string, NamePool> = {
  ENG: {
    given: ["Oliver", "Ethan", "Mason", "Liam", "Archie", "Finley", "Theo", "Jude"],
    family: ["Bennett", "Clarke", "Foster", "Hughes", "Palmer", "Sutton", "Ward", "Walsh"],
  },
  ESP: {
    given: ["Hugo", "Martín", "Alejandro", "Daniel", "Pablo", "Adrián", "Marcos", "Álvaro"],
    family: ["García", "Navarro", "Serrano", "Vega", "Prieto", "Cabrera", "Soler", "Moya"],
  },
  GER: {
    given: ["Jonas", "Leon", "Felix", "Lukas", "Maximilian", "Niklas", "Elias", "Florian"],
    family: ["Schneider", "Fischer", "Weber", "Wagner", "Hoffmann", "Becker", "Hartmann", "Krüger"],
  },
  ITA: {
    given: ["Luca", "Matteo", "Lorenzo", "Alessandro", "Riccardo", "Tommaso", "Federico", "Davide"],
    family: ["Romano", "Ricci", "Marino", "Greco", "Conti", "De Luca", "Moretti", "Lombardi"],
  },
  FRA: {
    given: ["Lucas", "Hugo", "Enzo", "Mathis", "Théo", "Jules", "Rayan", "Maxime"],
    family: ["Martin", "Bernard", "Dubois", "Laurent", "Moreau", "Lefèvre", "Roux", "Fontaine"],
  },
  POR: {
    given: ["João", "Tiago", "Diogo", "Gonçalo", "Martim", "Afonso", "Rafael", "Tomás"],
    family: ["Fernandes", "Carvalho", "Rodrigues", "Ferreira", "Almeida", "Correia", "Neves", "Pires"],
  },
  NED: {
    given: ["Daan", "Sem", "Luuk", "Finn", "Mees", "Thijs", "Bram", "Stijn"],
    family: ["de Jong", "van Dijk", "Smit", "Bakker", "Visser", "de Boer", "Bos", "Kuipers"],
  },
  BRA: {
    given: ["Gabriel", "Lucas", "Matheus", "Pedro", "João", "Vinícius", "Caio", "Rafael"],
    family: ["Oliveira", "Souza", "Santos", "Lima", "Ferreira", "Costa", "Ribeiro", "Barbosa"],
  },
  ARG: {
    given: ["Mateo", "Thiago", "Benjamín", "Joaquín", "Lautaro", "Tomás", "Franco", "Valentín"],
    family: ["González", "Fernández", "Romero", "Díaz", "Álvarez", "Herrera", "Acosta", "Pereyra"],
  },
  USA: {
    given: ["Ethan", "Noah", "Caleb", "Logan", "Miles", "Cameron", "Jordan", "Adrian"],
    family: ["Brooks", "Carter", "Hayes", "Turner", "Reed", "Bennett", "Collins", "Rivera"],
  },
  ISR: {
    given: ["Noam", "Itay", "Lior", "Omer", "Yonatan", "Ariel", "Nadav", "Eitan"],
    family: ["Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Dahan", "Azoulay", "Shalev"],
  },
  POL: {
    given: ["Jakub", "Kacper", "Szymon", "Mateusz", "Michał", "Bartosz", "Filip", "Wojciech"],
    family: ["Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kamiński", "Zieliński", "Szymański", "Dudek"],
  },
  CYP: {
    given: ["Andreas", "Giorgos", "Marios", "Christos", "Michalis", "Nicos", "Stelios", "Pavlos"],
    family: ["Georgiou", "Andreou", "Nicolaou", "Christou", "Ioannou", "Demetriou", "Savva", "Kyriakou"],
  },
  BEL: {
    given: ["Arthur", "Louis", "Jules", "Mathis", "Noah", "Milan", "Wout", "Seppe"],
    family: ["Peeters", "Janssens", "Maes", "Jacobs", "Willems", "Dubois", "Lambert", "De Smet"],
  },
  SCO: {
    given: ["Callum", "Lewis", "Finlay", "Euan", "Jamie", "Rory", "Fraser", "Scott"],
    family: ["Campbell", "Stewart", "Murray", "Fraser", "McLean", "Robertson", "Kerr", "Douglas"],
  },
  TUR: {
    given: ["Emir", "Arda", "Kerem", "Eren", "Mert", "Oğuz", "Burak", "Kaan"],
    family: ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Aydın", "Arslan", "Koç"],
  },
  CRO: {
    given: ["Luka", "Ivan", "Marko", "Petar", "Ante", "Josip", "Filip", "Lovro"],
    family: ["Horvat", "Kovač", "Babić", "Marić", "Jurić", "Novak", "Radić", "Božić"],
  },
  GRE: {
    given: ["Giorgos", "Nikos", "Dimitris", "Kostas", "Andreas", "Vasilis", "Manolis", "Stavros"],
    family: ["Papadopoulos", "Nikolaidis", "Georgiou", "Pappas", "Vlachos", "Kostas", "Manolas", "Raptis"],
  },
  AUT: {
    given: ["Lukas", "Felix", "David", "Florian", "Maximilian", "Jakob", "Simon", "Tobias"],
    family: ["Gruber", "Huber", "Wagner", "Bauer", "Moser", "Steiner", "Hofer", "Leitner"],
  },
  CZE: {
    given: ["Jakub", "Jan", "Tomáš", "Matěj", "Adam", "Ondřej", "Lukáš", "Filip"],
    family: ["Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák"],
  },
  DEN: {
    given: ["William", "Oscar", "Emil", "Magnus", "Mikkel", "Frederik", "Rasmus", "Kasper"],
    family: ["Nielsen", "Jensen", "Hansen", "Pedersen", "Andersen", "Christensen", "Larsen", "Madsen"],
  },
  SUI: {
    given: ["Noah", "Luca", "Leon", "Nico", "Julian", "Matteo", "Yannick", "Fabian"],
    family: ["Müller", "Meier", "Schmid", "Keller", "Frei", "Roth", "Brunner", "Aebi"],
  },
  NOR: {
    given: ["Jakob", "Emil", "Isak", "Magnus", "Sander", "Kristian", "Marius", "Elias"],
    family: ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Nilsen", "Berg", "Solberg"],
  },
  SWE: {
    given: ["William", "Hugo", "Elias", "Oscar", "Viktor", "Albin", "Gustav", "Anton"],
    family: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Lindberg"],
  },
  UKR: {
    given: ["Oleksandr", "Andriy", "Maksym", "Danylo", "Artem", "Mykola", "Vladyslav", "Bohdan"],
    family: ["Kovalenko", "Bondarenko", "Tkachenko", "Shevchuk", "Koval", "Boyko", "Melnyk", "Kravchenko"],
  },
  SRB: {
    given: ["Luka", "Nikola", "Stefan", "Miloš", "Aleksa", "Marko", "Dušan", "Vuk"],
    family: ["Jovanović", "Petrović", "Nikolić", "Marković", "Đorđević", "Pavlović", "Stojanović", "Ilić"],
  },
  ROU: {
    given: ["Andrei", "Alexandru", "Mihai", "Radu", "Vlad", "Ștefan", "Rareș", "Ionuț"],
    family: ["Popescu", "Ionescu", "Dumitru", "Stan", "Stoica", "Munteanu", "Rusu", "Marin"],
  },
  HUN: {
    given: ["Bence", "Máté", "Levente", "Dániel", "Ádám", "Zalán", "Balázs", "Gergő"],
    family: ["Nagy", "Kovács", "Tóth", "Szabó", "Horváth", "Varga", "Kiss", "Molnár"],
  },
  SAU: {
    given: ["Faisal", "Saud", "Omar", "Khalid", "Abdullah", "Nawaf", "Yousef", "Sultan"],
    family: ["Al-Qahtani", "Al-Harbi", "Al-Dosari", "Al-Ghamdi", "Al-Otaibi", "Al-Shammari", "Al-Anazi", "Al-Salem"],
  },
  JPN: {
    given: ["Haruto", "Ren", "Yuto", "Sota", "Kaito", "Riku", "Daiki", "Takumi"],
    family: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Nakamura", "Kobayashi"],
  },
  MEX: {
    given: ["Santiago", "Emiliano", "Diego", "Sebastián", "Mateo", "Javier", "Gael", "Rodrigo"],
    family: ["Hernández", "García", "Martínez", "López", "González", "Ramírez", "Torres", "Flores"],
  },
  ALB: {
    given: ["Ardit", "Erion", "Klejdi", "Ledion", "Lorik", "Rei", "Taulant", "Ylber"],
    family: ["Hoxha", "Krasniqi", "Kola", "Dervishi", "Gashi", "Leka", "Mema", "Shehu"],
  },
  ARM: {
    given: ["Aram", "Davit", "Gor", "Hayk", "Narek", "Sargis", "Tigran", "Vahan"],
    family: ["Grigoryan", "Harutyunyan", "Hovhannisyan", "Karapetyan", "Manukyan", "Mkrtchyan", "Petrosyan", "Sargsyan"],
  },
  BUL: {
    given: ["Aleksandar", "Bozhidar", "Dimitar", "Georgi", "Ivan", "Martin", "Nikolay", "Petar"],
    family: ["Dimitrov", "Georgiev", "Ivanov", "Kolev", "Nikolov", "Petrov", "Stoyanov", "Vasilev"],
  },
  FIN: {
    given: ["Eero", "Elias", "Joona", "Lauri", "Mikael", "Onni", "Rasmus", "Tuomas"],
    family: ["Heikkinen", "Järvinen", "Koskinen", "Laine", "Lehtonen", "Mäkinen", "Nieminen", "Virtanen"],
  },
  GEO: {
    given: ["Giorgi", "Irakli", "Lasha", "Levan", "Luka", "Nika", "Saba", "Zurab"],
    family: ["Beridze", "Davitashvili", "Gelashvili", "Kapanadze", "Kvaratskhelia", "Lomidze", "Maisuradze", "Tsiklauri"],
  },
  KAZ: {
    given: ["Abat", "Alibek", "Askhat", "Bauyrzhan", "Daniyar", "Nuraly", "Serik", "Timur"],
    family: ["Akhmetov", "Baltabayev", "Dosmanov", "Kassymov", "Nurgaliyev", "Sadykov", "Serikov", "Zhaksybayev"],
  },
  LVA: {
    given: ["Artūrs", "Daniels", "Edgars", "Jānis", "Kristaps", "Mārtiņš", "Rihards", "Roberts"],
    family: ["Bērziņš", "Jansons", "Kalniņš", "Liepiņš", "Ozoliņš", "Petrovs", "Siliņš", "Vītols"],
  },
  IRL: {
    given: ["Adam", "Cian", "Conor", "Darragh", "Eoin", "Jack", "Oisín", "Ronan"],
    family: ["Byrne", "Doyle", "Kelly", "Murphy", "O'Brien", "O'Connor", "Ryan", "Walsh"],
  },
};

const DEFAULT_POOL = NAME_POOLS.ENG;
const NAME_POOL_ALIASES: Record<string, string> = {
  AND: "ESP", AZE: "TUR", BLR: "UKR", BIH: "CRO", EST: "FIN", FRO: "DEN",
  GIB: "ENG", ISL: "NOR", KOS: "ALB", LTU: "LVA", LUX: "FRA", MLT: "ITA",
  MDA: "ROU", MNE: "SRB", MKD: "SRB", NIR: "IRL", SMR: "ITA", SVK: "CZE",
  SVN: "CRO", WAL: "ENG",
};

function namePool(countryCode: string) {
  return NAME_POOLS[countryCode] ?? NAME_POOLS[NAME_POOL_ALIASES[countryCode]] ?? DEFAULT_POOL;
}

function pick(items: readonly string[], random: () => number) {
  const roll = Math.max(0, Math.min(.999999, random()));
  return items[Math.floor(roll * items.length)];
}

export function generateName(countryCode: string, random: () => number = Math.random, avoid?: string) {
  const pool = namePool(countryCode);
  const given = pick(pool.given, random);
  let family = pick(pool.family, random);
  if (`${given} ${family}` === avoid) {
    family = pool.family[(pool.family.indexOf(family) + 1) % pool.family.length];
  }
  return `${given} ${family}`;
}

export function availableNameCount(countryCode: string) {
  const pool = namePool(countryCode);
  return pool.given.length * pool.family.length;
}

export function isGeneratedName(countryCode: string, name: string) {
  const pool = namePool(countryCode);
  return pool.given.some((given) => pool.family.some((family) => `${given} ${family}` === name));
}
