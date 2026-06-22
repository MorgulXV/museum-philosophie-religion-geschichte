// museum.js — All five rooms with per-room asset lifecycle management
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { rooms } from './data/exhibits.js';

// Mirrors --color-accent-* tokens from styles.css
const ACCENT_HEX = {
  'room-1': 0x5478A8,
  'room-2': 0x5C7E5F,
  'room-3': 0xC87941,
  'room-4': 0x7055A0,
  'room-5': 0x3E7875,
};

// ── Permanent renderer / scene / camera ────────────────────────────────────────
const canvas = document.getElementById('museum-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled   = true;
renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0C0B09);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);

// Permanent lights — never disposed
scene.add(new THREE.AmbientLight(0xE8D8C0, 0.7));
const fill = new THREE.DirectionalLight(0x7080a0, 0.12);
fill.position.set(0, 4, 8);
scene.add(fill);

// ── Controls (permanent) ──────────────────────────────────────────────────────
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;

// ── Room constants ────────────────────────────────────────────────────────────
const RW = 10, RH = 4, RD = 10;
const PEDESTAL_H      = 1.2;
const PEDESTAL_R      = 0.28;
const ARTIFACT_R      = 0.22;
const PED_Z           = -1.5;
const SPOT_Y          = RH - 0.2;
const EMISSIVE_NORMAL = 0.45;
const EMISSIVE_HOVER  = 0.95;

const OVERVIEW_POS    = new THREE.Vector3(0, 2.5, 7.5);
const OVERVIEW_TARGET = new THREE.Vector3(0, PEDESTAL_H + ARTIFACT_R, PED_Z);

// ── Per-room state ─────────────────────────────────────────────────────────────
let currentRoomIndex    = 0;
let currentLoadGen      = 0;
let roomGroup           = null;
let clickables          = [];
let focusedItem         = null;
let hoveredItem         = null;
let pendingLoads        = 0;

// ── UI elements ───────────────────────────────────────────────────────────────
const panel          = document.getElementById('exhibit-panel');
const panelClose     = document.getElementById('panel-close');
const loadingOverlay = document.getElementById('loading-overlay');

// ── Multi-touch tap tracking ──────────────────────────────────────────────────
// Maps pointerId → {x, y} for each active pointer.
// pointerTapCancelled becomes true the moment a second finger goes down;
// cleared after all fingers lift. Prevents pinch-zoom from registering as tap.
const activePointers     = new Map();
let   pointerTapCancelled = false;

// ── GLB loader (reused) ───────────────────────────────────────────────────────
const gltfLoader = new GLTFLoader();

// ── Dispose ───────────────────────────────────────────────────────────────────
function disposeRoomGroup(group) {
  if (!group) return;
  scene.remove(group);

  const geoms = new Set();
  const mats  = new Set();

  group.traverse(obj => {
    if (obj.isLight && obj.shadow?.map) obj.shadow.map.dispose();
    if (!obj.isMesh) return;
    if (obj.geometry) geoms.add(obj.geometry);
    const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
    ms.forEach(m => { if (m) mats.add(m); });
  });

  geoms.forEach(g => g.dispose());
  mats.forEach(m => {
    for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap',
                     'emissiveMap', 'envMap', 'aoMap', 'lightMap', 'alphaMap']) {
      if (m[k]?.isTexture) m[k].dispose();
    }
    m.dispose();
  });
}

// ── Model normalization ───────────────────────────────────────────────────────
function normalizeModel(root, targetSize) {
  const box3 = new THREE.Box3().setFromObject(root);
  const size  = new THREE.Vector3();
  box3.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim === 0) return;
  root.scale.setScalar(targetSize / maxDim);
  box3.setFromObject(root);
  const center = new THREE.Vector3();
  box3.getCenter(center);
  root.position.x -= center.x;
  root.position.y -= center.y;
  root.position.z -= center.z;
}

