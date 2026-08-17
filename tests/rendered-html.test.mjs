import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Goalbound career simulator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Goalbound — Your Football Career<\/title>/i);
  assert.match(html, /A career, not a transfer tour/);
  assert.match(html, /Every represented division is complete/);
  assert.match(html, /1061(?:<!-- -->)? real clubs/);
  assert.match(html, /aria-label="59 playable nations"/);
  assert.match(html, /title="Israel"/);
  assert.match(html, /title="Poland"/);
  assert.match(html, /title="Cyprus"/);
  assert.match(html, /title="Hungary"/);
  assert.match(html, /title="Albania"/);
  assert.match(html, /title="San Marino"/);
  assert.match(html, /Draw my starting route|Start your career/);
  assert.match(html, /Trophy room/);
  assert.match(html, /data-styled(?:-version)?=/);
  assert.match(html, /\.site-shell\{/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("keeps career rules, content, persistence, and rendering behind clear modules", async () => {
  const [page, engine, domain, storage, game, careerScreen, layout, packageJson, catalog, leagueCatalog, honours, trophyRoom] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../features/career/engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/domain.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/storage.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/GoalboundGame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../features/career/components/CareerScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../features/career/catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/leagueCatalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/honours.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/trophyRoom.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<GoalboundGame \/>/);
  assert.ok(page.split("\n").length < 10);
  assert.match(domain, /type Origin = "academy" \| "senior" \| "gem"/);
  assert.match(domain, /contractYears: number/);
  assert.match(domain, /division\?: number/);
  assert.match(engine, /function createCareerEngine/);
  assert.match(engine, /function simulateSeason/);
  assert.match(engine, /function requestTransfer/);
  assert.match(engine, /current\?\.country === "ISR"/);
  assert.match(engine, /forced-sale/);
  assert.match(engine, /Transfer bids have arrived while you are under contract/);
  assert.match(engine, /Accepted transfer bid/);
  assert.match(engine, /Renew contract/);
  assert.match(storage, /goalbound-career-v3/);
  assert.match(storage, /goalbound-trophy-room-v1/);
  assert.match(honours, /function simulateHonours/);
  assert.match(trophyRoom, /function mergeCareerSnapshot/);
  assert.match(game, /motion-screen/);
  assert.match(careerScreen, /decisionDockRef\.current\?\.scrollIntoView/);
  assert.match(careerScreen, /prefers-reduced-motion: reduce/);
  assert.match(careerScreen, /Request a transfer/);
  assert.match(careerScreen, /Review representation/);
  assert.match(careerScreen, /Available agents/);
  assert.match(layout, /Goalbound — Your Football Career/);
  assert.match(packageJson, /"build": "WRANGLER_LOG_PATH=/);
  const extraCountries = catalog.slice(catalog.indexOf("EXTRA_COUNTRIES"), catalog.indexOf("export const COUNTRIES"));
  assert.match(catalog, /export const START_COUNTRIES = COUNTRIES/);
  assert.match(extraCountries, /name: "Israel", flag: "🇮🇱"/);
  assert.match(extraCountries, /name: "Poland", flag: "🇵🇱"/);
  assert.match(extraCountries, /name: "Cyprus", flag: "🇨🇾"/);
  assert.match(leagueCatalog, /Premier League/);
  assert.match(leagueCatalog, /National League/);
  assert.match(leagueCatalog, /Maccabi Tel Aviv/);
  assert.match(leagueCatalog, /Legia Warszawa/);
  assert.match(leagueCatalog, /APOEL/);
  assert.doesNotMatch(game, /SkeletonPreview/);
});
