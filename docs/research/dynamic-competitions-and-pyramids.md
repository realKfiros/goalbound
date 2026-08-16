# Dynamic competitions and football pyramids

Checked: 16 August 2026
Scope: the 31 leagues and 21 countries represented by features/career/leagueCatalog.ts
Source policy: official federation, league, or competition regulations/pages only

## Executive conclusion

Goalbound should not encode one global “top N up, bottom N down” rule. The catalog needs a versioned competition-format registry, keyed by competition and season, while each save owns its current club memberships and club strength state.

The current catalog can support movement across the top-flight boundary only in England, Spain, Germany, Italy, France, Portugal, and the Netherlands. England can also support the next three boundaries. Every other open pyramid has only its top tier loaded, so relegated clubs currently have nowhere to go and promoted clubs do not exist. MLS is the deliberate exception because it is a closed league.

Rules change materially by season. Immediate examples are the Championship’s six-club play-off from 2026–27, Belgium dropping its title play-offs in 2026–27, Japan’s one-off 2026 transition tournament, and Mexico’s suspended/season-dependent sporting relegation. Save files therefore need to snapshot the applicable rule version.

## Normalized format taxonomy

These are composable rules, not mutually exclusive competition types.

| Rule block | Minimum fields | Used by |
|---|---|---|
| round_robin | cycles, matchesPerClub, rankingTiebreakers | Most European leagues; Brazil; Saudi Arabia; normal J.League |
| split_table | splitAfterRound, groups with rank ranges, groupCycles, carryPoints | Israel, Cyprus, Scotland, Greece |
| short_seasons | stages, standingsReset, annualAggregate, cross-stage awards | Argentina, Mexico |
| knockout_title | qualifiers, bracket, legsByRound, hostRule, neutralFinal, reseeding | Argentina, Mexico |
| conference_postseason | conferences, qualifiersPerConference, wildCard, seriesLengthByRound, hostRule | MLS |
| direct_movement | directUp, directDown, destination/source competition | Most open pyramids |
| boundary_playoff | upperEntryRanks, lowerEntryRanks, bracket, legsByRound, hostRule, winnerDestination | Germany, France, Portugal, Scotland, Croatia |
| lower_only_playoff | directUp plus lower-division promotion bracket | England, Spain, Italy, Poland, Turkey, Saudi Arabia, Brazil |
| period_qualifiers | periods, periodWinnerEligibility, fallbackRanking | Netherlands |
| gap_trigger | rankGapThreshold, directOutcome, fallbackPlayoff | Italy Serie B |
| coefficient_relegation | averagingWindow, eligibleMatches, parallelAnnualTable, duplicateResolution | Argentina; Mexico when enabled |
| closed_league | sportingMovement=false | MLS |
| transition_override | effectiveFrom, effectiveTo, temporaryFormat | Japan 2026; structural changes in Belgium and England |
| eligibility_override | reserveTeamRules, licensing, insolvency, fallbackOrder | Netherlands and every sanctioned pyramid |

Recommended registry identity:

- competitionId + effectiveFromSeason + effectiveToSeason
- regularSeason rule blocks
- titleResolution rule blocks
- movement rules for each boundary
- eligibility and licensing overrides
- source URL, checkedAt, and a short source note

A save should persist its rule-version ID. Updating the live registry must not rewrite an in-progress season.

## Country-by-country implementation matrix

### England — five loaded tiers

