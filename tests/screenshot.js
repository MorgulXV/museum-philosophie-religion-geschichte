// Screenshot harness — captures desktop + mobile views of the museum.
// Usage: node tests/screenshot.js <label>
// Requires a server on http://localhost:8000 (python3 -m http.server 8000).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const label = process.argv[2] || 'shot';
const BASE = 'http://localhost:8000/index.html';
const OUT = 'tests/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function shot(name, viewport, actions) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200); // let canvas intro settle
  if (actions) await actions(page);
  await page.screenshot({ path: `${OUT}/${label}-${name}.png`, fullPage: true });
  if (errors.length) console.log(`  [${name}] console errors:\n   ` + errors.join('\n   '));
  else console.log(`  [${name}] clean`);
  await ctx.close();
}

await shot('desktop', { width: 1440, height: 900 });
await shot('mobile', { width: 375, height: 812 });
// Graph region close-up on desktop
await shot('graph', { width: 1440, height: 900 }, async (page) => {
  await page.locator('#influence-map').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
});

await browser.close();
console.log(`Done → ${OUT}/${label}-*.png`);
