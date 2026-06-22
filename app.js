// app.js — Faith & Reason
import { rooms, throughLine, mapEdges } from './data/exhibits.js';

let currentRoomId = null;
let mode3d        = false;
let museum3dMod   = null;

function buildNav() {
  const ul = document.querySelector('#site-nav ul');
  if (!ul) return;

  const roomLinks = rooms
    .map(r => `<li><a href="#${r.id}">${r.era}. ${r.name}</a></li>`)
    .join('');

  ul.innerHTML = roomLinks +
    '<li><a href="#map">Map</a></li>' +
    '<li class="nav-toggle-item"><button id="toggle-3d" class="toggle-3d-btn" aria-pressed="false">3D-Museum</button></li>';
}

function buildThroughLine(activeRole) {
  if (!activeRole) return '';

  const items = throughLine
    .map((label, i) => {
      const isActive = label === activeRole;
      const cls = isActive ? 'through-line-item through-line-item--active' : 'through-line-item';
      const arrow =
        i < throughLine.length - 1
          ? '<span class="through-line-arrow" aria-hidden="true">&#8594;</span>'
          : '';
      return `<span class="${cls}">${label}</span>${arrow}`;
    })
    .join('');

  return `
    <div class="through-line" aria-label="Relationship of faith and reason across eras">
      <p class="through-line-label">Faith &amp; Reason across the eras</p>
      <div class="through-line-track">${items}</div>
    </div>`;
}

function buildExhibitCards(exhibits) {
  if (!exhibits.length) return '';

  const cards = exhibits
    .map(e => {
      const disputedBadge = e.detail.disputed
        ? '<span class="exhibit-disputed">(attribution disputed)</span>'
        : '';
      return `
        <article class="exhibit-card"
                 tabindex="0"
                 role="button"
                 aria-haspopup="dialog"
                 data-exhibit-id="${e.id}">
          <p class="exhibit-tagline">${e.tagline}</p>
          <h3 class="exhibit-title">${e.name}</h3>
          ${disputedBadge}
          <p class="exhibit-summary">${e.summary}</p>
        </article>`;
    })
    .join('');

  return `<div class="exhibit-grid" aria-label="Exhibits">${cards}</div>`;
}

function buildPlaceholder(sceneCaption) {
  const caption = sceneCaption
    ? `<p class="placeholder-caption">${sceneCaption}</p>`
    : '';
  return `
    <div class="exhibit-3d-placeholder" role="img" aria-label="3D exhibit — coming in Stage 3">
      <span class="placeholder-label">3D Exhibit — Interactive Model</span>
      <span class="placeholder-note">Stage 3</span>
      ${caption}
    </div>`;
}

function renderRoom(data) {
  const section = document.getElementById(data.id);
  if (!section) return;

  // Inject per-room accent so generic CSS rules work for every room
  section.style.setProperty('--room-accent', data.accent);

  const headingId = `${data.id}-title`;
  section.setAttribute('aria-labelledby', headingId);

  const thesis = data.thesis
    ? `<p class="room-thesis">${data.thesis}</p>`
    : '';

  const hasContent = data.exhibits.length > 0;
  const sceneMount = hasContent
    ? `<div class="room-3d-mount">
         ${buildPlaceholder(data.sceneCaption)}
         <canvas class="room-3d-canvas" data-room-canvas="${data.id}" aria-hidden="true"></canvas>
       </div>`
    : '';
  const cards = buildExhibitCards(data.exhibits);
  const tl    = hasContent ? buildThroughLine(data.throughLineRole) : '';

  section.innerHTML = `
    <div class="room-inner">
      <header class="room-header">
        <p class="room-era-label">Room ${data.era}</p>
        <h2 class="room-title" id="${headingId}">${data.name}</h2>
        <p class="room-period">${data.period}</p>
        ${thesis}
      </header>
      ${sceneMount}
      ${cards}
      ${tl}
    </div>`;
}

