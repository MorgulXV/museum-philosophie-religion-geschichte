// js/3d/GalleryScene.js — Museum geometry: floor, walls, ceiling, trim, benches
import * as THREE from 'three';
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

const DADO_H    = 1.20;   // dado rail top height
const DADO_RAIL = 0.10;   // rail cap thickness
const CORNICE   = 0.14;   // cornice depth at top of wall

// ── Mesh helpers ───────────────────────────────────────────────────────────────
function mesh(geo, mat, castShadow = false, receiveShadow = false) {
  const m = new THREE.Mesh(geo, mat);
  if (castShadow)    m.castShadow    = true;
  if (receiveShadow) m.receiveShadow = true;
  return m;
}

function box(scene, w, h, d, x, y, z, mat, cs = false, rs = false) {
  const m = mesh(new THREE.BoxGeometry(w, h, d), mat, cs, rs);
  m.position.set(x, y, z);
  scene.add(m);
  return m;
}

// ── Floor ─────────────────────────────────────────────────────────────────────
function buildFloor(scene, tex) {
  const { col, nrm, rgh, disp } = tex.marble;
  const setRep = (t, u, v) => { t.repeat.set(u, v); return t; };
  // Tiles ~2.5 m wide across 20 m floor
  [col, nrm, rgh, disp].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 36);  // slightly larger tiles on dark stone
  });
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x948f88,  // dark charcoal-stone tint — real gallery floors are dark (MoMA, Getty)
    map: col, normalMap: nrm, roughnessMap: rgh,
    displacementMap: disp, displacementScale: 0.010,
    roughness: 0.96, metalness: 0.0, side: THREE.DoubleSide,
    envMapIntensity: 0,  // suppress IBL on floor — RoomEnv overhead causes GGX blob at grazing angles
  });
  const geo  = new THREE.PlaneGeometry(ROOM_W, TOTAL_D, 40, 240);
  const f    = mesh(geo, floorMat, false, true);
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

  // Coffered ceiling — shallow recessed panels per room
  const COFFER_W = (ROOM_W - 2) / 3;   // 3 columns
  const COFFER_D = (ROOM_D - 2) / 3;   // 3 rows per room
  const COFFER_DEPTH = 0.12;
  const cofferMat = new THREE.MeshStandardMaterial({
    color: 0xd2cfc8, roughness: 0.96, metalness: 0, side: THREE.DoubleSide,
  });
  const cofferRimMat = new THREE.MeshStandardMaterial({
    color: 0xdedad3, roughness: 0.88, metalness: 0,
  });

  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const roomZ = ROOM_D * ri + 1;
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const cx = -ROOM_W / 2 + 1 + COFFER_W * (col + 0.5);
        const cz =  roomZ + COFFER_D * (row + 0.5);
        // Recessed panel
        const panel = mesh(new THREE.PlaneGeometry(COFFER_W - 0.2, COFFER_D - 0.2), cofferMat);
        panel.rotation.x = Math.PI / 2;
        panel.position.set(cx, ROOM_H - COFFER_DEPTH, cz);
        scene.add(panel);
        // Rib strips forming coffer walls (connect ceiling plane to recessed panel)
        // BoxGeometry(X-width, Y-height=COFFER_DEPTH, Z-length)
        const rib = (wx, wz, rx, ry, rz) => {
          const r = mesh(new THREE.BoxGeometry(wx, COFFER_DEPTH, wz), cofferRimMat, false, false);
          r.position.set(rx, ry, rz);
          scene.add(r);
        };
        const halfW = COFFER_W / 2, halfD = COFFER_D / 2;
        const ribY  = ROOM_H - COFFER_DEPTH / 2;
        rib(0.20, COFFER_D - 0.20, cx - halfW + 0.10, ribY, cz);  // W rib
        rib(0.20, COFFER_D - 0.20, cx + halfW - 0.10, ribY, cz);  // E rib
        rib(COFFER_W - 0.20, 0.20, cx, ribY, cz - halfD + 0.10);   // N rib
        rib(COFFER_W - 0.20, 0.20, cx, ribY, cz + halfD - 0.10);   // S rib
      }
    }

    // Room-colour accent strip flush with ceiling (hidden by coffers; only peeking through)
    const rz   = ROOM_D * ri + ROOM_D / 2;
    const col  = new THREE.Color(ROOM_TINTS[ri]).multiplyScalar(0.55);
    const accent = mesh(
      new THREE.PlaneGeometry(ROOM_W - 1, ROOM_D - 2),
      new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })
    );
    accent.rotation.x = Math.PI / 2;
    accent.position.set(0, ROOM_H - 0.005, rz);
    scene.add(accent);

    // Ceiling fixture disc + housing per room
    const disc = mesh(new THREE.CircleGeometry(0.30, 16), fixtureMat);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(0, ROOM_H - 0.04, rz);
    scene.add(disc);
    const housing = mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.10, 16, 1, true),
      fixtureHousingMat, true, false
    );
    housing.position.set(0, ROOM_H - 0.05, rz);
    scene.add(housing);
  }
}

