# Goalbound trophy collection and club-badge source research

Research date: 2026-08-16. Legionnaire observations refer to the public build and its first-party assets available on that date. This is product and implementation research, not legal advice.

## Executive recommendation

1. Reframe Goalbound's trophy room as a **global collectible collection**, not a stack of career-save summaries. The primary screen should show every available honour and every club, including locked entries, with distinct-item progress, duplicate counts and a “mine only” filter. A per-career ledger can remain as secondary detail.
2. Use two top-level tabs: **Honours** and **Club album**. Honours splits into team trophies and individual awards. The club album groups the full catalog by country and division and shows each badge, club name, seasons represented and a long-service/legend marker.
3. Add “new unlock” feedback at the moment a trophy or club is first collected, then repeat it on the career summary. Keep Goalbound's stated all-save persistence; do not copy Legionnaire's completed-career-only merge rule.
4. For badge metadata, **API-Football is the best technical fit** for the current worldwide catalog: its team endpoint returns persistent team IDs and logo URLs, every plan exposes the endpoints, the free tier has 100 requests/day, and the provider explicitly recommends downloading logos once and serving them from your own storage. Its API terms also explicitly say that it does not own those images or grant their intellectual-property rights, so this solves discovery and delivery—not badge licensing. [API-Football integration guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide), [pricing](https://www.api-football.com/pricing), [terms](https://api-sports.io/terms)
5. Implement a cached badge manifest with a generated Goalbound fallback. Provider-sourced images should be independently switchable by club and carry a rights record; the fallback must remain available when an image is absent, stale, disputed or not cleared.

## 1. What Legionnaire's collection actually is

The useful reference is broader than a trophy cabinet. Legionnaire presents one cross-career collection with two parallel collectible sets: honours and clubs. Entry points exist on the home screen and the retirement summary, and the collection has its own back and share actions. This is observable in the live app and its first-party bundle. [Legionnaire live app](https://www.legionnaire.xyz/), [published JavaScript](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js)

### Information architecture

- **Collection-level, not save-level.** The first view is an aggregate catalog. It does not begin with a list of player careers.
- **Two tabs.** One tab is the honours cabinet; the other is the club album.
- **Honours have two sections.** Team competitions are separated from individual awards. Each section carries a progress meter expressed as distinct collected items over total available items.
- **The complete catalog stays visible.** Uncollected honours remain in the grid as muted, grayscale cards. Collected honours use full-colour art; repeated wins display a multiplier rather than creating long duplicate rows.
- **The club album is completion-oriented.** It lists all clubs, grouped by division, with a collected/available count for each group. Collected clubs are sorted ahead of uncollected clubs. A club card records seasons played, not merely whether it was visited.
- **Long service becomes a special collectible state.** In the inspected build, six or more seasons plus at least one team trophy marks a club as a legend club and adds a crown marker.
- **The player can reduce clutter.** A pill-style toggle switches between the full catalog and collected items only.
- **Sharing is part of the page's purpose.** The collection can render a share image containing completion totals, trophy sections and collected club marks.

These structures and state rules are defined directly in the first-party collection component, collection merge logic and share renderer. [Legionnaire published JavaScript](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js)

### Visual system

The screen is compact and album-like: a centered column capped at 960px, short section gaps, responsive auto-fill grids, small collectible cards, roughly 44px trophy art and 40px club marks. Active controls use a bright green accent; locked items use reduced opacity plus grayscale/brightness treatment. Progress is shown with a thin bar and a numeric fraction. These are implementation measurements from the published stylesheet, not approximations from screenshots. [Legionnaire published CSS](https://www.legionnaire.xyz/assets/index-DKLvA82Y.css)

The individual cards are intentionally information-light: image, name, and either count or seasons. More detail appears on demand through small tooltips in the in-career accolade row. Repeated items can collapse into a counted or visually stacked representation. [Legionnaire published JavaScript](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js)

### Interaction sequence

1. The player opens the collection from home or the end-of-career summary.
2. The honours tab opens first, showing team and individual sections with distinct-item progress.
3. The player optionally enables the collected-only filter.
4. Switching to the club tab reveals division groups, group progress, badges, seasons and any legend marker.
5. During a career, newly encountered trophy and club identifiers are detected against the permanent collection and surfaced as new unlocks.
6. At retirement, the career is merged once using its seed as an idempotency key, so revisiting the summary does not duplicate the collection.
7. The player can export a social image summarizing collection progress.

The sequence, unlock detection, local-storage schema and seed-based merge are visible in Legionnaire's first-party bundle. [Legionnaire published JavaScript](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js)

### Tone

The collection UI is mostly functional and restrained. Small emoji markers make the two tabs instantly legible, empty states are short and mildly self-deprecating, and the screen treats completion as the joke rather than covering every trophy in celebratory copy. This is an inference from the live interface and published UI strings. [Legionnaire live app](https://www.legionnaire.xyz/), [published JavaScript](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js)

## 2. Goalbound target design

### Primary screen

Use a compact header with Back, Share collection, and a short title. Follow it with two equal-width tabs and one collected-only filter. Do not put four large KPI tiles or career-save cards before the collectibles; progress belongs beside each collection section.

#### Honours tab

- Section 1: Team trophies.
  - One collectible identity for every division title.
  - One collectible identity for every national cup.
  - Reserve the taxonomy for continental trophies when those enter the simulation.
- Section 2: Individual awards.
  - One Golden Boot collectible for every division.
  - One Player of the Season collectible for every division.
  - One global Ballon d'Or collectible.
- Show all possible items. Locked cards use a neutral silhouette or subdued trophy artwork; unlocked cards use their competition artwork and `×N` across all saves.
- Progress counts **distinct collectible identities**, not the sum of repeat wins.
- Selecting or focusing a collected item should reveal its career occurrences: season, player, club and save.

Stable identity should not depend on display text. Add `competitionId` and derive keys such as `team:league:ENG:premier-league`, `team:cup:ENG`, `individual:golden-boot:ENG:premier-league`, and `individual:ballon-dor:world`.

#### Club album tab

- Render the entire Goalbound club catalog, grouped first by country and then division.
- Each item shows badge, club name, total seasons across all saves and a collected state.
- Sort collected clubs before locked clubs while preserving alphabetical order within each state.
- Show progress per group and overall.
- Add a legend marker using a transparent, Goalbound-owned rule; six seasons plus a team trophy is a sensible reference point, but it should be independently configurable.
- Selecting a club should show the careers played there and the honours won there.

#### Unlock feedback

When a season first adds a collectible identity or first represents a club, show a small two-tab “new collection items” panel after the result animation. Repeat those unlocks in the final career summary. This gives the collection relevance during play instead of making it a detached archive.

### Persistence semantics

Keep Goalbound's all-save, on-device collection behavior. Merge every active save snapshot idempotently by `careerId`, and archive completed saves without deleting them. Compute the aggregate collection from career records so a future migration or repaired save can rebuild counts. Legionnaire only permanently merges retired careers in the inspected build; that behavior should not be copied because the Goalbound requirement explicitly covers all saves. Legionnaire's retired-career merge behavior is visible in its first-party storage code. [Legionnaire published JavaScript](https://www.legionnaire.xyz/assets/index-RDmLrW8M.js)

Recommended collection projection:

```ts
type CollectionProjection = {
  honours: Record<CollectibleId, {
    count: number;
    occurrences: Array<{
      careerId: string;
      playerName: string;
      clubId: string;
      season: string;
    }>;
  }>;
  clubs: Record<ClubId, {
    seasons: number;
    careerIds: string[];
    teamTrophies: number;
    legend: boolean;
  }>;
};
```

### Copy direction

Prefer terse labels: “Team trophies”, “Individual awards”, “Club album”, “Mine only”, “New in your collection”. Keep humour for empty states and tooltips, one sentence at most. The collection should feel like a sticker album designed by a football obsessive, not an awards-ceremony landing page.

## 3. Club-badge API comparison

An API can identify a club and return an image URL. It does not automatically grant the copyright or trademark rights in that crest. Every evaluated provider says this directly or requires owner permission for third-party marks. [API-SPORTS terms](https://api-sports.io/terms), [football-data.org terms](https://www.football-data.org/about), [Sportmonks terms](https://www.sportmonks.com/terms-of-service/), [TheSportsDB terms](https://www.thesportsdb.com/docs_terms_of_use.php)

| Provider | Technical fit for 429 clubs | Remote image behavior | Cost/limits relevant to import | Rights and attribution | Verdict |
|---|---|---|---|---|---|
| **API-Football / API-SPORTS** | `/teams` supports league+season, ID, country and name-search filters; team IDs are documented as persistent across competitions and seasons, and responses include a logo URL. The provider advertises 1,200+ competitions. [Guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide) | Logo URLs are returned from a media CDN. The provider explicitly says not to fetch them on every render: download once, cache, and serve from your own storage because the CDN has rate limits. [Guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide) | Free: 100 requests/day; Pro: $19/month and 7,500/day. Every plan includes all endpoints and competitions, while the free plan has reduced season depth. [Pricing](https://www.api-football.com/pricing) | Logo delivery is free and outside API quota, but the terms say the provider does not own the assets, grants no IP rights, and the user may need authorization from clubs/leagues/federations. [Terms](https://api-sports.io/terms) | **Best metadata/import choice.** One-off ingestion is affordable and provider guidance matches a static app asset pipeline. It is not a rights clearance service. |
| **TheSportsDB** | Team lookup/list responses expose badge artwork, and the official tutorial demonstrates using `strBadge`. Free list-team responses are limited to 10 items; premium raises that to 3,000. [Tutorial](https://www.thesportsdb.com/docs_api_examples), [documentation](https://www.thesportsdb.com/documentation) | The tutorial demonstrates using the returned badge URL, but the terms do not promise durable production hotlinking. Caching is safer operationally. [Tutorial](https://www.thesportsdb.com/docs_api_examples), [terms](https://www.thesportsdb.com/docs_terms_of_use.php) | Free API: 30 requests/minute; premium is €9/month and raises many result limits. [Documentation](https://www.thesportsdb.com/documentation), [examples/pricing link](https://www.thesportsdb.com/docs_api_examples) | Paid users may develop apps/services and use provider-created artwork with source mention, but third-party content requires owner permission or another lawful basis; trademark notices may not be altered. [Terms](https://www.thesportsdb.com/docs_terms_of_use.php) | Good low-cost fallback for missing matches. Crowdsourced naming and partial free responses make reconciliation less deterministic than API-Football. It still does not clear club crests. |
| **football-data.org** | The v4 Team resource includes a `crest` URL and stable team fields. The free tier covers 12 competitions, including many top flights but not the full lower-tier/worldwide Goalbound catalog. [Team resource](https://docs.football-data.org/general/v4/team.html), [coverage](https://www.football-data.org/coverage) | A crest URL is returned, but no durable hotlink permission is stated in the reviewed documentation. [Team resource](https://docs.football-data.org/general/v4/team.html) | Free: 12 competitions and 10 calls/minute; Standard: 30 competitions at €49/month. [Pricing](https://www.football-data.org/pricing) | Visible attribution is required. Its terms explicitly say team logos remain copyrighted by their legal owners and that the customer must obtain consent and arrange proof of IP. [FAQ](https://www.football-data.org/documentation/faq), [terms](https://www.football-data.org/about) | Excellent for top-league metadata, but a poor catalog-wide badge source here because coverage and rights constraints remain. |
| **Sportmonks** | The Teams endpoint returns an `image_path`; commercial plans include core team information and logos. Its plans are chosen by league count. [Teams endpoint](https://docs.sportmonks.com/v3/endpoints-and-entities/endpoints/teams/get-all-teams), [pricing](https://www.sportmonks.com/football-api/plans-pricing/) | CDN URLs are supplied, but the reviewed terms do not grant a general right to hotlink them. [Teams endpoint](https://docs.sportmonks.com/v3/endpoints-and-entities/endpoints/teams/get-all-teams), [terms](https://www.sportmonks.com/terms-of-service/) | Starter: 5 leagues from €29/month; Growth: 30 leagues from €99/month; Pro: 120 leagues from €249/month. [Pricing](https://www.sportmonks.com/football-api/plans-pricing/) | The terms state that logos and photos are owned by their legal owners and that the app publisher must arrange proof of permission. [Terms](https://www.sportmonks.com/terms-of-service/) | Strong data product, but excessive for a static badge import and no better on crest rights. |
| **Wikidata + Wikimedia Commons** | Wikidata is useful for CC0 identity/alias mapping. Commons can supplement images only when an individual file's license and provenance are suitable. [Wikidata licensing](https://www.wikidata.org/wiki/Wikidata%3ALicensing), [Commons reuse guide](https://commons.wikimedia.org/wiki/Commons%3AReusing_content_outside_Wikimedia/en) | Commons permits hotlinking but recommends downloading; licensing and attribution still apply, and hotlinked files can be changed, renamed or deleted. [Commons technical reuse guide](https://commons.wikimedia.org/wiki/Commons%3AReusing_content_outside_Wikimedia/technical) | No commercial API subscription is required for the structured data; every media file must be assessed individually. [Wikidata data access](https://www.wikidata.org/wiki/Help%3AData_access), [Commons reuse guide](https://commons.wikimedia.org/wiki/Commons%3AReusing_content_outside_Wikimedia/en) | Each file has its own license requirements, and Commons warns that trademarks and other non-copyright restrictions may still apply. [Commons reuse guide](https://commons.wikimedia.org/wiki/Commons%3AReusing_content_outside_Wikimedia/en) | Useful rights-aware supplement, not a complete automated badge source. |

### Hotlinking conclusion

- **Do not make runtime UI rendering depend on third-party badge URLs.** API-Football explicitly recommends local caching because its media CDN is throttled. [API-Football guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide)
- TheSportsDB demonstrates a returned badge URL, football-data.org returns `crest`, and Sportmonks returns `image_path`, but none of their reviewed terms turns transport access into ownership of the club mark. [TheSportsDB tutorial](https://www.thesportsdb.com/docs_api_examples), [football-data.org Team resource](https://docs.football-data.org/general/v4/team.html), [Sportmonks Teams endpoint](https://docs.sportmonks.com/v3/endpoints-and-entities/endpoints/teams/get-all-teams)
- Wikimedia Commons explicitly allows hotlinking subject to the individual file license, but recommends downloading because files can move or change. [Commons technical reuse guide](https://commons.wikimedia.org/wiki/Commons%3AReusing_content_outside_Wikimedia/technical)

## 4. Concrete implementation path

### Phase A — collection UX

1. Replace the career-card-first trophy room with the two-tab aggregate collection.
2. Define the complete honour catalog from Goalbound's league and cup catalog, with stable `competitionId` values.
3. Project existing all-save career data into honour counts, occurrences and club-season counts.
4. Render locked and unlocked collectible cards, section/group progress, duplicates and the mine-only filter.
5. Add club details, honour occurrence details, first-unlock feedback and a shareable collection image.
6. Preserve an optional Careers view for players who want the existing chronological archive.

### Phase B — badge ingestion

1. Register an API-Football account and keep the key in a server/build environment only. The provider's guide uses a request header for authentication and advises storing stable team IDs. [API-Football guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide)
2. Maintain a checked-in club mapping file:

```ts
type ClubBadgeRecord = {
  clubId: string;
  provider: "api-football" | "thesportsdb" | "wikimedia" | "manual";
  providerTeamId: string;
  sourceUrl: string;
  localAssetPath: string | null;
  matchedName: string;
  matchStatus: "automatic" | "reviewed" | "unmatched";
  rightsStatus: "unknown" | "provider-only" | "cleared" | "disabled";
  rightsOwner?: string;
  permissionUrl?: string;
  attribution?: string;
  lastVerifiedAt: string;
};
```

3. Query `/teams?league={id}&season={year}` once per catalog league, then fall back to country or name search for unmatched clubs. API-Football documents all of these filters and persistent team IDs. [API-Football guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide)
4. Normalize punctuation and common suffixes for candidate generation, but require manual confirmation when more than one provider team matches. Reserve/provider B teams must never be silently merged with their parent clubs.
5. Download confirmed files into Goalbound-controlled storage and refresh them on an explicit import schedule, not during page rendering. This follows API-Football's own CDN guidance. [API-Football guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide)
6. Render through one `ClubBadge` adapter: cleared local image → allowed provider image → existing generated monogram. Log failures without breaking the career flow.
7. Put provider attribution in an About/Data sources screen where required, and preserve per-asset attribution in the manifest.

### Phase C — permission gate

Before public display, obtain written confirmation for the intended use from the relevant mark owner or record the legal basis selected for that club. API access alone is insufficient: API-SPORTS says it owns none of the delivered visual assets; football-data.org and Sportmonks explicitly require owner consent/proof; TheSportsDB prohibits third-party use without permission or another lawful basis. [API-SPORTS terms](https://api-sports.io/terms), [football-data.org terms](https://www.football-data.org/about), [Sportmonks terms](https://www.sportmonks.com/terms-of-service/), [TheSportsDB terms](https://www.thesportsdb.com/docs_terms_of_use.php)

If Goalbound chooses to ship before that review is complete, keep the existing original monogram badges in the public build and use real crests only behind a non-production feature flag. That is the only implementation path here that separates the useful API integration from an unsupported assumption about trademark permission.

## 5. Acceptance criteria

- The default collection view is an aggregate collectible grid, not a career list.
- Team trophies and individual awards have separate distinct-item progress.
- Every defined honour and all catalog clubs have a locked/unlocked representation.
- Repeated honours show `×N`; club cards show total seasons across saves.
- Club album groups by country/division and displays badge or deterministic fallback.
- New trophy and club unlocks appear immediately after the relevant career result.
- Reopening or replaying a save cannot duplicate occurrences.
- No page render requires a badge-provider API call.
- Every real badge has provider provenance and a rights status.
- Missing, failed or disabled real badges fall back cleanly without layout shift.

