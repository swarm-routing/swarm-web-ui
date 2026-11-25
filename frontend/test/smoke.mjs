// Copyright (c) 2026 Daniel Joppi (https://github.com/swarm-routing)
// SPDX-License-Identifier: MIT OR GPL-2.0-only
//
// Browser smoke + axe on the production build, as the Colony Arena site's
// test/hub-smoke.mjs runs them: serve DIR over HTTP, open it in headless
// Chromium, fail on a console error, an uncaught exception or a serious or
// critical axe-core violation. With no daemon, /api/health is a 404, so this
// checks the replay-only shell (ADR-0002 item 5).
//
// Usage: node test/smoke.mjs DIR
// Env:   CHROMIUM=/path/to/chrome (default: Playwright's own)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const dir = path.resolve(process.argv[2] ?? 'dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(dir, rel.endsWith('/') ? rel + 'index.html' : rel);
  if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${server.address().port}/`;

let failed = 0;
const fail = (m) => {
  failed++;
  console.error(`FAIL: ${m}`);
};

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => fail(`uncaught: ${e.message}`));
  const health = new URL('api/health', url).href;
  page.on('console', (m) => {
    // only the 404 of /api/health is expected (the "no daemon" answer); every other error fails
    const expected = m.location().url === health && /status of 404/.test(m.text());
    if (m.type() === 'error' && !expected) fail(`console: ${m.text()} (${m.location().url})`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url() !== health) fail(`HTTP ${r.status()}: ${r.url()}`);
  });
  await page.goto(url);
  await page.getByText('Offline replay: no daemon.').waitFor({ timeout: 10000 });
  await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => await window.axe.run(document, { resultTypes: ['violations'] }));
  for (const v of r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')) {
    fail(`axe ${v.impact} ${v.id}: ${v.help} [${v.nodes.map((n) => n.target.join(' ')).join(', ')}]`);
  }
  if (!failed) console.log(`ok: ${url} — replay shell rendered, axe clean, no errors`);
} finally {
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
