import { exhibits, rooms, throughline, STRANDS, getExhibitsByRoom } from '../data/exhibits.js';

export const exhibitCardMap = new Map();

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const STRAND_LABELS = { philosophie: 'Philosophie', religion: 'Religion', geschichte: 'Geschichte' };

// Lazy reference to panel functions — set after panel.js loads to break circular dep
let _openPanel = null;
let _closePanel = null;

export function registerPanel(openFn, closeFn) {
  _openPanel = openFn;
  _closePanel = closeFn;
}

export function openExhibit(id) {
  const exhibit = exhibits.find(e => e.id === id);
  if (exhibit && _openPanel) _openPanel(exhibit);
}

export function scrollToExhibit(id) {
  const card = exhibitCardMap.get(id);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function renderThroughline() {
  const container = document.getElementById('throughline');
  if (!container) return;
  container.innerHTML = '';
  rooms.forEach((room, idx) => {
    const btn = document.createElement('button');
    btn.className = 'throughline-btn';
    btn.dataset.room = room.id;
    btn.setAttribute('aria-label', `Zu Raum ${ROMAN[idx]}: ${room.title}`);
    btn.innerHTML = `
      <span class="throughline-numeral">${ROMAN[idx]}</span>
      <span class="throughline-role">${room.throughlineRole}</span>
      <span class="throughline-dates">${room.dates}</span>
    `;
    btn.addEventListener('click', () => {
      const section = document.getElementById(`room-${room.id}`);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
    container.appendChild(btn);
  });
}

function renderLobby() {
  const lobby = document.getElementById('lobby');
  if (!lobby) return;
  lobby.innerHTML = `
    <h1 class="lobby-title">Philosophie, Religion &amp; Geschichte</h1>
    <p class="lobby-subtitle">Ein interaktives Museum</p>
    <p class="lobby-thesis">
      Philosophie und Religion begannen als eine Tätigkeit: der disziplinierte Versuch, das Göttliche und die kosmische Ordnung zu verstehen.
      Über zwei Jahrtausende drifteten sie auseinander, beeinflusst von konkreten historischen Ereignissen: Kriegen, Seuchen, Erfindungen, Revolutionen.
      Dieses Museum zeigt die Kausalkette: welche Ideen welche Ideen auslösten und welche Ereignisse das Denken erzwangen.
      In fünf Räumen, drei Strängen und 39 Exponaten, von Pythagoras bis zu den Vier Reitern.
    </p>
    <div class="lobby-actions">
      <button class="lobby-cta" data-tour-start aria-label="Geführten Rundgang starten">Rundgang starten</button>
      <a class="lobby-cta-secondary" href="#influence-map">Einflussgraph ansehen ↓</a>
    </div>
    <p class="lobby-stats" aria-label="Umfang der Sammlung">
      <span>39 Exponate</span><span>5 Räume</span><span>73 Einflusskanten</span><span>ca. 530 v.&nbsp;Chr. – 2009 n.&nbsp;Chr.</span>
    </p>
    <nav class="room-nav" aria-label="Raum-Navigation">
      ${rooms.map((room, idx) => `
        <button class="room-nav-btn" data-room="${room.id}"
                aria-label="Zu Raum ${ROMAN[idx]}: ${room.title}">
          <strong>Raum ${ROMAN[idx]}</strong> — ${room.title}
          <span style="display:block;font-size:11px;color:var(--text-dim);margin-top:2px;font-family:var(--font-mono)">${room.dates}</span>
        </button>
      `).join('')}
    </nav>
  `;
  lobby.querySelectorAll('.room-nav-btn').forEach(btn => {
    const rid = btn.dataset.room;
    btn.addEventListener('click', () => {
      const section = document.getElementById(`room-${rid}`);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderRooms() {
  const main = document.getElementById('main-content');
  if (!main) return;
  rooms.forEach((room, idx) => {
    const existing = document.getElementById(`room-${room.id}`);
    if (existing) existing.remove();

    const section = document.createElement('section');
    section.className = 'room';
    section.id = `room-${room.id}`;
    section.dataset.room = room.id;

    section.innerHTML = `
      <div class="room-banner">
        <div class="room-numeral">${ROMAN[idx]}</div>
        <div class="room-info">
          <h2 class="room-title">${room.title}</h2>
          <span class="room-dates">${room.dates}</span>
          <span class="room-role">"${room.throughlineRole}"</span>
          <p class="room-thesis">${room.thesis}</p>
        </div>
      </div>
      <div class="exhibits-grid"></div>
    `;

    const grid = section.querySelector('.exhibits-grid');
    const roomExhibits = getExhibitsByRoom(room.id)
      .slice()
      .sort((a, b) => {
        const order = ['philosophie', 'religion', 'geschichte'];
        return order.indexOf(a.strand) - order.indexOf(b.strand);
      });

    roomExhibits.forEach(exhibit => {
      const card = createExhibitCard(exhibit);
      grid.appendChild(card);
      exhibitCardMap.set(exhibit.id, card);
    });

    main.appendChild(section);
  });
}

function createExhibitCard(exhibit) {
  const article = document.createElement('article');
  article.className = 'exhibit-card';
  article.dataset.exhibitId = exhibit.id;
  article.dataset.strand = exhibit.strand;
  article.dataset.room = exhibit.room;
  article.setAttribute('tabindex', '0');
  article.setAttribute('role', 'button');
  article.setAttribute('aria-label', `Exponat: ${exhibit.name}`);

  const strandColor = `var(--${exhibit.strand})`;
  const label = STRAND_LABELS[exhibit.strand] || exhibit.strand;

  article.innerHTML = `
    <div class="card-body">
      <div class="card-meta">
        <span class="strand-badge strand-${exhibit.strand}">${label}</span>
        <span class="card-date">${exhibit.date}</span>
      </div>
      <h3 class="card-name">${exhibit.name}</h3>
      <p class="card-text">${exhibit.cardText}</p>
      <span class="card-tick" style="border-bottom: 2px solid ${strandColor}" aria-hidden="true"></span>
    </div>
  `;

  const activate = () => openExhibit(exhibit.id);
  article.addEventListener('click', activate);
  article.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });

  return article;
}

function setupScrollSpy() {
  const sections = document.querySelectorAll('.room');
  const buttons = document.querySelectorAll('.throughline-btn');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const roomId = entry.target.dataset.room;
        buttons.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.room === roomId);
        });
      }
    });

  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

function setupStrandFilter() {
  const buttons = [...document.querySelectorAll('#strand-filter .filter-btn')];
  const legendKeys = [...document.querySelectorAll('.legend-key')];
  const countEl = document.getElementById('filter-count');

  const counts = STRANDS
    ? Object.fromEntries(Object.keys(STRAND_LABELS).map(s => [s, exhibits.filter(e => e.strand === s).length]))
    : {};

  function setFilter(strand) {
    const active = strand && strand !== 'alle' ? strand : null;
    if (active) document.body.dataset.strandFilter = active;
    else document.body.removeAttribute('data-strand-filter');

    buttons.forEach(b => {
      const on = (b.dataset.strand === 'alle' && !active) || b.dataset.strand === active;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    legendKeys.forEach(k => k.classList.toggle('active', k.dataset.strand === active));
    if (countEl) {
      countEl.textContent = active
        ? `${STRAND_LABELS[active]} — ${counts[active]} Exponate`
        : `${exhibits.length} Exponate`;
    }
  }

  buttons.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.strand)));
  legendKeys.forEach(key => key.addEventListener('click', () => {
    // toggle: clicking the active legend key clears the filter
    const cur = document.body.dataset.strandFilter || null;
    setFilter(cur === key.dataset.strand ? 'alle' : key.dataset.strand);
  }));

  setFilter('alle');
}

function resolveDeepLink() {
  const hash = window.location.hash.slice(1);
  if (hash) {
    setTimeout(() => openExhibit(hash), 400);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderThroughline();
  renderLobby();
  renderRooms();
  setupScrollSpy();
  setupStrandFilter();
  resolveDeepLink();
});
