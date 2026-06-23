import { exhibits, rooms, buildInfluenceGraph, getExhibitById, getExhibitsByRoom, getInfluencedBy } from '../data/exhibits.js';
import { openExhibit, scrollToExhibit } from './render.js';

const STRAND_COLORS = {
  philosophie: '#3f5775',
  religion:    '#3a5a48',
  geschichte:  '#6b5236',
};

const ROOM_COLORS = {
  1: '#4a6fa5', 2: '#2d6a4f', 3: '#b5541a', 4: '#8b2635', 5: '#4a4a4a'
};

const MOBILE_BREAKPOINT = 768;
const isMobile = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

let canvas, ctx;
let layout = {};
let hoveredId = null;
let lastOpenId = null;
let animProgress = 0;
let animStart = null;
let isAnimating = true;

let transform = { x: 0, y: 0, scale: 1 };
let drag = { active: false, startX: 0, startY: 0, tx: 0, ty: 0 };

let canvasInited = false;
let listBuilt = false;

const { nodes, edges } = buildInfluenceGraph();

function computeLayout(w, h) {
  const laneW = w / 5;
  const strandOrder = ['philosophie', 'religion', 'geschichte'];
  const roomNodes = [[], [], [], [], []];

  nodes.forEach(n => roomNodes[n.room - 1].push(n));

  roomNodes.forEach((group, roomIdx) => {
    group.sort((a, b) => strandOrder.indexOf(a.strand) - strandOrder.indexOf(b.strand));
    const colX = laneW * roomIdx + laneW / 2;
    const totalH = h - 80;
    const step = totalH / (group.length + 1);
    group.forEach((n, i) => {
      const inDeg = edges.filter(e => e.target === n.id).length;
      const radius = Math.min(6 + inDeg * 1.5, 16);
      layout[n.id] = { x: colX, y: 40 + step * (i + 1), r: radius };
    });
  });
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function worldToScreen(wx, wy) {
  return {
    x: wx * transform.scale + transform.x,
    y: wy * transform.scale + transform.y,
  };
}

function screenToWorld(sx, sy) {
  return {
    x: (sx - transform.x) / transform.scale,
    y: (sy - transform.y) / transform.scale,
  };
}

function drawEdges(progress) {
  const filter = activeFilter();
  edges.forEach(edge => {
    const src = layout[edge.source];
    const tgt = layout[edge.target];
    if (!src || !tgt) return;

    const srcNode = nodes.find(n => n.id === edge.source);
    const tgtNode = nodes.find(n => n.id === edge.target);
    const col = STRAND_COLORS[srcNode?.strand] || '#888';

    const isHighlighted = hoveredId && (edge.source === hoveredId || edge.target === hoveredId);
    const dimByFilter = filter && srcNode?.strand !== filter && tgtNode?.strand !== filter;

    let edgeStroke, edgeAlpha;
    if (dimByFilter) {
      edgeStroke = 'rgba(26,23,20,0.04)';
      edgeAlpha = 1;
    } else if (hoveredId) {
      if (isHighlighted) {
        edgeStroke = col;
        edgeAlpha = 0.85;
      } else {
        edgeStroke = 'rgba(26,23,20,0.07)';
        edgeAlpha = 1;
      }
    } else {
      edgeStroke = 'rgba(26,23,20,0.25)';
      edgeAlpha = 1;
    }

    ctx.save();
    ctx.globalAlpha = edgeAlpha;
    ctx.strokeStyle = edgeStroke;
    ctx.lineWidth = isHighlighted ? 2 : 1;

    const srcS = worldToScreen(src.x, src.y);
    const tgtS = worldToScreen(tgt.x, tgt.y);

    // Bezier
    const cp1x = (srcS.x + tgtS.x) / 2;
    const cp1y = srcS.y;
    const cp2x = (srcS.x + tgtS.x) / 2;
    const cp2y = tgtS.y;

    // Animate draw on first load
    if (isAnimating && progress < 1) {
      const tx = srcS.x + (tgtS.x - srcS.x) * progress;
      const ty = srcS.y + (tgtS.y - srcS.y) * progress;
      ctx.beginPath();
      ctx.moveTo(srcS.x, srcS.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(srcS.x, srcS.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tgtS.x, tgtS.y);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(tgtS.y - cp2y, tgtS.x - cp2x);
      const arrowLen = 7 * transform.scale;
      const tR = (layout[edge.target]?.r || 6) * transform.scale + 2;
      const ax = tgtS.x - Math.cos(angle) * tR;
      const ay = tgtS.y - Math.sin(angle) * tR;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - arrowLen * Math.cos(angle - 0.4), ay - arrowLen * Math.sin(angle - 0.4));
      ctx.lineTo(ax - arrowLen * Math.cos(angle + 0.4), ay - arrowLen * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = edgeStroke;
      ctx.fill();
    }
    ctx.restore();
  });
}

// Distinct shape per strand so the graph reads without relying on hue alone.
function tracePath(strand, x, y, r) {
  ctx.beginPath();
  if (strand === 'religion') {
    // diamond
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
  } else if (strand === 'geschichte') {
    // upward triangle
    const h = r * 1.15;
    ctx.moveTo(x, y - h); ctx.lineTo(x + h * 0.92, y + h * 0.66);
    ctx.lineTo(x - h * 0.92, y + h * 0.66); ctx.closePath();
  } else {
    // circle (philosophie)
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
}

function activeFilter() {
  return document.body.dataset.strandFilter || null;
}

function drawNodes() {
  const filter = activeFilter();
  nodes.forEach(node => {
    const pos = layout[node.id];
    if (!pos) return;

    const { x, y } = worldToScreen(pos.x, pos.y);
    const r = pos.r * transform.scale;
    const col = STRAND_COLORS[node.strand] || '#888';
    const isHovered = hoveredId === node.id;
    const dimByFilter = filter && node.strand !== filter;

    let alpha;
    if (dimByFilter) alpha = 0.1;
    else if (isHovered) alpha = 1.0;
    else if (hoveredId) alpha = 0.5;
    else alpha = 0.9;

    ctx.save();
    if (isHovered && !dimByFilter) {
      ctx.shadowBlur = 20 * transform.scale;
      ctx.shadowColor = col;
    }
    tracePath(node.strand, x, y, isHovered ? r + 4 * transform.scale : r);
    ctx.fillStyle = col;
    ctx.globalAlpha = alpha;
    ctx.fill();
    // subtle ring on hover for extra non-color emphasis
    if (isHovered && !dimByFilter) {
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1a1714';
      ctx.globalAlpha = 0.6;
      tracePath(node.strand, x, y, r + 7 * transform.scale);
      ctx.stroke();
    }
    ctx.restore();

    // Label
    if (transform.scale > 0.6) {
      ctx.save();
      ctx.font = `${Math.max(8, 9 * transform.scale)}px 'Inter', sans-serif`;
      ctx.fillStyle = isHovered ? '#1a1714' : '#57514b';
      ctx.globalAlpha = dimByFilter ? 0.08 : (isHovered ? 1.0 : (hoveredId ? 0.3 : 0.7));
      ctx.textAlign = 'center';
      ctx.fillText(node.label, x, y + r + 12 * transform.scale);
      ctx.restore();
    }
  });
}

function drawLaneLabels() {
  if (!canvas) return;
  const laneW = (canvas.width / devicePixelRatio) / 5;
  const roomNames = ['Antike', 'Mittelalter', 'Richterin', 'Anklage', 'Gespräch'];

  ctx.save();
  ctx.font = `10px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';

  roomNames.forEach((name, i) => {
    const cx = laneW * i + laneW / 2;
    const { x } = worldToScreen(cx, 0);
    ctx.fillStyle = 'rgba(26,23,20,0.45)';
    ctx.globalAlpha = 1;
    ctx.fillText(`${['I','II','III','IV','V'][i]} ${name}`, x, 16);
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = 'rgba(26,23,20,1)';
    ctx.lineWidth = 1;
    if (i > 0) {
      const lx = worldToScreen(laneW * i, 0).x;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, canvas.height / devicePixelRatio);
      ctx.stroke();
    }
  });
  ctx.restore();
}

function render(ts) {
  if (!canvas || !ctx) return;
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f2f0ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawLaneLabels();

  let progress = 1;
  if (isAnimating) {
    if (!animStart) animStart = ts;
    progress = Math.min((ts - animStart) / 900, 1);
    if (progress >= 1) isAnimating = false;
    requestAnimationFrame(render);
  }

  drawEdges(progress);
  drawNodes();

  // Tooltip on hover
  if (hoveredId) {
    const pos = layout[hoveredId];
    const node = nodes.find(n => n.id === hoveredId);
    if (pos && node) {
      const { x, y } = worldToScreen(pos.x, pos.y);
      const exhibit = getExhibitById(hoveredId);
      const txt = exhibit?.name || node.label;
      const padding = 8;
      ctx.save();
      ctx.font = '12px Inter, sans-serif';
      const tw = ctx.measureText(txt).width;
      const bx = x - tw / 2 - padding;
      const by = y - pos.r * transform.scale - 36;
      const bw = tw + padding * 2;
      const bh = 24;
      ctx.fillStyle = 'rgba(250,249,247,0.97)';
      ctx.strokeStyle = 'rgba(26,23,20,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1a1714';
      ctx.textAlign = 'center';
      ctx.fillText(txt, x, by + 16);
      ctx.restore();
    }
  }
}

function scheduleRender() {
  if (!isAnimating) requestAnimationFrame(render);
}

function hitTest(sx, sy) {
  const { x: wx, y: wy } = screenToWorld(sx, sy);
  for (const node of nodes) {
    const pos = layout[node.id];
    if (!pos) continue;
    const dx = wx - pos.x;
    const dy = wy - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) <= pos.r + 4) return node.id;
  }
  return null;
}

function initCanvasGraph() {
  canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    computeLayout(rect.width, rect.height);
    scheduleRender();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  requestAnimationFrame(render);

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const id = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (id !== hoveredId) {
      hoveredId = id;
      canvas.style.cursor = id ? 'pointer' : 'grab';
      scheduleRender();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredId = null;
    scheduleRender();
  });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    if (drag.moved) return;
    const id = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (id) openExhibit(id);
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.5, Math.min(3.0, transform.scale * delta));
    const scaleRatio = newScale / transform.scale;
    transform.x = mx - scaleRatio * (mx - transform.x);
    transform.y = my - scaleRatio * (my - transform.y);
    transform.scale = newScale;
    scheduleRender();
  }, { passive: false });

  canvas.addEventListener('pointerdown', e => {
    drag.active = true;
    drag.moved = false;
    drag.startX = e.clientX - transform.x;
    drag.startY = e.clientY - transform.y;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', e => {
    if (!drag.active) return;
    const nx = e.clientX - drag.startX;
    const ny = e.clientY - drag.startY;
    if (Math.abs(nx - transform.x) > 2 || Math.abs(ny - transform.y) > 2) drag.moved = true;
    transform.x = nx;
    transform.y = ny;
    scheduleRender();
  });

  canvas.addEventListener('pointerup', () => { drag.active = false; });

  // Keyboard navigation for the canvas (accessibility)
  canvas.addEventListener('keydown', e => {
    const PAN = 60;
    switch (e.key) {
      case 'ArrowLeft':  transform.x += PAN; break;
      case 'ArrowRight': transform.x -= PAN; break;
      case 'ArrowUp':    transform.y += PAN; break;
      case 'ArrowDown':  transform.y -= PAN; break;
      case '+': case '=': zoomButton(1.25); return;
      case '-': case '_': zoomButton(0.8); return;
      // Tab is intentionally NOT intercepted: focus must be able to leave the
      // canvas (WCAG 2.1.2). Keyboard node access is provided by search.
      case 'Enter': case ' ':
        if (hoveredId) { e.preventDefault(); openExhibit(hoveredId); }
        return;
      default: return;
    }
    e.preventDefault();
    scheduleRender();
  });

  canvasInited = true;
}

function buildMobileList() {
  const container = document.getElementById('influence-list');
  if (!container || listBuilt) return;

  const STRAND_ORDER = ['philosophie', 'religion', 'geschichte'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

  rooms.forEach(room => {
    const roomExhibits = getExhibitsByRoom(room.id)
      .slice()
      .sort((a, b) => STRAND_ORDER.indexOf(a.strand) - STRAND_ORDER.indexOf(b.strand));

    const group = document.createElement('div');
    group.className = 'infl-room-group';

    const heading = document.createElement('h3');
    heading.className = 'infl-room-heading';
    heading.textContent = `${ROMAN[room.id - 1]} ${room.title}`;
    heading.style.setProperty('--room-color', `var(--room-${room.id})`);
    group.appendChild(heading);

    roomExhibits.forEach(exhibit => {
      const card = document.createElement('div');
      card.className = 'infl-card';

      const head = document.createElement('div');
      head.className = 'infl-card-head';
      head.addEventListener('click', () => openExhibit(exhibit.id));

      const dot = document.createElement('span');
      dot.className = 'infl-strand-dot';
      dot.textContent = '●';
      dot.style.color = `var(--${exhibit.strand})`;

      const name = document.createElement('span');
      name.className = 'infl-name';
      name.textContent = exhibit.name;

      const date = document.createElement('span');
      date.className = 'infl-date';
      date.textContent = exhibit.date;

      head.appendChild(dot);
      head.appendChild(name);
      head.appendChild(date);
      card.appendChild(head);

      if (exhibit.influences && exhibit.influences.length > 0) {
        const label = document.createElement('p');
        label.className = 'infl-rel-label';
        label.textContent = 'Beeinflusst →';
        card.appendChild(label);

        const chips = document.createElement('div');
        chips.className = 'infl-chips';
        exhibit.influences.forEach(targetId => {
          const target = getExhibitById(targetId);
          if (!target) return;
          const chip = document.createElement('button');
          chip.className = 'infl-chip';
          chip.textContent = target.name.split(' — ')[0];
          chip.addEventListener('click', e => { e.stopPropagation(); openExhibit(targetId); });
          chips.appendChild(chip);
        });
        card.appendChild(chips);
      }

      const influencers = getInfluencedBy(exhibit.id);
      if (influencers.length > 0) {
        const label = document.createElement('p');
        label.className = 'infl-rel-label';
        label.textContent = '← Beeinflusst durch';
        card.appendChild(label);

        const chips = document.createElement('div');
        chips.className = 'infl-chips';
        influencers.forEach(src => {
          const chip = document.createElement('button');
          chip.className = 'infl-chip';
          chip.textContent = src.name.split(' — ')[0];
          chip.addEventListener('click', e => { e.stopPropagation(); openExhibit(src.id); });
          chips.appendChild(chip);
        });
        card.appendChild(chips);
      }

      group.appendChild(card);
    });

    container.appendChild(group);
  });

  listBuilt = true;
}

// View preference: null = auto (graph on desktop, list on mobile), or forced 'graph' | 'list'
let viewPref = null;

function listMode() {
  return viewPref === 'list' || (viewPref === null && isMobile());
}

function applyMode() {
  const stage = document.querySelector('.graph-stage');
  const listEl = document.getElementById('influence-list');
  const hintDesktop = document.querySelector('.graph-hint-desktop');
  const hintMobile = document.querySelector('.graph-hint-mobile');
  const showList = listMode();

  if (showList) {
    if (stage) stage.hidden = true;
    if (listEl) listEl.hidden = false;
    if (hintDesktop) hintDesktop.hidden = true;
    if (hintMobile) hintMobile.hidden = false;
    buildMobileList();
  } else {
    if (stage) stage.hidden = false;
    if (listEl) listEl.hidden = true;
    if (hintDesktop) hintDesktop.hidden = false;
    if (hintMobile) hintMobile.hidden = true;
    if (!canvasInited) initCanvasGraph();
    else scheduleRender();
  }

  // Reflect in the view toggle
  const gBtn = document.getElementById('view-graph');
  const lBtn = document.getElementById('view-list');
  if (gBtn && lBtn) {
    gBtn.classList.toggle('active', !showList);
    lBtn.classList.toggle('active', showList);
    gBtn.setAttribute('aria-selected', String(!showList));
    lBtn.setAttribute('aria-selected', String(showList));
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function graphVisible() {
  const stage = document.querySelector('.graph-stage');
  return canvasInited && stage && !stage.hidden;
}

/* ── Zoom + pan controls ─────────────────────────────────────────── */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function zoomAround(cx, cy, factor) {
  const newScale = clamp(transform.scale * factor, 0.5, 3.0);
  const ratio = newScale / transform.scale;
  transform.x = cx - ratio * (cx - transform.x);
  transform.y = cy - ratio * (cy - transform.y);
  transform.scale = newScale;
}

function zoomButton(factor) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  zoomAround(rect.width / 2, rect.height / 2, factor);
  scheduleRender();
}

function resetView() {
  tweenTransform({ x: 0, y: 0, scale: 1 });
}

function tweenTransform(target, dur = 450) {
  if (prefersReducedMotion()) {
    Object.assign(transform, target);
    scheduleRender();
    return;
  }
  const start = { x: transform.x, y: transform.y, scale: transform.scale };
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
    transform.x = start.x + (target.x - start.x) * e;
    transform.y = start.y + (target.y - start.y) * e;
    transform.scale = start.scale + (target.scale - start.scale) * e;
    if (!isAnimating) render(now);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Center a node in the viewport and highlight it; optionally open its panel.
export function focusGraphNode(id, { open = false, highlight = true } = {}) {
  if (!graphVisible()) {
    if (open) openExhibit(id);
    return;
  }
  const pos = layout[id];
  if (!pos || !canvas) { if (open) openExhibit(id); return; }
  const rect = canvas.getBoundingClientRect();
  const scale = Math.max(transform.scale, 1.6);
  if (highlight) { hoveredId = id; }
  tweenTransform({ scale, x: rect.width / 2 - pos.x * scale, y: rect.height / 2 - pos.y * scale });
  if (open) setTimeout(() => openExhibit(id), 500);
}

/* ── Search ──────────────────────────────────────────────────────── */
function initSearch() {
  const input = document.getElementById('graph-search');
  const list = document.getElementById('graph-search-results');
  if (!input || !list) return;

  let activeIdx = -1;
  let matches = [];

  const close = () => {
    list.hidden = true;
    list.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    activeIdx = -1;
    matches = [];
  };

  const select = (id) => {
    close();
    input.blur();
    if (graphVisible()) focusGraphNode(id, { open: true });
    else { scrollToExhibit(id); setTimeout(() => openExhibit(id), 350); }
  };

  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    matches = exhibits.filter(e =>
      e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
    ).slice(0, 8);
    if (!matches.length) {
      list.innerHTML = '<li class="search-empty" role="option">Kein Treffer</li>';
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      return;
    }
    list.innerHTML = matches.map((e, i) => `
      <li role="option" id="search-opt-${i}" data-id="${e.id}"
          aria-selected="${i === activeIdx}"
          class="${i === activeIdx ? 'active' : ''}">
        <span class="search-dot" style="background:var(--${e.strand})"></span>
        <span class="search-name">${e.name.split(' — ')[0]}</span>
        <span class="search-date">${e.date}</span>
      </li>`).join('');
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    [...list.querySelectorAll('li[data-id]')].forEach(li => {
      li.addEventListener('mousedown', ev => { ev.preventDefault(); select(li.dataset.id); });
    });
  };

  input.addEventListener('input', () => { activeIdx = -1; render(); });
  input.addEventListener('focus', () => { if (input.value.trim()) render(); });
  input.addEventListener('blur', () => setTimeout(close, 150));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && matches.length) {
      e.preventDefault(); activeIdx = (activeIdx + 1) % matches.length; render();
    } else if (e.key === 'ArrowUp' && matches.length) {
      e.preventDefault(); activeIdx = (activeIdx - 1 + matches.length) % matches.length; render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matches.length) select(matches[activeIdx >= 0 ? activeIdx : 0].id);
    } else if (e.key === 'Escape') {
      input.value = ''; close();
    }
  });
}

/* ── View toggle + zoom buttons + help hint ──────────────────────── */
function initControls() {
  document.getElementById('zoom-in')?.addEventListener('click', () => zoomButton(1.25));
  document.getElementById('zoom-out')?.addEventListener('click', () => zoomButton(0.8));
  document.getElementById('zoom-reset')?.addEventListener('click', resetView);

  const gBtn = document.getElementById('view-graph');
  const lBtn = document.getElementById('view-list');
  gBtn?.addEventListener('click', () => { viewPref = 'graph'; applyMode(); });
  lBtn?.addEventListener('click', () => { viewPref = 'list'; applyMode(); });

  // Help hint card
  const help = document.getElementById('graph-help');
  const card = document.getElementById('graph-hintcard');
  const closeCard = card?.querySelector('.hintcard-close');
  const toggleCard = (show) => {
    if (!card || !help) return;
    const open = show ?? card.hidden;
    card.hidden = !open;
    help.setAttribute('aria-expanded', String(open));
  };
  help?.addEventListener('click', () => toggleCard());
  closeCard?.addEventListener('click', () => toggleCard(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && card && !card.hidden) toggleCard(false);
  });
}

let firstGraphReveal = false;
function initOnboarding() {
  // Auto-show the hint card once per session when the graph first scrolls into view.
  const card = document.getElementById('graph-hintcard');
  const help = document.getElementById('graph-help');
  const map = document.getElementById('influence-map');
  if (!card || !map) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !firstGraphReveal && graphVisible()) {
        firstGraphReveal = true;
        card.hidden = false;
        help?.setAttribute('aria-expanded', 'true');
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(map);
}

function initGraph() {
  applyMode();
  initSearch();
  initControls();
  initOnboarding();

  // Re-render the canvas when the strand filter changes
  const filterObs = new MutationObserver(() => scheduleRender());
  filterObs.observe(document.body, { attributes: true, attributeFilter: ['data-strand-filter'] });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyMode, 150);
  });
}

document.addEventListener('DOMContentLoaded', initGraph);
