import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("server-renders the doctoral roadmap", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Robot Citizens · Doctoral Research Roadmap<\/title>/i);
  assert.match(html, /Social roles of object-based urban AI robots/);
  assert.match(html, /Research journey, week by week/);
  assert.match(html, /DIS 2027 Work in Progress \+ Doctoral Consortium/);
  assert.match(html, /Annual Progression 1/);
  assert.match(html, /http:\/\/localhost(?::3000)?\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
});

test("keeps editing, detail and print interactions in the product source", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /window\.localStorage/);
  assert.match(page, /window\.print\(\)/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /2026\/27/);
  assert.match(page, /2027\/28/);
  assert.match(page, /2028\/29/);
  assert.match(page, /PhD thesis submission/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
