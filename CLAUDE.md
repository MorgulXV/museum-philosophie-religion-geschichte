# CLAUDE.md — Museum: Philosophie, Religion & Geschichte

## Was das ist
Interaktives Schulpräsentations-Museum. 39 Exponate, 5 Räume, 3 Stränge, 73 Einflusskanten.

## Audit
Ergebnis Step 0.1 (2026-06-19):
- Exponate: 39 | Räume: 1,2,3,4,5
- Stränge: philosophie:18 | religion:7 | geschichte:14
- Graph: 39 Knoten, 73 Kanten | Ungültige Refs: keine
- Vorherige Dateien: index.html (English shell), app.js, styles.css, museum.html, museum.js, museum3d.js — alle ersetzt

## Einzige Wahrheitsquelle
data/exhibits.js — ALLE Inhalte kommen von dort. Niemals Text hardcoden.
Verfügbare Exports: exhibits[], rooms[], throughline[], STRANDS, buildInfluenceGraph(),
getExhibitById(), getExhibitsByRoom(), getInfluencedBy()

## Stack
- Stage 1+2: Vanilla HTML/CSS/ES-Module. Kein Framework. Kein Build-Step.
- Stage 3: Three.js r158 via ES-Module CDN importmap. Braucht lokalen Server.
- index.html läuft via file:// (kein Server nötig).
- museum3d.html braucht: python3 -m http.server 8000

## Harte Regeln
- Kein localStorage, sessionStorage, oder Browser-Storage jeder Art.
- Kein React, kein Vue, kein Svelte, kein Webpack, kein Vite.
- Kein scope creep: nur implementieren, was explizit beschrieben ist.
- Kein generisches "KI-Design": keine Gradientensalat, kein Glasmorphismus-Spam.
- Nach jeder Phase: validate.js ausführen, Output zeigen.
- NIEMALS als "fertig" melden, bevor validate.js grün ist.

## Farb-Tokens (sacred — nicht ändern)
--bg-base:       #09091a    /* Planetarium-Schwarz */
--bg-surface:    #11112a    /* Karten */
--bg-elevated:   #1a1a3a    /* Panel, Overlays */
--bg-room-strip: #0d0d22    /* Raum-Banner */
--text-primary:  #e8e4d9    /* Warm Off-White */
--text-muted:    #8890aa    /* Gedämpft */
--text-dim:      #4a4a6a    /* Sehr gedämpft */
--accent:        #c47a1e    /* Bernstein/Spot */
--accent-hover:  #d4891e
--border:        rgba(255,255,255,0.07)
--border-strong: rgba(255,255,255,0.15)

Raum-Farben:
--room-1: #4a6fa5   /* Schieferblau */
--room-2: #2d6a4f   /* Petrol */
--room-3: #b5541a   /* Bernstein */
--room-4: #8b2635   /* Terrakotta */
--room-5: #4a4a4a   /* Neutralgrau */

Strang-Farben:
--philosophie: #4a6fa5
--religion:    #2d6a4f
--geschichte:  #8b5e3c

## Commit-Protokoll
Jede Phase: kleine, beschreibende Commits. Format: "phase(N): kurze Beschreibung"
