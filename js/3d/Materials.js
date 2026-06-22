// js/3d/Materials.js — PBR material/texture library
// Textures (all CC0):
//   grey_plaster — Poly Haven (walls + dado)
//   Plaster001   — ambientCG  (ceiling)
//   Wood051      — ambientCG  (dark espresso frames)
//   Wood049      — ambientCG  (medium oak bench seats)
//   Concrete007  — ambientCG  (pedestals, has AO)
//   Marble010    — ambientCG  (floor, defined in GalleryScene)
import * as THREE from 'three';

THREE.Cache.enabled = true;

const TL = new THREE.TextureLoader();

function load(path, isColor = false, aniso = 1) {
  const t = TL.load(path);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  if (isColor) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Clone a texture with independent repeat (image buffer shared — zero extra VRAM).
// Don't set needsUpdate=true on a freshly cloned texture — it hasn't uploaded yet,
// so the flag would fire the "no image data found" warning on first render.
function rep(t, u, v) {
  const c = t.clone();
  c.repeat.set(u, v);
  return c;
}

// ── Raw texture bundles ────────────────────────────────────────────────────────
export function buildTextures(maxAniso) {
  const A = maxAniso;

  const greyPlaster = {
    col: load('textures/grey_plaster/color.jpg',  true,  A),
    nrm: load('textures/grey_plaster/normal.jpg', false, A),
    rgh: load('textures/grey_plaster/rough.jpg',  false, A),
    ao:  load('textures/grey_plaster/ao.jpg',     false, A),
  };

  const plaster001 = {
    col: load('textures/plaster/Plaster001_2K-JPG_Color.jpg',    true,  A),
    nrm: load('textures/plaster/Plaster001_2K-JPG_NormalGL.jpg', false, A),
    rgh: load('textures/plaster/Plaster001_2K-JPG_Roughness.jpg',false, A),
  };

  const wood051 = {
    col: load('textures/wood051/Wood051_2K-JPG_Color.jpg',    true,  A),
    nrm: load('textures/wood051/Wood051_2K-JPG_NormalGL.jpg', false, A),
    rgh: load('textures/wood051/Wood051_2K-JPG_Roughness.jpg',false, A),
  };

  const wood049 = {
    col: load('textures/wood/Wood049_2K-JPG_Color.jpg',    true,  A),
    nrm: load('textures/wood/Wood049_2K-JPG_NormalGL.jpg', false, A),
    rgh: load('textures/wood/Wood049_2K-JPG_Roughness.jpg',false, A),
  };

  const concrete = {
    col: load('textures/concrete/Concrete007_2K-JPG_Color.jpg',            true,  A),
    nrm: load('textures/concrete/Concrete007_2K-JPG_NormalGL.jpg',         false, A),
    rgh: load('textures/concrete/Concrete007_2K-JPG_Roughness.jpg',        false, A),
    ao:  load('textures/concrete/Concrete007_2K-JPG_AmbientOcclusion.jpg', false, A),
  };

  const marble = {
    col:  load('textures/marble/Marble010_2K-JPG_Color.jpg',       true,  A),
    nrm:  load('textures/marble/Marble010_2K-JPG_NormalGL.jpg',    false, A),
    rgh:  load('textures/marble/Marble010_2K-JPG_Roughness.jpg',   false, A),
    disp: load('textures/marble/Marble010_2K-JPG_Displacement.jpg',false, A),
  };

  return { greyPlaster, plaster001, wood051, wood049, concrete, marble };
}

// ── Material factories ─────────────────────────────────────────────────────────

// Upper wall plaster — Plaster001 albedo (white) + grey_plaster NRM/RGH/AO
// We use white Plaster001 color map so walls stay cream; grey_plaster provides
// the surface relief (normal) and variation (roughness + AO) not available in Plaster001.
export function wallUpperMat(tex, uRep, vRep) {
  return new THREE.MeshStandardMaterial({
    color:        0xf5f2ec,
    map:          rep(tex.plaster001.col, uRep, vRep),
    normalMap:    rep(tex.greyPlaster.nrm, uRep, vRep),
    roughnessMap: rep(tex.greyPlaster.rgh, uRep, vRep),
    aoMap:        rep(tex.greyPlaster.ao,  uRep, vRep),
    roughness:    0.92,
    metalness:    0,
    side:         THREE.DoubleSide,
  });
}

// Lower dado panel — slightly warmer tint
export function wallDadoMat(tex, uRep, vRep) {
  return new THREE.MeshStandardMaterial({
    color:        0xe8e4dc,
    map:          rep(tex.plaster001.col, uRep, vRep),
    normalMap:    rep(tex.greyPlaster.nrm, uRep, vRep),
    roughnessMap: rep(tex.greyPlaster.rgh, uRep, vRep),
    aoMap:        rep(tex.greyPlaster.ao,  uRep, vRep),
    roughness:    0.94,
    metalness:    0,
    side:         THREE.DoubleSide,
  });
}

// Ceiling — Plaster001 off-white, high roughness
export function ceilingMat(tex, uRep, vRep) {
  return new THREE.MeshStandardMaterial({
    color:        0xdedbd4,
    map:          rep(tex.plaster001.col, uRep, vRep),
    normalMap:    rep(tex.plaster001.nrm, uRep, vRep),
    roughnessMap: rep(tex.plaster001.rgh, uRep, vRep),
    roughness:    0.96,
    metalness:    0,
    side:         THREE.DoubleSide,
  });
}

// Dark espresso Wood051 — exhibit frames
export function frameMat(tex) {
  return new THREE.MeshStandardMaterial({
    map:          rep(tex.wood051.col, 2, 2),
    normalMap:    rep(tex.wood051.nrm, 2, 2),
    roughnessMap: rep(tex.wood051.rgh, 2, 2),
    roughness:    0.62,
    metalness:    0.04,
  });
}

// Concrete007 pedestal (caller must set uv1 = uv on geometry for AO)
export function plinthMat(tex) {
  return new THREE.MeshStandardMaterial({
    map:          rep(tex.concrete.col, 3, 2),
    normalMap:    rep(tex.concrete.nrm, 3, 2),
    roughnessMap: rep(tex.concrete.rgh, 3, 2),
    aoMap:        rep(tex.concrete.ao,  3, 2),
    roughness:    0.88,
    metalness:    0.02,
  });
}

// Wood049 bench seat — warm natural oak
export function benchSeatMat(tex) {
  return new THREE.MeshStandardMaterial({
    color:        0xdab888,
    map:          rep(tex.wood049.col, 2, 1),
    normalMap:    rep(tex.wood049.nrm, 2, 1),
    roughnessMap: rep(tex.wood049.rgh, 2, 1),
    roughness:    0.58,
    metalness:    0,
  });
}

// Marble10 floor — built in GalleryScene (different because of DisplacementMap + segments)

// Shared singletons (no texture variation needed)

export const benchLegMat = new THREE.MeshStandardMaterial({
  color: 0x1a1614, roughness: 0.26, metalness: 0.92,
});

export const corniceMat = new THREE.MeshStandardMaterial({
  color: 0xe2dfd8, roughness: 0.80, metalness: 0,
});

export const dadoRailCapMat = new THREE.MeshStandardMaterial({
  color: 0xc8c4bc, roughness: 0.72, metalness: 0,
});

export const doorMoldingMat = new THREE.MeshStandardMaterial({
  color: 0xe0dcd4, roughness: 0.82, metalness: 0,
});

export const fixtureMat = new THREE.MeshStandardMaterial({
  color: 0x1a1614,
  emissive: new THREE.Color(0xfff5e8),
  emissiveIntensity: 0.80,  // visible warm disc; stays below bloom threshold (0.88) at this exposure
  roughness: 0.20,
  metalness: 0.80,
});

export const fixtureHousingMat = new THREE.MeshStandardMaterial({
  color: 0x161412, roughness: 0.30, metalness: 0.85,
});
