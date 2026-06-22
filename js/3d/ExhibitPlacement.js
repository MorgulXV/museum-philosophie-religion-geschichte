// js/3d/ExhibitPlacement.js — Exhibit frames, pedestals, and artwork planes
import * as THREE from 'three';
import { getExhibitsByRoom } from '../../data/exhibits.js';
import {
  ROOM_W, ROOM_D, ROOM_H, ROOM_COUNT, STRAND_COLORS, STRAND_HEX, STRAND_LABELS_DE,
} from './Constants.js';
import { addExhibitSpotlight } from './Lighting.js';
import { frameMat, plinthMat } from './Materials.js';

const FRAME_W     = 1.4;
const FRAME_H     = 1.6;
const FRAME_DEPTH = 0.10;
const FRAME_Y     = 2.55;
const WALL_OFFSET = 0.20;

const LEFT_X  = -(ROOM_W / 2) + WALL_OFFSET;
const RIGHT_X =  (ROOM_W / 2) - WALL_OFFSET;

const PLINTH_H = 1.00;
const OBJ_Y    = PLINTH_H + 0.45;

// Shared PBR materials — built once, referenced by all exhibits
let _frameMat  = null;
let _plinthMat = null;

export function placeExhibits(scene, tex) {
  _frameMat  = frameMat(tex);
  _plinthMat = plinthMat(tex);

  const exhibitMeshes = new Map();
  const allSpotlights = [];

  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const exs    = getExhibitsByRoom(ri + 1);
    const roomZ  = ROOM_D * ri;
    const phi    = exs.filter(e => e.strand === 'philosophie');
    const rel    = exs.filter(e => e.strand === 'religion');
    const geo    = exs.filter(e => e.strand === 'geschichte');

    placeWallRow(scene, phi, LEFT_X,  -Math.PI / 2, roomZ, ri, exhibitMeshes, allSpotlights);
    placeWallRow(scene, rel, RIGHT_X,  Math.PI / 2, roomZ, ri, exhibitMeshes, allSpotlights);
    placePlinths(scene, geo, roomZ, ri, exhibitMeshes, allSpotlights);
  }

  return { exhibitMeshes, allSpotlights };
}

// ── Wall exhibits ──────────────────────────────────────────────────────────────
function placeWallRow(scene, exhibits, wallX, rotY, roomZ, roomIdx, meshMap, spots) {
  if (!exhibits.length) return;
  const usable  = ROOM_D - 4;
  const spacing = usable / (exhibits.length + 1);

  exhibits.forEach((exhibit, i) => {
    const z    = roomZ + 2 + spacing * (i + 1);
    const sCol = new THREE.Color(STRAND_COLORS[exhibit.strand]);

    const group = new THREE.Group();
    group.rotation.y = rotY;
    group.position.set(wallX, FRAME_Y, z);

    // Outer frame — dark espresso Wood051 PBR
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(FRAME_W, FRAME_H, FRAME_DEPTH),
      _frameMat
    );
    frame.castShadow    = true;
    frame.receiveShadow = true;
    group.add(frame);

    // Narrow inner rebate (slightly lighter wood cap)
    const rebateW = FRAME_W - 0.18;
    const rebateH = FRAME_H - 0.18;
    const rebateMat = new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.55, metalness: 0.05 });
    const rebate = new THREE.Mesh(
      new THREE.BoxGeometry(rebateW, rebateH, FRAME_DEPTH * 0.4),
      rebateMat
    );
    rebate.position.z = -(FRAME_DEPTH * 0.3);
    group.add(rebate);

    // Artwork inner plane — MeshBasicMaterial keeps canvas text crisp
    const inner = new THREE.Mesh(
      new THREE.PlaneGeometry(FRAME_W - 0.16, FRAME_H - 0.16),
      new THREE.MeshBasicMaterial({ map: buildFrameTexture(exhibit) })
    );
    inner.position.z = -(FRAME_DEPTH / 2 + 0.005);
    inner.rotation.y = Math.PI;
    inner.userData.exhibitId = exhibit.id;
    group.add(inner);

    scene.add(group);
    meshMap.set(exhibit.id, { mesh: inner, exhibit, baseEmissive: 0 });

    // Exhibit spotlight — angled from ceiling toward the artwork
    const sx  = wallX + (rotY < 0 ? 1.8 : -1.8);
    const spot = addExhibitSpotlight(scene, sx, ROOM_H - 0.3, z, wallX, FRAME_Y - 0.1, z, roomIdx);
    spots.push({ spot, roomIdx });
  });
}