// ── Wall section helper ────────────────────────────────────────────────────────
// Builds a wall with dado panel, dado rail cap, cornice, and optional DoubleSide
function wallSection(scene, tex, W, Htotal, depth, x, z, rotY, uScale) {
  const upperH  = Htotal - DADO_H - DADO_RAIL;
  const upperY  = DADO_H + DADO_RAIL + upperH / 2;
  const dadoY   = DADO_H / 2;
  const railY   = DADO_H + DADO_RAIL / 2;
  const corY    = Htotal - CORNICE / 2;

  const vUpper  = Math.ceil(upperH / 2);     // ~1 tile per 2 m vertically
  const vDado   = 1;

  // Geometry convention: BoxGeometry(thickness, height, length)
  // Walls run along Z by default; end walls get rotY=π/2 to run along X.

  // Upper wall
  const up = mesh(
    new THREE.BoxGeometry(depth, upperH, W),
    wallUpperMat(tex, Math.ceil(W / 2) * uScale, vUpper),
    true, true
  );
  up.rotation.y = rotY;
  up.position.set(x, upperY, z);
  scene.add(up);

  // Dado (lower) panel
  const dp = mesh(
    new THREE.BoxGeometry(depth, DADO_H, W),
    wallDadoMat(tex, Math.ceil(W / 2) * uScale, vDado),
    true, true
  );
  dp.rotation.y = rotY;
  dp.position.set(x, dadoY, z);
  scene.add(dp);

  // Dado rail cap
  const rail = mesh(
    new THREE.BoxGeometry(depth + 0.04, DADO_RAIL, W + 0.02),
    dadoRailCapMat, true, false
  );
  rail.rotation.y = rotY;
  rail.position.set(x, railY, z);
  scene.add(rail);

  // Cornice strip
  const corn = mesh(
    new THREE.BoxGeometry(depth + 0.04, CORNICE, W + 0.02),
    corniceMat, true, false
  );
  corn.rotation.y = rotY;
  corn.position.set(x, corY, z);
  scene.add(corn);
}

// ── Side walls ─────────────────────────────────────────────────────────────────
function buildSideWalls(scene, tex) {
  const HW = ROOM_W / 2;
  // Long outer side walls (20 m width × TOTAL_D length box geometry, seen from inside)
  // We build them as a column per room so texture tiling matches
  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const rz = ROOM_D * ri + ROOM_D / 2;
    wallSection(scene, tex, ROOM_D, ROOM_H, 0.30, -HW, rz, 0,      1);  // left
    wallSection(scene, tex, ROOM_D, ROOM_H, 0.30,  HW, rz, Math.PI, 1);  // right
  }
}

// ── End walls ─────────────────────────────────────────────────────────────────
function buildEndWalls(scene, tex) {
  wallSection(scene, tex, ROOM_W, ROOM_H, 0.30, 0, 0,       Math.PI / 2, 1);
  wallSection(scene, tex, ROOM_W, ROOM_H, 0.30, 0, TOTAL_D, Math.PI / 2, 1);
}

