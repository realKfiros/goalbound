# Goalbound

Goalbound is a browser-based worldwide football career simulator. Players begin
in an academy, a smaller senior side, or as a rare gem, then navigate seasons,
contracts, transfers, injuries, club decisions, and off-pitch scenarios.

## Project structure

```text
app/
  layout.tsx                 Site metadata and root layout
  page.tsx                   Thin route entry point
features/career/
  GoalboundGame.tsx          MobX-observed React application shell
  CareerStore.ts             Observable state, actions, and persistence reactions
  domain.ts                  Shared career types and default save state
  catalog.ts                 Countries, featured club details, and scenarios
  leagueCatalog.ts           Complete researched league membership
  europeanTopFlights.ts      Remaining UEFA top-flight memberships
  competitionFormats.ts      Domestic title, playoff, and pyramid rules
  uefaSeason.ts              UEFA access lists, qualifiers, and league phases
  world.ts                   Persistent club strength and competition simulation
  honours.ts                 Domestic, continental, and individual awards
  engine.ts                  Career simulation and decision rules
  storage.ts                 Device-local save adapter
  styles.ts                  Goalbound styled-components global styles
  components/
    HomeScreen.tsx
    SetupScreen.tsx
    CareerScreen.tsx
    SummaryScreen.tsx
    ClubBadge.tsx
tests/
  rendered-html.test.mjs     Render and module-shape checks
  transfer-market.test.mjs   Deterministic offer-realism regression checks
  world.test.mjs             Competition, pyramid, and UEFA format checks
  honours.test.mjs           Awards and trophy-room checks
```

## Module seams

The career engine is the main behavioural module. Its interface exposes:

- `createCareer`
- `simulateSeason`
- `nextBeat`
- `ordinaryDecision`
- `resolveScenario`
- `achievements`

Football content can be edited in `catalog.ts`, `leagueCatalog.ts`, and
`europeanTopFlights.ts` without touching the rules. Complete league membership
is kept apart from hand-tuned club identities so season updates do not disturb
the career engine. Domestic rules live in `competitionFormats.ts`; UEFA access
and tournament formats live in `uefaSeason.ts`.
Rendering can change inside `components/` without touching the simulation.
`CareerStore.ts` owns application state and coordinates browser persistence
through the adapters isolated in `storage.ts`.

## Development

```bash
bun install
bun run dev
bun test
bun run lint
```

The production build is generated with `bun run build`.