// ── Freestanding plinths ───────────────────────────────────────────────────────
function placePlinths(scene, exhibits, roomZ, roomIdx, meshMap, spots) {
  if (!exhibits.length) return;
  const usable  = ROOM_D - 4;
  const spacing = usable / (exhibits.length + 1);
  const sCol    = new THREE.Color(STRAND_COLORS.geschichte);

  exhibits.forEach((exhibit, i) => {
    const z = roomZ + 2 + spacing * (i + 1);
    const x = (i % 2 === 0) ? -2.0 : 2.0;

    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Pedestal cylinder — Concrete007 PBR with AO
    const pedGeo = new THREE.CylinderGeometry(0.34, 0.42, PLINTH_H, 12);
    pedGeo.setAttribute('uv1', pedGeo.attributes.uv);  // AO map needs second UV set
    const ped = new THREE.Mesh(pedGeo, _plinthMat);
    ped.position.y   = PLINTH_H / 2;
    ped.castShadow   = true;
    ped.receiveShadow = true;
    group.add(ped);

    // Cap — smooth polished stone top
    const capGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 12);
    capGeo.setAttribute('uv1', capGeo.attributes.uv);
    const cap = new THREE.Mesh(capGeo, _plinthMat);
    cap.position.y   = PLINTH_H + 0.03;
    cap.castShadow   = true;
    cap.receiveShadow = true;
    group.add(cap);

    // Object on plinth — coloured, semi-metallic artefact with strand tint
    const objCol  = sCol.clone().lerp(new THREE.Color(STRAND_COLORS[exhibit.strand]), 0.6).multiplyScalar(1.3);
    const objMat  = new THREE.MeshStandardMaterial({
      color: objCol, roughness: 0.42, metalness: 0.28,
      envMapIntensity: 1.2,
    });
    const obj = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), objMat);
    obj.position.y     = OBJ_Y;
    obj.rotation.y     = (Math.PI / 7) + i * 0.4;
    obj.castShadow     = true;
    obj.receiveShadow  = true;
    obj.userData.exhibitId = exhibit.id;
    group.add(obj);

    scene.add(group);
    meshMap.set(exhibit.id, { mesh: obj, exhibit, baseEmissive: 0 });

    // Narrow straight-down pedestal spot (PI/14 ≈ 12.9°) — cone radius = 5.7*tan(12.9°) = 1.30m
    // Plinth centre is 2m from corridor axis, so x=0 stays outside the cone.
    const spot = addExhibitSpotlight(scene, x, ROOM_H - 0.3, z, x, OBJ_Y, z, roomIdx, Math.PI / 14);
    spots.push({ spot, roomIdx });
  });
}

// ── Canvas artwork texture ─────────────────────────────────────────────────────
function buildFrameTexture(exhibit) {
  const W = 512, H = 640;
  const c   = document.createElement('canvas');
  c.width   = W; c.height = H;
  const ctx = c.getContext('2d');

  // Dark gallery label — real museum nameplates use dark backgrounds with light text
  ctx.fillStyle = '#1e1c18';
  ctx.fillRect(0, 0, W, H);
  // Very subtle grain
  for (let g = 0; g < 300; g++) {
    const a = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  const hex = STRAND_HEX[exhibit.strand] || '#888';

  // Top + bottom accent bars — strand colour
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);

  // Strand label — strand colour, bright on dark bg
  ctx.font          = '16px "Courier New", monospace';
  ctx.fillStyle     = hex;
  ctx.textAlign     = 'center';
  ctx.letterSpacing = '0.15em';
  ctx.fillText((STRAND_LABELS_DE[exhibit.strand] || '').toUpperCase(), W / 2, 38);

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(52, 56); ctx.lineTo(W - 52, 56); ctx.stroke();

  // Exhibit title — warm cream on dark
  ctx.font      = 'bold 48px Georgia, serif';
  ctx.fillStyle = '#f0ece0';
  wrapText(ctx, exhibit.name.split(' — ')[0], W / 2, 112, 440, 56);

  // Second divider
  ctx.beginPath(); ctx.moveTo(52, H - 138); ctx.lineTo(W - 52, H - 138); ctx.stroke();

  // Date — muted grey
  ctx.font      = '24px "Courier New", monospace';
  ctx.fillStyle = '#b0a890';
  ctx.fillText(exhibit.date, W / 2, H - 95);

  // Artefact hint
  ctx.font      = '14px "Courier New", monospace';
  ctx.fillStyle = 'rgba(200,190,170,0.40)';
  ctx.fillText(exhibit.artefact?.assetHint || '', W / 2, H - 58);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;  // canvas paints in sRGB; mark it so Three.js linearises correctly
  return tex;
}

function wrapText(ctx, text, cx, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), cx, y);
      line = w + ' ';
      y   += lh;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), cx, y);
}
