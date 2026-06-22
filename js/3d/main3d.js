import * as THREE from 'three';
import { RoomEnvironment }  from 'three/addons/environments/RoomEnvironment.js';
import { buildGallery }     from './GalleryScene.js';
import { setupLighting }    from './Lighting.js';
import { FPControls }       from './FirstPersonControls.js';
import { placeExhibits }    from './ExhibitPlacement.js';
import { Interaction }      from './Interaction.js';
import { buildComposer, resizeComposer } from './PostProcessing.js';
import { buildTextures }    from './Materials.js';
import { rooms }            from '../../data/exhibits.js';
import { ROMAN, ROOM_D, ROOM_COUNT } from './Constants.js';

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas   = document.getElementById('museum3d-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled  = true;
renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
renderer.toneMapping        = THREE.ACESFilmicToneMapping;  // applied by PBR shaders
renderer.toneMappingExposure = 0.85;                         // compensates for reduced ambient/IBL
renderer.outputColorSpace   = THREE.LinearSRGBColorSpace;   // intermediate buffers stay linear

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1816);
scene.fog        = new THREE.Fog(0x1a1816, 14, 65);

// ── IBL ───────────────────────────────────────────────────────────────────────
const pmrem = new THREE.PMREMGenerator(renderer);
const roomEnv = new RoomEnvironment();
scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
scene.environmentIntensity = 0;  // IBL off — RoomEnv overhead triggers bloom via metallic fixture even at 0.40; ambient+points carry fill
pmrem.dispose();
roomEnv.dispose();

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.05, 200);

// ── PBR Texture library ───────────────────────────────────────────────────────
const tex = buildTextures(renderer.capabilities.getMaxAnisotropy());

// ── World ─────────────────────────────────────────────────────────────────────
buildGallery(scene, tex);
setupLighting(scene);
const { exhibitMeshes, allSpotlights } = placeExhibits(scene, tex);

// ── Post-processing ───────────────────────────────────────────────────────────
const pp = buildComposer(renderer, scene, camera);

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

controls.addEventListener('lock',   () => hideOverlay());
controls.addEventListener('unlock', () => {
  if (!suppressOverlay) {
    showOverlay();
    enterBtn.textContent = 'Weiter →';
  }
  suppressOverlay = false;
});

const origActivate = interaction._activate.bind(interaction);
interaction._activate = (id) => { suppressOverlay = true; origActivate(id); };

new MutationObserver(() => {
  if (panelEl.hasAttribute('hidden')) {
    interaction.clearInfluenceLines();
    showOverlay();
    enterBtn.textContent = 'Weiter →';
  }
}).observe(panelEl, { attributes: true, attributeFilter: ['hidden'] });

enterBtn.addEventListener('click', () => controls.lock());

// ── Room tracking ─────────────────────────────────────────────────────────────
let lastRoomIdx = -1;

function updateRoomLabel() {
  const ri = controls.getRoomIndex();
  if (ri === lastRoomIdx) return;
  lastRoomIdx = ri;
  roomLabel.textContent = `Raum ${ROMAN[ri]} — ${rooms[ri]?.title ?? ''}`;
  // Only enable shadow maps for the current room — keeps active shadow textures ≤ 10
  // so total fragment texture units stay under Metal's limit (material maps + shadow maps ≤ 16).
  allSpotlights.forEach(({ spot, roomIdx }) => {
    spot.castShadow = roomIdx === ri;
  });
}

// ── Render loop ───────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  controls.update(dt);
  interaction.update();
  updateRoomLabel();
  pp.composer.render();   // replaces renderer.render(scene, camera)
}
animate();

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const W = innerWidth, H = innerHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
  resizeComposer(pp, W, H);
});
