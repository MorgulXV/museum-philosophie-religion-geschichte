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

test.describe('Museum: Graph-Suche', () => {
  test('Tippen zeigt Treffer und Enter öffnet das Exponat', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#graph-canvas');
    await page.locator('#graph-search').fill('nietz');
    await expect(page.locator('#graph-search-results')).toBeVisible();
    await expect(page.locator('#graph-search-results li').first()).toContainText('Nietzsche');
    await page.locator('#graph-search').press('Enter');
    await expect(page.locator('#exhibit-panel')).not.toHaveAttribute('hidden');
    await expect(page.locator('.panel-name')).toContainText('Nietzsche');
  });

  test('Kein Treffer zeigt Hinweis', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#graph-canvas');
    await page.locator('#graph-search').fill('zzzzz');
    await expect(page.locator('.search-empty')).toBeVisible();
  });
});

test.describe('Museum: Ansicht & Zoom', () => {
  test('Graph/Liste-Umschalter wechselt die Ansicht', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#graph-canvas');
    await page.locator('#view-list').click();
    await expect(page.locator('#influence-list')).toBeVisible();
    await expect(page.locator('.graph-stage')).toBeHidden();
    await page.locator('#view-graph').click();
    await expect(page.locator('.graph-stage')).toBeVisible();
    await expect(page.locator('#influence-list')).toBeHidden();
  });

  test('Tab verlässt den Canvas (kein Tastatur-Trap, WCAG 2.1.2)', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#graph-canvas');
    await page.locator('#graph-canvas').focus();
    await expect(page.locator('#graph-canvas')).toBeFocused();
    await page.keyboard.press('Tab');
    const leftCanvas = await page.evaluate(() => document.activeElement?.id !== 'graph-canvas');
    expect(leftCanvas).toBe(true);
  });

  test('Zoom- und Reset-Buttons sind vorhanden und reagieren', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/index.html');
    await page.waitForSelector('#graph-canvas');
    await page.locator('#zoom-in').click();
    await page.locator('#zoom-out').click();
    await page.locator('#zoom-reset').click();
    expect(errors).toHaveLength(0);
  });
});

test.describe('Museum: Onboarding-Hinweis', () => {
  test('Hinweiskarte erscheint beim Graphen und lässt sich schließen', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#graph-canvas');
    await page.locator('#influence-map').scrollIntoViewIfNeeded();
    await expect(page.locator('#graph-hintcard')).toBeVisible();
    await page.locator('.hintcard-close').click();
    await expect(page.locator('#graph-hintcard')).toBeHidden();
    // ? button öffnet erneut
    await page.locator('#graph-help').click();
    await expect(page.locator('#graph-hintcard')).toBeVisible();
  });
});

test.describe('Museum: Filter-Feinschliff', () => {
  test('Filter zeigt aktive Anzahl an', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await expect(page.locator('#filter-count')).toContainText('39 Exponate');
    await page.locator('#strand-filter .filter-btn[data-strand="philosophie"]').click();
    await expect(page.locator('#filter-count')).toContainText('Philosophie — 18');
  });

  test('Legenden-Punkte filtern den Graphen', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('.legend-key[data-strand="religion"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-strand-filter', 'religion');
    // erneuter Klick hebt den Filter auf
    await page.locator('.legend-key[data-strand="religion"]').click();
    await expect(page.locator('body')).not.toHaveAttribute('data-strand-filter');
  });
});

test.describe('Museum: Rundgang-Tiefe', () => {
  test('Vor und zurück mit den Pfeiltasten', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('#tour-btn').click();
    await expect(page.locator('#tour-label')).toContainText('Station 1 / 39');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tour-label')).toContainText('Station 2 / 39');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#tour-label')).toContainText('Station 1 / 39');
    // Zurück-Button ist an Station 1 deaktiviert
    await expect(page.locator('#tour-prev')).toBeDisabled();
  });

  test('Letzte Station zeigt die Abschlusskarte', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.exhibit-card');
    await page.locator('#tour-btn').click();
    await expect(page.locator('#tour-label')).toContainText('Station 1 / 39');
    for (let i = 0; i < 39; i++) await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tour-end')).toBeVisible();
    await expect(page.locator('.tour-end-quote')).toContainText('Das Gespräch geht weiter');
    await expect(page.locator('#exhibit-panel')).toHaveAttribute('hidden', '');
    await page.locator('#tour-end-explore').click();
    await expect(page.locator('#tour-end')).toBeHidden();
  });
});

test.describe('Museum: Metadaten', () => {
  test('Beschreibung, OG-Tags und Favicon sind gesetzt', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.svg/);
  });
});
