import { getExhibitById, getInfluencedBy } from '../data/exhibits.js';
import { registerPanel, scrollToExhibit, exhibitCardMap } from './render.js';

const STRAND_LABELS = { philosophie: 'Philosophie', religion: 'Religion', geschichte: 'Geschichte' };

let lastOpenId = null;
const panel = () => document.getElementById('exhibit-panel');
const overlay = () => document.getElementById('panel-overlay');
const content = () => document.getElementById('panel-content');
const closeBtn = () => document.getElementById('panel-close');

export function openPanel(exhibit) {
  lastOpenId = exhibit.id;
  const label = STRAND_LABELS[exhibit.strand] || exhibit.strand;

  const sources = getInfluencedBy(exhibit.id);

  content().innerHTML = `
    <div class="panel-header">
      <span class="panel-strand-badge strand-${exhibit.strand}">${label}</span>
      <h2 class="panel-name">${exhibit.name}</h2>
      <span class="panel-date">${exhibit.date}</span>
    </div>

    <div class="panel-section">
      <h3>Narrativ</h3>
      <p>${exhibit.panelText.story}</p>
    </div>

    <div class="panel-keyidea" style="border-left: 3px solid var(--${exhibit.strand})">
      <h3>Kerngedanke</h3>
      <p>${exhibit.panelText.keyIdea}</p>
    </div>

    ${exhibit.panelText.quote ? `
    <blockquote class="panel-quote">
      <p>»${exhibit.panelText.quote.text}«</p>
      <cite>— ${exhibit.panelText.quote.source}</cite>
    </blockquote>
    ` : ''}

    ${exhibit.panelText.disputed ? `
    <div class="panel-disputed">
      <span class="disputed-icon">⚠</span>
      <p>${exhibit.panelText.disputed}</p>
    </div>
    ` : ''}

    ${exhibit.influences.length > 0 ? `
    <div class="panel-influences">
      <h3>Beeinflusst →</h3>
      <div class="influence-chips" id="chips-out"></div>
    </div>
    ` : ''}

    ${sources.length > 0 ? `
    <div class="panel-influenced-by">
      <h3>← Beeinflusst durch</h3>
      <div class="influence-chips" id="chips-in"></div>
    </div>
    ` : ''}
  `;

  if (exhibit.influences.length > 0) {
    const chipsOut = content().querySelector('#chips-out');
    exhibit.influences.forEach(targetId => {
      const target = getExhibitById(targetId);
      if (!target) return;
      const chip = document.createElement('button');
      chip.className = `influence-chip strand-${target.strand}`;
      chip.dataset.target = targetId;
      chip.setAttribute('aria-label', `Gehe zu ${target.name}`);
      chip.textContent = target.name.split(' — ')[0];
      chip.addEventListener('click', () => {
        closePanel();
        scrollToExhibit(targetId);
        setTimeout(() => {
          import('./render.js').then(m => m.openExhibit(targetId));
        }, 350);
      });
      chipsOut.appendChild(chip);
    });
  }

  if (sources.length > 0) {
    const chipsIn = content().querySelector('#chips-in');
    sources.forEach(source => {
      const chip = document.createElement('button');
      chip.className = `influence-chip strand-${source.strand}`;
      chip.dataset.target = source.id;
      chip.setAttribute('aria-label', `Gehe zu ${source.name}`);
      chip.textContent = source.name.split(' — ')[0];
      chip.addEventListener('click', () => {
        closePanel();
        scrollToExhibit(source.id);
        setTimeout(() => {
          import('./render.js').then(m => m.openExhibit(source.id));
        }, 350);
      });
      chipsIn.appendChild(chip);
    });
  }

  const p = panel();
  p.removeAttribute('hidden');
  p.setAttribute('aria-hidden', 'false');
  overlay().classList.add('overlay-open');
  overlay().setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-open');

  history.pushState(null, '', '#' + exhibit.id);

  requestAnimationFrame(() => {
    closeBtn()?.focus();
  });

  trapFocus(p);
}

export function closePanel() {
  const p = panel();
  p.setAttribute('hidden', '');
  p.setAttribute('aria-hidden', 'true');
  overlay().classList.remove('overlay-open');
  overlay().setAttribute('aria-hidden', 'true');
  document.body.classList.remove('panel-open');
  history.pushState(null, '', window.location.pathname);

  if (lastOpenId) {
    const card = exhibitCardMap.get(lastOpenId);
    card?.focus();
  }

  removeTrap();
}

// Focus trap
let _trapHandler = null;
function trapFocus(container) {
  removeTrap();
  const focusable = () => [...container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.disabled && el.offsetParent !== null);

  _trapHandler = e => {
    if (e.key !== 'Tab') return;
    const els = focusable();
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  container.addEventListener('keydown', _trapHandler);
}

function removeTrap() {
  const p = panel();
  if (p && _trapHandler) {
    p.removeEventListener('keydown', _trapHandler);
    _trapHandler = null;
  }
}

// Events
document.addEventListener('DOMContentLoaded', () => {
  closeBtn()?.addEventListener('click', closePanel);
  overlay()?.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel()?.hasAttribute('hidden')) closePanel();
  });
});

// Register with render.js to break circular dependency
registerPanel(openPanel, closePanel);
