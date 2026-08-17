# European top flights, UEFA competitions, awards, and scenario research

Checked: 17 August 2026  
Implementation baseline: 2026/27  
Source policy: UEFA, national associations/leagues, Ballon d'Or, and other first-party football sources only

## Executive conclusions

1. "Every European top flight except Russia" means **53 domestic leagues**. UEFA has 55 member associations; Russia is excluded and Liechtenstein has no domestic championship. Liechtenstein must instead be represented as a cup-only UEFA association whose clubs play in the Swiss pyramid.
2. The three men's UEFA club competitions need a shared qualification graph, not three isolated tournaments. In 2026/27 there are 36 clubs in each league phase, but qualifying losers move from the Champions League into the Europa or Conference League and from the Europa League into the Conference League.
3. Domestic standings in season `S` allocate **projected places for UEFA season `S+1`**. Current European participation is a separate fact inherited from the previous domestic season. The UI should never use the same marker for both.
4. A credible Ballon d'Or simulation must follow the official pillars—individual performance, team achievements, and class/fair play—and use a shortlist/voting model. A trophy is helpful but not mandatory; a player from a weaker league needs correspondingly exceptional individual and high-level evidence.
5. Humorous events should be parameterised archetypes rather than fixed jokes. Each event should inspect country/league, club scale, career phase, role, form, fixtures, relationships, and recent history before it can fire.

## 1. European domestic top-flight universe

