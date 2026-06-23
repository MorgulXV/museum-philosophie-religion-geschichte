import { exhibits } from '../data/exhibits.js';
import { openExhibit, scrollToExhibit } from './render.js';
import { closePanel } from './panel.js';

const strandOrder = ['philosophie', 'religion', 'geschichte'];
const tourSequence = [...exhibits].sort((a, b) => {
  if (a.room !== b.room) return a.room - b.room;
  return strandOrder.indexOf(a.strand) - strandOrder.indexOf(b.strand);
});

let tourActive = false;
let tourIndex = 0;

function tourBar() { return document.getElementById('tour-bar'); }
function tourProgress() { return document.getElementById('tour-progress'); }
function tourLabel() { return document.getElementById('tour-label'); }
function tourBtn() { return document.getElementById('tour-btn'); }

function startTour() {
  tourActive = true;
  tourIndex = 0;
  const bar = tourBar();
  if (bar) bar.hidden = false;
  const btn = tourBtn();
  if (btn) btn.textContent = 'Rundgang läuft...';
  showTourItem();
}

function showTourItem() {
  if (tourIndex >= tourSequence.length) { stopTour(); return; }
  const exhibit = tourSequence[tourIndex];
  scrollToExhibit(exhibit.id);
  setTimeout(() => openExhibit(exhibit.id), 400);
  updateTourBar();
}

function advanceTour() {
  tourIndex++;
  if (tourIndex >= tourSequence.length) {
    stopTour();
  } else {
    showTourItem();
  }
}

function stopTour() {
  tourActive = false;
  const bar = tourBar();
  if (bar) bar.hidden = true;
  const btn = tourBtn();
  if (btn) btn.textContent = 'Rundgang starten';
  closePanel();
}

function updateTourBar() {
  const progress = tourIndex / tourSequence.length * 100;
  const pg = tourProgress();
  if (pg) pg.style.width = progress + '%';
  const lbl = tourLabel();
  if (lbl) {
    const exhibit = tourSequence[tourIndex];
    lbl.textContent = `${tourIndex + 1} / ${tourSequence.length} — ${exhibit.name.split(' — ')[0]}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = () => { if (tourActive) { stopTour(); } else { startTour(); } };
  const btn = tourBtn();
  if (btn) btn.addEventListener('click', toggle);
  // Hero CTA and any other tour-start triggers
  document.querySelectorAll('[data-tour-start]').forEach(el => {
    el.addEventListener('click', () => { if (!tourActive) startTour(); });
  });

  const nextBtn = document.getElementById('tour-next');
  if (nextBtn) nextBtn.addEventListener('click', advanceTour);

  const stopBtn = document.getElementById('tour-stop');
  if (stopBtn) stopBtn.addEventListener('click', stopTour);
});
