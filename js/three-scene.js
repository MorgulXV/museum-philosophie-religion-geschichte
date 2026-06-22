import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { exhibits, rooms, getExhibitsByRoom, getInfluencedBy, buildInfluenceGraph } from '../data/exhibits.js';

const STRAND_COLORS = {
  philosophie: 0x3b5a8c,
  religion:    0x2a5c42,
  geschichte:  0x6b4a25,
};

const ROOM_OFFSETS = [0, 40, 80, 120, 160];
const ROOM_COLORS  = [0x3b5a8c, 0x2a5c42, 0x8c4a15, 0x6e1e2a, 0x4a4035];

let scene, camera, renderer, controls;
let raycaster, pointer;
let clock;

const artifactMeshes = new Map();  // exhibitId -> mesh
const pedestalGroup  = new Map();  // exhibitId -> Group
let influenceLines = [];
let currentRoomIdx = 0;
let openExhibitId = null;

const tooltip = document.getElementById('three-tooltip');
const panel   = document.getElementById('three-panel');
const panelContent = document.getElementById('three-panel-content');
const closeBtn = document.getElementById('three-panel-close');

const STRAND_LABELS = { philosophie: 'Philosophie', religion: 'Religion', geschichte: 'Geschichte' };

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f0e6);
  scene.fog = new THREE.FogExp2(0xf4f0e6, 0.006);

  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
  camera.position.set(0, 12, 22);

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three-canvas'),
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minDistance = 5;
  controls.maxDistance = 50;

  raycaster = new THREE.Raycaster();
  pointer   = new THREE.Vector2();
  clock     = new THREE.Clock();

  setupLights();
  buildMuseum();
  goToRoom(0, false);
  setupEvents();
  animate();
}

function setupLights() {
  scene.add(new THREE.AmbientLight(0xf5ead0, 0.6));

  for (let i = 0; i < 5; i++) {
    const spot = new THREE.SpotLight(0xfff4e0, 3.0, 80, Math.PI / 5, 0.5, 1.0);
    spot.position.set(ROOM_OFFSETS[i], 22, 0);
    spot.target.position.set(ROOM_OFFSETS[i], 0, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    scene.add(spot);
    scene.add(spot.target);

    const fill = new THREE.DirectionalLight(0xf0e8d8, 1.2);
    fill.position.set(ROOM_OFFSETS[i], 5, 18);
    scene.add(fill);
  }

  scene.add(new THREE.HemisphereLight(0xf5ead0, 0xc8b890, 0.8));
}

function buildMuseum() {
  // Floor
  const floorGeo = new THREE.PlaneGeometry(200, 30);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xebe5d5, roughness: 0.9, metalness: 0.0 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Room labels (subtle box per room)
  rooms.forEach((room, idx) => {
    const geo = new THREE.BoxGeometry(38, 0.05, 22);
    const mat = new THREE.MeshStandardMaterial({
      color: ROOM_COLORS[idx],
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.06,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.position.set(ROOM_OFFSETS[idx], 0.01, 0);
    scene.add(plane);
  });

  // Artifacts per room
  rooms.forEach((room, roomIdx) => {
    const rxhibits = getExhibitsByRoom(room.id);
    const cols = Math.ceil(rxhibits.length / 2);
    rxhibits.forEach((exhibit, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = ROOM_OFFSETS[roomIdx] - (cols - 1) * 3.5 + col * 7;
      const z = row * 6 - 3;
      addArtifact(exhibit, x, z, roomIdx);
    });
  });
}

function addArtifact(exhibit, x, z, roomIdx) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  scene.add(group);
  pedestalGroup.set(exhibit.id, group);

  // Pedestal
  const pedGeo = new THREE.CylinderGeometry(0.6, 0.8, 1.2, 8);
  const pedMat = new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.7, metalness: 0.1 });
  const pedestal = new THREE.Mesh(pedGeo, pedMat);
  pedestal.position.y = 0.6;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  // Artifact shape — vary by strand
  let geo;
  const col = STRAND_COLORS[exhibit.strand] || 0x888888;
  const inDeg = 0;

  if (exhibit.strand === 'philosophie') {
    geo = new THREE.OctahedronGeometry(0.5 + inDeg * 0.02, 0);
  } else if (exhibit.strand === 'religion') {
    geo = new THREE.TetrahedronGeometry(0.6, 0);
  } else {
    geo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
  }

  const mat = new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.3,
    metalness: 0.6,
    emissive: col,
    emissiveIntensity: 0.45,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 1.8;
  mesh.castShadow = true;
  mesh.userData = { exhibitId: exhibit.id, mat, baseEmissive: 0.15, baseY: 1.8 };
  group.add(mesh);
  artifactMeshes.set(exhibit.id, mesh);
}

function drawInfluenceLines(exhibitId) {
  clearInfluenceLines();
  const exhibit = exhibits.find(e => e.id === exhibitId);
  if (!exhibit) return;

  const srcGroup = pedestalGroup.get(exhibitId);
  if (!srcGroup) return;

  const srcPos = srcGroup.position.clone().add(new THREE.Vector3(0, 2.2, 0));

  const drawLine = (targetId, color) => {
    const tgt = pedestalGroup.get(targetId);
    if (!tgt) return;
    const tgtPos = tgt.position.clone().add(new THREE.Vector3(0, 2.2, 0));

    const points = [];
    const mid = srcPos.clone().lerp(tgtPos, 0.5).add(new THREE.Vector3(0, 3, 0));
    const curve = new THREE.QuadraticBezierCurve3(srcPos, mid, tgtPos);
    for (let i = 0; i <= 24; i++) points.push(curve.getPoint(i / 24));

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    influenceLines.push(line);
  };

  exhibit.influences.forEach(tId => drawLine(tId, 0xd4a855));
  getInfluencedBy(exhibitId).forEach(src => drawLine(src.id, 0x6a8fc0));
}