UEFA lists **55 member associations**, and its annual European Football Directory treats first-division clubs by association. The requested exclusion removes Russia. Liechtenstein is the remaining special case because it does not organise a domestic league. Sources: [UEFA national associations](https://www.uefa.com/nationalassociations/) and [UEFA European Football Directory 2025/26](https://editorial.uefa.com/resources/02a2-2004c8d438c3-b03724f6d21e-1000/uefa_european_football_directory_2025-26_march_edition.pdf.pdf).

### The 53 top flights to represent

| Group | UEFA associations with a domestic top flight |
| --- | --- |
| A–B | Albania, Andorra, Armenia, Austria, Azerbaijan, Belarus, Belgium, Bosnia and Herzegovina, Bulgaria |
| C–F | Croatia, Cyprus, Czechia, Denmark, England, Estonia, Faroe Islands, Finland, France |
| G–I | Georgia, Germany, Gibraltar, Greece, Hungary, Iceland, Israel, Italy |
| K–M | Kazakhstan, Kosovo, Latvia, Lithuania, Luxembourg, Malta, Moldova, Montenegro |
| N–R | Netherlands, North Macedonia, Northern Ireland, Norway, Poland, Portugal, Republic of Ireland, Romania |
| S | San Marino, Scotland, Serbia, Slovakia, Slovenia, Spain, Sweden, Switzerland |
| T–W | Türkiye, Ukraine, Wales |

This count is deliberately **association-based**, not a loose geographic list. Monaco and Vatican City are not UEFA member associations. Russia remains a UEFA member but its clubs and national teams are suspended from UEFA competition until further notice, so it stays outside this product scope. Source: [FIFA/UEFA suspension announcement](https://www.uefa.com/news-media/news/0272-148df1faf082-6e50b5ea1f84-1000--fifa-uefa-suspend-russian-clubs-and-national-teams-from-all-com/).

### Edge cases the data model must preserve

- **Liechtenstein:** no national league. Its seven clubs participate in Switzerland; the Liechtenstein Cup winner qualifies for the following season's Conference League. Do not invent a Liechtenstein league table. Store `domesticAssociationId` separately from `leagueSystemAssociationId`. [Liechtenstein FA, 2026/27 adult football](https://www.lfv.li/breitenfussball/vereinsfussball/erwachsenenfussball/)
- **San Marino:** it does have its own domestic championship and belongs in the 53. A separate Sammarinese club can also play in the Italian pyramid; geography must not determine the association access route. [UEFA, San Marino association history](https://www.uefa.com/nationalassociations/smr/)
- **Cross-border clubs:** FC Andorra in Spain, FC Vaduz in Switzerland, Welsh clubs in England, and Derry City in the Republic of Ireland are reminders that `country`, `registeredAssociation`, and `competition` are not interchangeable fields. UEFA entry comes from the competition/association route, not the stadium's coordinates.
- **Calendar-year leagues:** Belarus, Estonia, Faroe Islands, Finland, Georgia, Iceland, Kazakhstan, Latvia, Lithuania, Norway, Republic of Ireland, and Sweden commonly resolve champions on a spring-to-autumn calendar. Their champion still enters the next UEFA edition; season IDs need explicit start/end years rather than a universal `2026/27` assumption. UEFA's live access list explicitly notes these leagues can confirm entrants earlier. [UEFA 2026/27 access-list explainer](https://www.uefa.com/news-media/news/02a4-2060ea59fbc5-4be94b1fbe5a-1000--access-list-track-which-sides-will-play-in-the-2026-27-uef/)
- **Brand names change:** use stable internal competition IDs and season-specific display names. The club set, number of clubs, splits, and calendar must be versioned independently.

## 2. Exact 2026/27 UEFA men's competition formats

### Shared qualifying rules

All qualifying and play-off ties are home-and-away. A tied aggregate goes to extra time and penalties; the away-goals rule is not used. Qualifying draws ordinarily pair seeded and unseeded clubs using club coefficients; clubs from the same association cannot be drawn together. UEFA can group clubs and rebalance annual access lists. [2026/27 UEFA regulations, Articles 14–15](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27-Online)

The round headcounts below are the **actual adapted 2026/27 baseline**, not eternal constants.

### Champions League

| Stage | 2026/27 field | Progression |
| --- | ---: | --- |
| First qualifying round | 28 Champions Path clubs | 14 winners to UCL Q2 CP |
| Second qualifying round | 24 Champions Path (10 entrants + 14 winners); 4 League Path entrants | 12 CP and 2 LP winners to UCL Q3 |
| Third qualifying round | 12 Champions Path; 8 League Path (6 entrants + 2 winners) | 6 CP and 4 LP winners to play-offs |
| Play-offs | 10 Champions Path (4 entrants + 6 winners); 4 League Path winners | 5 CP and 2 LP winners to league phase |
| League phase | 29 automatic/rebalanced entrants + 7 play-off winners = 36 | Top 8 to R16; 9–24 to knockout play-offs; 25–36 out |

Official source: [UEFA 2026/27 Champions League qualifying](https://www.uefa.com/uefachampionsleague/news/02a6-20e5a8be4e63-ae971c582f8c-1000--champions-league-qualifying-fixtures-results-dates-how-it-/).

### Europa League

| Stage | 2026/27 field | Progression |
| --- | ---: | --- |
| First qualifying round | 12 Main Path clubs | 6 winners to UEL Q2 |
| Second qualifying round | 18 Main Path (12 entrants + 6 winners) | 9 winners to UEL Q3 |
| Third qualifying round | 12 Champions Path from UCL Q2 CP; 14 Main Path (3 entrants + 9 winners + 2 UCL Q2 LP losers) | 6 CP and 7 MP winners to play-offs |
| Play-offs | 24 total: 5 entrants + 6 UCL Q3 CP losers + 13 UEL Q3 winners | 12 winners to league phase |
| League phase | 13 direct/rebalanced + 12 UEL play-off winners + 11 UCL transfers = 36 | Top 8 to R16; 9–24 to knockout play-offs; 25–36 out |

The 11 UCL transfers entering the UEL league phase are four UCL Q3 League Path losers plus seven UCL play-off losers. Official source: [UEFA 2026/27 Europa League qualifying](https://www.uefa.com/uefaeuropaleague/accesslist/?n=%40).

### Conference League

| Stage | 2026/27 field | Progression |
| --- | ---: | --- |
| First qualifying round | 52 Main Path clubs | 26 winners to UECL Q2 |
| Second qualifying round | 12 Champions Path from UCL Q1; 86 Main Path (60 entrants, including 6 UEL Q1 losers, + 26 winners) | 6 CP and 43 MP winners to Q3 |
| Third qualifying round | 8 Champions Path (2 UCL Q1 bye recipients + 6 winners); 52 Main Path (9 UEL Q2 losers + 43 winners) | 4 CP and 26 MP winners to play-offs |
| Play-offs | 10 Champions Path (4 winners + 6 UEL Q3 CP losers); 38 Main Path (26 winners + 5 entrants + 7 UEL Q3 MP losers) | 5 CP and 19 MP winners to league phase |
| League phase | 24 UECL play-off winners + 12 UEL play-off losers = 36 | Top 8 to R16; 9–24 to knockout play-offs; 25–36 out |

No club qualifies directly for the 2026/27 Conference League league phase. Official source: [UEFA 2026/27 Conference League qualifying](https://www.uefa.com/uefaconferenceleague/news/02a6-20e5e911587f-cc10425958b3-1000--conference-league-qualifying-fixtures-results-dates-how-it-/).

### Elimination and transfer graph

| Eliminated from | Destination |
| --- | --- |
| UCL Q1 Champions Path | UECL Q2 Champions Path; two 2026/27 losers receive balancing byes to UECL Q3 |
| UCL Q2 Champions Path | UEL Q3 Champions Path |
| UCL Q2 League Path | UEL Q3 Main Path |
| UCL Q3 Champions Path | UEL play-offs |
| UCL Q3 League Path | UEL league phase |
| UCL play-offs, either path | UEL league phase |
| UEL Q1 Main Path | UECL Q2 Main Path |
| UEL Q2 Main Path | UECL Q3 Main Path |
| UEL Q3 Champions/Main Path | UECL play-offs in the corresponding path |
| UEL play-offs | UECL league phase |
| Any UECL qualifying or play-off tie | Eliminated |
| Any competition's league phase, positions 25–36 | Eliminated; no mid-season transfer to a lower competition |

### League phase, draw, and knockout structure

- **UCL and UEL:** 36 clubs in four pots of nine. Each club plays two opponents from each pot, one home and one away, for eight different opponents and eight matches. [UCL draw rules](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-16-Draw-system-league-phase-Online) and [UEL league system](https://documents.uefa.com/r/Regulations-of-the-UEFA-Europa-League-2026/27/Article-17-Match-system-league-phase-Online)
- **UECL:** 36 clubs in six pots of six. Each club plays one opponent from each pot, three home and three away, for six matches. [UECL draw rules](https://documents.uefa.com/r/Regulations-of-the-UEFA-Conference-League-2026/27/Article-16-Draw-system-league-phase-Online)
- In principle there are no same-association pairings in the league phase, and no club faces more than two opponents from one other association.
- One combined table is used. Positions 1–8 qualify directly for the round of 16. Positions 9–24 enter two-legged knockout play-offs. Positions 25–36 are eliminated.
- The knockout play-off bands are 9/10 against 23/24, 11/12 against 21/22, 13/14 against 19/20, and 15/16 against 17/18. The round-of-16 draw places the top eight into the predetermined bracket.
- League ranking influences later home-leg priority: 1–4 retain second-leg-at-home preference through the quarter-finals, and 1–2 through the semi-finals; a club that eliminates one of them inherits that bracket privilege.
- Knockout rounds are two-legged except the neutral-venue final. [UEFA knockout draw rules](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-19-Draw-system-knockout-phase-Online)
- Final league-phase tiebreak order is: goal difference, goals scored, away goals, wins, away wins, opponents' collective points, opponents' goal difference, opponents' goals, disciplinary score, then club coefficient. [UEFA Article 18](https://documents.uefa.com/r/Regulations-of-the-UEFA-Europa-League-2026/27/Article-18-Equality-of-points-league-phase-Online)

### Access-list rules that must not be flattened

- UCL base allocation includes the UCL and UEL holders, four league places for associations ranked 1–4, three for No. 5, two for No. 6, one each for Nos. 7–10, two European Performance Spots (EPS), five Champions Path qualifiers, and two League Path qualifiers. Annual titleholder rebalancing changes the apparent direct count. [UEFA 2026/27 allocation](https://www.uefa.com/uefachampionsleague/news/02a2-1fdbe9a25733-8d37ff5f9226-1000--2026-27-uefa-champions-league-which-teams-are-in-the-euro/)
- The two EPS associations are the best collective performers in the immediately completed European season. Each EPS goes to that association's highest domestic finisher not already in the UCL league phase.
- The UCL and UEL holders are guaranteed the following UCL league phase. The UECL holder is guaranteed the following UEL league phase.
- Domestic cup winners have priority for UEL/UECL access. If a cup winner qualifies for a higher competition, the place cascades according to the regulations rather than disappearing.
- If a titleholder already qualified domestically, UEFA may promote eligible clubs by club coefficient and shift qualifying entrants up a round. It does not simply award the vacancy to the next club in the titleholder's domestic table. [UEFA UCL entry and rebalancing rules](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-3-Entries-for-the-competition-Online)
- For 2026/27, association access ranking uses five seasons ending in 2024/25, while club seeding uses five seasons ending in 2025/26. Access therefore deliberately lags a season. [UEFA coefficient reference periods](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/D.2-Reference-periods-for-rankings-Online)
- Licensing, ownership, discipline, and annual rebalancing can change entrants. Store access-list rules as versioned data and resolve a final adapted list only after all relevant competitions end.

### Recommended simulation boundaries

Use a versioned `UefaSeason` aggregate with:

- association access ranking and slot routes;
- club coefficients for draw seeding;
- previous UEFA titleholders;
- the two EPS associations;
- domestic champions, league finishers, and cup winners;
- licensing/eligibility flags;
- a round graph with loser destinations;
- league draw constraints and the fixed knockout bracket.

A long-running fictional save can evolve association and club coefficients, but its formula and reference window must remain compatible with the UEFA rule version attached to that save season.

## 3. Domestic qualification belongs to the next UEFA season

UEFA describes 2025/26 domestic campaigns as determining the line-ups for **next season's 2026/27 competitions**. The official UCL explainer likewise says qualification depends on the previous domestic season's final league position. Sources: [UEFA 2026/27 access list](https://www.uefa.com/news-media/news/02a4-2060ea59fbc5-4be94b1fbe5a-1000--access-list-track-which-sides-will-play-in-the-2026-27-uef/) and [UEFA new-format explainer](https://www.uefa.com/uefaeuropaleague/news/0268-12157d69ce2d-9f011c70f6fa-1000--2024-25-europa-league-access-list/).

### Correct state model

| Concept | Meaning |
| --- | --- |
| `currentEuropeanEntry` | Competition and round the club is playing **this season**, earned previously |
| `projectedNextEuropeanEntry` | Live projection from the current domestic table/cup state for **next season** |
| `finalNextEuropeanEntry` | Frozen domestic qualification after season completion, before/after UEFA rebalancing as separate statuses |
| `nextUefaSeasonId` | Explicit target such as `2027/28`, including for calendar-year domestic leagues |

### UI behavior

- A 2026/27 domestic table should say **“Projected 2027/28 Champions League”**, never imply the club is already playing that competition in 2026/27.
- Current-season UCL/UEL/UECL participation can be a separate crest or column labelled **“Europe this season.”**
- While cups, EPS, and titleholders are unresolved, show projected ranges such as `UCL league phase`, `UEL/UECL pending cup`, or `European place pending rebalancing`.
- At the domestic season rollover, freeze sporting qualifiers. Then apply cup cascades, EPS, titleholder rebalancing, licensing, and discipline. Only the resulting next-season entrant list should seed the next UEFA competition.
- Do not retroactively recolour the completed domestic table when next season begins; keep it as a historical record of what that table projected/awarded.

## 4. Credible individual awards

### Official Ballon d'Or basis

The official Ballon d'Or process uses a 30-player shortlist and journalists who rank ten players. The three stated criteria are: individual performance and decisiveness, team performance/achievements, and class/fair play. The award covers the season and includes domestic and international competition; it is not restricted by nationality or league. [Official Ballon d'Or rules](https://ballondor.com/the-ballon-dor) and [UEFA voting explainer](https://www.uefa.com/ballondor/news/0292-1c2705cb8fd5-8f2dcb111a8a-1000--ballon-d-or-how-are-the-winners-decided/).

Therefore:

- winning a trophy must **not** be a hard eligibility rule;
- raw goals alone must not outweigh the standard and stakes of the matches;
- league reputation must not be an absolute exclusion either;
- the award should not be selected from all generated players with a flat random chance.

### Separate award models

| Award | Appropriate basis |
| --- | --- |
| Domestic top scorer | Actual league goals; no global league-strength modifier |
| Domestic player of the season | Minutes, position-adjusted performance, decisive contribution, club over/under-performance, discipline within that league |
| Domestic young player | Same model with the competition's age rule |
| Ballon d'Or | Entire season across domestic, UEFA, and international competitions, with opponent/competition strength and team achievement context |
| Kopa-type award | Global under-21 season model |
| Yashin-type award | Goalkeeper-specific model rather than attacker statistics |

### Recommended Ballon d'Or simulation

The official criteria do not publish numeric weights. A defensible game interpretation is:

1. Build a **30-player shortlist**, not a direct winner pool.
2. Compute a position-aware season dossier:
   - individual output and consistency, adjusted for minutes and position;
   - decisive actions in high-leverage matches;
   - domestic finish, cups, UEFA stage, and national-team tournament performance;
   - opponent and competition strength using dynamic club/association coefficients;
   - fair-play/disciplinary record.
3. For shortlisting, use approximately `50% individual + 25% team achievement + 20% competition/opponent context + 5% class/fair play`. This is a simulation choice, not an official formula.
4. Simulate the journalist ballot from those dossiers with modest voter preference/noise. The best dossier should be favoured strongly but not win deterministically every time.
5. Add plausibility guards:
   - minimum meaningful minutes/appearances;
   - a weak-league candidate needs an exceptional individual percentile and strong evidence in European or international matches;
   - a trophyless candidate remains viable when individual output, club over-performance, and big-match impact are extraordinary;
   - one inflated stat in a low-volume season cannot win globally;
   - no random winner may fall materially outside the credible top shortlist tier.
6. Persist the dossier summary with the trophy so the UI can explain the result: e.g. elite output, league finish, UEFA run, international tournament, and decisive matches.

This avoids the false rule “only a champion may win” while making a mediocre season at a mediocre club extremely unlikely to beat an elite, decisive season.

## 5. Original humorous scenario bank

The sources below show that unusual football events are not limited to transfer drama: official league histories document public team talks, outfield emergency goalkeepers, animals, kit mistakes, broken posts, ghost goals, bizarre own goals, and social-media discipline. The game should use those **archetypes**, not copy the historical wording or attach invented misconduct to real current people.

| Archetype | Context gate | Example original decision shape |
| --- | --- | --- |
| Public half-time lecture | England; manager under pressure; team heavily behind | Join the manager on the pitch, quietly return inside, or try to turn it into a rally. A later celebration can parody it only if the team recovers. [Premier League historical example](https://www.premierleague.com/en/news/4509800/ten-memorable-moments-from-the-festive-fixtures) |
| Emergency goalkeeper | Any league; all keepers unavailable/sent off; player has suitable role/traits | Volunteer, nominate the tallest defender, or pretend not to hear the coach. [Premier League outfield-goalkeeper cases](https://www.premierleague.com/en/news/137574) |
| Animal interrupts training or a match | Generic; stronger German flavour and clubs with living mascots | Befriend it, help remove it, or let the club social team turn it into content. [Bundesliga official funny-moments archive](https://www.bundesliga.com/en/history) |
| Living mascot chooses a favourite | Germany/club with a living mascot; home player | Accept a ceremonial feeding duty or protect expensive boots from becoming lunch. [Bundesliga animal-club history](https://www.bundesliga.com/en/bundesliga/news/clubs-with-animal-names-germany-eagles-wolves-goats-foals-lions-25000) |
| Wrong shirt, number, or kit bag | Qualifier, away trip, lower-budget club, or hurried transfer debut | Wear the emergency shirt, delay kickoff, or borrow an academy player's number. [Bundesliga 2024/25 funny incidents](https://www.bundesliga.com/en/bundesliga/news/funniest-moments-from-bundesliga-season-so-far-30231) |
| Goal structure or stadium mishap | Smaller ground, cup tie, severe weather, lower division | Help the ground staff, warm up again, or negotiate an improvised wait. [Bundesliga broken-post history](https://www.bundesliga.com/en/history) |
| “Did that actually go in?” controversy | Germany historically; any league depending on VAR/goal-line technology availability | Admit uncertainty, celebrate shamelessly, or calm teammates while officials decide. [Bundesliga ghost-goal history](https://www.bundesliga.com/en/bundesliga/news/bizarre-ghost-goals-bayern-munich-bayer-leverkusen-kiessling-24771) |
| Own goal becomes a meme | Any league; defender/goalkeeper; only after an actual poor event | Post a joke, go offline, or front the next press conference. [Bundesliga own-goal account](https://www.bundesliga.com/en/bundesliga/news/christoph-kramer-interview-eigentor-borussia-monchengladbach-dortmund-24335) |
| Former-club crowd writes the script | Spain, England, Scotland, Balkans, or any rivalry; player actually has history there | Respectful non-celebration, full celebration, or neutral response; fan reaction depends on how the earlier exit happened. LaLiga's official reports document former-player-specific chants, so this should use relationship history rather than a generic “former club” flag. [LaLiga weekly incident reporting](https://www.laliga.com/noticias/nota-informativa-sobre-las-denuncias-de-la-j23-de-laliga-ea-sports-y-la-j25-de-laliga-hypermotion) |
| Social post after a refereeing dispute | England especially, or any association with equivalent rules; angry/high-profile player | Delete draft, post a diplomatic emoji, or publish and risk a fine/ban. Never offer discriminatory content as a joke. [FA Player Essentials](https://www.thefa.com/football-rules-governance/discipline/player-essentials) |
| Transfer or lineup accidentally leaked online | Generic; new signing, deadline day, teammate streaming | Warn the club, pretend it is an old screenshot, or lean into the chaos; reputation and trust change rather than OVR. |
| Visa/passport scramble before a qualifier | Cross-border UEFA round; non-EU/visa-sensitive travel; never a domestic match | Return for documents, ask the club liaison for help, or miss media duty to make the flight. UEFA expressly assigns clubs visa-formality responsibilities. [UEFA club responsibilities](https://documents.uefa.com/r/Regulations-of-the-UEFA-Europa-League-2026/27/Article-7-Responsibilities-of-the-associations-and-clubs-Online) |
| Translation goes sideways | Player is foreign and language familiarity is low; press conference or initiation | Correct the quote, let a teammate translate, or allow the accidental catchphrase to become a fan chant. |
| Sponsor activation at the worst time | High commercial club or cash-strapped club needing a sponsor; after bad form | Perform enthusiastically, negotiate a shorter appearance, or produce an unintentionally viral clip. |
| Cup away-day facilities shock | Top-flight player at a small cup opponent | Complain, improvise, or help teammates adapt; scale humour to club wealth and competition round. |
| Derby divided household | Player's birthplace/homegrown club/rival history makes it true | Accept family ticket requests, refuse to discuss loyalties, or make a risky promise about scoring. |
| Club president's extravagant bonus promise | Owner-led club; surprise title/relegation run; financially plausible | Take the unusual team bonus, ask for conventional money, or redirect it to staff. Avoid country stereotypes; gate on club governance personality. |
| Training-ground punishment becomes content | Late arrival, poor form, or light breach; strong squad relationships | Do the silly task, buy team breakfast, or dispute the fine. Serious misconduct should use a separate non-comedic system. |
| Fan-created nickname escapes containment | Excellent form, odd celebration, mistranslation, or distinctive appearance | Adopt it, ask the club to stop using it, or create merchandise; use generated nicknames, not copyrighted chants. |

### Scenario-system rules

Each scenario definition should carry at least:

- `countryTags`, `leagueTags`, and `genericFallback`;
- player role, age/career phase, OVR band, form, squad status, and personality gates;
- club wealth/tier, governance style, rivalry, fixture, weather/calendar, and European-stage gates;
- relationship prerequisites such as former club, home club, manager trust, teammate friendship, or fan sentiment;
- exclusion conditions, cooldown, and maximum occurrences per career/save;
- consequences split into performance, fitness, reputation, trust, morale, money, and narrative memory;
- follow-up hooks so the punchline can pay off later rather than disappearing after one screen.

Country adaptation should change the setting and football culture, not merely swap a flag into the same joke. Generic events should remain available everywhere, while league-specific variants require verified structures or traditions. Avoid jokes about war, racism, disasters, protected characteristics, or unproven misconduct by real people.

## Implementation order

1. Add stable association/competition IDs and the 53 top-flight shells; handle Liechtenstein as a cup-only association.
2. Add a versioned UEFA access list and full loser-transfer graph, then implement qualifying draws and rounds.
3. Separate `currentEuropeanEntry` from `projectedNextEuropeanEntry` in simulation and UI.
4. Replace global-award random selection with dossiers, shortlist, and simulated votes.
5. Add a rule-driven scenario registry with 10–15 well-gated archetypes first, then expand country variants after tests confirm rarity and relevance.

