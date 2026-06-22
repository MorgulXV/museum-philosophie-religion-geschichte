// js/3d/GalleryScene.js — Museum geometry: floor, walls, ceiling, trim, benches
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  ROOM_W, ROOM_D, ROOM_H, ROOM_COUNT, TOTAL_D,
  DOOR_W, DOOR_H, ROOM_TINTS,
} from './Constants.js';
import {
  wallUpperMat, wallDadoMat, ceilingMat,
  benchSeatMat, benchLegMat,
  corniceMat, dadoRailCapMat, doorMoldingMat,
  fixtureMat, fixtureHousingMat,
} from './Materials.js';

const DADO_H    = 1.20;
const DADO_RAIL = 0.10;
const CORNICE   = 0.14;

// ── Mesh helpers ───────────────────────────────────────────────────────────────
function mesh(geo, mat, castShadow = false, receiveShadow = false) {
  const m = new THREE.Mesh(geo, mat);
  if (castShadow)    m.castShadow    = true;
  if (receiveShadow) m.receiveShadow = true;
  return m;
}

// Bake any geometry to world-space. applyMatrix4 transforms positions/normals only —
// UVs stay in local [0,1]; texture.repeat on the material handles tiling.
function bakedGeo(geo, wx, wy, wz, rotX = 0, rotY = 0, rotZ = 0) {
  const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ));
  geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(wx, wy, wz), quat, new THREE.Vector3(1, 1, 1)));
  return geo;
}

function bakedBox(w, h, d, wx, wy, wz, rotY = 0) {
  return bakedGeo(new THREE.BoxGeometry(w, h, d), wx, wy, wz, 0, rotY, 0);
}

// Merge an array of pre-baked geometries into a single Mesh and add to scene.
function addMerged(scene, geos, mat, castShadow = false, receiveShadow = false) {
  const merged = mergeGeometries(geos, false);
  if (!merged) return;
  const m = new THREE.Mesh(merged, mat);
  m.castShadow    = castShadow;
  m.receiveShadow = receiveShadow;
  scene.add(m);
}

// ── Floor ─────────────────────────────────────────────────────────────────────
function buildFloor(scene, tex) {
  const { col, nrm, rgh, disp } = tex.marble;
  [col, nrm, rgh, disp].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 36);
  });
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x948f88,
    map: col, normalMap: nrm, roughnessMap: rgh,
    displacementMap: disp, displacementScale: 0.010,
    roughness: 0.96, metalness: 0.0, side: THREE.DoubleSide,
    envMapIntensity: 0,
  });
  const geo = new THREE.PlaneGeometry(ROOM_W, TOTAL_D, 8, 48);  // 768 tris vs 19 200 — displacement is 0.01 m, imperceptible at higher density
  const f   = mesh(geo, floorMat, false, true);
  f.rotation.x = -Math.PI / 2;
  f.position.set(0, 0, TOTAL_D / 2);
  scene.add(f);
}

