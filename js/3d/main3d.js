import * as THREE from 'three';
import { RoomEnvironment }  from 'three/addons/environments/RoomEnvironment.js';
import { buildGallery }     from './GalleryScene.js';
import { setupLighting }    from './Lighting.js';
import { FPControls }       from './FirstPersonControls.js';
import { placeExhibits }    from './ExhibitPlacement.js';
import { Interaction }      from './Interaction.js';
import { buildTextures }    from './Materials.js';
import { rooms }            from '../../data/exhibits.js';
import { ROMAN, ROOM_COUNT } from './Constants.js';

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas   = document.getElementById('museum3d-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false });
renderer.setPixelRatio(1);  // no retina scaling — 4× fill-rate saving on HiDPI screens
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled  = false;  // no shadows — eliminates shadow map sampling from all fragment shaders
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace   = THREE.SRGBColorSpace;  // handles gamma automatically; no post-processing pass needed

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1816);
scene.fog        = new THREE.Fog(0x1a1816, 14, 65);

// ── IBL ───────────────────────────────────────────────────────────────────────
const pmrem = new THREE.PMREMGenerator(renderer);
const roomEnv = new RoomEnvironment();
scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
scene.environmentIntensity = 0;
pmrem.dispose();
roomEnv.dispose();

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.05, 200);

// ── PBR Texture library ───────────────────────────────────────────────────────
const tex = buildTextures(renderer.capabilities.getMaxAnisotropy());

// ── World ─────────────────────────────────────────────────────────────────────
buildGallery(scene, tex);
setupLighting(scene);
const { exhibitMeshes } = placeExhibits(scene, tex);

// ── Controls ──────────────────────────────────────────────────────────────────
const controls    = new FPControls(camera, renderer.domElement);
const interaction = new Interaction(camera, exhibitMeshes, scene, controls);

// ── UI elements ───────────────────────────────────────────────────────────────
const enterOverlay = document.getElementById('enter-overlay');
const enterBtn     = document.getElementById('enter-btn');
const crosshair    = document.getElementById('crosshair');
const roomLabel    = document.getElementById('room-label');
const panelEl      = document.getElementById('exhibit-panel');

let suppressOverlay = false;

function showOverlay() {
  enterOverlay.style.display = '';
  crosshair.hidden = true;
  roomLabel.hidden = true;
}
function hideOverlay() {
  enterOverlay.style.display = 'none';
  crosshair.hidden = false;
  roomLabel.hidden = false;
}

// ── Render-on-demand ──────────────────────────────────────────────────────────
let _dirty = true;
function markDirty() { _dirty = true; }

controls.addEventListener('lock',   () => { hideOverlay(); markDirty(); });
controls.addEventListener('unlock', () => {
  // Show overlay only when user presses Escape mid-exploration (no panel open).
  // Panel-close path re-locks immediately; that also fires 'lock', not 'unlock'.
  if (!suppressOverlay && panelEl.hasAttribute('hidden')) {
    showOverlay();
    enterBtn.textContent = 'Weiter →';
  }
  suppressOverlay = false;
  markDirty();
});

const origActivate = interaction._activate.bind(interaction);
interaction._activate = (id) => { suppressOverlay = true; origActivate(id); };

// Panel close → hide overlay so canvas is visible; cursor stays free.
// User clicks the canvas when ready to re-enter first-person mode.
function reenterMuseum() {
  enterOverlay.style.display = 'none';
  markDirty();
}

document.getElementById('panel-close').addEventListener('click', reenterMuseum);
document.getElementById('panel-overlay').addEventListener('click', reenterMuseum);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !panelEl.hasAttribute('hidden')) reenterMuseum();
});

// Click anywhere on the canvas (cursor free) → re-enter pointer lock
canvas.addEventListener('click', () => {
  if (!controls.isLocked) controls.lock();
});

new MutationObserver(() => {
  if (panelEl.hasAttribute('hidden')) {
    interaction.clearInfluenceLines();
  }
  markDirty();
}).observe(panelEl, { attributes: true, attributeFilter: ['hidden'] });

enterBtn.addEventListener('click', () => controls.lock());

// ── Room tracking ─────────────────────────────────────────────────────────────
let lastRoomIdx = -1;

function updateRoomLabel() {
  const ri = controls.getRoomIndex();
  if (ri === lastRoomIdx) return;
  lastRoomIdx = ri;
  roomLabel.textContent = `Raum ${ROMAN[ri]} — ${rooms[ri]?.title ?? ''}`;
}

// ── Render loop ───────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();  // always consume to prevent accumulated-time jump

  if (controls.isLocked) _dirty = true;
  if (!_dirty) return;
  _dirty = false;

  controls.update(dt);
  interaction.update();
  updateRoomLabel();
  renderer.render(scene, camera);  // direct render — no EffectComposer overhead
}
animate();

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const W = innerWidth, H = innerHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
  markDirty();
});
