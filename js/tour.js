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
let pendingOpen = null;

const $ = id => document.getElementById(id);
const tourBar = () => $('tour-bar');
const tourProgress = () => $('tour-progress');
const tourLabel = () => $('tour-label');
const tourBtn = () => $('tour-btn');
const tourEnd = () => $('tour-end');

function startTour() {
  hideEnd();
  tourActive = true;
  tourIndex = 0;
  const bar = tourBar();
  if (bar) bar.hidden = false;
  const btn = tourBtn();
  if (btn) btn.textContent = 'Rundgang läuft …';
  showTourItem();
}

function showTourItem() {
  const exhibit = tourSequence[tourIndex];
  scrollToExhibit(exhibit.id);
  clearTimeout(pendingOpen);
  pendingOpen = setTimeout(() => openExhibit(exhibit.id), 400);
  updateTourBar();
}

function advanceTour() {
  if (tourIndex >= tourSequence.length - 1) { finishTour(); return; }
  tourIndex++;
  showTourItem();
}

function retreatTour() {
  if (tourIndex <= 0) return;
  tourIndex--;
  showTourItem();
}

function stopTour() {
  tourActive = false;
  clearTimeout(pendingOpen);
  const bar = tourBar();
  if (bar) bar.hidden = true;
  const btn = tourBtn();
  if (btn) btn.textContent = 'Rundgang starten';
  closePanel();
}

// Reached the last station → designed closing moment.
function finishTour() {
  tourActive = false;
  clearTimeout(pendingOpen);
  const bar = tourBar();
  if (bar) bar.hidden = true;
  closePanel();
  const end = tourEnd();
  if (end) {
    end.hidden = false;
    requestAnimationFrame(() => $('tour-end-explore')?.focus());
  }
  const btn = tourBtn();
  if (btn) btn.textContent = 'Rundgang starten';
}

function hideEnd() {
  const end = tourEnd();
  if (end) end.hidden = true;
}

function updateTourBar() {
  const total = tourSequence.length;
  const pg = tourProgress();
  if (pg) pg.style.width = `${((tourIndex + 1) / total) * 100}%`;

  const lbl = tourLabel();
  if (lbl) {
    const exhibit = tourSequence[tourIndex];
    lbl.textContent = `Station ${tourIndex + 1} / ${total} — ${exhibit.name.split(' — ')[0]}`;
  }

  const prev = $('tour-prev');
  if (prev) prev.disabled = tourIndex === 0;
  const next = $('tour-next');
  if (next) next.textContent = tourIndex >= total - 1 ? 'Abschließen ✓' : 'Weiter →';
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = () => { if (tourActive) stopTour(); else startTour(); };
  tourBtn()?.addEventListener('click', toggle);

  // Hero CTA and any other tour-start triggers
  document.querySelectorAll('[data-tour-start]').forEach(el => {
    el.addEventListener('click', () => { if (!tourActive) startTour(); });
  });

  $('tour-prev')?.addEventListener('click', retreatTour);
  $('tour-next')?.addEventListener('click', advanceTour);
  $('tour-stop')?.addEventListener('click', stopTour);

  $('tour-end-explore')?.addEventListener('click', hideEnd);
  $('tour-end-restart')?.addEventListener('click', startTour);

  // Keyboard control while the tour runs
  document.addEventListener('keydown', e => {
    if (!tourEnd()?.hidden) {
      if (e.key === 'Escape') hideEnd();
      return;
    }
    if (!tourActive) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); advanceTour(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); retreatTour(); }
    else if (e.key === 'Escape') { e.preventDefault(); stopTour(); }
  });
});
