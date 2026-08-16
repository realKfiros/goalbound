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
  assert.match(html, /Top clubs, smaller clubs and second-tier pathways/);
  assert.match(html, /Draw my starting route|Start your career/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("keeps career rules, content, persistence, and rendering behind clear modules", async () => {
  const [page, engine, domain, storage, game, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../features/career/engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/domain.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/storage.ts", import.meta.url), "utf8"),
    readFile(new URL("../features/career/GoalboundGame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<GoalboundGame \/>/);
  assert.ok(page.split("\n").length < 10);
  assert.match(domain, /type Origin = "academy" \| "senior" \| "gem"/);
  assert.match(domain, /contractYears: number/);
  assert.match(engine, /function createCareerEngine/);
  assert.match(engine, /function simulateSeason/);
  assert.match(engine, /forced-sale/);
  assert.match(engine, /Transfer bids have arrived while you are under contract/);
  assert.match(engine, /Accepted transfer bid/);
  assert.match(engine, /Renew contract/);
  assert.match(storage, /goalbound-career-v3/);
  assert.match(game, /motion-screen/);
  assert.match(layout, /Goalbound — Your Football Career/);
  assert.match(packageJson, /"build": "WRANGLER_LOG_PATH=/);
  assert.doesNotMatch(game, /SkeletonPreview/);
});
