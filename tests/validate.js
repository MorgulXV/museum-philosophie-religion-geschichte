#!/usr/bin/env node
/**
 * validate.js — Prüft die Integrität des Museums ohne Browser.
 * Ausführen: node tests/validate.js
 */
import { exhibits, rooms, throughline, STRANDS, buildInfluenceGraph,
         getExhibitById, getExhibitsByRoom, getInfluencedBy } from '../data/exhibits.js';

const pass = [];
const fail = [];
const ok  = msg => pass.push('  ✓ ' + msg);
const err = msg => fail.push('  ✗ ' + msg);

// Grundstruktur
exhibits.length === 39         ? ok(`39 Exponate`)            : err(`Exponate: ${exhibits.length} ≠ 39`);
rooms.length === 5             ? ok(`5 Räume`)                : err(`Räume: ${rooms.length}`);
throughline.length === 5       ? ok(`5 Durchlinien`)          : err(`Durchlinien: ${throughline.length}`);
Object.keys(STRANDS).length===3? ok(`3 Stränge`)             : err(`STRANDS: ${Object.keys(STRANDS)}`);

// ID-Eindeutigkeit
const allIds = new Set(exhibits.map(e => e.id));
allIds.size === 39             ? ok(`39 eindeutige IDs`)       : err(`Duplikat-IDs gefunden`);

// Pflichtfelder
const missingFields = exhibits.filter(e =>
  !e.id || !e.room || !e.strand || !e.date || !e.name ||
  !e.artefact?.description || !e.cardText ||
  !e.panelText?.story || !e.panelText?.keyIdea ||
  !Array.isArray(e.influences)
);
missingFields.length === 0     ? ok(`Pflichtfelder vollständig`) : err(`Fehlende Felder: ${missingFields.map(e=>e.id)}`);

// Strang-Werte
const validStrands = new Set(['philosophie','religion','geschichte']);
const badStrands = exhibits.filter(e => !validStrands.has(e.strand));
badStrands.length === 0        ? ok(`Strang-Werte gültig`)    : err(`Ungültige Stränge: ${badStrands.map(e=>e.id)}`);

// Graph-Integrität
const badRefs = exhibits.flatMap(e => e.influences.filter(t => !allIds.has(t)).map(t => `${e.id}→${t}`));
badRefs.length === 0           ? ok(`Influence-Refs gültig`)  : err(`Ungültige Refs: ${badRefs}`);
const selfRefs = exhibits.filter(e => e.influences.includes(e.id));
selfRefs.length === 0          ? ok(`Keine Selbstreferenzen`) : err(`Selbstrefs: ${selfRefs.map(e=>e.id)}`);

// Raumverteilung
for (let r = 1; r <= 5; r++) {
  const inR = exhibits.filter(e => e.room === r);
  inR.length >= 4 ? ok(`Raum ${r}: ${inR.length} Exponate`) : err(`Raum ${r}: zu wenige (${inR.length})`);
  ['philosophie','religion','geschichte'].forEach(s => {
    inR.some(e => e.strand === s) ? ok(`Raum ${r} hat ${s}`) : err(`Raum ${r} fehlt ${s}`);
  });
}

// Graph
const { nodes, edges } = buildInfluenceGraph();
nodes.length === 39 ? ok(`Graph: 39 Knoten`)     : err(`Graph Knoten: ${nodes.length}`);
edges.length >= 70  ? ok(`Graph: ${edges.length} Kanten`) : err(`Graph Kanten: ${edges.length}`);

// Inhaltsqualität
const shortStory   = exhibits.filter(e => e.panelText.story.length < 200);
const shortKeyIdea = exhibits.filter(e => e.panelText.keyIdea.length < 80);
shortStory.length === 0    ? ok(`Stories ≥200 Zeichen`)   : err(`Kurze Stories: ${shortStory.map(e=>e.id)}`);
shortKeyIdea.length === 0  ? ok(`KeyIdeas ≥80 Zeichen`)   : err(`Kurze KeyIdeas: ${shortKeyIdea.map(e=>e.id)}`);

// Hilfsfunktionen
const pyth = getExhibitById('pythagoras');
pyth?.id === 'pythagoras'  ? ok(`getExhibitById()`)        : err(`getExhibitById fehlschlag`);
getExhibitById('x') === null ? ok(`getExhibitById(null)`)  : err(`null-Guard fehlt`);
const r1 = getExhibitsByRoom(1);
r1.every(e => e.room === 1)? ok(`getExhibitsByRoom()`)     : err(`getExhibitsByRoom fehlschlag`);
const inf = getInfluencedBy('platon');
inf.every(e=>e.influences.includes('platon')) ? ok(`getInfluencedBy()`) : err(`getInfluencedBy fehlschlag`);

// Ausgabe
console.log('\n━━━ Museum Validation ━━━');
console.log(`Exponate: ${exhibits.length} | Räume: 5 | Stränge: 3 | Kanten: ${edges.length}`);
console.log('');
if (fail.length === 0) {
  console.log(`✓ ALLE ${pass.length} PRÜFUNGEN BESTANDEN\n`);
  pass.forEach(p => console.log(p));
  process.exit(0);
} else {
  console.log(`✗ ${fail.length} FEHLER:\n`);
  fail.forEach(f => console.log(f));
  console.log(`\n${pass.length} bestanden:\n`);
  pass.forEach(p => console.log(p));
  process.exit(1);
}
