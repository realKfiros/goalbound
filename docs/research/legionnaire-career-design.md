# Goalbound: Legionnaire-inspired worldwide career design research

Research date: 2026-08-16. Legionnaire observations refer to the live build and its first-party public JavaScript asset available on that date. This is product research, not legal advice.

## Executive findings

1. Legionnaire's appeal is not the number of leagues. It is a fast repeating loop: a short, specific dilemma; 2–4 choices whose trade-off is immediately legible; a hidden probabilistic outcome; a compact one-to-three-season simulation; then a new dilemma caused by the resulting career state. The career board makes the accumulated story visible. This was observed directly in the [live game](https://www.legionnaire.xyz/) and its [published game asset](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js).
2. Worldwide realism should come from believable pathways and constraints, not from making every career end at an elite club. Academy release, reserve/B-team football, loans, second divisions, non-renewal, free agency, stepping-stone leagues, late breakthroughs, injuries and downward moves should be normal outcomes. ECA reports that only 48% of surveyed academies had a formally prescribed first-team transition process, while an U21/U23/B team was the final step at just over half of clubs; CIES identifies academy promotion, outside recruitment and team promotion as distinct routes into the big five. [ECA youth-football report](https://www.ecaeurope.com/media/5625/eca-youth-football-12-quality-areas-report.pdf), [CIES career-path report](https://football-observatory.com/IMG/sites/mr/mr54/en/)
3. “FIFPRO will not care” answers the wrong rights question. FIFPRO's collective licensing concerns players' names, images and likenesses. Clubs control separate identity assets such as official names, crests, logos, trademarks and colours. The Premier League specifically tells users to contact clubs before reproducing names or badges. [FIFPRO licensing](https://www.fifpro.org/en/who-we-are/commercial), [UEFA Article 61](https://documents.uefa.com/r/UEFA-Club-Licensing-and-Financial-Sustainability-Regulations-2026/Article-61-Licence-applicant-s-identity-history-and-legacy-Online?contentId=H6KEXv2JzXdGS4WhsOGIWw), [Premier League permissions guidance](https://www.premierleague.com/en/news/102426)
4. The practical MVP is real club names with clearly original, non-mimicking visual identifiers and fictional players. Official crests, league logos, kits, sponsor marks and player likenesses should be feature-flagged off until their rights are documented. “Small” or “the other game does it” is not a permission source; none of the rights-owner or API terms reviewed states a small-game exception. [Premier League guidance](https://www.premierleague.com/en/news/102426), [Manchester United brand protection](https://www.manutd.com/en/club/club-info/brand-protection), [football-data.org terms, section 9](https://www.football-data.org/about)

## 1. What Legionnaire actually does

### Decision loop

Observed directly in the [live game](https://www.legionnaire.xyz/) and corroborated in the [first-party published asset](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js):

- A career begins at 16 with surname, shirt number, preferred foot, position and a choice of one-, two- or three-season decision cadence.
- The opening decision offers three real Israeli youth departments. Each option exposes the club, division and likely squad role.
- A choice simulates the selected cadence and produces appearances, goals/assists, overall-rating change, role change, market value, awards and international statistics. The next decision follows automatically.
- Structural decisions include youth graduation, senior promotion versus loan, loan continuation, return to the parent club, not being retained, contract non-renewal, agent selection/upgrades, transfer windows, staying, permanent moves and forced retirement when no offer arrives.
- Personal events are eligibility-filtered by such state as age, domestic/foreign status, division, national-team involvement and career history. Each option can have more than one weighted outcome and can change temporary or permanent ability, role, value, availability, future transfer affinity, representation or national-team status.
- Agent choices are systemic rather than cosmetic: different agents bias which clubs make offers and can change valuations. Career effects persist, so a comic event can alter later sporting decisions.

### Scenario range

The public asset contains, among others, injury and rehabilitation gambles; nightlife and media decisions; dressing-room conflict; a new coach resetting the hierarchy; tactical disagreement; sponsor conflicts; social-media discipline; contract-renewal standoffs; relegation clauses; club insolvency; agent commission disputes; foreign-language confusion; national-team rooming, captaincy and selection disputes; pressure to retire internationally; and integrity/medical-risk situations. These are not all equally realistic, but they share the same useful design shape: recognizable football context, a personal choice, uncertain consequences and a persistent state effect. [Legionnaire published asset](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js)

### Tone and humour

The humour is mostly deadpan and situational. A credible football problem is made funny by one highly specific local detail: a familiar media format, a suspiciously well-connected agent, a teammate's relative entering the pundit cycle, a roommate problem on international duty, or an administrator using grand language for a small inconvenience. The UI itself stays terse and treats the absurdity as ordinary. This is an inference from the [live game](https://www.legionnaire.xyz/) and [published scenario text](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js).

Goalbound should copy the **method**, not the lines:

- Start with a football truth; add one culturally specific inconvenience.
- Make the institution the butt of the joke more often than the player, nationality, religion or supporter group.
- Keep the title short, the setup to two sentences and option labels literal.
- Let consequences provide the punchline. Do not explain why the event is funny.
- Localize the premise, not only the wording: tabloids in England, radio call-ins in Argentina, ultra pressure in Italy, agent-family networks in parts of South America, language and weather adaptation in northern Europe, travel and payment uncertainty in lower-resource leagues. Local scenarios need native review before publication.
- Use roughly four grounded events for each heightened comic event. A career should feel funny because football is strange, not because everything is random.

## 2. What realistic careers need to model

### Youth and first-team transition

- Do not permit an ordinary international club transfer before age 18. FIFA says international transfers of minors remain prohibited except for six narrowly defined exceptions requiring advance approval. Domestic academy movement can still occur under national rules. [FIFA minor-application guide announcement](https://inside.fifa.com/legal/news/new-edition-guide-submitting-minor-application)
- Early debut should be rare and not guarantee a superstar outcome. CIES found 402 players used in the big-five leagues before turning 18 across 2009–2023; among those who later played for another team, only 47.7% reached at least one club at a higher sporting level than their initial club. [CIES underage-player study](https://football-observatory.com/Use-of-underage-players-in-the-big-5-2009-2023)
- Academy exit should branch into first-team integration, U21/U23/B-team football, loan/partner club, release and lower-level recruitment. In ECA's academy survey, just over half used an U21/U23/B team as the final pre-first-team step; 98% explained transitions such as age-group moves, loans or partner clubs, and 81% provided exit support to players not retained. [ECA youth-football report](https://www.ecaeurope.com/media/5625/eca-youth-football-12-quality-areas-report.pdf)

### Debut ages, roles and stepping stones

- Position should affect the age curve. In CIES's big-five sample, the average debut was 21.7; goalkeepers averaged 23.4, defenders 22.0, midfielders 21.3 and forwards 21.2. [CIES Monthly Report 54](https://football-observatory.com/IMG/sites/mr/mr54/en/)
- Elite-league entry should have three routes: graduation from the debut club's academy/reserves, recruitment from another club and promotion with the player's existing club. Nearly half of the sampled big-five players arrived after recruitment from outside those leagues. [CIES Monthly Report 54](https://football-observatory.com/IMG/sites/mr/mr54/en/)
- Stepping-stone leagues should be a major path, not consolation content. CIES reports that cross-border mobility extends to lower-level professionals, with expatriate counts in 135 men's leagues across 88 associations rising almost 20% from 2020 to 2024. [CIES migration report](https://www.cies.ch/research/news/news-detail/article/migration-report-the-rise-continues)
- The engine should not assume a single universal pyramid. FIFA's current landscape covers all 211 member associations, while its second/third-division study documents substantial variation in competition structure. [FIFA Professional Football Landscape](https://inside.fifa.com/en/advancing-football/about-landscape), [FIFA second- and third-division analysis](https://profootball.fifa.com/mod/resource/view.php?id=1303)

### Transfers, contracts and agents

- Transfers should be frequent but mostly ordinary. FIFA recorded 24,558 international transfers in men's professional football in 2025; 1,214 clubs paid at least one incoming fee and 1,495 received at least one outgoing fee. [FIFA Global Transfer Report 2025 release](https://inside.fifa.com/transfer-system/media-releases/international-transfers-reach-historic-high-2025)
- Agent selection should have a written term, fee and service scope. FIFA's current FAQ says only licensed natural persons may provide football-agent services, a written representation agreement is required, and an agreement with a player or coach may not exceed two years. [FIFA agent FAQ](https://legal.fifa.com/transfer-system/agents/faq-agents)
- Use registration windows, contract expiry, loans, release clauses, sell-on/training incentives, wage security and squad role as decision inputs. The ruleset must be date-versioned: FIFA approved a replacement transfer framework in June 2026, but states it enters into force on 1 January 2027. [FIFA 2025 Legal Handbook](https://legal.fifa.com/legal/news/legal-handbook-2025-edition-published), [2027 framework announcement](https://ipt.fifa.com/transfer-system/news/bureau-council-new-regulatory-framework-global-football-transfer-system-2027)

### Health, workload and adversity

- Injury risk needs to depend on exposure, recovery, age and prior injury rather than a flat random roll. UEFA's long-running elite-club study has analysed more than 28,000 injuries across 96 clubs, while FIFPRO's 2024/25 workload report tracked 1,500 players and emphasized inadequate rest/pre-season after continuous competition cycles. [UEFA Elite Club Injury Study](https://www.uefa.com/news-media/news/02a7-2127f03f93eb-9c1369d44100-1000--uefa-elite-club-injury-study-25-years-of-protecting-players/), [FIFPRO workload report](https://www.fifpro.org/en/articles/2025/09/without-minimum-protection-for-player-health-and-performance-football-remains-global-outlier-among-elite-sports-fifpro-report-shows)
- Club instability, delayed wages and integrity pressure belong in some regions and lower tiers, but should not become stereotypes tied to a nationality. FIFPRO's 2016 survey of 13,000 professionals found 40% reported delayed or missing salary payments; its reporting tool exists because financially vulnerable players can be targeted by match fixers. [FIFPRO anti-match-fixing overview](https://www.fifpro.org/en/what-we-do/workplace-safety/match-fixing), [FIFPRO global employment report](https://www.fifpro.org/media/xdjhlwb0/working-conditions-in-professional-football.pdf)

### International and late career

- National-team selection should consider form, minutes, positional competition, team strength, age and tournament cycle. Dual-eligible players can create a one-time association decision, but FIFA eligibility and change-of-association rules apply; a player with a pending request cannot represent any national team until the decision is made. [FIFA eligibility explainer](https://inside.fifa.com/legal/media-releases/fifa-publishes-explainer-on-eligibility-to-play-for-representative-teams), [FIFA change-of-association platform announcement](https://inside.fifa.com/legal/news/digital-platform-launched-detailing-players-changed-association)
- Decline should be position-specific and include role changes, not only rating loss. In CIES's 2022 European census, average ages were 26.60 for goalkeepers, 26.47 for centre-backs, 26.45 for full-backs, 25.90 for defensive midfielders, 25.26 for attacking midfielders and 25.62 for forwards. [CIES Monthly Report 79](https://football-observatory.com/IMG/pdf/mr79en.pdf)
- Retirement decisions should include education, coaching, media, business and an abrupt forced exit. FIFPRO reported that 67% of surveyed active players were unsure about their second career, supporting preparation decisions during the playing career. [FIFPRO career-transition interview](https://www.fifpro.org/en/articles/2021/09/scott-ward-former-player-on-navigating-life-outside-football)

## 3. Concrete scenario taxonomy

The examples below are original Goalbound directions, not Legionnaire text.

| Family | Typical eligibility | Decision shape | Persistent consequences | Tone seed |
|---|---|---|---|---|
| Academy recruitment | Age 15–18, domestic | Elite academy with a blocked pathway vs smaller academy with minutes vs staying local | Training quality, education, home support, early role | “The big academy has twelve analysts; only one knows your name.” |
| First-team threshold | Academy graduation | Senior bench vs B/reserve team vs loan vs release | Senior debut, role, confidence, new-club interest | The manager calls you “part of the project”; nobody can locate the project. |
| Loan pathway | Under 24 or role below rotation | Higher-level bench vs lower-level starter vs different country | Minutes, adaptation, recall, parent-club opinion | Your parent club promises to watch every match; the analyst asks for your shirt number. |
| Coach and hierarchy | Coach change, poor form, tactical mismatch | Adapt position, request a meeting, train harder, seek a move | Role, versatility, injury risk, relationship | The new coach has a system, a whiteboard and no footage of you. |
| Contract and security | Final 18 months, relegation risk, delayed pay | Extend for security, run down deal, demand clause, leave | Wage, value, loyalty, free agency, board relationship | The bonus is described as “achievable” in a font normally used for warnings. |
| Agent and network | First pro deal, rising value, foreign interest | Local specialist vs international network vs self/family representation | Offer pool, negotiation quality, commission, conflict risk | The agent has a direct line to three sporting directors and one of their cousins. |
| Transfer and stepping stone | Performance threshold, window open | Stay for status, move up as rotation, move abroad as starter | League reputation, role, adaptation, value | Sunny destination; less sunny release clause. |
| Foreign adaptation | First season abroad | Language study, teammate translator, isolate, return home | Tactical comprehension, morale, role, future country affinity | Nodding confidently works until the set-piece meeting. |
| Injury and workload | Exposure/recovery model trigger | Play through pain, rest, conservative rehab, aggressive return | Availability, recurrence risk, permanent ability, trust | The “must-win” match is followed by another must-win match on Tuesday. |
| Club instability | Financial-risk league/club state | Wait, union/legal route, seek transfer, accept wage cut | Pay security, reputation, transfer urgency | The owner says the money is “already moving”; nobody asks in which direction. |
| Integrity and discipline | Financial stress, betting approach, social/media event | Report, refuse quietly, confront, post publicly | Suspension risk, reputation, union support, team role | Keep humour away from the fixer; let bureaucracy carry it. |
| Dressing room and media | Captaincy, poor run, high reputation | Defend teammate, stay quiet, challenge coach, give interview | Leadership, morale, role, supporter sentiment | A private meeting attended by only the squad, staff and three podcasts. |
| National team | Eligible and in selection range | Accept youth/senior call, choose association where legal, manage club conflict, retire internationally | Caps, lock-in/change process, workload, prestige | The rooming list is treated as a constitutional document. |
| Peak and legacy | Elite performance, long club tenure | Chase a bigger club, stay for legend status, prioritize continent/country | Trophies, club affinity, valuation, legend events | The statue discussion begins before the contract discussion. |
| Decline and retirement | Age curve, recurring injury, no offers | Drop a tier, return home, become mentor, retire, start education | Final seasons, testimonial/legacy, post-career epilogue | Your legs say coaching; your agent says one last “interesting project.” |

### Event-engine contract

Use a data-driven event schema so realism and humour can be reviewed separately from simulation code:

```ts
type CareerEvent = {
  id: string;
  family: string;
  countries?: string[];
  locales?: string[];
  eligibility: Predicate[];
  weight: number;
  cooldownSeasons?: number;
  titleKey: string;
  bodyKey: string;
  options: Array<{
    labelKey: string;
    outcomes: Array<{
      probability: number;
      resultKey: string;
      effects: CareerEffect[];
    }>;
  }>;
};
```

Recommended simulation rules:

- Separate **structural events** (contract, transfer, loan, selection, injury) from **colour events** (media, roommate, sponsor, cultural adaptation). Structural events get priority when the state requires a decision.
- Show the player the football trade-off—role, league level, contract security, likely minutes—but keep exact outcome percentages hidden unless an accessibility/difficulty setting enables them.
- Allow both options to succeed or fail for different reasons. Avoid a fixed “professional answer always wins” rule.
- Make effects causal and inspectable: the career timeline should say that an offer came through an agent, a role fell after a coach dispute, or an injury recurred after an early return.
- Use fail-forward outcomes. A failed elite move can create a loan, lower-tier revival, new-country path or early retirement rather than a dead screen.
- Calibrate debut and decline curves by position, transfer destinations by association-to-association flows, and injury by workload. The cited CIES, FIFA, UEFA and FIFPRO sources above provide defensible starting priors, not immutable probabilities.

## 4. Real clubs, crests and data

### Rights layers

| Layer | What the reviewed source says | Goalbound MVP stance |
|---|---|---|
| Player names/images/likenesses | FIFPRO offers collective licensing to feature real professional players in games and apps. [FIFPRO](https://www.fifpro.org/en/who-we-are/commercial) | Keep players fictional unless separately licensed. |
| Club name/crest/colours | UEFA requires a club's official name, crest, logos, trademarks and colours to be owned/controlled by the licence applicant; the Premier League says clubs retain their marks and should be contacted before reproducing names or badges. [UEFA](https://documents.uefa.com/r/UEFA-Club-Licensing-and-Financial-Sustainability-Regulations-2026/Article-61-Licence-applicant-s-identity-history-and-legacy-Online?contentId=H6KEXv2JzXdGS4WhsOGIWw), [Premier League](https://www.premierleague.com/en/news/102426) | Real names only after a launch-territory review; use deliberately original identifiers, not lookalike crests. |
| League marks and fixture data | The Premier League treats its trademarks separately and directs match-data permission requests to Football DataCo. [Premier League](https://www.premierleague.com/en/news/102426) | No league logos; do not scrape proprietary fixtures for the simulation. |
| API-provided crest URL | football-data.org says team logos and player photos remain copyrighted and users must obtain owner consent. [football-data.org](https://www.football-data.org/about) | Ignore crest URLs unless the asset has separate clearance. |
| CC0 factual metadata | Wikidata's structured data is CC0, but CC0 does not affect third-party trademark rights. [Wikidata licensing](https://www.wikidata.org/wiki/Wikidata%3ALicensing), [CC0 limitations](https://www.wikidata.org/wiki/Wikidata%3AText_of_the_Creative_Commons_Public_Domain_Dedication) | Good seed for names, countries, cities and official-site links; not a crest licence. |

### Practical source stack

1. **World/league structure:** use the free FIFA Professional Football Landscape to identify professional associations, clubs and competition structures; it is aggregate, regularly updated rather than live, and built from member-association input. [FIFA landscape methodology](https://inside.fifa.com/en/advancing-football/about-landscape)
2. **Club identity seed:** use [Wikidata](https://www.wikidata.org/wiki/Help:Data_access) for factual metadata and official-site links, then validate current division and official spelling against the relevant federation or league.
3. **Open prototype data:** [OpenFootball/football.db](https://openfootball.github.io/) publishes public-domain football text datasets suitable for prototypes and historical calibration; completeness and currency still need validation.
4. **Maintained metadata/fixtures:** [football-data.org v4](https://docs.football-data.org/general/v4/team.html) supplies team and competition metadata. Its own terms require attribution and separately warn that logos remain copyrighted. [football-data.org terms](https://www.football-data.org/about)
5. **Match-event calibration:** [StatsBomb Open Data](https://github.com/statsbomb/open-data) can help calibrate performance distributions for research and genuine football analysis. Confirm commercial-production permission before bundling or deriving shipped datasets.

Store a rights record per visual asset: `owner`, `sourceUrl`, `permissionDocument`, `permittedUses`, `territories`, `expiry`, `attribution`, and `enabled`. An official badge should render only when that record is complete. For the first release, a neutral monogram/shape system should avoid official crest composition, distinctive symbols, stars, crowns, animals, mottos, kit patterns and sponsor marks associated with the club.

## 5. Recommended first content slice

Start with 10 career-origin nations, but model **pathway countries** separately. A Brazilian career, for example, should be able to route through domestic state/national tiers and then credible destinations; a French career may rise domestically or through nearby smaller leagues; an English career may use academy release, non-league/EFL progression and loans. The CIES migration report supports nation-specific transfer corridors rather than a universal “good player gets England/Spain” ladder. [CIES migration report](https://www.cies.ch/research/news/news-detail/article/migration-report-the-rise-continues)

For each origin nation, ship:

- 2–3 domestic tiers or pathway bands;
- 30–60 real clubs with verified official names and original identifiers;
- 3 academy openings, 4 first-team threshold events, 5 contract/loan events, 5 coach/role events, 5 health/workload events, 5 local colour events, 3 international-team events and 3 late-career events;
- 3–5 evidence-based transfer corridors to other nations;
- native review of humour and terminology;
- fictional players throughout.

This produces 250–350 reusable event templates plus localized variants—enough variety for repeated careers while keeping reviewable causal logic and a manageable rights surface.