function setGroupEmissive(group, intensity) {
  group.traverse(obj => {
    if (!obj.isMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach(m => { if ('emissiveIntensity' in m) m.emissiveIntensity = intensity; });
  });
}

function pedestalX(i, count) {
  if (count === 1) return 0;
  const spread = RW - 3.0;
  return -spread / 2 + (i / (count - 1)) * spread;
}

// ── Load room ─────────────────────────────────────────────────────────────────
function loadRoom(index) {
  camAnim.active   = false;
  controls.enabled = true;

  disposeRoomGroup(roomGroup);
  roomGroup  = null;
  clickables = [];
  hoveredItem = null;

  if (focusedItem) { focusedItem = null; hidePanel(); }

  // Clear any loading overlay from the previous room
  pendingLoads = 0;
  loadingOverlay?.setAttribute('hidden', '');

  const gen = ++currentLoadGen;
  currentRoomIndex = index;

  const roomData  = rooms[index];
  const accentHex = ACCENT_HEX[roomData.id] ?? 0xB8B3A8;
  const exhibits  = roomData.exhibits ?? [];
  const N         = Math.max(exhibits.length, 1);

  const group = new THREE.Group();

  const wallMat  = new THREE.MeshStandardMaterial({ color: 0xF0EDE7, roughness: 0.88, metalness: 0 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xD8D4CB, roughness: 0.92, metalness: 0 });
  const pedMat   = new THREE.MeshStandardMaterial({ color: 0xE8E4DF, roughness: 0.65, metalness: 0 });
  const stripMat = new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.8,  metalness: 0 });

  function addBox(w, h, d, mat, x, y, z, recv = false) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = recv;
    group.add(m);
    return m;
  }

  addBox(RW,   0.15, RD,   floorMat, 0,              -0.075,             0, true);
  addBox(RW,   0.15, RD,   wallMat,  0,               RH + 0.075,        0, false);
  addBox(0.15, RH,   RD,   wallMat, -RW / 2 - 0.075,  RH / 2,            0, true);
  addBox(0.15, RH,   RD,   wallMat,  RW / 2 + 0.075,  RH / 2,            0, true);
  addBox(RW,   RH,   0.15, wallMat,  0,               RH / 2, -RD / 2 - 0.075, true);

  const strip = new THREE.Mesh(new THREE.BoxGeometry(RW, 0.06, 0.14), stripMat);
  strip.position.set(0, 0.03, -RD / 2 - 0.075);
  group.add(strip);

  for (let i = 0; i < N; i++) {
    const px  = pedestalX(i, N);
    const artY = PEDESTAL_H + ARTIFACT_R;

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(PEDESTAL_R, PEDESTAL_R, PEDESTAL_H, 32),
      pedMat
    );
    pedestal.position.set(px, PEDESTAL_H / 2, PED_Z);
    pedestal.castShadow = pedestal.receiveShadow = true;
    group.add(pedestal);

    const artMat = new THREE.MeshStandardMaterial({
      color:             accentHex,
      emissive:          new THREE.Color(accentHex),
      emissiveIntensity: EMISSIVE_NORMAL,
      roughness:         0.3,
      metalness:         0.1,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(ARTIFACT_R, 32, 16), artMat);
    sphere.castShadow = true;

    const artGroup = new THREE.Group();
    artGroup.position.set(px, artY, PED_Z);
    artGroup.add(sphere);
    group.add(artGroup);

    const spot = new THREE.SpotLight(0xfff4e0, 4.5);
    spot.angle      = Math.PI / 9;
    spot.penumbra   = 0.35;
    spot.decay      = 2;
    spot.distance   = 5.5;
    spot.castShadow = true;
    spot.shadow.mapSize.set(512, 512);
    spot.position.set(px, SPOT_Y, PED_Z);
    group.add(spot);

    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(px, PEDESTAL_H * 0.6, PED_Z);
    group.add(spotTarget);
    spot.target = spotTarget;

    const c = { group: artGroup, pedestal, exhibit: exhibits[i] ?? null };
    artGroup.userData.clickableRef  = c;
    pedestal.userData.clickableRef  = c;
    clickables.push(c);
  }

  scene.add(group);
  roomGroup = group;

  camera.position.copy(OVERVIEW_POS);
  controls.target.copy(OVERVIEW_TARGET);
  controls.update();

  // Start loading GLB models; show spinner while any are pending
  const toLoad = exhibits.filter(e => e?.model);
  if (toLoad.length > 0) {
    pendingLoads = toLoad.length;
    loadingOverlay?.removeAttribute('hidden');
  }

  // Local finishLoad closes over gen — stale callbacks from superseded rooms
  // return early without touching pendingLoads for the current room.
  function finishLoad() {
    if (currentLoadGen !== gen) return;
    pendingLoads = Math.max(0, pendingLoads - 1);
    if (pendingLoads === 0) loadingOverlay?.setAttribute('hidden', '');
  }

  exhibits.forEach((exhibit, i) => {
    if (!exhibit?.model) return;
    const c = clickables[i];
    if (!c) return;
    gltfLoader.load(
      exhibit.model,
      (gltf) => {
        if (currentLoadGen !== gen) return;
        const model = gltf.scene;
        normalizeModel(model, ARTIFACT_R * 2);
        while (c.group.children.length) {
          const child = c.group.children[0];
          c.group.remove(child);
          if (child.isMesh) {
            child.geometry?.dispose();
            const ms = Array.isArray(child.material) ? child.material : [child.material];
            ms.forEach(m => m?.dispose());
          }
        }
        c.group.add(model);
        finishLoad();
      },
      undefined,
      (err) => {
        if (currentLoadGen !== gen) return;
        console.warn(`[museum] Model "${exhibit.model}":`, err.message ?? err);
        finishLoad();
      }
    );
  });

  updateNavUI();
}

