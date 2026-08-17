export type EuropeanTopFlightSeed = {
  country: string;
  league: string;
  division: 1;
  expectedClubs: number;
  clubs: readonly string[];
};

/**
 * Complete top-flight membership for UEFA associations that were not already
 * represented in the core catalog. Russia is intentionally excluded. UEFA
 * member Liechtenstein has no domestic league and is therefore not listed.
 */
export const ADDITIONAL_EUROPEAN_TOP_FLIGHTS: readonly EuropeanTopFlightSeed[] = [
  {
    country: "ALB", league: "Kategoria Superiore", division: 1, expectedClubs: 10,
    clubs: ["Bylis", "Dinamo City", "Egnatia", "Elbasani", "Flamurtari", "Partizani", "Teuta", "Tirana", "Vllaznia", "Vora"],
  },
  {
    country: "AND", league: "Primera Divisió", division: 1, expectedClubs: 10,
    clubs: ["Atlètic Club d'Escaldes", "Carroi", "FC Ordino", "FC Pas de la Casa", "FC Santa Coloma", "Inter Club d'Escaldes", "La Massana", "Penya Encarnada", "Ranger's", "UE Santa Coloma"],
  },
  {
    country: "ARM", league: "Armenian Premier League", division: 1, expectedClubs: 10,
    clubs: ["Alashkert", "Ararat-Armenia", "Ararat Yerevan", "BKMA Yerevan", "Gandzasar", "Noah", "Pyunik", "Shirak", "Urartu", "Van"],
  },
  {
    country: "AZE", league: "Azerbaijan Premier League", division: 1, expectedClubs: 12,
    clubs: ["Araz-Naxçıvan", "Gabala", "İmişli", "Karvan", "Kəpəz", "Neftçi", "Qarabağ", "Sabah", "Şamaxı", "Sumqayıt", "Turan Tovuz", "Zira"],
  },
  {
    country: "BLR", league: "Belarusian Premier League", division: 1, expectedClubs: 16,
    clubs: ["Arsenal Dzerzhinsk", "BATE Borisov", "Dinamo Brest", "Dinamo Minsk", "Gomel", "Isloch", "Maxline Vitebsk", "Minsk", "Molodechno", "Naftan Novopolotsk", "Neman Grodno", "Slavia Mozyr", "Slutsk", "Smorgon", "Torpedo-BelAZ", "Vitebsk"],
  },
  {
    country: "BIH", league: "Premier League of Bosnia and Herzegovina", division: 1, expectedClubs: 10,
    clubs: ["Borac Banja Luka", "Posušje", "Radnik Bijeljina", "Rudar Prijedor", "Sarajevo", "Sloga Doboj", "Široki Brijeg", "Velež Mostar", "Zrinjski Mostar", "Željezničar"],
  },
  {
    country: "BUL", league: "Bulgarian First League", division: 1, expectedClubs: 16,
    clubs: ["Arda Kardzhali", "Beroe Stara Zagora", "Botev Plovdiv", "Botev Vratsa", "Cherno More", "CSKA 1948", "CSKA Sofia", "Dobrudzha", "Levski Sofia", "Lokomotiv Plovdiv", "Lokomotiv Sofia", "Ludogorets Razgrad", "Montana", "Septemvri Sofia", "Slavia Sofia", "Spartak Varna"],
  },
  {
    country: "EST", league: "Meistriliiga", division: 1, expectedClubs: 10,
    clubs: ["Flora Tallinn", "Harju JK Laagri", "Kuressaare", "Nõmme Kalju", "Narva Trans", "Paide Linnameeskond", "Parnu Vaprus", "Tallinna Kalev", "Tammeka Tartu", "FCI Levadia"],
  },
  {
    country: "FRO", league: "Faroe Islands Premier League", division: 1, expectedClubs: 10,
    clubs: ["07 Vestur", "B36 Tórshavn", "B68 Toftir", "EB/Streymur", "FC Suðuroy", "HB Tórshavn", "KÍ Klaksvík", "NSÍ Runavík", "TB Tvøroyri", "Víkingur Gøta"],
  },
  {
    country: "FIN", league: "Veikkausliiga", division: 1, expectedClubs: 12,
    clubs: ["AC Oulu", "FF Jaro", "Haka", "HJK", "IF Gnistan", "IFK Mariehamn", "Ilves", "Inter Turku", "KTP", "KuPS", "SJK", "VPS"],
  },
  {
    country: "GEO", league: "Erovnuli Liga", division: 1, expectedClubs: 10,
    clubs: ["Dila Gori", "Dinamo Batumi", "Dinamo Tbilisi", "Gagra", "Gareji Sagarejo", "Iberia 1999", "Kolkheti Poti", "Samgurali", "Telavi", "Torpedo Kutaisi"],
  },
  {
    country: "GIB", league: "Gibraltar Football League", division: 1, expectedClubs: 11,
    clubs: ["College 1975", "Europa", "Europa Point", "Glacis United", "Lions Gibraltar", "Lincoln Red Imps", "Lynx", "Manchester 62", "Mons Calpe", "St Joseph's", "FCB Magpies"],
  },
  {
    country: "ISL", league: "Besta deild karla", division: 1, expectedClubs: 12,
    clubs: ["Afturelding", "Breiðablik", "FH", "Fram", "ÍA", "ÍBV", "KA", "KR", "Stjarnan", "Valur", "Vestri", "Víkingur Reykjavík"],
  },
  {
    country: "KAZ", league: "Kazakhstan Premier League", division: 1, expectedClubs: 14,
    clubs: ["Aktobe", "Astana", "Atyrau", "Kairat", "Kaisar", "Kyzylzhar", "Okzhetpes", "Ordabasy", "Tobol", "Turan", "Ulytau", "Yelimay", "Zhenis", "Zhetysu"],
  },
  {
    country: "KOS", league: "Football Superleague of Kosovo", division: 1, expectedClubs: 10,
    clubs: ["Ballkani", "Drita", "Dukagjini", "Ferizaj", "Gjilani", "Llapi", "Malisheva", "Prishtina", "Prishtina e Re", "Vushtrria"],
  },
  {
    country: "LVA", league: "Latvian Higher League", division: 1, expectedClubs: 10,
    clubs: ["Auda", "BFC Daugavpils", "Grobina", "Jelgava", "Liepāja", "Metta", "RFS", "Riga FC", "Super Nova", "Tukums 2000"],
  },
  {
    country: "LTU", league: "A Lyga", division: 1, expectedClubs: 10,
    clubs: ["Banga Gargždai", "Dainava", "Džiugas Telšiai", "FA Šiauliai", "Hegelmann", "Kauno Žalgiris", "Panevėžys", "Riteriai", "Sūduva", "Žalgiris Vilnius"],
  },
  {
    country: "LUX", league: "Luxembourg National Division", division: 1, expectedClubs: 16,
    clubs: ["Atert Bissen", "Differdange 03", "F91 Dudelange", "Hostert", "Jeunesse Esch", "Mamer 32", "Mondorf-les-Bains", "Progrès Niederkorn", "Racing Union Luxembourg", "Rodange 91", "Swift Hesperange", "UNA Strassen", "Union Titus Pétange", "Victoria Rosport", "Wiltz 71", "Bettembourg"],
  },
  {
    country: "MLT", league: "Maltese Premier League", division: 1, expectedClubs: 12,
    clubs: ["Birkirkara", "Floriana", "Gżira United", "Ħamrun Spartans", "Hibernians", "Marsaxlokk", "Mosta", "Naxxar Lions", "Sliema Wanderers", "Tarxien Rainbows", "Valletta", "Żabbar St Patrick"],
  },
  {
    country: "MDA", league: "Moldovan Super Liga", division: 1, expectedClubs: 8,
    clubs: ["CSF Bălți", "Dacia Buiucani", "Florești", "Milsami Orhei", "Petrocub Hîncești", "Sheriff Tiraspol", "Spartanii Sportul", "Zimbru Chișinău"],
  },
  {
    country: "MNE", league: "Montenegrin First League", division: 1, expectedClubs: 10,
    clubs: ["Arsenal Tivat", "Bokelj", "Budućnost Podgorica", "Dečić", "Jezero", "Jedinstvo Bijelo Polje", "Mornar", "OFK Mladost DG", "Petrovac", "Sutjeska Nikšić"],
  },
  {
    country: "MKD", league: "Macedonian First Football League", division: 1, expectedClubs: 12,
    clubs: ["AP Brera Strumica", "Bashkimi", "Gostivar", "Makedonija Gjorče Petrov", "Pelister", "Rabotnički", "Shkëndija", "Shkupi", "Sileks", "Struga", "Tikvesh", "Vardar"],
  },
  {
    country: "NIR", league: "NIFL Premiership", division: 1, expectedClubs: 12,
    clubs: ["Ballymena United", "Bangor", "Carrick Rangers", "Cliftonville", "Coleraine", "Crusaders", "Dungannon Swifts", "Glentoran", "Glenavon", "Larne", "Linfield", "Portadown"],
  },
  {
    country: "IRL", league: "League of Ireland Premier Division", division: 1, expectedClubs: 10,
    clubs: ["Bohemians", "Cork City", "Derry City", "Drogheda United", "Galway United", "Shamrock Rovers", "Shelbourne", "Sligo Rovers", "St Patrick's Athletic", "Waterford"],
  },
  {
    country: "SMR", league: "Campionato Sammarinese", division: 1, expectedClubs: 16,
    clubs: ["Cailungo", "Cosmos", "Domagnano", "Faetano", "Fiorentino", "Folgore", "Juvenes/Dogana", "La Fiorita", "Libertas", "Murata", "Pennarossa", "San Giovanni", "San Marino Academy", "Tre Fiori", "Tre Penne", "Virtus"],
  },
  {
    country: "SVK", league: "Slovak First Football League", division: 1, expectedClubs: 12,
    clubs: ["DAC Dunajská Streda", "Košice", "Komárno", "Michalovce", "Podbrezová", "Ružomberok", "Skalica", "Slovan Bratislava", "Spartak Trnava", "Tatran Prešov", "Trenčín", "Žilina"],
  },
  {
    country: "SVN", league: "Slovenian PrvaLiga", division: 1, expectedClubs: 10,
    clubs: ["Aluminij", "Bravo", "Celje", "Domžale", "Koper", "Maribor", "Mura", "Olimpija Ljubljana", "Primorje", "Radomlje"],
  },
  {
    country: "WAL", league: "Cymru Premier", division: 1, expectedClubs: 12,
    clubs: ["Bala Town", "Barry Town United", "Briton Ferry Llansawel", "Caernarfon Town", "Cardiff Metropolitan University", "Colwyn Bay", "Connah's Quay Nomads", "Flint Town United", "Haverfordwest County", "Llanelli Town", "Penybont", "The New Saints"],
  },
] as const;
