# Complete 2026/27 UEFA club access list for Goalbound

Checked: 17 August 2026  
Scope: men's UEFA club competitions; 53 represented domestic leagues, Russia excluded, plus cup-only Liechtenstein  
Source policy: UEFA and national-association primary sources only

## Executive answer

Goalbound needs two data layers, not one hard-coded country list:

1. a **rank template** that maps association rank and domestic source to a competition, entry round and path; and
2. a **season adaptation** that removes suspended associations and resolves UEFA titleholders, European Performance Spots (EPS) and the vacancies they create.

The final 2026/27 list is unusually adapted. Russia's rank-26 entries are removed; the UCL and UEL titleholders both also qualified domestically, moving Shakhtar Donetsk and Sporting CP into the UCL league phase and moving several other clubs up qualifying rounds; England and Spain have EPS places; and Crystal Palace enters the UEL as UECL holder. These are annual outcomes, not permanent country entitlements. UEFA's definitive primary source is [Circular Letter 33/2026 and its final revised access-list enclosure](https://editorial.uefa.com/resources/02a6-20c7e4bad9ad-4a4cf586592b-1000/20260603_circular_2026_33_en.zip), read with [Annex A](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Annex-A-Access-List-for-the-2026/27-UEFA-Club-Competitions-Online).

## Machine-readable vocabulary

- `N1`, `N2`, ...: first, second, ... in the top domestic league.
- `CW`: national cup winner.
- `LQ1`, `LQ2`: first and second highest league finishers not already allocated a higher UEFA route. These are cascade results, not fixed table numbers.
- `TH`: UEFA competition titleholder.
- `LP/D`: league phase, direct.
- `PO`: play-off; `Q1`, `Q2`, `Q3`: qualifying rounds.
- `CP`: Champions Path; `LgP`: UCL League Path; `MP`: UEL/UECL Main Path.
- A semicolon separates distinct berths.
- `*` marks a 2026/27 adaptation. The ordinary route is stated in parentheses where its entry stage changed.

Recommended slot record:

```ts
type UefaAccessSlot = {
  season: "2026/27";
  association: string;
  accessRank: number;           // preserve the gaps at RUS 26 and LIE 44
  slotId: string;               // stable identity, e.g. "ISR:CW"
  sourceType: "champion" | "league" | "cup" | "special-cup" | "titleholder" | "eps";
  sourceOrdinal?: number;
  competition: "UCL" | "UEL" | "UECL";
  entryRound: "LP" | "PO" | "Q3" | "Q2" | "Q1";
  path: "D" | "CP" | "LgP" | "MP";
  ordinaryEntryRound: "LP" | "PO" | "Q3" | "Q2" | "Q1";
  adaptation?: "RUS_SUSPENSION" | "UCL_TH_VACANCY" | "UEL_TH_VACANCY" | "UECL_TH" | "EPS";
};
```

Do not infer rank from an array after filtering Russia or Liechtenstein. The 2026/27 positions are the UEFA rankings based on 2020/21 through 2024/25, so `accessRank` must remain explicit. See UEFA's [2025 association coefficient table](https://www.uefa.com/nationalassociations/uefarankings/country/?year=2025) and [ranking reference-period rule](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/D.2-Reference-periods-for-rankings-Online).

## Final 2026/27 association matrix

This table gives the final sporting entry stage after the published 2026/27 adaptations. `Ord/final` is the ordinary association quota followed by the final number of clubs when EPS or a non-domestic titleholder route adds a club. Cup and league duplicate handling is described after the table.

| Rank | Association | UCL source → entry | UEL source → entry | UECL source → entry | Ord/final |
| ---: | --- | --- | --- | --- | ---: |
| 1 | England (`ENG`) | `N1–N4 → LP/D; N5 → LP/D [EPS]*` | `CW → LP/D; LQ1 → LP/D; UECL-TH → LP/D [additional]*` | `EFL Cup winner/next unallocated league club → PO/MP` | 7/9 |
| 2 | Italy (`ITA`) | `N1–N4 → LP/D` | `CW → LP/D; LQ1 → LP/D` | `LQ2 → PO/MP` | 7/7 |
| 3 | Spain (`ESP`) | `N1–N4 → LP/D; N5 → LP/D [EPS]*` | `CW → LP/D; LQ1 → LP/D` | `LQ2 → PO/MP` | 7/8 |
| 4 | Germany (`GER`) | `N1–N4 → LP/D` | `CW → LP/D; LQ1 → LP/D` | `LQ2 → PO/MP` | 7/7 |
| 5 | France (`FRA`) | `N1–N3 → LP/D; N4 → Q3/LgP` | `CW → LP/D; LQ1 → LP/D` | `LQ2 → PO/MP` | 7/7 |
| 6 | Netherlands (`NED`) | `N1,N2 → LP/D; N3 → Q3/LgP` | `CW → LP/D; LQ1 → Q2/MP` | `LQ2 → Q2/MP` | 6/6 |
| 7 | Portugal (`POR`) | `N1 → LP/D; N2 → LP/D [UEL-TH vacancy]* (ordinary Q3/LgP)` | `CW → LP/D; LQ1 → Q2/MP` | `LQ2 → Q2/MP` | 5/5 |
| 8 | Belgium (`BEL`) | `N1 → LP/D; N2 → Q3/LgP` | `CW → PO/MP; LQ1 → Q2/MP` | `LQ2 → Q2/MP` | 5/5 |
| 9 | Czechia (`CZE`) | `N1 → LP/D; N2 → Q3/LgP` | `CW → PO/MP; LQ1 → Q2/MP` | `LQ2 → Q2/MP` | 5/5 |
| 10 | Türkiye (`TUR`) | `N1 → LP/D; N2 → Q2/LgP` | `CW → PO/MP; LQ1 → Q2/MP` | `LQ2 → Q2/MP` | 5/5 |
| 11 | Norway (`NOR`) | `N1 → PO/CP; N2 → Q3/LgP [UEL-TH vacancy]* (ordinary Q2)` | `CW → PO/MP; LQ1 → Q2/MP` | `LQ2 → Q2/MP` | 5/5 |
| 12 | Greece (`GRE`) | `N1 → PO/CP; N2 → Q3/LgP [UEL-TH vacancy]* (ordinary Q2)` | `CW → PO/MP; LQ1 → Q2/MP` | `LQ2 → Q2/MP` | 5/5 |
| 13 | Austria (`AUT`) | `N1 → PO/CP; N2 → Q2/LgP` | `CW → Q3/MP` | `N3,N4 → Q2/MP` | 5/5 |
| 14 | Scotland (`SCO`) | `N1 → PO/CP; N2 → Q2/LgP` | `CW → Q3/MP` | `N3,N4 → Q2/MP` | 5/5 |
| 15 | Poland (`POL`) | `N1 → Q2/CP; N2 → Q2/LgP` | `CW → Q3/MP` | `N3,N4 → Q2/MP` | 5/5 |
| 16 | Denmark (`DEN`) | `N1 → Q2/CP` | `CW → Q2/MP [RUS suspension]* (ordinary Q1)` | `N2,N3 → Q2/MP` | 4/4 |
| 17 | Switzerland (`SUI`) | `N1 → Q2/CP` | `CW → Q2/MP [UEL-TH knock-on]* (ordinary Q1)` | `N2,N3 → Q2/MP` | 4/4 |
| 18 | Israel (`ISR`) | `N1 → Q2/CP` | `CW → Q2/MP [UEL-TH knock-on]* (ordinary Q1)` | `N2,N3 → Q2/MP` | 4/4 |
| 19 | Cyprus (`CYP`) | `N1 → Q2/CP` | `CW → Q2/MP [UEL-TH knock-on]* (ordinary Q1)` | `N2,N3 → Q2/MP` | 4/4 |
| 20 | Sweden (`SWE`) | `N1 → Q2/CP` | `CW → Q2/MP [UEL-TH knock-on]* (ordinary Q1)` | `N2,N3 → Q2/MP` | 4/4 |
| 21 | Croatia (`CRO`) | `N1 → Q2/CP` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 22 | Serbia (`SRB`) | `N1 → Q2/CP` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 23 | Ukraine (`UKR`) | `N1 → LP/D [UCL-TH vacancy]* (ordinary Q2/CP)` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 24 | Hungary (`HUN`) | `N1 → Q1/CP` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 25 | Romania (`ROU`) | `N1 → Q1/CP` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 27 | Slovakia (`SVK`) | `N1 → Q2/CP [UCL-TH knock-on]* (ordinary Q1)` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 28 | Slovenia (`SVN`) | `N1 → Q2/CP [UCL-TH knock-on]* (ordinary Q1)` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 29 | Bulgaria (`BUL`) | `N1 → Q1/CP` | `CW → Q1/MP` | `N2,N3 → Q2/MP` | 4/4 |
| 30 | Azerbaijan (`AZE`) | `N1 → Q1/CP` | `CW → Q1/MP` | `N2 → Q2/MP; N3 → Q1/MP` | 4/4 |
| 31 | Republic of Ireland (`IRL`) | `N1 → Q1/CP` | `CW → Q1/MP` | `N2 → Q2/MP; N3 → Q1/MP` | 4/4 |
| 32 | Moldova (`MDA`) | `N1 → Q1/CP` | `CW → Q1/MP` | `N2 → Q2/MP; N3 → Q1/MP` | 4/4 |
| 33 | Iceland (`ISL`) | `N1 → Q1/CP` | `CW → Q1/MP` | `N2 → Q2/MP; N3 → Q1/MP` | 4/4 |
| 34 | Bosnia and Herzegovina (`BIH`) | `N1 → Q1/CP` | — | `CW → Q2/MP; N2,N3 → Q1/MP` | 4/4 |
| 35 | Armenia (`ARM`) | `N1 → Q1/CP` | — | `CW → Q2/MP; N2,N3 → Q1/MP` | 4/4 |
| 36 | Latvia (`LVA`) | `N1 → Q1/CP` | — | `CW → Q2/MP; N2,N3 → Q1/MP` | 4/4 |
| 37 | Kosovo (`KOS`) | `N1 → Q1/CP` | — | `CW → Q2/MP; N2,N3 → Q1/MP` | 4/4 |
| 38 | Finland (`FIN`) | `N1 → Q1/CP` | — | `CW → Q2/MP; N2,N3 → Q1/MP` | 4/4 |
| 39 | Kazakhstan (`KAZ`) | `N1 → Q1/CP` | — | `CW → Q2/MP [RUS suspension]* (ordinary Q1); N2,N3 → Q1/MP` | 4/4 |
| 40 | Faroe Islands (`FRO`) | `N1 → Q1/CP` | — | `CW → Q2/MP [RUS suspension]* (ordinary Q1); N2,N3 → Q1/MP` | 4/4 |
| 41 | Malta (`MLT`) | `N1 → Q1/CP` | — | `CW → Q2/MP [RUS suspension]* (ordinary Q1); N2,N3 → Q1/MP` | 4/4 |
| 42 | Northern Ireland (`NIR`) | `N1 → Q1/CP` | — | `CW → Q2/MP [RUS suspension]* (ordinary Q1); N2,N3 → Q1/MP` | 4/4 |
| 43 | Lithuania (`LTU`) | `N1 → Q1/CP` | — | `CW → Q2/MP [RUS suspension]* (ordinary Q1); N2,N3 → Q1/MP` | 4/4 |
| 44 | Liechtenstein (`LIE`) | — | — | `CW → Q2/MP [RUS suspension]* (ordinary Q1)` | 1/1 |
| 45 | Estonia (`EST`) | `N1 → Q1/CP` | — | `CW,N2,N3 → Q1/MP` | 4/4 |
| 46 | Albania (`ALB`) | `N1 → Q1/CP` | — | `CW,N2,N3 → Q1/MP` | 4/4 |
| 47 | Montenegro (`MNE`) | `N1 → Q1/CP` | — | `CW,N2,N3 → Q1/MP` | 4/4 |
| 48 | Luxembourg (`LUX`) | `N1 → Q1/CP` | — | `CW,N2,N3 → Q1/MP` | 4/4 |
| 49 | Wales (`WAL`) | `N1 → Q1/CP` | — | `CW,N2,N3 → Q1/MP` | 4/4 |
| 50 | Georgia (`GEO`) | `N1 → Q1/CP` | — | `CW,N2,N3 → Q1/MP` | 4/4 |
| 51 | North Macedonia (`MKD`) | `N1 → Q1/CP` | — | `CW,N2 → Q1/MP` | 3/3 |
| 52 | Belarus (`BLR`) | `N1 → Q1/CP` | — | `CW,N2 → Q1/MP` | 3/3 |
| 53 | Andorra (`AND`) | `N1 → Q1/CP` | — | `CW,N2 → Q1/MP` | 3/3 |
| 54 | Gibraltar (`GIB`) | `N1 → Q1/CP` | — | `CW,N2 → Q1/MP` | 3/3 |
| 55 | San Marino (`SMR`) | `N1 → Q1/CP` | — | `CW,N2 → Q1/MP` | 3/3 |

Rank 26 is Russia and has no 2026/27 entries. It is deliberately omitted rather than renumbering ranks 27–55. Liechtenstein has no domestic league: its clubs play in the Swiss system and only its cup winner supplies a Liechtenstein UEFA entry. See the [Liechtenstein Football Association's competition explanation](https://www.lfv.li/breitenfussball/vereinsfussball/erwachsenenfussball/).

The table expands the final enclosure in [UEFA Circular 33/2026](https://editorial.uefa.com/resources/02a6-20c7e4bad9ad-4a4cf586592b-1000/20260603_circular_2026_33_en.zip). UEFA's [live access-list tracker](https://www.uefa.com/news-media/news/02a4-2060ea59fbc5-4be94b1fbe5a-1000--access-list-track-which-sides-will-play-in-the-2026-27-uef/) and official [UCL](https://www.uefa.com/uefachampionsleague/clubs/), [UEL](https://www.uefa.com/uefaeuropaleague/clubs/) and [UECL](https://www.uefa.com/uefaconferenceleague/clubs/) team lists are useful runtime cross-checks.

## Stable ordinary rank template

This is the reusable template before Russia's suspension, titleholder vacancy filling and EPS. The template includes Russia at rank 26 and treats Liechtenstein's sole ordinary route as `CW → UECL Q1`; apply the seasonal adaptations afterward.

### Champions League

| Rank band | Ordinary domestic sources and entries |
| --- | --- |
| 1–4 | `N1,N2,N3,N4 → LP/D` |
| 5 | `N1,N2,N3 → LP/D; N4 → Q3/LgP` |
| 6 | `N1,N2 → LP/D; N3 → Q3/LgP` |
| 7–9 | `N1 → LP/D; N2 → Q3/LgP` |
| 10 | `N1 → LP/D; N2 → Q2/LgP` |
| 11–14 | `N1 → PO/CP; N2 → Q2/LgP` |
| 15 | `N1 → Q2/CP; N2 → Q2/LgP` |
| 16–23 | `N1 → Q2/CP` |
| 24–55 | `N1 → Q1/CP`, except Liechtenstein |

Ordinary checksum, before suspensions: `25 LP/D + 4 PO/CP + 9 Q2/CP + 31 Q1/CP + 5 Q3/LgP + 6 Q2/LgP = 80` clubs.

### Europa League

| Rank band | Ordinary domestic sources and entries |
| --- | --- |
| 1–5 | `CW → LP/D; N5 → LP/D` |
| 6 | `CW → LP/D; N4 → Q2/MP` |
| 7 | `CW → LP/D; N3 → Q2/MP` |
| 8–12 | `CW → PO/MP; N3 → Q2/MP` |
| 13–15 | `CW → Q3/MP` |
| 16–33 | `CW → Q1/MP` |
| 34–55 | no ordinary UEL berth |

Ordinary checksum, before suspensions: `12 LP/D + 5 PO/MP + 3 Q3/MP + 7 Q2/MP + 18 Q1/MP = 45` clubs. The UECL holder's reserved UEL league-phase place is separate.

### Conference League

| Rank band | Ordinary domestic sources and entries |
| --- | --- |
| 1–5 | `N6 → PO/MP` |
| 6 | `N5 → Q2/MP` |
| 7–12 | `N4 → Q2/MP` |
| 13–15 | `N3,N4 → Q2/MP` |
| 16–29 | `N2,N3 → Q2/MP` |
| 30–33 | `N2 → Q2/MP; N3 → Q1/MP` |
| 34–38 | `CW → Q2/MP; N2,N3 → Q1/MP` |
| 39–50 | `CW,N2,N3 → Q1/MP` |
| 51–55 | `CW,N2 → Q1/MP` |
| Liechtenstein | `CW → Q1/MP`; no league sources |

Ordinary checksum, before suspensions and with Liechtenstein corrected: `5 PO/MP + 50 Q2/MP + 58 Q1/MP = 113` clubs.

UEFA permits another official domestic competition to replace the lowest league-place UECL source when UEFA approved it before the season. England uses that rule for the EFL Cup; it is a source override, not an eighth ordinary berth. See [UECL Article 3.03](https://documents.uefa.com/r/Regulations-of-the-UEFA-Conference-League-2026/27/Article-3-Entries-for-the-competition-Online).

## Exact 2026/27 adaptations

### Russia suspension

The final circular removes Russia's `N1 → UCL Q1`, `CW → UEL Q1` and two `UECL Q2` league routes. The published rebalancing then:

- moves Denmark's cup route from UEL Q1 to Q2; and
- moves the cup routes of ranks 39–44—Kazakhstan, Faroe Islands, Malta, Northern Ireland, Lithuania and Liechtenstein—from UECL Q1 to Q2.

This is why filtering `RUS` out of a rank array and applying the ordinary bands is wrong: removal creates vacancies that UEFA explicitly reallocates.

### UCL titleholder vacancy

Paris Saint-Germain qualified domestically as French champion. Its reserved titleholder place was therefore vacant. UEFA applied [UCL Article 3.04](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-3-Entries-for-the-competition-Online):

- Shakhtar Donetsk, the highest-coefficient eligible champion, moved from UCL Q2/CP to the league phase.
- Slovan Bratislava and Celje, the next eligible clubs from Q1/CP, moved to Q2/CP.

UEFA also explains the concrete 2026/27 result in its [Shakhtar vacancy article](https://www.uefa.com/uefachampionsleague/news/02a2-1fdbe8841243-cc2d911740ee-1000--what-happens-if-the-uefa-champions-league-winners-have-also-/).

### UEL titleholder vacancy

Aston Villa qualified domestically for the UCL, so its reserved UEL-titleholder UCL place was vacant. UEFA's coefficient-based rebalancing produced:

- Sporting CP: UCL Q3/LgP to the league phase;
- Bodø/Glimt and Olympiacos: UCL Q2/LgP to Q3/LgP; and
- as a lower-competition knock-on, the cup routes of Switzerland, Israel, Cyprus and Sweden: UEL Q1/MP to Q2/MP.

UEFA documents the concrete result in its [Sporting vacancy article](https://www.uefa.com/uefaeuropaleague/news/02a2-1fdbe897bb7f-131fc631688c-1000--sporting-cp-secure-champions-league-league-phase-berth-follo/).

### UECL titleholder and EPS

- Crystal Palace had not otherwise qualified domestically, so the UECL holder route adds an English UEL league-phase club without consuming or creating a third ordinary English UEL berth.
- England and Spain earned the two EPS places. Each EPS adds one association club and sends the highest domestic finisher not already in the UCL league phase directly there. UCL Articles 3.08–3.09 then cascade the domestic league routes beneath it.

See UEFA's [2026/27 EPS announcement](https://www.uefa.com/uefachampionsleague/news/02a2-1fdbe9a25733-8d37ff5f9226-1000--2026-27-uefa-champions-league-which-teams-are-in-the-euro/) and [UCL Article 3.08–3.09](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-3-Entries-for-the-competition-Online).

## Domestic cup and titleholder resolution rules

Resolve an association's slots in this order:

1. freeze the season's final league table, national cup winner and any UEFA-approved special-cup winner;
2. establish UCL/UEL titleholders and fill or deduct their reserved places under UCL Articles 3.03–3.07;
3. calculate the two EPS associations and apply UCL Articles 3.08–3.09;
4. allocate the national cup slot at its fixed competition/stage, then cascade league sources around duplicates;
5. apply the UECL titleholder rules and any remaining UEFA vacancy rebalancing; and
6. assert the round-entry checksums below before simulating a draw.

Important duplicate semantics:

- A cup runner-up does not inherit the berth.
- When the cup winner also qualifies through the league, the club keeps the higher route and the cup/league sources cascade through the league while preserving each access stage. The exact cascade is in [UEL Articles 3.03–3.05](https://documents.uefa.com/r/Regulations-of-the-UEFA-Europa-League-2026/27/Article-3-Entries-for-the-competition-Online) and [UECL Articles 3.04–3.05](https://documents.uefa.com/r/Regulations-of-the-UEFA-Conference-League-2026/27/Article-3-Entries-for-the-competition-Online).
- UCL and UEL titleholders are guaranteed UCL league-phase places. If either holder occupies a domestic UEL/UECL berth rather than a domestic UCL berth, the association's entitlement in that lower competition is reduced by one; do not pass it down domestically.
- If a UCL holder already qualifies for the UCL league phase, promote the highest-coefficient eligible champion, then fill each Champions Path vacancy from the previous round by club coefficient.
- If a UEL holder already qualifies for the UCL league phase, promote the highest-coefficient eligible UCL qualifier that is its association's highest domestically ranked non-direct club, then cascade within that path by club coefficient.
- The UECL holder is guaranteed UEL league phase. If it already has a domestic UECL route, that association loses one UECL entitlement. If it already qualifies directly for the UEL, UEFA fills the reserved vacancy from eligible UEL qualifying clubs by coefficient; if it qualifies for the UCL, it may choose UCL and vacate the UEL holder place. See [UEL Articles 3.07–3.13](https://documents.uefa.com/r/Regulations-of-the-UEFA-Europa-League-2026/27/Article-3-Entries-for-the-competition-Online).
- EPS is calculated from the immediately preceding season's association performance, not the access-list five-year rank. Never guess EPS from access rank when results are unavailable.

UEFA issues the final circular only after domestic and UEFA competitions finish because the last four steps are outcome-dependent. A long-running save must run this resolver every season; it must not permanently give Portugal two direct UCL clubs or Israel a UEL Q2 cup place merely because those statements are true in the adapted 2026/27 list.

## Qualifying-round checksum and loser-transfer graph

The official qualifying draw pages validate the final access-list arithmetic: [UCL Q1](https://www.uefa.com/uefachampionsleague/news/02a6-20df9860a261-5068e9b6c51c-1000--uefa-champions-league-first-qualifying-round-draw/), [UCL Q2](https://www.uefa.com/uefachampionsleague/news/02a6-20df98635dbd-bd0f9ed2d71e-1000--uefa-champions-league-second-qualifying-round-draw/), [UEL qualifying](https://www.uefa.com/uefaeuropaleague/news/02a6-20e5db0029dd-8241a8d00925-1000--europa-league-qualifying-fixtures-results-dates-how-it-works/) and [UECL qualifying](https://www.uefa.com/uefaconferenceleague/news/02a6-20e5e911587f-cc10425958b3-1000--conference-league-qualifying-fixtures-results-dates-how-it-/).

### UCL

- CP: `28 Q1 entrants → 14 winners`; `14 + 10 new Q2 → 12`; `12 Q3 → 6`; `6 + 4 new PO → 5 league-phase clubs`.
- LgP: `4 Q2 entrants → 2`; `2 + 6 new Q3 → 4`; `4 PO → 2 league-phase clubs`.
- League phase: `29 direct + 5 CP winners + 2 LgP winners = 36`.

### UEL

- MP Q1: `12 → 6`.
- MP Q2: `12 new + 6 Q1 winners = 18 → 9`.
- CP Q3: `12 UCL-Q2/CP losers → 6`.
- MP Q3: `3 new + 9 Q2 winners + 2 UCL-Q2/LgP losers = 14 → 7`.
- Play-off: `5 new + 6 CP-Q3 winners + 7 MP-Q3 winners + 6 UCL-Q3/CP losers = 24 → 12`.
- League phase: `13 direct (12 domestic + UECL holder) + 12 UEL play-off winners + 4 UCL-Q3/LgP losers + 7 UCL play-off losers = 36`.

### UECL

- MP Q1: `52 → 26`.
- CP Q2: `12 of 14 UCL-Q1/CP losers → 6`; the other two receive a separately drawn Q3 bye.
- MP Q2: `54 new + 26 Q1 winners + 6 UEL-Q1 losers = 86 → 43`.
- CP Q3: `6 Q2 winners + 2 UCL-Q1 bye clubs = 8 → 4`.
- MP Q3: `43 Q2 winners + 9 UEL-Q2 losers = 52 → 26`.
- CP play-off: `4 Q3 winners + 6 UEL-Q3/CP losers = 10 → 5`.
- MP play-off: `5 new + 26 Q3 winners + 7 UEL-Q3/MP losers = 38 → 19`.
- League phase: `5 CP winners + 19 MP winners + 12 UEL play-off losers = 36`.

### Transfer edges

| Loser | Destination |
| --- | --- |
| UCL Q1/CP | UECL Q2/CP; two drawn clubs receive UECL Q3/CP byes |
| UCL Q2/CP | UEL Q3/CP |
| UCL Q2/LgP | UEL Q3/MP |
| UCL Q3/CP | UEL play-off |
| UCL Q3/LgP | UEL league phase |
| UCL PO, either path | UEL league phase |
| UEL Q1/MP | UECL Q2/MP |
| UEL Q2/MP | UECL Q3/MP |
| UEL Q3/CP | UECL PO/CP |
| UEL Q3/MP | UECL PO/MP |
| UEL PO | UECL league phase |
| UECL qualifier | eliminated |

There are no cross-competition transfers after the league phases begin. The authoritative routing table is also reproduced in [UEL Article 3.06](https://documents.uefa.com/r/Regulations-of-the-UEFA-Europa-League-2026/27/Article-3-Entries-for-the-competition-Online) and [UECL Article 3.06](https://documents.uefa.com/r/Regulations-of-the-UEFA-Conference-League-2026/27/Article-3-Entries-for-the-competition-Online).

## Goalbound implementation status

The access-list integration was completed after the research pass:

- `uefaAccessList.ts` owns the full 1–55 ranking with the Russia gap, all 54 active associations, stable slot IDs and the ordinary UCL, UEL and UECL rank routes.
- `uefaSeason.ts` consumes those routes directly. Generic country filling and filtered-rank slices are no longer used.
- The opening season applies the published 2026/27 adaptations: England and Spain EPS; Shakhtar, Slovan/Celje, Sporting and Bodø/Glimt/Olympiacos movements; Denmark and ranks 39–44 Russia-suspension movements; and Crystal Palace's additional UEL holder route.
- Later simulated seasons recalculate UCL, UEL and UECL titleholder cases plus EPS from the preceding simulated European performance. Missing EPS data is an error rather than an access-rank guess.
- Domestic sources remain distinct from additional titleholder/EPS places. Cup cascades retain their inherited stage, lower titleholder slots can be deducted, and every persisted projection carries its stable `slotId`.
- The qualifier sim follows every loser-transfer edge, draws the UECL Q3 balancing byes, supports access-list byes caused by deductions, and balances all three league phases to 36 clubs.
- Regression coverage pins the raw access-list checksums, the six named UCL adaptations, Denmark/SUI/ISR/CYP/SWE UEL Q2 routes, ranks 39–44 UECL Q2 routes, England and Israel cup cascades, slot identity, all qualifying tie totals, titleholder rollovers and multi-season field integrity.

The implementation is intentionally versioned as `2026/27`. Its titleholder, EPS, cup and qualifying outcomes change in long-running saves, but the five-year association rank order and Russia suspension remain this season's rules dataset. A future UEFA cycle should add another versioned dataset rather than silently mutate this one. For non-published future vacancy choices, Goalbound uses its continental club-strength model as the available proxy for UEFA club coefficients.

## Source index

- [UEFA Circular Letter 33/2026 with final revised access list](https://editorial.uefa.com/resources/02a6-20c7e4bad9ad-4a4cf586592b-1000/20260603_circular_2026_33_en.zip)
- [UEFA Annex A: 2026/27 access list](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Annex-A-Access-List-for-the-2026/27-UEFA-Club-Competitions-Online)
- [UEFA UCL regulations, Article 3](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-3-Entries-for-the-competition-Online)
- [UEFA UEL regulations, Article 3](https://documents.uefa.com/r/Regulations-of-the-UEFA-Europa-League-2026/27/Article-3-Entries-for-the-competition-Online)
- [UEFA UECL regulations, Article 3](https://documents.uefa.com/r/Regulations-of-the-UEFA-Conference-League-2026/27/Article-3-Entries-for-the-competition-Online)
- [UEFA 2026/27 live access list](https://www.uefa.com/nationalassociations/uefarankings/accesslist/allcompetitions/)
- [UEFA 2025 association ranking](https://www.uefa.com/nationalassociations/uefarankings/country/?year=2025)
- [Liechtenstein Football Association: domestic competition structure](https://www.lfv.li/breitenfussball/vereinsfussball/erwachsenenfussball/)