// ── Navigation UI ─────────────────────────────────────────────────────────────
function updateNavUI() {
  const roomData = rooms[currentRoomIndex];
  const counter  = document.getElementById('room-counter');
  const title    = document.getElementById('room-title');
  const prevBtn  = document.getElementById('btn-prev');
  const nextBtn  = document.getElementById('btn-next');

  if (counter) counter.textContent = `Raum ${currentRoomIndex + 1} von ${rooms.length}`;
  if (title)   title.textContent   = `${roomData.era}. ${roomData.name}`;
  if (prevBtn) prevBtn.disabled    = currentRoomIndex === 0;
  if (nextBtn) nextBtn.disabled    = currentRoomIndex === rooms.length - 1;
}

function goToRoom(index) {
  if (index < 0 || index >= rooms.length) return;
  loadRoom(index);
}

// ── Camera animation ──────────────────────────────────────────────────────────
const camAnim = {
  active: false, t: 0,
  fromPos:    new THREE.Vector3(),
  toPos:      new THREE.Vector3(),
  fromTarget: new THREE.Vector3(),
  toTarget:   new THREE.Vector3(),
  onDone: null,
};

function easeOutCubic(t) { return 1 - (1 - t) ** 3; }

function moveCameraTo(pos, target, onDone) {
  camAnim.fromPos.copy(camera.position);
  camAnim.fromTarget.copy(controls.target);
  camAnim.toPos.copy(pos);
  camAnim.toTarget.copy(target);
  camAnim.t        = 0;
  camAnim.active   = true;
  camAnim.onDone   = onDone ?? null;
  controls.enabled = false;
}

// ── Exhibit panel ─────────────────────────────────────────────────────────────
function showPanel(exhibit) {
  document.getElementById('panel-tagline').textContent    = exhibit.tagline;
  document.getElementById('panel-title').textContent      = exhibit.name;
  document.getElementById('panel-key-idea').textContent   = exhibit.detail.keyIdea;
  document.getElementById('panel-quote-text').textContent = exhibit.detail.quote.text;
  document.getElementById('panel-quote-attr').textContent  = exhibit.detail.quote.attribution;
  document.getElementById('panel-disputed').hidden = !exhibit.detail.disputed;
  panel.classList.add('visible');
  panel.removeAttribute('aria-hidden');
  panelClose.focus();
}

function hidePanel() {
  panel.classList.remove('visible');
  panel.setAttribute('aria-hidden', 'true');
}

// ── Raycaster ─────────────────────────────────────────────────────────────────
const raycaster  = new THREE.Raycaster();
const ndcPointer = new THREE.Vector2();

function toNDC(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  ndcPointer.set(
    ((clientX - r.left) / r.width)  *  2 - 1,
    ((clientY - r.top)  / r.height) * -2 + 1
  );
}