// ── Ceiling ────────────────────────────────────────────────────────────────────
function buildCeiling(scene, tex) {
  // Main ceiling plane
  const mat = ceilingMat(tex, 10, 60);
  const c   = mesh(new THREE.PlaneGeometry(ROOM_W, TOTAL_D), mat);
  c.rotation.x = Math.PI / 2;
  c.position.set(0, ROOM_H, TOTAL_D / 2);
  scene.add(c);

  // Coffered ceiling — 225 individual meshes → 3 InstancedMesh (1 draw call each)
  const COFFER_W     = (ROOM_W - 2) / 3;
  const COFFER_D     = (ROOM_D - 2) / 3;
  const COFFER_DEPTH = 0.12;
  const NCOFFERS     = ROOM_COUNT * 9;  // 45

  const cofferMat = new THREE.MeshStandardMaterial({
    color: 0xd2cfc8, roughness: 0.96, metalness: 0, side: THREE.DoubleSide,
  });
  const cofferRimMat = new THREE.MeshStandardMaterial({
    color: 0xdedad3, roughness: 0.88, metalness: 0,
  });

  const panelInst = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(COFFER_W - 0.20, COFFER_D - 0.20), cofferMat,    NCOFFERS);
  const wRibInst  = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.20, COFFER_DEPTH, COFFER_D - 0.20), cofferRimMat, NCOFFERS * 2);
  const nRibInst  = new THREE.InstancedMesh(
    new THREE.BoxGeometry(COFFER_W - 0.20, COFFER_DEPTH, 0.20), cofferRimMat, NCOFFERS * 2);

  const _m4    = new THREE.Matrix4();
  const _pos   = new THREE.Vector3();
  const _scl   = new THREE.Vector3(1, 1, 1);
  const _qFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  const _qId   = new THREE.Quaternion();
  let pi = 0, wi = 0, ni = 0;

  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const roomZ = ROOM_D * ri + 1;
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const cx    = -ROOM_W / 2 + 1 + COFFER_W * (col + 0.5);
        const cz    = roomZ + COFFER_D * (row + 0.5);
        const ribY  = ROOM_H - COFFER_DEPTH / 2;
        const halfW = COFFER_W / 2, halfD = COFFER_D / 2;

        _pos.set(cx, ROOM_H - COFFER_DEPTH, cz); _m4.compose(_pos, _qFlat, _scl); panelInst.setMatrixAt(pi++, _m4);
        _pos.set(cx - halfW + 0.10, ribY, cz);   _m4.compose(_pos, _qId,   _scl); wRibInst.setMatrixAt(wi++, _m4);
        _pos.set(cx + halfW - 0.10, ribY, cz);   _m4.compose(_pos, _qId,   _scl); wRibInst.setMatrixAt(wi++, _m4);
        _pos.set(cx, ribY, cz - halfD + 0.10);   _m4.compose(_pos, _qId,   _scl); nRibInst.setMatrixAt(ni++, _m4);
        _pos.set(cx, ribY, cz + halfD - 0.10);   _m4.compose(_pos, _qId,   _scl); nRibInst.setMatrixAt(ni++, _m4);
      }
    }
  }

  panelInst.instanceMatrix.needsUpdate = true;
  wRibInst.instanceMatrix.needsUpdate  = true;
  nRibInst.instanceMatrix.needsUpdate  = true;
  scene.add(panelInst);
  scene.add(wRibInst);
  scene.add(nRibInst);

  // Fixture discs + housings — 5 rooms → 2 InstancedMesh (was 10 individual meshes)
  const discInst    = new THREE.InstancedMesh(new THREE.CircleGeometry(0.30, 16), fixtureMat, ROOM_COUNT);
  const housingInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.10, 16, 1, true), fixtureHousingMat, ROOM_COUNT);
  housingInst.castShadow = true;

  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const rz = ROOM_D * ri + ROOM_D / 2;
    _pos.set(0, ROOM_H - 0.04, rz); _m4.compose(_pos, _qFlat, _scl); discInst.setMatrixAt(ri, _m4);
    _pos.set(0, ROOM_H - 0.05, rz); _m4.compose(_pos, _qId,   _scl); housingInst.setMatrixAt(ri, _m4);
  }
  discInst.instanceMatrix.needsUpdate    = true;
  housingInst.instanceMatrix.needsUpdate = true;
  scene.add(discInst);
  scene.add(housingInst);

  // Per-room colour accent strips — different material per room, can't instance
  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const rz  = ROOM_D * ri + ROOM_D / 2;
    const col = new THREE.Color(ROOM_TINTS[ri]).multiplyScalar(0.55);
    const accent = mesh(
      new THREE.PlaneGeometry(ROOM_W - 1, ROOM_D - 2),
      new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })
    );
    accent.rotation.x = Math.PI / 2;
    accent.position.set(0, ROOM_H - 0.005, rz);
    scene.add(accent);
  }
}

// ── Wall section — returns world-baked geometries for caller to merge ──────────
// Replaces the old per-mesh wallSection that added 4 Meshes directly to scene.
function wallSectionGeos(W, Htotal, depth, x, z, rotY) {
  const upperH = Htotal - DADO_H - DADO_RAIL;
  const upperY = DADO_H + DADO_RAIL + upperH / 2;
  const dadoY  = DADO_H / 2;
  const railY  = DADO_H + DADO_RAIL / 2;
  const corY   = Htotal - CORNICE / 2;
  return {
    upper:   bakedBox(depth,        upperH,      W,        x, upperY, z, rotY),
    dado:    bakedBox(depth,        DADO_H,      W,        x, dadoY,  z, rotY),
    rail:    bakedBox(depth + 0.04, DADO_RAIL,   W + 0.02, x, railY,  z, rotY),
    cornice: bakedBox(depth + 0.04, CORNICE,     W + 0.02, x, corY,   z, rotY),
  };
}