function clearInfluenceLines() {
  influenceLines.forEach(l => { l.geometry.dispose(); l.material.dispose(); scene.remove(l); });
  influenceLines = [];
}

function goToRoom(idx, animate = true) {
  currentRoomIdx = idx;
  document.querySelectorAll('.room-btn').forEach((btn, i) => btn.classList.toggle('active', i === idx));
  const tx = ROOM_OFFSETS[idx];
  if (animate) {
    animateCameraTo(new THREE.Vector3(tx, 12, 22), new THREE.Vector3(tx, 0, 0));
  } else {
    camera.position.set(tx, 12, 22);
    controls.target.set(tx, 0, 0);
    controls.update();
  }
}

function animateCameraTo(targetPos, lookAt) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const duration = 0.9;
  let elapsed = 0;

  const tick = () => {
    elapsed += clock.getDelta();
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(startPos, targetPos, ease);
    controls.target.lerpVectors(startTarget, lookAt, ease);
    controls.update();
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

let hoveredId = null;

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const meshes = [...artifactMeshes.values()];
  const hits = raycaster.intersectObjects(meshes, false);

  const newId = hits.length > 0 ? hits[0].object.userData.exhibitId : null;

  if (newId !== hoveredId) {
    // Reset old
    if (hoveredId) {
      const mesh = artifactMeshes.get(hoveredId);
      if (mesh) mesh.userData.mat.emissiveIntensity = mesh.userData.baseEmissive;
    }
    hoveredId = newId;

    if (newId) {
      const mesh = artifactMeshes.get(newId);
      if (mesh) mesh.userData.mat.emissiveIntensity = 0.6;
      const exhibit = exhibits.find(e => e.id === newId);
      if (exhibit) {
        tooltip.textContent = `${exhibit.name.split(' — ')[0]} · ${exhibit.date}`;
        tooltip.classList.add('visible');
      }
      renderer.domElement.style.cursor = 'pointer';
    } else {
      tooltip.classList.remove('visible');
      renderer.domElement.style.cursor = 'default';
    }
  }
}

let _clickStart = null;

function onPointerDown(e) {
  _clickStart = { x: e.clientX, y: e.clientY };
}

function onPointerUp(e) {
  if (!_clickStart) return;
  const dx = Math.abs(e.clientX - _clickStart.x);
  const dy = Math.abs(e.clientY - _clickStart.y);
  _clickStart = null;
  if (dx < 6 && dy < 6 && hoveredId) {
    openExhibitPanel(hoveredId);
  }
}

function openExhibitPanel(id) {
  openExhibitId = id;
  const exhibit = exhibits.find(e => e.id === id);
  if (!exhibit) return;

  const label = STRAND_LABELS[exhibit.strand] || exhibit.strand;
  panelContent.innerHTML = `
    <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07)">
      <span class="panel-strand-badge strand-${exhibit.strand}" style="margin-bottom:8px">${label}</span>
      <h2 style="font-family:'EB Garamond',Georgia,serif;font-size:1.4rem;line-height:1.3;margin:8px 0 4px">${exhibit.name}</h2>
      <span style="font-family:'DM Mono','Courier New',monospace;font-size:11px;color:var(--text-dim)">${exhibit.date}</span>
    </div>
    <div style="margin-bottom:16px">
      <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:6px">Artefakt</h3>
      <p style="font-size:14px;line-height:1.6;color:var(--text-muted)">${exhibit.artefact.description}</p>
    </div>
    <div style="margin-bottom:16px">
      <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim);margin-bottom:6px">Narrativ</h3>
      <p style="font-size:14px;line-height:1.7;color:var(--text);">${exhibit.panelText.story.slice(0, 300)}…</p>
    </div>
    <div style="border-left:3px solid var(--${exhibit.strand});padding-left:12px;margin-bottom:16px">
      <p style="font-size:13px;line-height:1.7;font-style:italic;color:var(--text-muted)">${exhibit.panelText.keyIdea}</p>
    </div>
    <a href="index.html#${exhibit.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:var(--amber);text-decoration:none;font-family:'Inter',sans-serif">
      Im 2D-Museum öffnen →
    </a>
  `;

  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  closeBtn.focus();
  drawInfluenceLines(id);
}

function closeExhibitPanel() {
  openExhibitId = null;
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  clearInfluenceLines();
}

function setupEvents() {
  renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
  renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
  renderer.domElement.addEventListener('pointerup', onPointerUp, { passive: true });

  closeBtn.addEventListener('click', closeExhibitPanel);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeExhibitPanel();
  });

  document.querySelectorAll('.room-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => goToRoom(i));
  });

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  artifactMeshes.forEach((mesh, id) => {
    const base = mesh.userData.baseY;
    mesh.position.y = base + Math.sin(t * 0.8 + mesh.id * 0.37) * 0.12;
    mesh.rotation.y += 0.004;
  });

  controls.update();
  renderer.render(scene, camera);
}

init();