function initScrollSpy() {
  // A room is "active" when its section top has scrolled at or past the nav.
  // IntersectionObserver alone cannot detect this reliably: IO fires on element
  // bounding-box boundary crossings, not on the element's top edge crossing a
  // specific y-position. A tall section's IO fires ~300px too late, and a large
  // programmatic scroll (anchor links, keyboard Page Down) can jump past the
  // detection zone entirely without firing. We use IO for the initial page-load
  // check and a passive scroll listener (rAF-throttled) for ongoing updates.
  const NAV_H = 48; // matches --nav-height: 3rem
  let ticking  = false;

  function setActive(id) {
    if (id === currentRoomId) return;
    currentRoomId = id;
    document.querySelectorAll('#site-nav a').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`)
    );
    if (id == null) return;
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    document.querySelectorAll('.through-line-item').forEach(item =>
      item.classList.toggle(
        'through-line-item--active',
        item.textContent.trim() === room.throughLineRole
      )
    );
    if (mode3d && museum3dMod) museum3dMod.activateRoom(id);
  }

  function evaluate() {
    // Use the nav bottom as the trigger. Near the page bottom, widen the trigger
    // to the viewport midpoint so the last room can activate even when there isn't
    // enough below-the-fold space to scroll it fully past the nav.
    const nearBottom =
      document.documentElement.scrollHeight - window.scrollY - window.innerHeight < NAV_H * 2;
    const trigger = nearBottom ? Math.round(window.innerHeight * 0.5) : NAV_H;

    let active = null;
    for (const r of rooms) {
      const el = document.getElementById(r.id);
      if (el && el.getBoundingClientRect().top <= trigger) active = r.id;
    }
    setActive(active);
  }

  function scheduleEvaluate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { evaluate(); ticking = false; });
  }

  // Passive scroll listener — rAF-throttled, one getBoundingClientRect per frame
  window.addEventListener('scroll', scheduleEvaluate, { passive: true });

  // IntersectionObserver: catch anchor-link jumps and initial page load.
  // Fires when any room section enters/leaves the viewport.
  new IntersectionObserver(scheduleEvaluate, { threshold: 0 })
    .observe(document.querySelector('main') ?? document.body);

  evaluate(); // set correct state before first scroll
}

let _triggerCard = null;

function openDialog(exhibit, cardEl) {
  const dialog = document.getElementById('exhibit-dialog');

  dialog.querySelector('.dialog-tagline').textContent  = exhibit.tagline;
  dialog.querySelector('#dialog-title').textContent    = exhibit.name;
  dialog.querySelector('.dialog-story').textContent    = exhibit.detail.story;
  dialog.querySelector('.dialog-key-idea').textContent = exhibit.detail.keyIdea;
  dialog.querySelector('.dialog-quote-text').textContent        = exhibit.detail.quote.text;
  dialog.querySelector('.dialog-quote-attribution').textContent = exhibit.detail.quote.attribution;

  const disputedTag = dialog.querySelector('.dialog-disputed-tag');
  disputedTag.hidden = !exhibit.detail.disputed;

  // Carry the room accent into the dialog
  const accent = getComputedStyle(cardEl).getPropertyValue('--room-accent').trim();
  dialog.style.setProperty('--room-accent', accent || 'var(--color-accent-iii)');

  _triggerCard = cardEl;
  dialog.showModal();
  dialog.querySelector('.dialog-close').focus();
}

function initDialogs() {
  const dialog = document.getElementById('exhibit-dialog');

  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

  // Backdrop click closes dialog
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });

  // Restore focus to the triggering card whenever the dialog closes
  dialog.addEventListener('close', () => {
    if (_triggerCard) {
      _triggerCard.focus();
      _triggerCard = null;
    }
  });

  // Open dialog on card click (delegated)
  document.querySelector('main').addEventListener('click', e => {
    const card = e.target.closest('[data-exhibit-id]');
    if (!card) return;
    const id = card.dataset.exhibitId;
    for (const room of rooms) {
      const exhibit = room.exhibits.find(ex => ex.id === id);
      if (exhibit) { openDialog(exhibit, card); return; }
    }
  });

  // Keyboard activation for role="button" cards (Enter / Space)
  document.querySelector('main').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-exhibit-id]');
    if (!card) return;
    e.preventDefault();
    card.click();
  });
}

// ── Concept map ───────────────────────────────────────────────────────────────

function renderConceptMap(container) {
  // Room accent colours (mirrors design tokens)
  const ACCENT = {
    'room-1': '#5478A8',
    'room-2': '#5C7E5F',
    'room-3': '#C87941',
    'room-4': '#7055A0',
    'room-5': '#3E7875',
  };

  // Five nodes in a smooth arc (viewBox 900×360).
  // Arc formula: x evenly spaced, y = 288 - sin(t·π)·216
  const W = 900, H = 360;
  const nodes = rooms.map((room, i) => {
    const t = i / (rooms.length - 1);
    return {
      id:   room.id,
      cx:   Math.round(60 + t * (W - 120)),
      cy:   Math.round(H * 0.8 - Math.sin(t * Math.PI) * H * 0.6),
      r:    room.id === 'room-3' ? 38 : 30,
      name: room.name,
      era:  room.era,
    };
  });

  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Straight-line endpoints offset to node boundary
  function linePts(a, b) {
    const dx = b.cx - a.cx, dy = b.cy - a.cy;
    const L  = Math.hypot(dx, dy);
    const nx = dx / L, ny = dy / L;
    return {
      x1: Math.round(a.cx + nx * a.r), y1: Math.round(a.cy + ny * a.r),
      x2: Math.round(b.cx - nx * b.r), y2: Math.round(b.cy - ny * b.r),
    };
  }

  // Bezier control point for cross-edges (arc dips below the nodes)
  function crossCtrl(a, b) {
    return { cpx: Math.round((a.cx + b.cx) / 2), cpy: 340 };
  }

  const ARROW_ID  = 'arr';
  const ARROW_D_ID = 'arr-d';

  // Build SVG fragments
  let edgeSvg = '';
  let labelSvg = '';

  for (const edge of mapEdges) {
    const a = byId[edge.from], b = byId[edge.to];
    if (!a || !b) continue;

    if (edge.cross) {
      const { cpx, cpy } = crossCtrl(a, b);
      // Quadratic bezier midpoint for label: t=0.5 → 0.25·P0 + 0.5·P1 + 0.25·P2
      const lx = Math.round(0.25 * a.cx + 0.5 * cpx + 0.25 * b.cx);
      const ly = Math.round(0.25 * a.cy + 0.5 * cpy + 0.25 * b.cy);
      edgeSvg += `<path d="M${a.cx} ${a.cy} Q${cpx} ${cpy} ${b.cx} ${b.cy}"
        stroke="#96938D" stroke-width="1" stroke-dasharray="5 4"
        fill="none" marker-end="url(#${ARROW_D_ID})" />`;
      labelSvg += `<text x="${lx}" y="${ly + 5}" class="map-edge-label map-edge-label--cross">${edge.label}</text>`;
    } else {
      const { x1, y1, x2, y2 } = linePts(a, b);
      const mx = Math.round((x1 + x2) / 2), my = Math.round((y1 + y2) / 2);
      // perpendicular offset: rotate 90° to place label to the "outside" of arc
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
      const ox = Math.round(-dy / L * 14), oy = Math.round(dx / L * 14);
      edgeSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="#B8B3A8" stroke-width="1.5"
        marker-end="url(#${ARROW_ID})" />`;
      labelSvg += `<text x="${mx + ox}" y="${my + oy + 5}" class="map-edge-label">${edge.label}</text>`;
    }
  }

  let nodeSvg = '';
  for (const n of nodes) {
    const color = ACCENT[n.id];
    nodeSvg += `
      <g class="map-node" aria-label="Room ${n.era}: ${n.name}">
        <circle cx="${n.cx}" cy="${n.cy}" r="${n.r}"
          fill="#F0EDE7" stroke="${color}" stroke-width="2" />
        <text x="${n.cx}" y="${n.cy - 2}" class="map-node-era" fill="${color}">${n.era}</text>
        <text x="${n.cx}" y="${n.cy + 52}" class="map-node-name">${n.name}</text>
      </g>`;
  }

  const svg = `
<svg viewBox="0 0 ${W} ${H + 40}" xmlns="http://www.w3.org/2000/svg"
     role="img" aria-label="Concept map — how the five eras of faith and reason connect">
  <title>Concept Map — Faith &amp; Reason</title>
  <defs>
    <marker id="${ARROW_ID}" markerWidth="8" markerHeight="6"
            refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#B8B3A8" />
    </marker>
    <marker id="${ARROW_D_ID}" markerWidth="8" markerHeight="6"
            refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#96938D" />
    </marker>
  </defs>

  <!-- Edges drawn first so nodes render on top -->
  ${edgeSvg}
  ${labelSvg}
  ${nodeSvg}
</svg>`;

  // Replace placeholder content
  container.className = 'map-canvas-rendered';
  container.removeAttribute('role');
  container.removeAttribute('aria-label');
  container.innerHTML = svg;
}

async function toggle3D() {
  mode3d = !mode3d;
  document.body.classList.toggle('mode-3d', mode3d);

  const btn = document.getElementById('toggle-3d');
  if (btn) {
    btn.textContent     = mode3d ? 'Klassische Ansicht' : '3D-Museum';
    btn.setAttribute('aria-pressed', String(mode3d));
  }

  if (mode3d) {
    if (!museum3dMod) museum3dMod = await import('./museum3d.js');
    // Re-check mode3d in case user toggled off during the async import
    if (mode3d && currentRoomId) museum3dMod.activateRoom(currentRoomId);
  } else if (museum3dMod) {
    museum3dMod.deactivateAll();
  }
}

function init() {
  buildNav();
  rooms.forEach(renderRoom);
  initScrollSpy();
  initDialogs();

  document.getElementById('toggle-3d')?.addEventListener('click', toggle3D);

  window.addEventListener('resize', () => {
    if (mode3d && museum3dMod && currentRoomId) museum3dMod.resize(currentRoomId);
  }, { passive: true });

  renderConceptMap(document.getElementById('map-canvas'));
}

init();
