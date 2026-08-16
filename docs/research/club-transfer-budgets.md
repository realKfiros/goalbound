# Goalbound club transfer-budget model

Research date: 2026-08-16. This is product research, not legal advice.

## Recommendation

Use a **Goalbound-owned estimate**, not a copied Transfermarkt or EA SPORTS FC
budget table. Give every club a small original `financialBand` (1–5), combine
it with a league/tier squad-value proxy, and retain hard fee ceilings. This is
specific enough to make Manchester City, Brighton, Hull City and Dorking
Wanderers behave differently, while remaining maintainable across the existing
388-club complete-league catalog.

The current engine's value is not really a whole-window transfer budget: it is
the most one club can pay for the career player's transfer. Name the resulting
concept `maxSingleFee`. A genuine seasonal budget would require simulating and
deducting the cost of every other signing, which Goalbound does not yet do.

## What the suggested sources can and cannot provide

### Transfermarkt: useful calibration, unsafe as the shipped dataset

Transfermarkt says its player market values are community-informed expected
values, not predicted or actual transfer fees, and that it does not use an
algorithm. Its methodology also treats smaller markets differently where salary
demand matters more than fee-paying activity. A squad value is therefore a
useful **relative strength signal**, not cash in the bank or a transfer budget.
[Transfermarkt market-value definition](https://www.transfermarkt.us/navigation/mwdefinition)

The signal is directionally valuable. Transfermarkt's current Premier League
page spans roughly €1.47bn for Manchester City, €619.5m for Brighton and
€144.3m for Hull City, showing why a single league-wide budget is inadequate.
At the other end of the pyramid, its Dorking Wanderers squad page totals only
€125k and leaves most players unvalued, so lower-tier totals should not be
treated literally. [Transfermarkt Premier League club values](https://www.transfermarkt.com/premier-league/marktwerteverein/wettbewerb/GB1),
[Dorking Wanderers squad](https://www.transfermarkt.co.uk/dorking-wanderers/kader/verein/52299/saison_id/2025)

The reuse constraint is decisive: Transfermarkt's legal notice says
reproduction or inclusion in online services, even in part, requires prior
written consent, and commercial resale is prohibited. Its terms also reserve
rights in its databases and automated access. Goalbound should therefore not
scrape or periodically copy its club values without written permission.
[Transfermarkt legal notice](https://www.transfermarkt.us/intern/impressum),
[Transfermarkt terms of use](https://www.transfermarkt.com/intern/anb)

If permission is obtained later, store one licensed squad-total snapshot per
club with its season, retrieval date and permission record. Do not import
player-by-player values merely to calculate the same total.

### EA SPORTS FC: good design precedent, no official budget feed

The official EA materials reviewed do not publish a club-by-club numeric
starting-budget table, downloadable dataset or Career Mode API. EA confirms
that club budgets exist internally and that AI clubs consider their financial
strength, stature, philosophy and how much of a budget a target consumes, but
the numbers themselves are not provided. FC 27 also says its new **player
valuation** model is informed by TransferRoom xTV; that is not a published
club-budget dataset. [EA SPORTS FC 27 Career deep dive](https://careers.ea.com/sv/games/ea-sports-fc/fc-27/news/pitch-notes-fc27-career-mode-deep-dive),
[EA SPORTS FC 24 Career deep dive](https://www.ea.com/games/ea-sports-fc/news/fc-24-career-deep-dive)

The useful idea to borrow is behavioural: financially cautious clubs should not
spend every available euro, youth-focused clubs should prefer prospects, and a
target's intended role should affect willingness to pay. Online “FIFA Career
Mode budget” lists are observed third-party game data, not an official EA feed,
so Goalbound should not use them as an authoritative source.

### Primary-source reality checks

UEFA's club-finance work shows that finances are highly polarised even within
the elite: it reports a €300m-plus revenue gap between the eighth- and
twelfth-highest clubs and separately tracks revenue, wages and the cumulative
fees used to assemble squads. FIFA likewise reports that only 1,214 clubs paid
an incoming international fee in 2025, while English clubs accounted for
USD 3.82bn of the global USD 13.08bn men's spend. These support separate
club-strength and league-liquidity inputs rather than one universal rating.
[UEFA European Club Finance and Investment Landscape](https://ecfil.uefa.com/2024/),
[FIFA Global Transfer Report 2025 release](https://inside.fifa.com/transfer-system/media-releases/international-transfers-reach-historic-high-2025)

UEFA's transfer review also estimated €2.7bn of English gross spend in its
reviewed summer—about the same as the other big-five countries combined—and a
€14m average Premier League deal. England should therefore have its own tier
profile rather than inheriting a generic European curve.
[UEFA European Club Talent and Competition Landscape](https://ectcl.uefa.com/2024)

## Implementable owned model

Add finance data separately from sporting `level`; a strong team and a rich
team are related, but not the same property.

```ts
type FinancialBand = 1 | 2 | 3 | 4 | 5;

type ClubFinance = {
  financialBand: FinancialBand;
  financeSource: "goalbound";
  financeSeason: string;
};

type TierFinance = {
  squadValueProxy: number;
  hardMaxSingleFee: number;
};
```

Use these original multipliers:

| Financial band | Meaning | Multiplier |
| ---: | --- | ---: |
| 1 | Constrained / newly promoted | 0.45 |
| 2 | Small | 0.70 |
| 3 | Typical | 1.00 |
| 4 | Strong | 1.40 |
| 5 | Elite or exceptional | 2.20 |

Then calculate:

```ts
proxySquadValue =
  tier.squadValueProxy * FINANCIAL_MULTIPLIER[club.financialBand];

maxSingleFee = roundForTier(Math.min(
  tier.hardMaxSingleFee,
  0.10 * proxySquadValue * windowFactor * roleFactor,
));
```

- `windowFactor` is stable for the club and season, seeded in the range
  0.85–1.15. It creates lean and ambitious windows without rerolling on every
  offer.
- `roleFactor` uses information the engine already has: Prospect 0.75,
  Rotation 0.90, Starter 1.05, Star 1.20.
- Round first/second-tier fees to €50k and lower-tier fees to €10k. The current
  €50k rounding is too coarse when a club's whole plausible bid is €40k.
- A contracted-player offer is eligible only when the minimum plausible fee
  (`player.value * 0.92`) is at or below `maxSingleFee`. The accepted fee is
  still the current random 92–128% of player value, capped by
  `maxSingleFee`.
- Forced sales use the same affordability test. Free agents bypass the transfer
  fee test; a future wage ceiling should constrain them separately.

### English calibration

These are Goalbound design values, deliberately rounded rather than copied
Transfermarkt values:

| Tier | Neutral squad proxy | Existing hard ceiling retained |
| --- | ---: | ---: |
| Premier League | €450m | €175m |
| Championship | €80m | €25m |
| League One | €10m | €4m |
| League Two | €4m | €1.5m |
| National League | €1m | €500k |

Example maximum fees below assume a **Star** target and show the 0.85–1.15
window range:

| Example club profile | Band | Calculated range | Final result after ceiling |
| --- | ---: | ---: | ---: |
| Manchester City, Premier League elite | 5 | €101m–€137m | €101m–€137m |
| Brighton, Premier League typical | 3 | €46m–€62m | €46m–€62m |
| Hull City, Premier League constrained | 1 | €21m–€28m | €21m–€28m |
| Large Championship club | 5 | €18m–€24m | €18m–€24m |
| Typical Championship club | 3 | €8.2m–€11m | €8.2m–€11m |
| Leicester-sized League One outlier | 5 | €2.2m–€3m | €2.2m–€3m |
| Small League One club | 1 | €460k–€620k | €460k–€620k |
| Strong League Two club | 4 | €570k–€770k | €570k–€770k |
| Dorking-sized National League club | 1 | €50k–€60k | €50k–€60k |

That last row makes the reported €12m National League offer impossible by
roughly two orders of magnitude, even before the €500k absolute ceiling.

Use the same structure worldwide, with a `TierFinance` row per
country/division. Big-five top flights can start around €250m–€450m neutral
proxy; Portugal and the Netherlands around €80m–€140m; and Israel, Poland and
Cyprus around €10m–€30m. Those are initial game-balancing bands, not factual
financial claims, and should be tuned from simulated offer distributions.

## Covering the full catalog without copying a database

1. Hand-tune `financialBand` for the existing featured clubs. Their current
   `level` is a reasonable one-time seed, but the new field must remain
   independent afterward.
2. For the remaining complete-league clubs, seed bands from the previous
   season's official league finish: top 15% → band 4, next 30% → band 3, next
   35% → band 2, bottom 20% and promoted clubs → band 1. Band 5 is always an
   explicit editorial override.
3. Add explicit overrides for obvious financial outliers and fallen giants.
   Their current division's hard ceiling still wins, so a historic name in
   League One cannot spend like a Premier League club.
4. Store `financeSeason` and the official league-table URL used for seeding.
   Review only promoted/relegated clubs and overrides during the annual catalog
   refresh.
5. Add distribution tests per tier: no sampled bid exceeds its ceiling; at
   least one affordable lower-tier bid remains possible; and the median
   simulated maximum decreases monotonically down each pyramid.

Transfermarkt can remain a manual QA screen: compare a handful of elite,
typical and constrained clubs after each calibration. It should not become a
runtime dependency or a copied 388-row data source.