// ── Dividing walls with doorways ───────────────────────────────────────────────
function buildDividingWalls(scene, tex) {
  const segW   = (ROOM_W - DOOR_W) / 2;
  const topH   = ROOM_H - DOOR_H;
  const topCy  = DOOR_H + topH / 2;
  const leftCx  = -(ROOM_W / 2) + segW / 2;
  const rightCx =  (ROOM_W / 2) - segW / 2;

  for (let i = 1; i < ROOM_COUNT; i++) {
    const wz   = ROOM_D * i;
    const tint = new THREE.Color(0xf0ede6).lerp(new THREE.Color(ROOM_TINTS[i]), 0.12);
    const hex  = parseInt(tint.getHexString(), 16);

    // Left and right segments (full height panels alongside doorway)
    const segMat  = wallUpperMat(tex, Math.ceil(segW / 2), Math.ceil(ROOM_H / 2));
    segMat.color.set(hex);
    for (const cx of [leftCx, rightCx]) {
      const s = mesh(new THREE.BoxGeometry(segW, ROOM_H, 0.30), segMat, true, true);
      s.position.set(cx, ROOM_H / 2, wz);
      scene.add(s);
    }

    // Transom above door
    const transomMat = wallUpperMat(tex, Math.ceil(DOOR_W / 2), 1);
    transomMat.color.set(hex);
    const t = mesh(new THREE.BoxGeometry(DOOR_W, topH, 0.30), transomMat, true, true);
    t.position.set(0, topCy, wz);
    scene.add(t);

    // Door frame moldings
    const mT = (w, h, d, ox, oy) => {
      const m = mesh(new THREE.BoxGeometry(w, h, d), doorMoldingMat, true, false);
      m.position.set(ox, oy, wz);
      scene.add(m);
    };
    // Left jamb, right jamb, lintel
    mT(0.12, DOOR_H, 0.36,  -(DOOR_W / 2 + 0.06), DOOR_H / 2);
    mT(0.12, DOOR_H, 0.36,   (DOOR_W / 2 + 0.06), DOOR_H / 2);
    mT(DOOR_W + 0.24, 0.12, 0.36, 0, DOOR_H + 0.06);
  }
}

// ── Baseboard ──────────────────────────────────────────────────────────────────
function buildBaseboard(scene) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xb4b0a8, roughness: 0.65, metalness: 0.06,
  });
  const H = 0.12, D = 0.06;
  const HW = ROOM_W / 2 - D / 2;
  // Side baseboards
  const bl = mesh(new THREE.BoxGeometry(D, H, TOTAL_D), mat, false, true);
  bl.position.set(-HW, H / 2, TOTAL_D / 2);
  scene.add(bl);
  const br = mesh(new THREE.BoxGeometry(D, H, TOTAL_D), mat, false, true);
  br.position.set( HW, H / 2, TOTAL_D / 2);
  scene.add(br);
}

// ── Gallery benches ────────────────────────────────────────────────────────────
function buildBenches(scene, tex) {
  const seatMat = benchSeatMat(tex);
  const legGeo  = new THREE.CylinderGeometry(0.028, 0.028, 0.41, 8);
  const SEAT_Y  = 0.44;
  const BENCH_X = 5.0;  // between plinths (±2) and wall (±10)

  for (let ri = 0; ri < ROOM_COUNT; ri++) {
    const bz = ROOM_D * ri + ROOM_D / 2;
    for (const bx of [-BENCH_X, BENCH_X]) {
      const grp = new THREE.Group();
      grp.position.set(bx, 0, bz);
      // Seat plank
      const seat = mesh(new THREE.BoxGeometry(1.50, 0.06, 0.40), seatMat, true, true);
      seat.position.y = SEAT_Y + 0.03;
      grp.add(seat);
      // Leg cross-brace
      const brace = mesh(new THREE.BoxGeometry(1.30, 0.04, 0.06), benchLegMat, true, false);
      brace.position.y = SEAT_Y - 0.20;
      grp.add(brace);
      // 4 legs
      [[-0.64, -0.15], [-0.64, 0.15], [0.64, -0.15], [0.64, 0.15]].forEach(([lx, lz]) => {
        const leg = mesh(legGeo, benchLegMat, true, false);
        leg.position.set(lx, SEAT_Y / 2 - 0.02, lz);
        grp.add(leg);
      });
      scene.add(grp);
    }
  }
}

// ── Entry area — information plinth ────────────────────────────────────────────
function buildInfoStand(scene) {
  const standMat = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.45, metalness: 0.12 });
  // Slim lectern at museum entry (room 1 near back)
  const grp = new THREE.Group();
  grp.position.set(0, 0, 3.5);
  const pole = mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.05, 12), standMat, true, false);
  pole.position.y = 0.525;
  grp.add(pole);
  const top = mesh(new THREE.BoxGeometry(0.55, 0.04, 0.40), standMat, true, true);
  top.position.y = 1.07;
  top.rotation.x = -0.18;
  grp.add(top);
  const base = mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.06, 12), standMat, true, true);
  base.position.y = 0.03;
  grp.add(base);
  scene.add(grp);
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
