// js/3d/ExhibitPlacement.js — Exhibit frames, pedestals, and artwork planes
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { getExhibitsByRoom } from '../../data/exhibits.js';
import {
  ROOM_W, ROOM_D, ROOM_H, ROOM_COUNT, STRAND_COLORS, STRAND_HEX, STRAND_LABELS_DE,
} from './Constants.js';
import { frameMat, plinthMat } from './Materials.js';

const FRAME_W     = 1.4;
const FRAME_H     = 1.6;
const FRAME_DEPTH = 0.10;
const FRAME_Y     = 2.55;
// 0.22 (not 0.20) so the frame back face clears the wall inner face — prevents Z-fighting
const WALL_OFFSET = 0.22;

const LEFT_X  = -(ROOM_W / 2) + WALL_OFFSET;
const RIGHT_X =  (ROOM_W / 2) - WALL_OFFSET;

const PLINTH_H = 1.00;
const OBJ_Y    = PLINTH_H + 0.45;

let _frameMat  = null;
let _plinthMat = null;
const _rebateMat = new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.55, metalness: 0.05 });

export function placeExhibits(scene, tex) {
  _frameMat  = frameMat(tex);
  _plinthMat = plinthMat(tex);

  const exhibitMeshes = new Map();

  const frameGeos  = [];
  const rebateGeos = [];
  const plinthGeos = [];

  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const exs   = getExhibitsByRoom(ri + 1);
    const roomZ = ROOM_D * ri;
    const phi   = exs.filter(e => e.strand === 'philosophie');
    const rel   = exs.filter(e => e.strand === 'religion');
    const geo   = exs.filter(e => e.strand === 'geschichte');

    placeWallRow(scene, phi, LEFT_X,  -Math.PI / 2, roomZ, exhibitMeshes, frameGeos, rebateGeos);
    placeWallRow(scene, rel, RIGHT_X,  Math.PI / 2, roomZ, exhibitMeshes, frameGeos, rebateGeos);
    placePlinths(scene, geo, roomZ, exhibitMeshes, plinthGeos);
  }

  _addMerged(scene, frameGeos,  _frameMat,  false, false);
  _addMerged(scene, rebateGeos, _rebateMat, false, false);
  _addMerged(scene, plinthGeos, _plinthMat, false, false);

  return { exhibitMeshes };
}

function _addMerged(scene, geos, mat, castShadow, receiveShadow) {
  if (!geos.length) return;
  const merged = mergeGeometries(geos, false);
  if (!merged) return;
  const m = new THREE.Mesh(merged, mat);
  m.castShadow    = castShadow;
  m.receiveShadow = receiveShadow;
  scene.add(m);
}

function placeWallRow(scene, exhibits, wallX, rotY, roomZ, meshMap, frameGeos, rebateGeos) {
  if (!exhibits.length) return;
  const usable  = ROOM_D - 4;
  const spacing = usable / (exhibits.length + 1);

  const groupQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  const _scl      = new THREE.Vector3(1, 1, 1);

  exhibits.forEach((exhibit, i) => {
    const z = roomZ + 2 + spacing * (i + 1);

    const fgeo = new THREE.BoxGeometry(FRAME_W, FRAME_H, FRAME_DEPTH);
    fgeo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(wallX, FRAME_Y, z), groupQuat, _scl));
    frameGeos.push(fgeo);

    const rebateOffset = new THREE.Vector3(0, 0, -(FRAME_DEPTH * 0.3)).applyQuaternion(groupQuat);
    const rebatePos    = new THREE.Vector3(wallX, FRAME_Y, z).add(rebateOffset);
    const rgeo = new THREE.BoxGeometry(FRAME_W - 0.18, FRAME_H - 0.18, FRAME_DEPTH * 0.4);
    rgeo.applyMatrix4(new THREE.Matrix4().compose(rebatePos, groupQuat, _scl));
    rebateGeos.push(rgeo);

    const group = new THREE.Group();
    group.rotation.y = rotY;
    group.position.set(wallX, FRAME_Y, z);
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
  });
}

function placePlinths(scene, exhibits, roomZ, meshMap, plinthGeos) {
  if (!exhibits.length) return;
  const usable  = ROOM_D - 4;
  const spacing = usable / (exhibits.length + 1);
  const sCol    = new THREE.Color(STRAND_COLORS.geschichte);

  exhibits.forEach((exhibit, i) => {
    const z = roomZ + 2 + spacing * (i + 1);
    const x = (i % 2 === 0) ? -2.0 : 2.0;

    const pedGeo = new THREE.CylinderGeometry(0.34, 0.42, PLINTH_H, 12);
    pedGeo.setAttribute('uv1', pedGeo.attributes.uv);
    pedGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(x, PLINTH_H / 2, z));
    plinthGeos.push(pedGeo);

    const capGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 12);
    capGeo.setAttribute('uv1', capGeo.attributes.uv);
    capGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(x, PLINTH_H + 0.03, z));
    plinthGeos.push(capGeo);

    const objCol = sCol.clone().lerp(new THREE.Color(STRAND_COLORS[exhibit.strand]), 0.6).multiplyScalar(1.3);
    const objMat = new THREE.MeshStandardMaterial({
      color: objCol, roughness: 0.42, metalness: 0.28, envMapIntensity: 1.2,
    });
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const obj = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), objMat);
    obj.position.y         = OBJ_Y;
    obj.rotation.y         = (Math.PI / 7) + i * 0.4;
    obj.userData.exhibitId = exhibit.id;
    group.add(obj);
    scene.add(group);

    meshMap.set(exhibit.id, { mesh: obj, exhibit, baseEmissive: 0 });
  });
}

function buildFrameTexture(exhibit) {
  const W = 512, H = 640;
  const c   = document.createElement('canvas');
  c.width   = W; c.height = H;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#1e1c18';
  ctx.fillRect(0, 0, W, H);
  for (let g = 0; g < 300; g++) {
    const a = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  const hex = STRAND_HEX[exhibit.strand] || '#888';

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);

  ctx.font          = '16px "Courier New", monospace';
  ctx.fillStyle     = hex;
  ctx.textAlign     = 'center';
  ctx.letterSpacing = '0.15em';
  ctx.fillText((STRAND_LABELS_DE[exhibit.strand] || '').toUpperCase(), W / 2, 38);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(52, 56); ctx.lineTo(W - 52, 56); ctx.stroke();

  ctx.font      = 'bold 48px Georgia, serif';
  ctx.fillStyle = '#f0ece0';
  wrapText(ctx, exhibit.name.split(' — ')[0], W / 2, 112, 440, 56);

  ctx.beginPath(); ctx.moveTo(52, H - 138); ctx.lineTo(W - 52, H - 138); ctx.stroke();

  ctx.font      = '24px "Courier New", monospace';
  ctx.fillStyle = '#b0a890';
  ctx.fillText(exhibit.date, W / 2, H - 95);

  ctx.font      = '14px "Courier New", monospace';
  ctx.fillStyle = 'rgba(200,190,170,0.40)';
  ctx.fillText(exhibit.artefact?.assetHint || '', W / 2, H - 58);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
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
