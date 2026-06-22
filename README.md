# Museum — Philosophie, Religion & Geschichte

Interaktives Schulpräsentations-Museum über die Verflechtung von Philosophie, Religion und Geschichte.  
39 Exponate · 5 Räume · 73 Einflusskanten · ca. 530 v. Chr. – 2009 n. Chr.

---

## Schnellstart

```bash
# 2D-Ansicht (kein Server nötig)
open index.html

# 3D-Ansicht + E2E-Tests (erfordert lokalen Server)
python3 -m http.server 8000
# → http://localhost:8000/History/index.html
# → http://localhost:8000/History/museum3d.html
```

---

## Projektstruktur

```
History/
├── index.html           # Haupt-2D-Museum
├── museum3d.html        # Three.js 3D-Ansicht
├── css/
│   └── museum.css       # Alle Styles + Design-Tokens
├── js/
│   ├── render.js        # DOM-Rendering, Karten, Scroll-Spy, Filter
│   ├── panel.js         # Slide-in Panel, Focus-Trap, URL-Hash
│   ├── graph.js         # Canvas-2D Einflussgraph
│   ├── tour.js          # Geführter Rundgang
│   └── three-scene.js   # Three.js 3D-Szene
├── data/
│   └── exhibits.js      # Einzige Wahrheitsquelle — NICHT BEARBEITEN
├── tests/
│   ├── validate.js      # Node.js Daten-Validierung (37 Checks)
│   └── e2e.spec.js      # Playwright E2E-Tests (16 Tests)
├── assets/              # Zukünftige Bild-Assets
├── package.json
└── playwright.config.js
```

---

## Features

### 2D-Museum (`index.html`)

| Feature | Details |
|---|---|
| **5 Räume** | Antike · Mittelalter · Der Bruch · Herausforderungen · Modern |
| **3 Stränge** | Philosophie (18) · Religion (7) · Geschichte (14) |
| **Einflussgraph** | Canvas 2D, kein D3. Hover → Verbindungen. Zoom/Pan. Klick öffnet Panel |
| **Slide-in Panel** | Artefakt · Narrativ · Kerngedanke · Zitat · Einflussketten-Chips |
| **Strang-Filter** | CSS-only via `body[data-strand-filter]`, kein DOM-Rebuild |
| **Geführter Rundgang** | Alle 39 Exponate sortiert, 10s/Exponat, manueller Weiter-Button |
| **Deep Links** | URL-Hash `#exhibit-id` öffnet Panel direkt beim Laden |
| **Scroll-Spy** | IntersectionObserver synchronisiert Throughline mit aktivem Raum |
| **Tastatur** | Tab, Enter, Space, ESC, Focus-Trap im Panel |
| **Responsiv** | 1-spaltig < 768px, 2-spaltig bis 1024px, auto-fill ab 1024px |

### 3D-Museum (`museum3d.html`)

- Three.js r158 via ES-Module CDN (kein npm install nötig)
- 5 Räume, Sockel mit schwebenden Artefakten pro Strang-Geometrie
- OrbitControls: Orbit (ziehen), Zoom (Scroll), Raum-Buttons (Kamera-Flug)
- Hover: Glow-Effekt + Tooltip
- Klick: Detail-Panel mit Link zurück zum 2D-Museum
- Einflusslinen: Bezier-Kurven beim Öffnen eines Exponats
- Erfordert lokalen Server (Three.js CDN + CORS)

---

## Daten-Modell

```js
// data/exhibits.js — einzige Wahrheitsquelle
exhibit = {
  id:     string,           // kebab-case, URL-sicher
  name:   string,           // "Name — Untertitel"
  date:   string,           // "ca. 530 v. Chr."
  strand: 'philosophie' | 'religion' | 'geschichte',
  room:   1 | 2 | 3 | 4 | 5,
  cardText:  string,        // Kurztext für die Karte
  artefact:  { description, assetHint },
  panelText: { story, keyIdea, quote?, disputed? },
  influences: string[],     // IDs anderer Exponate
};
```

---

## Tests

### Daten-Validierung

```bash
node tests/validate.js
```

37 Checks ohne Browser: Exponat-Anzahl, Räume, Stränge, Pflichtfelder, Referenz-Integrität, Graph-Struktur.

### E2E-Tests (Playwright)

```bash
npm install
npx playwright install chromium
npx playwright test
```

16 Tests: Seitenstruktur, Panel, Strang-Filter, Deep Links, Tastatur, Canvas, Rundgang, Responsivität.

---

## Design-System

Planetarium-Schwarz Ästhetik: dunkler Hintergrund, warme Bernstein-Akzente, Cormorant Garamond Display-Schrift.

| Token | Wert | Bedeutung |
|---|---|---|
| `--bg-base` | `#09091a` | Planetarium-Schwarz |
| `--bg-surface` | `#11112a` | Karten |
| `--bg-elevated` | `#1a1a3a` | Panel, Overlays |
| `--text` | `#e8e4d9` | Warmes Off-White |
| `--amber` | `#d4a855` | Akzent / Spotlight |
| `--philosophie` | `#4a6fa5` | Schieferblau |
| `--religion` | `#2d6a4f` | Petrol |
| `--geschichte` | `#8b5e3c` | Umbra |

---

## Architektur-Entscheidungen

**Keine Frameworks, kein Build-Step.** Alle vier JS-Dateien sind ES-Module, die direkt vom Browser geladen werden. `data/exhibits.js` ist die einzige Wahrheitsquelle — kein Text ist hardcodiert.

**Kreisabhängigkeit render.js ↔ panel.js** wird durch `registerPanel(openFn, closeFn)` aufgelöst: `panel.js` registriert sich beim Laden in `render.js`, sodass `render.js` nie direkt importiert werden muss.

**Canvas statt SVG** für den Einflussgraph: ermöglicht HiDPI-Rendering, Zoom/Pan ohne DOM-Overhead, und Animationen ohne Bibliothek.

**CSS-Filter** (`body[data-strand-filter="X"] .exhibit-card[data-strand="Y"] { display:none }`) statt JS-DOM-Manipulation: deklarativ, animierbar, kein Re-Render.

**`hidden` + `display:block!important`** für das Panel: CSS-Transitions funktionieren nicht mit `display:none`. Lösung: das `hidden`-Attribut bleibt für Accessibility erhalten, wird aber per CSS auf `display:block` überschrieben; Sichtbarkeit wird via `transform: translateX(100%)` gesteuert.
