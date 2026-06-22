import { test, expect } from '@playwright/test';

test.describe('Museum: Grundlegende Seitenstruktur', () => {
  test('Keine JS-Fehler beim Laden', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    expect(errors).toHaveLength(0);
  });

  test('39 Exponat-Karten werden gerendert', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    const cards = await page.locator('.exhibit-card').count();
    expect(cards).toBe(39);
  });

  test('5 Raum-Sections vorhanden', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.room');
    const rooms = await page.locator('.room').count();
    expect(rooms).toBe(5);
  });

  test('Lobby wird gerendert', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#lobby .lobby-title');
    const title = await page.locator('.lobby-title').textContent();
    expect(title).toContain('Philosophie');
  });

  test('Throughline zeigt 5 Buttons', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.throughline-btn');
    const btns = await page.locator('.throughline-btn').count();
    expect(btns).toBe(5);
  });
});

test.describe('Museum: Panel', () => {
  test('Klick auf Karte öffnet Panel', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.exhibit-card').first().click();
    await expect(page.locator('#exhibit-panel')).not.toHaveAttribute('hidden');
  });

  test('Panel zeigt Exponat-Name', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.exhibit-card').first().click();
    await expect(page.locator('.panel-name')).toBeVisible();
  });

  test('Panel-Close-Button schließt Panel', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.exhibit-card').first().click();
    await page.locator('#panel-close').click();
    await expect(page.locator('#exhibit-panel')).toHaveAttribute('hidden', '');
  });

  test('ESC schließt Panel', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.exhibit-card').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#exhibit-panel')).toHaveAttribute('hidden', '');
  });

  test('Overlay-Klick schließt Panel', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.exhibit-card').first().click();
    await page.locator('#panel-overlay').click();
    await expect(page.locator('#exhibit-panel')).toHaveAttribute('hidden', '');
  });
});

test.describe('Museum: Strang-Filter', () => {
  test('Filter "Philosophie" zeigt nur Philosophie-Karten', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('#strand-filter .filter-btn[data-strand="philosophie"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-strand-filter', 'philosophie');
    // Wait for CSS opacity transition (300ms) to complete
    await page.waitForFunction(() =>
      parseFloat(getComputedStyle(
        document.querySelector('.exhibit-card[data-strand="religion"]')
      ).opacity) < 0.5
    );
    const philoCount = await page.locator('.exhibit-card[data-strand="philosophie"]').count();
    expect(philoCount).toBeGreaterThan(0);
  });

  test('Filter "Alle" zeigt alle Karten', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('#strand-filter .filter-btn[data-strand="philosophie"]').click();
    await page.locator('#strand-filter .filter-btn[data-strand="alle"]').click();
    await expect(page.locator('body')).not.toHaveAttribute('data-strand-filter');
    const all = await page.locator('.exhibit-card').count();
    expect(all).toBe(39);
  });
});

test.describe('Museum: Deep Link', () => {
  test('URL-Hash öffnet Panel direkt', async ({ page }) => {
    await page.goto('/index.html#pythagoras');
    await page.waitForTimeout(800);
    await expect(page.locator('#exhibit-panel')).not.toHaveAttribute('hidden');
  });
});

test.describe('Museum: Tastatur-Navigation', () => {
  test('Enter auf Karte öffnet Panel', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.exhibit-card').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#exhibit-panel')).not.toHaveAttribute('hidden');
  });

  test('Space auf Karte öffnet Panel', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.exhibit-card').first().focus();
    await page.keyboard.press(' ');
    await expect(page.locator('#exhibit-panel')).not.toHaveAttribute('hidden');
  });
});

test.describe('Museum: Canvas Einflussgraph', () => {
  test('Canvas-Element vorhanden', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#graph-canvas')).toBeVisible();
  });

  test('Canvas hat Breite > 0', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#graph-canvas');
    const width = await page.locator('#graph-canvas').evaluate(el => el.offsetWidth);
    expect(width).toBeGreaterThan(100);
  });
});

test.describe('Museum: Rundgang', () => {
  test('Tour-Button vorhanden', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#tour-btn')).toBeVisible();
  });

  test('Klick auf Tour-Button startet Rundgang', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('#tour-btn').click();
    await expect(page.locator('#tour-bar')).not.toHaveAttribute('hidden');
  });

  test('Stop beendet Rundgang', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('#tour-btn').click();
    await page.waitForTimeout(500);
    await page.locator('#tour-stop').click();
    await expect(page.locator('#tour-bar')).toHaveAttribute('hidden', '');
  });
});

test.describe('Museum: Responsiv', () => {
  test('Mobile: Karten werden gestapelt dargestellt', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    const cards = await page.locator('.exhibit-card').count();
    expect(cards).toBe(39);
  });

  test('Mobile: Einflussgraph wird zur Liste, kein Overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    // Liste sichtbar, Canvas versteckt
    await expect(page.locator('#influence-list')).toBeVisible();
    const canvasVisible = await page.locator('#graph-canvas').isVisible();
    expect(canvasVisible).toBe(false);
    // alle 39 Exponate in der Liste
    const cards = await page.locator('.infl-card').count();
    expect(cards).toBe(39);
    // kein horizontales Overflow
    const noOverflow = await page.locator('body').evaluate(el => el.scrollWidth <= el.clientWidth);
    expect(noOverflow).toBe(true);
    // Chip-Klick öffnet Panel
    await page.locator('.infl-chip').first().click();
    await expect(page.locator('#exhibit-panel')).toBeVisible();
  });
});
