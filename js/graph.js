import { exhibits, buildInfluenceGraph, getExhibitById } from '../data/exhibits.js';
import { openExhibit } from './render.js';

const STRAND_COLORS = {
  philosophie: '#3f5775',
  religion:    '#3a5a48',
  geschichte:  '#6b5236',
};

const ROOM_COLORS = {
  1: '#4a6fa5', 2: '#2d6a4f', 3: '#b5541a', 4: '#8b2635', 5: '#4a4a4a'
};

let canvas, ctx;
let layout = {};
let hoveredId = null;
let lastOpenId = null;
let animProgress = 0;
let animStart = null;
let isAnimating = true;

let transform = { x: 0, y: 0, scale: 1 };
let drag = { active: false, startX: 0, startY: 0, tx: 0, ty: 0 };

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
  edges.forEach(edge => {
    const src = layout[edge.source];
    const tgt = layout[edge.target];
    if (!src || !tgt) return;

    const srcNode = nodes.find(n => n.id === edge.source);
    const col = STRAND_COLORS[srcNode?.strand] || '#888';

    const isHighlighted = hoveredId && (edge.source === hoveredId || edge.target === hoveredId);

    let edgeStroke, edgeAlpha;
    if (hoveredId) {
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

function drawNodes() {
  nodes.forEach(node => {
    const pos = layout[node.id];
    if (!pos) return;

    const { x, y } = worldToScreen(pos.x, pos.y);
    const r = pos.r * transform.scale;
    const col = STRAND_COLORS[node.strand] || '#888';
    const isHovered = hoveredId === node.id;

    ctx.save();

    if (isHovered) {
      ctx.shadowBlur = 20 * transform.scale;
      ctx.shadowColor = col;
    }

    ctx.beginPath();
    ctx.arc(x, y, isHovered ? r + 4 * transform.scale : r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.globalAlpha = isHovered ? 1.0 : (hoveredId ? 0.5 : 0.85);
    ctx.fill();

    ctx.restore();

    // Label
    if (transform.scale > 0.6) {
      const shortName = node.label;
      ctx.save();
      ctx.font = `${Math.max(8, 9 * transform.scale)}px 'Inter', sans-serif`;
      ctx.fillStyle = isHovered ? '#1a1714' : '#57514b';
      ctx.globalAlpha = isHovered ? 1.0 : (hoveredId ? 0.3 : 0.7);
      ctx.textAlign = 'center';
      ctx.fillText(shortName, x, y + r + 12 * transform.scale);
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

function initGraph() {
  canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.getBoundingClientRect();
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
      canvas.style.cursor = id ? 'pointer' : 'crosshair';
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
}

document.addEventListener('DOMContentLoaded', initGraph);
