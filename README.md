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
  GoalboundGame.tsx          React state and career-flow orchestration
  domain.ts                  Shared career types and default save state
  catalog.ts                 Countries, clubs, positions, and scenarios
  engine.ts                  Career simulation and decision rules
  storage.ts                 Device-local save adapter
  career.css                 Goalbound feature styles
  components/
    HomeScreen.tsx
    SetupScreen.tsx
    CareerScreen.tsx
    SummaryScreen.tsx
    ClubBadge.tsx
tests/
  rendered-html.test.mjs     Render and module-shape checks
```

## Module seams

The career engine is the main behavioural module. Its interface exposes:

- `createCareer`
- `simulateSeason`
- `nextBeat`
- `ordinaryDecision`
- `resolveScenario`
- `achievements`

Football content can be edited in `catalog.ts` without touching the rules.
Rendering can change inside `components/` without touching the simulation.
Browser persistence is isolated in `storage.ts`.

## Development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
npm test
npm run lint
```

The production build is generated with `npm run build`.
