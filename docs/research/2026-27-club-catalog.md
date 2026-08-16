# 2026–27 club catalog research

Checked 16 August 2026. This catalog uses the current 2026–27 composition of 20
competitions: England's first five levels; the first two levels of Spain,
Germany, Italy, France, Portugal, and the Netherlands; and the top divisions of
Israel, Poland, and Cyprus.

The count-checked club membership is encoded in
`features/career/leagueCatalog.ts`. The complete-league total is **388 clubs**.
Existing hand-tuned clubs outside these competitions remain available as
additional transfer destinations.

## Official sources and counts

| Country | Competition | Clubs | Primary source |
| --- | --- | ---: | --- |
| England | Premier League | 20 | [Premier League table](https://www.premierleague.com/en/tables) |
| England | EFL Championship | 24 | [EFL Championship](https://www.efl.com/competitions/efl-championship/) |
| England | EFL League One | 24 | [EFL League One](https://www.efl.com/competitions/efl-league-one/) |
| England | EFL League Two | 24 | [EFL League Two](https://www.efl.com/competitions/efl-league-two/) |
| England | National League | 24 | [FA 2026–27 club allocations](https://www.thefa.com/news/2026/may/14/nls-club-allocations-2026-27) |
| Spain | La Liga | 20 | [LaLiga EA Sports clubs](https://www.laliga.com/laliga-easports/clubes) |
| Spain | Segunda División | 22 | [LaLiga Hypermotion clubs](https://www.laliga.com/laliga-hypermotion/clubes) |
| Germany | Bundesliga | 18 | [Bundesliga clubs](https://www.bundesliga.com/de/bundesliga/clubs?firsttab=kader) |
| Germany | 2. Bundesliga | 18 | [2. Bundesliga](https://www.bundesliga.com/en/2bundesliga) |
| Italy | Serie A | 20 | [Lega Serie A teams](https://www.legaseriea.it/team) |
| Italy | Serie B | 20 | [Lega B teams](https://www.legab.it/seriebkt/squadre) |
| France | Ligue 1 | 18 | [Official 2026–27 calendar](https://ligue1.com/en/articles/l1_article_5292-the-2026-27-ligue-1-mcdonald-s-calendar-is-released) |
| France | Ligue 2 | 16 | [Official 2026–27 calendar](https://ligue1.com/fr/articles/l1_article_5281-saison-26-27-le-calendrier-des-matchs-de-ligue-2-bkt) |
| Portugal | Primeira Liga | 18 | [2026–27 admitted clubs](https://www.ligaportugal.pt/backoffice/assets/Comunicado_Oficial_n_362_fba25aee39.pdf) |
| Portugal | Liga Portugal 2 | 18 | [2026–27 admitted clubs](https://www.ligaportugal.pt/backoffice/assets/Comunicado_Oficial_n_362_fba25aee39.pdf) |
| Netherlands | Eredivisie | 18 | [Eredivisie clubs](https://eredivisie.nl/competitie/clubs/) |
| Netherlands | Eerste Divisie | 20 | [Official 2026–27 schedule](https://api.keukenkampioendivisie.nl/wp-content/uploads/2026/06/CONCEPT-Competitieprogramma-Keuken-Kampioen-Divisie-2026-27.pdf) |
| Israel | Israeli Premier League | 14 | [IFA league draw](https://www.football.org.il/leagues/games/game/?itemid=%7BEF8C31CF-0958-4D79-8C18-C29E0222A1E8%7D) |
| Poland | Ekstraklasa | 18 | [Ekstraklasa clubs](https://ekstraklasa.org/kluby/) |
| Cyprus | Cypriot First Division | 14 | [Cyprus FA 2026–27 announcement](https://www.cfa.com.cy/Gr/news/53532) |

## Data decisions

- Club names are factual membership data. The UI continues to use original
  text badges for newly added clubs; official crests were not imported.
- Familiar English-language forms are retained where the existing game already
  had a hand-tuned club, such as `Inter Milan`, `AC Milan`, and
  `Bayern Munich`.
- France's second level currently has 16 participants in the official 2026–27
  calendar, so the catalog does not force the usual 18-club shape.
- The National League list follows the FA's 2026–27 allocation. Because Step 1
  allocations can be amended after publication, this is the first membership
  to recheck during the next seasonal refresh.
- Israel's final two places were cross-checked from the IFA's prior final tables
  and 2026–27 draw: Maccabi Petah Tikva and Hapoel Ramat Gan replaced Maccabi
  Bnei Reineh and FC Ashdod.