- Premier League: bottom three are relegated and three clubs arrive from the Championship. [Premier League relegation FAQ](https://www.premierleague.com/en/news/4657245/202526-premier-league-relegation-faq)
- Championship: bottom three are relegated. From 2026–27, the promotion play-off expands from four to six clubs: two eliminators, then the winners face third and fourth over two legs, followed by a final. The EFL said the final’s exact format would be agreed later in 2026, so store that round as unresolved until the final regulations are published. [EFL 2026–27 play-off statement](https://www.efl.com/news/2026/march/05/efl-statement--sky-bet-championship-play-off-format/)
- League One: top two plus the winner of a third-to-sixth play-off are promoted; bottom four are relegated.
- League Two: top three plus the winner of a fourth-to-seventh play-off are promoted; bottom two are relegated to the National League.
- National League: champion and the eligible play-off winner can enter League Two. [EFL Handbook](https://www.efl.com/documents/efl-handbook.pdf)
- Catalog implication: Premier League through National League movement is modelable. Relegation from the National League is not, because no Step 2 leagues are loaded.

### Spain — two loaded tiers

- La Liga: bottom three are relegated.
- Segunda División: top two are promoted directly; third through sixth play two-legged semi-finals and a two-legged final for the third place; bottom four are relegated.
- The RFEF publishes season-specific professional competition bases, so positions and tie rules should be versioned. [RFEF 2025–26 competition bases](https://rfef.es/es/federacion/bases-de-competicion-202526) and [professional division regulations](https://rfef.es/sites/default/files/pdf/circulares/circular42%2Bdocumento.pdf)
- Catalog implication: the La Liga/Segunda boundary works; Primera Federación is required below Segunda.

### Germany — two loaded tiers

- Bundesliga: bottom two are relegated directly; 16th plays 2. Bundesliga third over two legs.
- 2. Bundesliga: top two are promoted directly; third enters the Bundesliga play-off. Bottom two are relegated directly and 16th plays 3. Liga third over two legs.
- [DFB promotion/relegation fixtures](https://www.dfb.de/news/relegation-und-aufstiegsspiele-alle-duelle-alle-termine) and [DFB Spielordnung](https://assets.dfb.de/uploads/000/328/557/original_Heft_04_Spielordnung_Schiedsrichterordnung_20251128.pdf?1769517020=)
- Catalog implication: the top boundary works; 3. Liga is required to resolve the lower boundary.

### Italy — two loaded tiers

- Serie A: the bottom three are relegated.
- Serie B: top two are promoted. Third also promotes directly if it finishes more than 14 points ahead of fourth; otherwise third through eighth enter the play-offs. Fifth versus eighth and sixth versus seventh are single-match preliminary ties; third and fourth enter two-legged semi-finals; the final is two-legged.
- At the bottom of Serie B, the last three go down. Fourth-bottom also goes down directly if it is more than four points behind fifth-bottom; otherwise those two play a two-legged play-out.
- [FIGC 2025–26 Serie B play-off/play-out regulation](https://www.figc.it/media/276909/39-deroga-art-51-noif-classifica-finale-play-off-e-play-out-campionato-serie-b-ss-2025-2026.pdf) and [FIGC Serie A re-admission order](https://files.figc.it/version/c%3AOTc0MjQ3YzUtMjEyMC00%3AMzJlOTc5ZTQtZGVmNC00/210%20-%20Criteri%20e%20Termini%20riammissioni%20Campionato%20Serie%20A%202026-2027.pdf)
- Catalog implication: the top boundary works; Serie C is required below Serie B. Italy needs gap_trigger rather than a fixed play-off bracket.

### France — two loaded tiers

- Ligue 1: bottom two are relegated directly. Sixteenth plays a two-legged boundary tie against the Ligue 2 play-off winner.
- Ligue 2: top two are promoted directly. Fourth hosts fifth, the winner visits third, and that winner faces Ligue 1 16th over two legs. Ligue 2 16th also faces the third-tier representative over two legs.
- From 2026–27, Ligue 3’s top two promote directly; third through sixth contest single-match play-offs, and the winner faces Ligue 2 16th over two legs. [LFP 2026–27 Ligue 2 calendar/format](https://www.lfp.fr/article/publication-du-calendrier-general-de-la-ligue-2-bkt-pour-la-saison-2026-2027), [FFF Ligue 3 announcement](https://www.fff.fr/article/16778-la-fff-officialise-la-ligue-3-professionnelle.html), and [FFF 2026–27 play-off dates](https://www.fff.fr/article/17022-le-calendrier-2026-2027-est-servi.html)
- Catalog implication: Ligue 3 is required. Also reconcile a data mismatch before implementing positions: the official 2026–27 calendar describes 34 Ligue 2 matchdays and a 16th-place boundary play-off, while Goalbound currently contains 16 Ligue 2 clubs. The app’s membership list and the official format cannot both be used as-is.

### Portugal — two loaded tiers

- Primeira Liga: bottom two are relegated; 16th plays the next eligible Liga Portugal 2 club.
- Liga Portugal 2: top two promote directly; the next eligible club enters the boundary play-off. Bottom two are relegated, while 16th plays an eligible Liga 3 club.
- [Liga Portugal 2026–27 competition regulations](https://www.ligaportugal.pt/backoffice/assets/20260701_RC_2026_27_f53785bcd4.pdf)
- Catalog implication: the top boundary works; Liga 3 is required below the second tier.

### Netherlands — two loaded tiers

- Eredivisie: bottom two are relegated directly; 16th enters the promotion/relegation play-offs.
- Eerste Divisie: the champion and runner-up among eligible first teams promote directly. Four period champions and the best remaining eligible first teams join Eredivisie 16th in the play-off path for one top-flight place. Reserve sides cannot promote.
- Current regulations do not provide sporting movement for first teams between Eerste and Tweede Divisie, so that lower boundary should be disabled rather than simulated.
- [KNVB 2025–26 play-off regulations](https://www.knvb.nl/downloads/bestand/29580/reglement-play-off-promotie-degradatie-2025-26), [KNVB period-title rules](https://www.knvb.nl/competities/competitiezaken/competitiemodel/periodetitels-in-de-eerste-divisie), and [KNVB paid-football movement rules](https://www.knvb.nl/downloads/bestand/29572/promotie--en-degradatieregeling-betaald-voetbal-seizoen-2025-26)
- Catalog implication: the top boundary works. Implement reserve-team eligibility and period winners; do not invent movement below tier two.

### Israel — one loaded tier

- Ligat Ha’Al has 14 clubs and a 26-match first phase. It then splits into a top-six championship group and bottom-eight relegation group with points carried forward. The top six play home and away; the bottom eight play one further round. The bottom two are relegated.
- [Israel Football Association championship regulations](https://www.football.org.il/files/Rules/championship.pdf)
- Catalog implication: Liga Leumit is required for the two promoted and relegated clubs.

### Poland — one loaded tier

- Ekstraklasa has 18 clubs, a double round robin, and three direct relegation places.
- The second tier promotes its top two directly. Third through sixth contest single-match semi-finals and a final, hosted by the higher-ranked club, for the third promotion place.
- [PZPN 2026–27 board/regulation report](https://www.pzpn.pl/public/system/files/site_content/635/7351-Sprawozdanie%20z%20posiedzenia%20Zarz%C4%85du%20V.2026.pdf), [PZPN lower-league regulations](https://pzpn.pl/public/system/files/site_content/635/7380-Regulamin%201.%20Ligi%202.%20Ligi%20i%203.%20Ligi%20na%20sezon%202026-2027.pdf), and [PZPN play-off announcement](https://pzpn.pl/federacja/aktualnosci/2026-05-24/baraze-o-awans-do-pko-bp-ekstraklasy-2025/2026)
- Catalog implication: I Liga is required.

### Cyprus — one loaded tier

- The 14-club top division plays 26 rounds, then splits into a top six playing home and away and a bottom eight playing one round; points carry. The bottom three are relegated.
- The 16-club second division plays a 15-match first phase, splits into two groups of eight, then plays 14 more matches with points carried. The top three promote and bottom three relegate.
- [CFA 2026–27 top-division regulations](https://www.cfa.com.cy/images/DownloadsGr/%CE%A0%CF%81%CE%BF%CE%BA%CE%AE%CF%81%CF%85%CE%BE%CE%B7%20Cyprus%20League%20by%20Stoiximan.pdf) and [CFA 2026–27 second-division regulations](https://www.cfa.com.cy/images/DownloadsGr/%CE%95%CE%9D%CE%9F%CE%A8%CE%95%CE%99-2026-2027%CE%A0%CF%81%CE%BF%CE%BA%CE%AE%CF%81%CF%85%CE%BE%CE%B7%20%CE%92%CE%84%20%CE%9A%CE%B1%CF%84%CE%B7%CE%B3%CE%BF%CF%81%CE%AF%CE%B1%CF%82-01.pdf)
- Catalog implication: the second division is required.

### Brazil — one loaded tier

- Série A is a 20-club, 38-round double round robin; the bottom four are relegated.
- For 2026 Série B, the top two promote directly. Third versus sixth and fourth versus fifth play two-legged ties; both tie winners promote, yielding four promoted clubs in total. The bottom four are relegated.
- [CBF 2026 Série A schedule release](https://www.cbf.com.br/futebol-brasileiro/noticias/competicoes-campeonato-brasileiro-serie-c/a/cbf-divulga-tabela-detalhada-das-primeiras-rodadas-do-brasileirao-2026) and [CBF 2026 Série B technical documents](https://www.cbf.com.br/futebol-brasileiro/noticias/campeonato-brasileiro/a/cbf-divulga-documentos-tecnicos-do-brasileirao-da-serie-b-de-2026)
- Catalog implication: Série B is required; its 2026 play-off has no final.

### Argentina — one loaded tier

- The 30-club Primera runs Apertura and Clausura. Each stage uses two 15-club zones, a 16-match zone phase, then the top eight from each zone enter single-match round of 16, quarter-final and semi-final ties, followed by a neutral final.
- The regulation also creates an annual league champion from the combined zone-phase points and a Trofeo de Campeones between the Apertura and Clausura champions.
- Relegation provisions refer to both the rolling average table and annual table. Exact counts and duplicate-resolution must be read from the season’s AFA rule set rather than assumed from a prior year.
- [LPF 2026 competition regulation](https://www.ligaprofesional.ar/wp-content/uploads/2026/01/Reglamento-Torneos-LPF-Primera-2026-1.pdf) and [AFA assembly regulation](https://www.afa.com.ar/upload/Comite/6323%20x%20Asamblea%20Extraordinaria%20%2822-06-2023%29.pdf)
- Catalog implication: Primera Nacional is required for movement. The engine needs short_seasons, zones, knockout_title, annualAggregate, and coefficient_relegation.

### United States — MLS only

- MLS has Eastern and Western conferences and a 34-match regular season. The top nine from each conference qualify. Eighth hosts ninth in a Wild Card match; seeds one through seven plus that winner enter a best-of-three first round; conference semi-finals and finals are single elimination; MLS Cup is a single match hosted according to Supporters’ Shield ranking.
- MLS has no sporting promotion or relegation.
- [MLS 2026 competition guidelines](https://www.mlssoccer.com/league-reports/competition-guidelines/)
- Catalog implication: mark the competition closed. No lower league is required for competition movement.

### Belgium — one loaded tier

- From 2026–27 the 18-club Pro League plays 34 rounds with no championship play-offs.
- The Challenger Pro League’s champion promotes directly. Clubs ranked second through fifth contest two-legged play-offs for the second promotion place; its bottom two are relegated.
- [Pro League 2026–27 top-flight format](https://www.proleague.be/nieuws/vanaf-seizoen-26-27-met-18-clubs-in-de-jupiler-pro-league) and [Challenger Pro League format](https://www.proleague.be/fr/informations/nouveau-format-sans-quota-pour-les-u23-pour-la-challenger-pro-league)
- Catalog implication: Challenger Pro League is required. Use a transition override; do not retain the former six-team title split.

### Scotland — one loaded tier

- The 12-club Premiership plays 33 matches, splits into top and bottom six with points carried, then plays five more matches.
- The champion of the Championship promotes directly. Premiership 12th is relegated directly. Championship third plays fourth over two legs, the winner plays second over two legs, and that winner plays Premiership 11th over two legs.
- [SPFL Premiership update](https://spfl.co.uk/news/press-release-premiership-update) and [SPFL 2026–27 key dates](https://spfl.co.uk/news/key-dates-for-202627)
- Catalog implication: the Championship is required; model the boundary as a multi-round ladder.

### Turkey — one loaded tier

- Süper Lig has 18 clubs, a double round robin, and three direct relegation places.
- TFF 1. Lig’s top two promote directly. Third advances to the play-off final; fourth hosts seventh and fifth hosts sixth in single matches, those winners play a two-legged semi-final, and its winner faces third in a neutral single-match final.
- [TFF 2026–27 Süper Lig status](https://www.tff.org/Resources/TFF/Documents/STATULER/2026-2027/2026-2027-sezonu-super-lig-musabakalari-statusu.pdf) and [TFF 2026–27 1. Lig status](https://www.tff.org/Resources/TFF/Documents/STATULER/2026-2027/2026-2027-sezonu-tff-1-lig-musabakalari-statusu.pdf)
- Catalog implication: TFF 1. Lig is required.

### Croatia — one loaded tier

- The 10-club HNL plays four round-robin cycles, 36 matches per club.
- The bottom club is relegated directly. From 2026–27, ninth plays the second-placed Prva NL club over two legs; the Prva NL champion promotes directly.
- [HNS competition-system decision](https://hns-cff.hr/files/documents/27662/Glasnik_24-2023.pdf)
- Catalog implication: Prva NL is required.

### Greece — one loaded tier

- The 14-club Super League regular phase is followed by groups for positions 1–4, 5–8, and 9–14. The first group resolves the title, the middle group European qualification, and the bottom group relegation; the bottom two are relegated.
- The structure is approved season by season and should remain versioned. [Super League board decision](https://www.slgr.gr/el/article/apophaseis-d-s-8-12-2025/) and [Hellenic Football Federation approval](https://www.epo.gr/en/node/33341)
- Catalog implication: Super League 2 is required. Verify the annual proclamation before locking group cycles and tie-breakers.

### Saudi Arabia — one loaded tier

- The 18-club Saudi Pro League plays 34 rounds.
- The First Division’s top two promote directly; third through sixth contest single-match semi-finals and a final hosted by the higher seed for the third promotion place. This corresponds to three top-flight relegation places.
- [SPL 2026–27 fixture format](https://www.spl.com.sa/en/news/1079597/spl-announces-2026-27-rsl-fixture-schedule) and [SPL First Division play-off](https://www.spl.com.sa/en/news/750465/al-hazem-and-al-adalah-to-contest-inaugural-fdl-play-off-final)
- Catalog implication: the First Division is required.

### Japan — one loaded tier plus a transition season

- The J.League changes to an August–May season from 2026–27.
- The separate 2026 special half-season is not a normal league season: J1 clubs are divided into two regional groups of ten, followed by two-legged matching-position play-offs, and there is no relegation.
- [J.League season-transition announcement](https://www.jleague.co/en/news/jleague-season-timing-to-transition-from-202627-season/) and [J1 2026 special-season format](https://www.jleague.co/special/2026specialseason/j1/)
- Catalog implication: use an explicit transition_override for 2026 only. Add J2 before enabling normal promotion/relegation, and verify the final 2026–27 movement regulation rather than carrying the special-season rule forward.

### Mexico — one loaded tier

- Liga MX uses separate Apertura and Clausura regular phases followed by title knockouts. The season regulation defines the current Play-In/Liguilla bracket and must be the source of truth.
- Sporting promotion/relegation has been suspended and the bottom coefficient-ranked clubs have paid stabilization penalties under recent regulations. Because 2026–27 is a policy boundary, do not infer that either suspension or automatic resumption continues without reading that season’s published regulation.
- [FMF official regulations index, including Liga MX 2026–27](https://fmf.mx/justicia-deportiva/reglamentos), [FMF 2025–26 Liga MX regulation](https://fmf.mx/docs/reglamentos/483.pdf), and [FMF competition-format announcement](https://fmf.mx/noticia/por-unanimidad-la-asamblea-de-clubes-designa-a-juan-carlos-rodriguez-nuevo-presidente-electo-de-la-fmf-para-el-periodo-2023-2026_1350)
- Catalog implication: title competition needs short_seasons and knockout_title now. Keep sportingMovement season-versioned; only add Liga de Expansión membership when an official season rule actually connects the tiers.

## Catalog gap summary

| Boundary | Current support | Required catalog work |
|---|---|---|
| England tiers 1–5 | Four internal boundaries are loaded | Add Step 2 leagues only if National League relegation must be simulated |
| Spain, Germany, Italy, France, Portugal | Top boundary loaded | Add each country’s third tier to complete movement below tier two |
| Netherlands | Top boundary loaded | No first-team lower movement under cited current rules; add reserve eligibility |
| Israel, Poland, Cyprus, Brazil, Argentina, Belgium, Scotland, Turkey, Croatia, Greece, Saudi Arabia, Japan | Top tier only | Add the relevant second tier before enabling movement |
| MLS | Complete for a closed league | Explicitly set sportingMovement=false |
| Mexico | Top tier enough for current title play | Gate movement and lower-tier loading on the applicable official season regulation |

Promotion/relegation must be atomic: resolve all licensed qualifiers, update competition membership, then validate the next season’s expected club counts. If a destination tier is absent, the safest behavior is to disable that boundary and surface “pyramid not loaded”; silently deleting, cloning, or retaining relegated clubs makes the table incoherent.

## Adaptive club strength across seasons

Separate immutable Club identity from per-save ClubSeasonState. A useful minimal seasonal state is:

- current competition and previous finish
- squad quality and age curve
- finances/wage capacity
- reputation
- youth and infrastructure
- manager stability
- rolling three-to-five-season domestic and continental performance

At season rollover:

1. Apply prize money, European revenue, transfer balance, promotion/relegation shocks, and expiring contracts.
2. Regress squad quality and reputation toward plausible league-specific ranges, with bounded random variation.
3. Make promoted clubs financially stronger but normally weaker than established top-flight clubs; make relegated clubs stronger than the average lower-tier club but vulnerable to wage cuts and sales.
4. Derive title odds from current save state, home advantage, form, and player impact—not static name weights.
5. Cap a single player’s team-strength contribution. An exceptional player can move Hull City into a genuine title race, but should not erase squad depth, schedule, finance, and opponent-strength differences.
6. Persist every membership and strength transition so the trophy room and career history can reconstruct the exact clubs and competitions for each season.

This preserves realistic incumbency without hard-coding permanent winners: elite clubs begin with much stronger financial, reputation, and squad priors, while sustained good or bad seasons gradually change those priors.

## Recommended implementation order

1. Introduce the versioned format registry and closed/disabled-boundary states.
2. Implement ordinary round robins and direct movement.
3. Add generic lower-only and cross-boundary play-off brackets.
4. Add split tables, then short seasons/zones, then MLS series.
5. Load missing second tiers country by country; never enable an open boundary before both sides exist.
6. Add ClubSeasonState evolution and run multi-decade simulations that assert club counts, movement counts, bracket entrants, and plausible title concentration.
7. Re-check official rules each catalog season, especially England Championship, France Ligue 2, Greece, Japan, Argentina, and Mexico.