// ── Side walls ─────────────────────────────────────────────────────────────────
function buildSideWalls(scene, tex) {
  const HW     = ROOM_W / 2;
  const upperH = ROOM_H - DADO_H - DADO_RAIL;
  // All 10 side wall sections share identical UV repeat — build shared materials once
  const upperMat = wallUpperMat(tex, Math.ceil(ROOM_D / 2), Math.ceil(upperH / 2));
  const dadoMat  = wallDadoMat(tex,  Math.ceil(ROOM_D / 2), 1);

  // All 10 side wall sections share one material — collect all, merge globally → 4 draw calls total
  const upperGs = [], dadoGs = [], railGs = [], cornGs = [];
  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const rz = ROOM_D * ri + ROOM_D / 2;
    const L  = wallSectionGeos(ROOM_D, ROOM_H, 0.30, -HW, rz, 0);
    const R  = wallSectionGeos(ROOM_D, ROOM_H, 0.30,  HW, rz, Math.PI);
    upperGs.push(L.upper, R.upper);
    dadoGs.push(L.dado,   R.dado);
    railGs.push(L.rail,   R.rail);
    cornGs.push(L.cornice, R.cornice);
  }
  addMerged(scene, upperGs, upperMat,       true, true);
  addMerged(scene, dadoGs,  dadoMat,        true, true);
  addMerged(scene, railGs,  dadoRailCapMat, true, false);
  addMerged(scene, cornGs,  corniceMat,     true, false);
}

// ── End walls ─────────────────────────────────────────────────────────────────
function buildEndWalls(scene, tex) {
  const upperH   = ROOM_H - DADO_H - DADO_RAIL;
  const upperMat = wallUpperMat(tex, Math.ceil(ROOM_W / 2), Math.ceil(upperH / 2));
  const dadoMat  = wallDadoMat(tex,  Math.ceil(ROOM_W / 2), 1);
  const A = wallSectionGeos(ROOM_W, ROOM_H, 0.30, 0, 0,       Math.PI / 2);
  const B = wallSectionGeos(ROOM_W, ROOM_H, 0.30, 0, TOTAL_D, Math.PI / 2);
  // Front + back merged per type — 4 draw calls (was 8)
  addMerged(scene, [A.upper,   B.upper  ], upperMat,       true, true);
  addMerged(scene, [A.dado,    B.dado   ], dadoMat,        true, true);
  addMerged(scene, [A.rail,    B.rail   ], dadoRailCapMat, true, false);
  addMerged(scene, [A.cornice, B.cornice], corniceMat,     true, false);
}

// ── Dividing walls with doorways ───────────────────────────────────────────────
function buildDividingWalls(scene, tex) {
  const segW    = (ROOM_W - DOOR_W) / 2;
  const topH    = ROOM_H - DOOR_H;
  const topCy   = DOOR_H + topH / 2;
  const leftCx  = -(ROOM_W / 2) + segW / 2;
  const rightCx =  (ROOM_W / 2) - segW / 2;

  const moldingGeos = [];  // all 12 door moldings → 1 merged mesh

  for (let i = 1; i < ROOM_COUNT; i++) {
    const wz   = ROOM_D * i;
    const tint = new THREE.Color(0xf0ede6).lerp(new THREE.Color(ROOM_TINTS[i]), 0.12);
    const hex  = parseInt(tint.getHexString(), 16);

    // Segments: left+right share the same per-divider tinted material → merge into 1 draw call
    const segMat = wallUpperMat(tex, Math.ceil(segW / 2), Math.ceil(ROOM_H / 2));
    segMat.color.set(hex);
    addMerged(scene, [
      bakedBox(segW, ROOM_H, 0.30, leftCx,  ROOM_H / 2, wz),
      bakedBox(segW, ROOM_H, 0.30, rightCx, ROOM_H / 2, wz),
    ], segMat, true, true);

    // Transom: unique per-room tint, stays individual
    const transomMat = wallUpperMat(tex, Math.ceil(DOOR_W / 2), 1);
    transomMat.color.set(hex);
    const t = mesh(new THREE.BoxGeometry(DOOR_W, topH, 0.30), transomMat, true, true);
    t.position.set(0, topCy, wz);
    scene.add(t);

    // Collect molding geometries for a single global merged mesh
    moldingGeos.push(bakedBox(0.12,          DOOR_H, 0.36, -(DOOR_W / 2 + 0.06), DOOR_H / 2,    wz));
    moldingGeos.push(bakedBox(0.12,          DOOR_H, 0.36,  (DOOR_W / 2 + 0.06), DOOR_H / 2,    wz));
    moldingGeos.push(bakedBox(DOOR_W + 0.24, 0.12,   0.36,  0,                    DOOR_H + 0.06, wz));
  }

  addMerged(scene, moldingGeos, doorMoldingMat, true, false);  // 12 → 1
}

