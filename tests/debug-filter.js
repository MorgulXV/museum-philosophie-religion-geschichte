import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8000/index.html');
await page.waitForSelector('.exhibit-card');
await page.locator('#strand-filter .filter-btn[data-strand="philosophie"]').click();
await page.waitForTimeout(300);
const result = await page.locator('.exhibit-card[data-strand="religion"]').first().evaluate(el => ({
  opacity: getComputedStyle(el).opacity,
  bodyAttr: document.body.getAttribute('data-strand-filter'),
  hasDataStrand: el.hasAttribute('data-strand'),
  dataStrand: el.getAttribute('data-strand'),
}));
console.log(JSON.stringify(result, null, 2));
await browser.close();