function hitTest(clientX, clientY) {
  toNDC(clientX, clientY);
  raycaster.setFromCamera(ndcPointer, camera);
  const targets = clickables.flatMap(c => [c.group, c.pedestal]);
  const hits = raycaster.intersectObjects(targets, true);
  if (!hits.length) return null;
  let obj = hits[0].object;
  while (obj) {
    if (obj.userData.clickableRef) return obj.userData.clickableRef;
    obj = obj.parent;
  }
  return null;
}

function openItem(item) {
  if (!item?.exhibit) return;
  focusedItem = item;
  const p = item.group.position;
  moveCameraTo(
    new THREE.Vector3(p.x, p.y + 0.15, p.z + 2.2),
    new THREE.Vector3(p.x, p.y,         p.z),
    () => { controls.enabled = true; }
  );
  showPanel(item.exhibit);
}

function closeItem() {
  focusedItem = null;
  hidePanel();
  moveCameraTo(
    OVERVIEW_POS.clone(),
    OVERVIEW_TARGET.clone(),
    () => { controls.enabled = true; }
  );
}

// ── Pointer / touch events ────────────────────────────────────────────────────

// Long-press context menu blocks touch tap registration on some mobile browsers
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Hover — mouse only
canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' || camAnim.active) return;
  const hit = hitTest(e.clientX, e.clientY);
  if (hoveredItem && hoveredItem !== hit) {
    setGroupEmissive(hoveredItem.group, EMISSIVE_NORMAL);
    hoveredItem = null;
    canvas.style.cursor = 'default';
  }
  if (hit && hit !== hoveredItem) {
    setGroupEmissive(hit.group, EMISSIVE_HOVER);
    hoveredItem = hit;
    canvas.style.cursor = 'pointer';
  }
});

canvas.addEventListener('pointerleave', () => {
  if (hoveredItem) {
    setGroupEmissive(hoveredItem.group, EMISSIVE_NORMAL);
    hoveredItem = null;
    canvas.style.cursor = 'default';
  }
});

// Tap detection — works for both mouse clicks and single-finger touch.
// A second finger sets pointerTapCancelled for the whole gesture so that
// lifting either finger during a pinch-zoom never fires openItem/closeItem.
canvas.addEventListener('pointerdown', e => {
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (activePointers.size > 1) pointerTapCancelled = true;
});

canvas.addEventListener('pointerup', e => {
  const start       = activePointers.get(e.pointerId);
  activePointers.delete(e.pointerId);
  const wasCancelled = pointerTapCancelled;
  if (activePointers.size === 0) pointerTapCancelled = false;

  if (!start || wasCancelled || camAnim.active) return;
  const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5;
  if (moved) return;

  const hit = hitTest(e.clientX, e.clientY);
  if (hit)              openItem(hit);
  else if (focusedItem) closeItem();
});

canvas.addEventListener('pointercancel', e => {
  activePointers.delete(e.pointerId);
  if (activePointers.size === 0) pointerTapCancelled = false;
});

panelClose.addEventListener('click', closeItem);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && focusedItem) { closeItem(); return; }
  if (panel.classList.contains('visible')) return;
  if (e.key === 'ArrowLeft')  goToRoom(currentRoomIndex - 1);
  if (e.key === 'ArrowRight') goToRoom(currentRoomIndex + 1);
});

document.getElementById('btn-prev')?.addEventListener('click', () => goToRoom(currentRoomIndex - 1));
document.getElementById('btn-next')?.addEventListener('click', () => goToRoom(currentRoomIndex + 1));

// ── Render loop ───────────────────────────────────────────────────────────────
function tick() {
  requestAnimationFrame(tick);

  if (camAnim.active) {
    camAnim.t = Math.min(camAnim.t + 0.025, 1);
    const ease = easeOutCubic(camAnim.t);
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, ease);
    controls.target.lerpVectors(camAnim.fromTarget, camAnim.toTarget, ease);
    if (camAnim.t >= 1) {
      camAnim.active = false;
      controls.update();
      if (camAnim.onDone) camAnim.onDone();
    }
  } else {
    controls.update();
  }

  renderer.render(scene, camera);
}

// ── Resize ────────────────────────────────────────────────────────────────────
function onResize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize, { passive: true });
onResize();

// ── Init — start at room-3 (index 2), the only room with exhibit content ──────
loadRoom(2);
tick();