// ── Baseboard ──────────────────────────────────────────────────────────────────
function buildBaseboard(scene) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xb4b0a8, roughness: 0.65, metalness: 0.06 });
  const H = 0.12, D = 0.06;
  const HW = ROOM_W / 2 - D / 2;
  addMerged(scene, [
    bakedBox(D, H, TOTAL_D, -HW, H / 2, TOTAL_D / 2),
    bakedBox(D, H, TOTAL_D,  HW, H / 2, TOTAL_D / 2),
  ], mat, false, true);
}

// ── Gallery benches ────────────────────────────────────────────────────────────
function buildBenches(scene, tex) {
  // 60 individual meshes → 3 InstancedMesh (1 draw call each)
  const seatMat = benchSeatMat(tex);
  const SEAT_Y  = 0.44;
  const BENCH_X = 5.0;
  const NBENCH  = ROOM_COUNT * 2;

  const seatInst  = new THREE.InstancedMesh(new THREE.BoxGeometry(1.50, 0.06, 0.40), seatMat,     NBENCH);
  const braceInst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.30, 0.04, 0.06), benchLegMat, NBENCH);
  const legInst   = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.41, 8), benchLegMat, NBENCH * 4);
  seatInst.receiveShadow = true;
  legInst.castShadow     = true;

  const _m4  = new THREE.Matrix4();
  const _pos = new THREE.Vector3();
  const _scl = new THREE.Vector3(1, 1, 1);
  const _q   = new THREE.Quaternion();
  let si = 0, bi = 0, li = 0;

  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const bz = ROOM_D * ri + ROOM_D / 2;
    for (const bx of [-BENCH_X, BENCH_X]) {
      _pos.set(bx, SEAT_Y + 0.03, bz); _m4.compose(_pos, _q, _scl); seatInst.setMatrixAt(si++, _m4);
      _pos.set(bx, SEAT_Y - 0.20, bz); _m4.compose(_pos, _q, _scl); braceInst.setMatrixAt(bi++, _m4);
      for (const [lx, lz] of [[-0.64, -0.15], [-0.64, 0.15], [0.64, -0.15], [0.64, 0.15]]) {
        _pos.set(bx + lx, SEAT_Y / 2 - 0.02, bz + lz);
        _m4.compose(_pos, _q, _scl);
        legInst.setMatrixAt(li++, _m4);
      }
    }
  }

  seatInst.instanceMatrix.needsUpdate  = true;
  braceInst.instanceMatrix.needsUpdate = true;
  legInst.instanceMatrix.needsUpdate   = true;
  scene.add(seatInst);
  scene.add(braceInst);
  scene.add(legInst);
}

// ── Entry area — information plinth ────────────────────────────────────────────
function buildInfoStand(scene) {
  const standMat = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.45, metalness: 0.12 });
  addMerged(scene, [
    bakedGeo(new THREE.CylinderGeometry(0.04, 0.06, 1.05, 12), 0, 0.525, 3.5),
    bakedGeo(new THREE.BoxGeometry(0.55, 0.04, 0.40),          0, 1.07,  3.5, -0.18),
    bakedGeo(new THREE.CylinderGeometry(0.20, 0.22, 0.06, 12), 0, 0.03,  3.5),
  ], standMat, true, true);
}

// ── Main export ────────────────────────────────────────────────────────────────
export function buildGallery(scene, tex) {
  buildFloor(scene, tex);
  buildCeiling(scene, tex);
  buildSideWalls(scene, tex);
  buildEndWalls(scene, tex);
  buildDividingWalls(scene, tex);
  buildBaseboard(scene);
  buildBenches(scene, tex);
  buildInfoStand(scene);
}
